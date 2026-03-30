const rawPrimaryApiUrl = import.meta.env.VITE_API_URL as string | undefined;
const rawSecondaryApiUrl = import.meta.env.VITE_RENDER_API_URL as string | undefined;
const rawTimeout = import.meta.env.VITE_API_FAILOVER_TIMEOUT_MS as string | undefined;
const REQUEST_TIMEOUT_MS = Number(rawTimeout || "4500");

function normalizeBaseUrl(url?: string): string {
  return (url || "").trim().replace(/\/$/, "");
}

const apiBaseCandidates = Array.from(
  new Set([normalizeBaseUrl(rawPrimaryApiUrl), normalizeBaseUrl(rawSecondaryApiUrl)].filter(Boolean))
);

if (apiBaseCandidates.length === 0) {
  // Helpful warning during local/dev if env is missing.
  console.warn("VITE_API_URL is not set. API calls will use same-origin relative paths.");
}

if (apiBaseCandidates.length > 1) {
  console.info("API failover is enabled with multiple backend base URLs.");
}

const AUTH_TOKEN_KEY = "interiorar_auth_token";

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getApiBaseCandidates(): string[] {
  return apiBaseCandidates;
}

export function buildApiUrl(path: string, baseOverride?: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = baseOverride ?? apiBaseCandidates[0] ?? "";
  return base ? `${base}${normalizedPath}` : normalizedPath;
}

export function getApiAttemptTimeoutMs(attemptIndex: number): number {
  const safeBase = Number.isFinite(REQUEST_TIMEOUT_MS) && REQUEST_TIMEOUT_MS > 0 ? REQUEST_TIMEOUT_MS : 4500;
  return attemptIndex === 0 ? safeBase : safeBase * 2;
}

export async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function shouldRetryOnStatus(status: number): boolean {
  return status >= 500 || status === 429;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const bases = apiBaseCandidates.length > 0 ? apiBaseCandidates : [""];
  let lastError: Error | null = null;

  for (let i = 0; i < bases.length; i += 1) {
    const base = bases[i];
    const isLastAttempt = i === bases.length - 1;

    try {
      const response = await fetchWithTimeout(buildApiUrl(path, base), {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(init?.headers || {}),
        },
        ...init,
      }, getApiAttemptTimeoutMs(i));

      if (!response.ok) {
        let message = `Request failed: ${response.status}`;
        try {
          const payload = (await response.json()) as { message?: string };
          if (payload?.message) {
            message = payload.message;
          }
        } catch {
          // Ignore JSON parse error and keep fallback message.
        }

        if (!isLastAttempt && shouldRetryOnStatus(response.status)) {
          continue;
        }

        throw new Error(message);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown API request error");
      if (!isLastAttempt) {
        continue;
      }
    }
  }

  throw lastError || new Error("Request failed on all configured backends");
}
