import { AuthService } from "@/services/AuthService";

const GUEST_SCOPE = "guest";

export function getAuthStorageScope(): string {
  return AuthService.getStoredUser()?.id || GUEST_SCOPE;
}

export function getScopedStorageKey(baseKey: string, scope = getAuthStorageScope()): string {
  return `${baseKey}:${scope}`;
}
