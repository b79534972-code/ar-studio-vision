import { apiRequest, clearAuthToken, setAuthToken } from "@/lib/api";
import type { User } from "@/types/subscription";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  subscriptionPlan: "free" | "basic" | "advanced" | "pro";
  subscriptionStatus?: "active" | "canceled" | "past_due" | "trialing";
  createdAt?: string;
};

type AuthResponse = {
  token?: string;
  user: AuthUser;
};

const AUTH_USER_KEY = "interiorar_auth_user";

function normalizeUser(user: AuthUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    subscriptionPlan: user.subscriptionPlan,
    subscriptionStatus: user.subscriptionStatus ?? "active",
    createdAt: user.createdAt ?? new Date().toISOString(),
  };
}

function notifyAuthUserChanged() {
  window.dispatchEvent(new Event("interiorar-auth-user-changed"));
}

export class AuthService {
  static getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  static setStoredUser(user: AuthUser) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalizeUser(user)));
    notifyAuthUserChanged();
  }

  static clearStoredUser() {
    localStorage.removeItem(AUTH_USER_KEY);
    notifyAuthUserChanged();
  }

  static async login(identifier: string, password: string) {
    const res = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    this.setStoredUser(res.user);
    return res;
  }

  static async register(name: string, email: string, password: string) {
    const res = await apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    this.setStoredUser(res.user);
    return res;
  }

  static getMe() {
    return apiRequest<AuthResponse>("/auth/me", {
      method: "GET",
    });
  }

  static async logout() {
    const res = await apiRequest<{ success: boolean }>("/auth/logout", {
      method: "POST",
    });
    clearAuthToken();
    this.clearStoredUser();
    return res;
  }
}
