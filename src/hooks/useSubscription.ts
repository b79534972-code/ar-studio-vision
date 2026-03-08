/**
 * useSubscription — Mock subscription state
 *
 * When backend is connected, this will be replaced with
 * real auth + DB queries. For now, provides mock data with localStorage persistence.
 */

import { useState, useCallback, useMemo } from "react";
import { useSyncExternalStore } from "react";
import { PLAN_CONFIG, type User, type UserUsage, type SubscriptionPlan, type Currency } from "@/types/subscription";
import { subscriptionStore } from "@/stores/subscriptionStore";

const MOCK_USER_BASE: Omit<User, "subscriptionPlan"> = {
  id: "usr_demo_001",
  name: "Alex Designer",
  email: "alex@InteriorAR.io",
  avatar: undefined,
  role: "user",
  subscriptionStatus: "active",
  createdAt: "2026-02-01T00:00:00Z",
};

const MOCK_USAGE: UserUsage = {
  userId: "usr_demo_001",
  modelsCount: 3,
  layoutsCount: 2,
  arSessionsCount: 7,
  aiRequestsCount: 0,
  aiCreditsUsed: 0,
  aiCreditsTotal: 5,
};

export function useSubscription() {
  const currentPlan = useSyncExternalStore(subscriptionStore.subscribe, subscriptionStore.getPlan);

  const user: User = useMemo(() => ({
    ...MOCK_USER_BASE,
    subscriptionPlan: currentPlan,
  }), [currentPlan]);

  const [usage, setUsage] = useState<UserUsage>(() => ({
    ...MOCK_USAGE,
    aiCreditsTotal: PLAN_CONFIG[currentPlan].limits.aiCredits ?? 5,
  }));
  const [currency, setCurrency] = useState<Currency>("USD");
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const upgradePlan = useCallback((plan: SubscriptionPlan) => {
    subscriptionStore.upgradePlan(plan);
    const newCredits = PLAN_CONFIG[plan].limits.aiCredits ?? 5;
    setUsage((prev) => ({ ...prev, aiCreditsTotal: newCredits, aiCreditsUsed: 0 }));
  }, []);

  const useCredit = useCallback((amount: number = 1): boolean => {
    let success = false;
    setUsage((prev) => {
      const remaining = prev.aiCreditsTotal - prev.aiCreditsUsed;
      if (remaining < amount) return prev;
      success = true;
      return {
        ...prev,
        aiCreditsUsed: prev.aiCreditsUsed + amount,
        aiRequestsCount: prev.aiRequestsCount + 1,
      };
    });
    return success;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  return {
    user,
    usage,
    currency,
    setCurrency,
    isAuthenticated,
    upgradePlan,
    logout,
    setUser: () => {},
    setUsage,
    useCredit,
  };
}
