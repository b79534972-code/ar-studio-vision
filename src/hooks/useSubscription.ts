/**
 * useSubscription — Mock subscription state with FIFO credit batches
 *
 * When backend is connected, this will be replaced with
 * real auth + DB queries. For now, provides mock data with localStorage persistence.
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { useSyncExternalStore } from "react";
import { PLAN_CONFIG, type User, type UserUsage, type SubscriptionPlan, type Currency, type CreditBatch } from "@/types/subscription";
import { subscriptionStore } from "@/stores/subscriptionStore";
import { creditBatchStore } from "@/stores/creditBatchStore";
import { AuthService } from "@/services/AuthService";
import { getScopedStorageKey } from "@/lib/authStorage";

const MOCK_USER_BASE: Omit<User, "subscriptionPlan"> = {
  id: "usr_demo_001",
  name: "Alex Designer",
  email: "alex@InteriorAR.io",
  avatar: undefined,
  role: "user",
  subscriptionStatus: "active",
  createdAt: "2026-02-01T00:00:00Z",
};

export function useSubscription() {
  const currentPlan = useSyncExternalStore(subscriptionStore.subscribe, subscriptionStore.getPlan);
  const creditBatches = useSyncExternalStore(creditBatchStore.subscribe, creditBatchStore.getBatches);
  const totalCreditsRemaining = useSyncExternalStore(creditBatchStore.subscribe, creditBatchStore.getTotalRemaining);
  const [storedUser, setStoredUser] = useState<User | null>(() => AuthService.getStoredUser());

  useEffect(() => {
    const handleAuthUserChanged = () => {
      setStoredUser(AuthService.getStoredUser());
    };

    window.addEventListener("interiorar-auth-user-changed", handleAuthUserChanged);
    return () => window.removeEventListener("interiorar-auth-user-changed", handleAuthUserChanged);
  }, []);

  const user: User = useMemo(() => ({
    ...(storedUser ?? MOCK_USER_BASE),
    subscriptionPlan: currentPlan,
    subscriptionStatus: storedUser?.subscriptionStatus ?? "active",
  }), [currentPlan, storedUser]);

  const [aiRequestsCount, setAiRequestsCount] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(getScopedStorageKey("ai-requests-count", user.id));
      setAiRequestsCount(stored ? parseInt(stored, 10) || 0 : 0);
    } catch {
      setAiRequestsCount(0);
    }
  }, [user.id]);

  // Persist AI requests count
  useEffect(() => {
    try {
      localStorage.setItem(getScopedStorageKey("ai-requests-count", user.id), String(aiRequestsCount));
    } catch {
      // Ignore storage errors.
    }
  }, [aiRequestsCount, user.id]);

  // Compute usage from credit batches
  const totalCreditsPurchased = creditBatches.reduce((sum, b) => sum + b.creditsPurchased, 0);
  const totalCreditsUsed = totalCreditsPurchased - totalCreditsRemaining;

  const usage: UserUsage = useMemo(() => ({
    userId: user.id,
    modelsCount: 3,
    layoutsCount: 2,
    arSessionsCount: 7,
    aiRequestsCount,
    aiCreditsUsed: totalCreditsUsed,
    aiCreditsTotal: totalCreditsPurchased,
  }), [aiRequestsCount, totalCreditsUsed, totalCreditsPurchased, user.id]);

  const [currency, setCurrency] = useState<Currency>("USD");
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const upgradePlan = useCallback((plan: SubscriptionPlan) => {
    subscriptionStore.upgradePlan(plan);
    if (plan !== "free") {
      creditBatchStore.addBatch(plan as Exclude<SubscriptionPlan, "free">);
    }
  }, []);

  const useCredit = useCallback((amount: number = 1): boolean => {
    const success = creditBatchStore.consumeCredits(amount);
    if (success) {
      setAiRequestsCount((prev) => prev + 1);
    }
    return success;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    AuthService.clearStoredUser();
  }, []);

  return {
    user,
    usage,
    currency,
    setCurrency,
    isAuthenticated,
    upgradePlan,
    logout,
    setUser: setStoredUser,
    setUsage: () => {},
    useCredit,
    creditBatches,
    totalCreditsRemaining,
  };
}
