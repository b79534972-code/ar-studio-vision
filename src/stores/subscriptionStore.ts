/**
 * Subscription Store — persists subscription plan in localStorage.
 * Mock implementation for demo. Will be replaced by Stripe + backend.
 */

import type { SubscriptionPlan } from "@/types/subscription";
import { getAuthStorageScope, getScopedStorageKey } from "@/lib/authStorage";
import { AuthService } from "@/services/AuthService";

type Listener = () => void;

const listeners = new Set<Listener>();
let currentPlan: SubscriptionPlan = "free";
let currentScope = getAuthStorageScope();

function loadPlan(scope = currentScope): SubscriptionPlan {
  try {
    const stored = localStorage.getItem(getScopedStorageKey("subscription-plan", scope));
    if (stored === "free" || stored === "basic" || stored === "advanced" || stored === "pro") {
      return stored;
    }
  } catch {
    // Ignore storage errors and fall back to free plan.
  }

  const authPlan = AuthService.getStoredUser()?.subscriptionPlan;
  if (authPlan === "free" || authPlan === "basic" || authPlan === "advanced" || authPlan === "pro") {
    return authPlan;
  }

  return "free";
}

currentPlan = loadPlan();

function persist() {
  try {
    localStorage.setItem(getScopedStorageKey("subscription-plan", currentScope), currentPlan);
  } catch {
    // Ignore storage errors.
  }
}

function syncScope(): void {
  const nextScope = getAuthStorageScope();
  if (nextScope === currentScope) return;
  currentScope = nextScope;
  currentPlan = loadPlan(currentScope);
}

if (typeof window !== "undefined") {
  window.addEventListener("interiorar-auth-user-changed", () => {
    syncScope();
    notify();
  });
}

function notify() {
  listeners.forEach((l) => l());
}

export const subscriptionStore = {
  getPlan: () => {
    syncScope();
    return currentPlan;
  },

  upgradePlan: (plan: SubscriptionPlan) => {
    syncScope();
    currentPlan = plan;
    persist();
    notify();
  },

  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
