/**
 * FeatureService — Feature Gating Layer
 *
 * CRITICAL: This is the ONLY place where subscription checks happen.
 * UI components NEVER check subscription plan directly.
 * They always ask FeatureService for permission.
 */

import { PLAN_CONFIG, type User, type UserUsage } from "@/types/subscription";

export class FeatureService {
  static canUploadModel(user: User, usage: UserUsage): { allowed: boolean; reason?: string } {
    const limits = PLAN_CONFIG[user.subscriptionPlan].limits;
    if (limits.maxModels !== null && usage.modelsCount >= limits.maxModels) {
      return { allowed: false, reason: `You've reached the ${limits.maxModels} model limit on your ${user.subscriptionPlan} plan.` };
    }
    return { allowed: true };
  }

  static canCreateLayout(user: User, usage: UserUsage): { allowed: boolean; reason?: string } {
    const limits = PLAN_CONFIG[user.subscriptionPlan].limits;
    if (limits.maxLayouts !== null && usage.layoutsCount >= limits.maxLayouts) {
      return { allowed: false, reason: `You've reached the ${limits.maxLayouts} layout limit on your ${user.subscriptionPlan} plan.` };
    }
    return { allowed: true };
  }

  static canUseMultiObject(user: User): { allowed: boolean; reason?: string } {
    const limits = PLAN_CONFIG[user.subscriptionPlan].limits;
    if (!limits.multiObjectAR) {
      return { allowed: false, reason: "Multi-object AR requires Starter plan or above." };
    }
    return { allowed: true };
  }

  static canUseAI(user: User): { allowed: boolean; reason?: string } {
    const limits = PLAN_CONFIG[user.subscriptionPlan].limits;
    if (!limits.aiBasic) {
      return { allowed: false, reason: "AI features require Starter plan or above." };
    }
    return { allowed: true };
  }

  static canUseAdvancedAI(user: User): { allowed: boolean; reason?: string } {
    const limits = PLAN_CONFIG[user.subscriptionPlan].limits;
    if (!limits.aiAdvanced) {
      return { allowed: false, reason: "Advanced AI features require Pro plan." };
    }
    return { allowed: true };
  }

  static canAutoConvertUSDZ(user: User): { allowed: boolean; reason?: string } {
    const limits = PLAN_CONFIG[user.subscriptionPlan].limits;
    if (!limits.usdzAutoConvert) {
      return { allowed: false, reason: "USDZ auto conversion requires Pro plan." };
    }
    return { allowed: true };
  }

  static canUseCloudSync(user: User): { allowed: boolean; reason?: string } {
    const limits = PLAN_CONFIG[user.subscriptionPlan].limits;
    if (!limits.cloudSync) {
      return { allowed: false, reason: "Cloud sync requires Starter plan or above." };
    }
    return { allowed: true };
  }

  static canUseVersionHistory(user: User): { allowed: boolean; reason?: string } {
    const limits = PLAN_CONFIG[user.subscriptionPlan].limits;
    if (!limits.versionHistory) {
      return { allowed: false, reason: "Version history requires Pro plan." };
    }
    return { allowed: true };
  }

  static hasWatermark(user: User): boolean {
    return PLAN_CONFIG[user.subscriptionPlan].limits.watermark;
  }

  static getUsagePercentage(user: User, usage: UserUsage, resource: "models" | "layouts"): number | null {
    const limits = PLAN_CONFIG[user.subscriptionPlan].limits;
    const max = resource === "models" ? limits.maxModels : limits.maxLayouts;
    const current = resource === "models" ? usage.modelsCount : usage.layoutsCount;
    if (max === null) return null; // unlimited
    return Math.round((current / max) * 100);
  }
}
