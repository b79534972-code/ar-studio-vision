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

export type AuthErrorFields = {
  identifier?: string;
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export interface ParsedAuthError {
  message: string;
  fields: AuthErrorFields;
}

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

function parseAuthErrorMessage(rawMessage: string): ParsedAuthError {
  const message = rawMessage.toLowerCase();

  if (message.includes("email already registered")) {
    return {
      message: "This email is already registered. Please sign in or use another email.",
      fields: { email: "Email is already registered" },
    };
  }

  if (message.includes("username already taken")) {
    return {
      message: "This username is already taken. Please choose another username.",
      fields: { name: "Username is already taken" },
    };
  }

  if (message.includes("incorrect username or password")) {
    return {
      message: "Incorrect username/email or password.",
      fields: {
        identifier: "Check your username/email",
        password: "Check your password",
      },
    };
  }

  if (message.includes("username or email is required")) {
    return {
      message: "Please enter your username or email.",
      fields: { identifier: "Username or email is required" },
    };
  }

  if (message.includes("username is required")) {
    return {
      message: "Please enter your username.",
      fields: { name: "Name is required" },
    };
  }

  if (message.includes("email format is invalid")) {
    return {
      message: "Email format is invalid.",
      fields: { email: "Invalid email format" },
    };
  }

  if (message.includes("email is required")) {
    return {
      message: "Please enter your email.",
      fields: { email: "Email is required" },
    };
  }

  if (message.includes("password must be at least 6 characters")) {
    return {
      message: "Password must be at least 6 characters.",
      fields: { password: "Must be at least 6 characters" },
    };
  }

  if (message.includes("password is required")) {
    return {
      message: "Please enter your password.",
      fields: { password: "Password is required" },
    };
  }

  if (message.includes("failed to fetch") || message.includes("network")) {
    return {
      message: "Cannot connect to server. Please check your internet or try again.",
      fields: {},
    };
  }

  return {
    message: rawMessage || "Authentication request failed. Please try again.",
    fields: {},
  };
}

export class AuthService {
  static parseAuthError(error: unknown): ParsedAuthError {
    if (error instanceof Error) {
      return parseAuthErrorMessage(error.message);
    }
    return {
      message: "Authentication request failed. Please try again.",
      fields: {},
    };
  }

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
