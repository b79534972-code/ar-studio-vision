/**
 * ApplicationService — Central Service Layer
 *
 * Dashboard and UI components interact with this service ONLY.
 * This service delegates to FeatureService, AIService, etc.
 * No direct engine/AI imports from UI components.
 */

import { FeatureService } from "./FeatureService";
import { AIService } from "./AIService";
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

  static suggestPlacement(user: User, modelId: string, roomId: string) {
    return AIService.suggestPlacement(user, modelId, roomId);
  }

  static generateLayouts(user: User, roomId: string) {
    return AIService.generateLayouts(user, roomId);
  }

  static optimizeSpace(user: User, roomId: string) {
    return AIService.optimizeSpace(user, roomId);
  }

  static analyzeRoomImage(user: User, imageUrl: string) {
    return AIService.analyzeRoomImage(user, imageUrl);
  }

  static chatAssistant(user: User, message: string) {
    return AIService.chatInteriorAssistant(user, message);
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
