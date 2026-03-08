/**
 * useSubscription — Mock subscription state
 *
 * When Azure Cloud is enabled, this will be replaced with
 * real auth + DB queries. For now, provides mock data.
 */

import { useState, useCallback } from "react";
import type { User, UserUsage, SubscriptionPlan, Currency } from "@/types/subscription";

const MOCK_USER: User = {
  id: "usr_demo_001",
  name: "Alex Designer",
  email: "alex@InteriorAR.io",
  avatar: undefined,
  role: "user",
  subscriptionPlan: "free",
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
  aiCreditsTotal: 5, // Free plan = 5 credits
};

export function useSubscription() {
  const [user, setUser] = useState<User>(MOCK_USER);
  const [usage, setUsage] = useState<UserUsage>(MOCK_USAGE);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const upgradePlan = useCallback((plan: SubscriptionPlan) => {
    setUser((prev) => ({ ...prev, subscriptionPlan: plan }));
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
    setUser,
    setUsage,
  };
}
