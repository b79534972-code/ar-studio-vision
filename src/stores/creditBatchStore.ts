/**
 * CreditBatchStore — Manages credit batches with FIFO expiration.
 * Mock implementation for demo. Will be replaced by backend CreditPurchase table.
 */

import { type CreditBatch, type SubscriptionPlan, PLAN_CONFIG } from "@/types/subscription";
import { getAuthStorageScope, getScopedStorageKey } from "@/lib/authStorage";

type Listener = () => void;

const listeners = new Set<Listener>();
let batches: CreditBatch[] = [];
let currentScope = getAuthStorageScope();

// Validity durations in months per plan
const VALIDITY_MONTHS: Record<Exclude<SubscriptionPlan, "free">, number> = {
  basic: 3,
  advanced: 6,
  pro: 12,
};

function loadBatches(scope = currentScope): CreditBatch[] {
  try {
    const stored = localStorage.getItem(getScopedStorageKey("credit-batches", scope));
    if (stored) return JSON.parse(stored) as CreditBatch[];
  } catch {
    // Ignore storage errors and fall back to empty state.
  }
  return [];
}

batches = loadBatches();

function persist() {
  try {
    localStorage.setItem(getScopedStorageKey("credit-batches", currentScope), JSON.stringify(batches));
  } catch {
    // Ignore storage errors.
  }
}

function syncScope(): void {
  const nextScope = getAuthStorageScope();
  if (nextScope === currentScope) return;
  currentScope = nextScope;
  batches = loadBatches(currentScope);
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

/** Remove expired batches (silent = no notify, safe for use during render) */
function pruneExpired(silent = false): void {
  syncScope();
  const now = new Date().toISOString();
  const filtered = batches.filter((b) => b.expiresAt > now && b.creditsRemaining > 0);
  if (filtered.length !== batches.length) {
    batches = filtered;
    persist();
    if (!silent) notify();
  }
}

export const creditBatchStore = {
  getBatches: (): CreditBatch[] => {
    syncScope();
    pruneExpired(true); // silent — safe for useSyncExternalStore snapshot
    return batches;
  },

  /** Total remaining credits across all non-expired batches */
  getTotalRemaining: (): number => {
    syncScope();
    pruneExpired(true); // silent — safe for useSyncExternalStore snapshot
    return batches.reduce((sum, b) => sum + b.creditsRemaining, 0);
  },

  /** Add a new credit batch (when user buys a plan) */
  addBatch: (plan: Exclude<SubscriptionPlan, "free">): CreditBatch => {
    syncScope();
    const credits = PLAN_CONFIG[plan].limits.aiCredits ?? 0;
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + VALIDITY_MONTHS[plan]);

    const batch: CreditBatch = {
      id: `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      plan,
      creditsPurchased: credits,
      creditsRemaining: credits,
      purchasedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    batches.push(batch);
    // Sort by expiresAt ascending (FIFO — earliest expiry consumed first)
    batches.sort((a, b) => a.expiresAt.localeCompare(b.expiresAt));
    persist();
    notify();
    return batch;
  },

  /**
   * Consume credits using FIFO (earliest expiry first).
   * Returns true if enough credits were available.
   */
  consumeCredits: (amount: number): boolean => {
    syncScope();
    pruneExpired();
    const totalRemaining = batches.reduce((sum, b) => sum + b.creditsRemaining, 0);
    if (totalRemaining < amount) return false;

    let remaining = amount;
    for (const batch of batches) {
      if (remaining <= 0) break;
      const deduct = Math.min(batch.creditsRemaining, remaining);
      batch.creditsRemaining -= deduct;
      remaining -= deduct;
    }

    // Remove fully consumed batches
    batches = batches.filter((b) => b.creditsRemaining > 0);
    persist();
    notify();
    return true;
  },

  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
