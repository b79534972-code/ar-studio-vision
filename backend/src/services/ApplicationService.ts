/**
 * ApplicationService — Central Service Layer
 *
 * Dashboard and UI components interact with this service ONLY.
 * This service delegates to FeatureService, AIService, etc.
 * No direct engine/AI imports from UI components.
 */

import { FeatureService } from "./FeatureService";
import { AIService, type AIRoomContext } from "./AIService";
import type { User, UserUsage } from "@/types/subscription";

export class ApplicationService {
  // --- Feature Gate Delegates ---

  static checkModelUpload(user: User, usage: UserUsage) {
    return FeatureService.canUploadModel(user, usage);
  }

  static checkLayoutCreate(user: User, usage: UserUsage) {
    return FeatureService.canCreateLayout(user, usage);
  }

  static checkMultiObjectAR(user: User) {
    return FeatureService.canUseMultiObject(user);
  }

  static checkAI(user: User) {
    return FeatureService.canUseAI(user);
  }

  static checkAdvancedAI(user: User) {
    return FeatureService.canUseAdvancedAI(user);
  }

  // --- AI Delegates ---

  static suggestLayouts(user: User, context: AIRoomContext, token?: string) {
    return AIService.suggestLayouts(user, context, token);
  }

  static optimizeLayout(user: User, context: AIRoomContext, token?: string) {
    return AIService.optimizeLayout(user, context, token);
  }

  static transformStyle(user: User, context: AIRoomContext, targetStyle: string, token?: string) {
    return AIService.transformStyle(user, context, targetStyle, token);
  }

  static recommendProducts(user: User, context: AIRoomContext, count?: number, token?: string) {
    return AIService.recommendProducts(user, context, count, token);
  }

  static optimizeBudget(user: User, context: AIRoomContext, token?: string) {
    return AIService.optimizeBudget(user, context, token);
  }

  static renderPhotorealistic(user: User, context: AIRoomContext, cameraAngle?: string, token?: string) {
    return AIService.renderPhotorealistic(user, context, cameraAngle, token);
  }

  static fullRedesign(user: User, context: AIRoomContext, preferences?: Record<string, unknown>, token?: string) {
    return AIService.fullRedesign(user, context, preferences, token);
  }

  /** Get remaining AI credits */
  static getCreditsRemaining(token?: string) {
    return AIService.getCreditsRemaining(token);
  }

  // --- Usage Helpers ---

  static getUsageStats(user: User, usage: UserUsage) {
    return {
      models: {
        current: usage.modelsCount,
        percentage: FeatureService.getUsagePercentage(user, usage, "models"),
      },
      layouts: {
        current: usage.layoutsCount,
        percentage: FeatureService.getUsagePercentage(user, usage, "layouts"),
      },
      aiRequests: usage.aiRequestsCount,
      arSessions: usage.arSessionsCount,
    };
  }
}
