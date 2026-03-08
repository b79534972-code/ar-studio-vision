/**
 * Subscription Store — persists subscription plan in localStorage.
 * Mock implementation for demo. Will be replaced by Stripe + backend.
 */

import { PLAN_CONFIG, type SubscriptionPlan } from "@/types/subscription";

type Listener = () => void;

const listeners = new Set<Listener>();
let currentPlan: SubscriptionPlan = "free";

// Load from localStorage
try {
  const stored = localStorage.getItem("subscription-plan");
  if (stored && (stored === "free" || stored === "basic" || stored === "advanced" || stored === "pro")) {
    currentPlan = stored as SubscriptionPlan;
  }
} catch { /* ignore */ }

function persist() {
  try {
    localStorage.setItem("subscription-plan", currentPlan);
  } catch { /* ignore */ }
}

function notify() {
  listeners.forEach((l) => l());
}

export const subscriptionStore = {
  getPlan: () => currentPlan,

  upgradePlan: (plan: SubscriptionPlan) => {
    currentPlan = plan;
    persist();
    notify();
  },

  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
