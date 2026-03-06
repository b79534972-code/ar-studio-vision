/**
 * useFeatureGate — React hook for feature gating
 *
 * Wraps FeatureService for convenient use in components.
 * Returns gate check + upgrade modal trigger.
 */

import { useState, useCallback } from "react";
import { FeatureService } from "@/services/FeatureService";
import type { User, UserUsage } from "@/types/subscription";

export function useFeatureGate(user: User, usage: UserUsage) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");

  const gate = useCallback(
    (check: { allowed: boolean; reason?: string }): boolean => {
      if (!check.allowed) {
        setUpgradeReason(check.reason || "Upgrade required");
        setShowUpgrade(true);
        return false;
      }
      return true;
    },
    []
  );

  return {
    showUpgrade,
    upgradeReason,
    setShowUpgrade,
    canUploadModel: () => gate(FeatureService.canUploadModel(user, usage)),
    canCreateLayout: () => gate(FeatureService.canCreateLayout(user, usage)),
    canUseMultiObject: () => gate(FeatureService.canUseMultiObject(user)),
    canUseAI: () => gate(FeatureService.canUseAI(user)),
    canUseAdvancedAI: () => gate(FeatureService.canUseAdvancedAI(user)),
    canAutoConvertUSDZ: () => gate(FeatureService.canAutoConvertUSDZ(user)),
    hasWatermark: FeatureService.hasWatermark(user),
  };
}
