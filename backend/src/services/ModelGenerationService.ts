import { buildApiUrl, fetchWithTimeout, getApiAttemptTimeoutMs, getAuthToken } from "@/lib/api";

export interface StartFurnitureGenerationPayload {
  image: File;
  name: string;
  category: string;
  width: number;
  height: number;
  depth: number;
  material?: string;
  color?: string;
}

export interface StartFurnitureGenerationResponse {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  message: string;
}

export interface FurnitureGenerationJob {
  id: string;
  userId: string;
  kind: "furniture";
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  message: string;
  result?: {
    modelUrl: string;
    usdzUrl?: string;
    cleanedImageUrl: string;
  };
  error?: string;
}

export interface RoomScanResult {
  width: number;
  depth: number;
  height: number;
  wallColor: string;
  floorColor: string;
  confidence: number;
  walls: { id: string; from: [number, number]; to: [number, number] }[];
}

async function authFetch<T>(path: string, init: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };

  const response = await fetchWithTimeout(
    buildApiUrl(path),
    {
      ...init,
      credentials: "include",
      headers,
    },
    getApiAttemptTimeoutMs(0),
  );

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const payload = (await response.json()) as { message?: string };
      if (payload?.message) message = payload.message;
    } catch {
      // keep fallback
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export class ModelGenerationService {
  static async startFurnitureGeneration(payload: StartFurnitureGenerationPayload): Promise<StartFurnitureGenerationResponse> {
    const form = new FormData();
    form.append("image", payload.image);
    form.append("name", payload.name);
    form.append("category", payload.category);
    form.append("width", String(payload.width));
    form.append("height", String(payload.height));
    form.append("depth", String(payload.depth));
    if (payload.material) form.append("material", payload.material);
    if (payload.color) form.append("color", payload.color);

    return authFetch<StartFurnitureGenerationResponse>("/model-generation/furniture", {
      method: "POST",
      body: form,
    });
  }

  static async getFurnitureJob(jobId: string): Promise<FurnitureGenerationJob> {
    return authFetch<FurnitureGenerationJob>(`/model-generation/jobs/${jobId}`, {
      method: "GET",
    });
  }

  static async scanRoom(image: File): Promise<RoomScanResult> {
    const form = new FormData();
    form.append("image", image);

    const response = await authFetch<{ success: boolean; result: RoomScanResult }>("/model-generation/room-scan", {
      method: "POST",
      body: form,
    });

    return response.result;
  }
}
