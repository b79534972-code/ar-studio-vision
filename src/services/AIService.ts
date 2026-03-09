/**
 * AIService — Frontend AI Client
 *
 * All AI calls go through backend API endpoints.
 * Feature gating, credit consumption handled server-side.
 * Frontend only manages UI state and displays results.
 */

import { FeatureService } from "./FeatureService";
import type { User } from "@/types/subscription";
import { getFeatureCost, type AIFeatureId } from "@/config/aiCreditCosts";

const API_URL = import.meta.env.VITE_API_URL || "";

export interface AIResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  creditsUsed?: number;
  creditsRemaining?: number;
}

/** Room context sent to backend */
export interface AIRoomContext {
  roomConfig?: {
    width: number;
    depth: number;
    height: number;
    wallColor: string;
    floorColor: string;
  };
  objects?: Array<{
    id: string;
    name: string;
    category: string;
    position: [number, number, number];
    dimensions: { width: number; height: number; depth: number };
  }>;
  style?: string;
  budget?: { min: number; max: number; currency: "VND" | "USD" };
}

/** Layout suggestion from AI */
export interface LayoutSuggestion {
  name: string;
  description: string;
  score: number;
  objects: Array<{
    id: string;
    name: string;
    category: string;
    position: [number, number, number];
    rotation: [number, number, number];
  }>;
}

/** Style transform result */
export interface StyleTransformResult {
  styleName: string;
  colorPalette: string[];
  suggestedChanges: Array<{
    objectId: string;
    property: string;
    from: string;
    to: string;
  }>;
  moodDescription: string;
}

/** Product recommendation */
export interface ProductRecommendation {
  name: string;
  category: string;
  reason: string;
  estimatedPrice: { amount: number; currency: string };
  dimensions: { width: number; height: number; depth: number };
  style: string;
  imageUrl?: string;
  purchaseUrl?: string;
}

/** Budget optimization result */
export interface BudgetOptimization {
  totalEstimate: { amount: number; currency: string };
  savings: { amount: number; currency: string };
  suggestions: Array<{
    objectId?: string;
    action: "replace" | "remove" | "diy" | "alternative";
    description: string;
    savingsAmount: number;
  }>;
}

/** Photorealistic render result */
export interface PhotoRenderResult {
  imageUrl: string;
  format: "png" | "jpg" | "webp";
  resolution: { width: number; height: number };
  renderTimeMs: number;
}

/** Full room redesign result */
export interface FullRedesignResult {
  concept: string;
  style: string;
  colorPalette: string[];
  layouts: LayoutSuggestion[];
  moodboardUrl?: string;
  estimatedBudget?: { amount: number; currency: string };
}

/**
 * Helper: Call backend AI endpoint with auth token
 */
async function callAI<T>(
  endpoint: string,
  body: Record<string, unknown>,
  token?: string
): Promise<AIResult<T>> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api/ai/${endpoint}`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle specific error codes
      if (response.status === 403) {
        const code = errorData?.code;
        if (code === "CREDITS_EXHAUSTED") {
          return {
            success: false,
            error: `Không đủ credits. Cần ${errorData.required} credits, còn ${errorData.remaining}.`,
          };
        }
        if (code === "FEATURE_RESTRICTED") {
          return {
            success: false,
            error: `Tính năng yêu cầu gói ${errorData.requiredPlan}+.`,
          };
        }
      }

      return {
        success: false,
        error: errorData?.message || errorData?.error || `Lỗi server (${response.status})`,
      };
    }

    return await response.json();
  } catch (error) {
    console.error(`AI request failed [${endpoint}]:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể kết nối đến server",
    };
  }
}

export class AIService {
  // ─── Layout Features ──────────────────────────────────────

  static async suggestLayouts(
    user: User,
    context: AIRoomContext,
    token?: string
  ): Promise<AIResult<LayoutSuggestion[]>> {
    const gate = FeatureService.canUseAI(user);
    if (!gate.allowed) return { success: false, error: gate.reason };

    return callAI<LayoutSuggestion[]>("suggest-layouts", { context }, token);
  }

  static async optimizeLayout(
    user: User,
    context: AIRoomContext,
    token?: string
  ): Promise<AIResult<LayoutSuggestion>> {
    const gate = FeatureService.canUseAI(user);
    if (!gate.allowed) return { success: false, error: gate.reason };

    return callAI<LayoutSuggestion>("optimize-layout", { context }, token);
  }

  // ─── Style Features ───────────────────────────────────────

  static async transformStyle(
    user: User,
    context: AIRoomContext,
    targetStyle: string,
    token?: string
  ): Promise<AIResult<StyleTransformResult>> {
    const gate = FeatureService.canUseAI(user);
    if (!gate.allowed) return { success: false, error: gate.reason };

    return callAI<StyleTransformResult>("transform-style", { context, targetStyle }, token);
  }

  // ─── Analysis Features ────────────────────────────────────

  static async recommendProducts(
    user: User,
    context: AIRoomContext,
    count?: number,
    token?: string
  ): Promise<AIResult<ProductRecommendation[]>> {
    const gate = FeatureService.canUseAI(user);
    if (!gate.allowed) return { success: false, error: gate.reason };

    return callAI<ProductRecommendation[]>("recommend-products", { context, count }, token);
  }

  static async optimizeBudget(
    user: User,
    context: AIRoomContext,
    token?: string
  ): Promise<AIResult<BudgetOptimization>> {
    const gate = FeatureService.canUseAI(user);
    if (!gate.allowed) return { success: false, error: gate.reason };

    return callAI<BudgetOptimization>("optimize-budget", { context }, token);
  }

  // ─── Render Features ──────────────────────────────────────

  static async renderPhotorealistic(
    user: User,
    context: AIRoomContext,
    cameraAngle?: string,
    token?: string
  ): Promise<AIResult<PhotoRenderResult>> {
    const gate = FeatureService.canUseAdvancedAI(user);
    if (!gate.allowed) return { success: false, error: gate.reason };

    return callAI<PhotoRenderResult>("render-photorealistic", { context, cameraAngle }, token);
  }

  static async fullRedesign(
    user: User,
    context: AIRoomContext,
    preferences?: Record<string, unknown>,
    token?: string
  ): Promise<AIResult<FullRedesignResult>> {
    const gate = FeatureService.canUseAdvancedAI(user);
    if (!gate.allowed) return { success: false, error: gate.reason };

    return callAI<FullRedesignResult>("full-redesign", { context, preferences }, token);
  }

  // ─── Utility ──────────────────────────────────────────────

  /** Get credit cost for a feature (client-side lookup) */
  static getCreditCost(featureId: AIFeatureId): number {
    return getFeatureCost(featureId);
  }

  /** Check remaining credits via backend */
  static async getCreditsRemaining(token?: string): Promise<number> {
    const result = await callAI<{ remaining: number }>("credits", {}, token);
    return result.data?.remaining ?? 0;
  }
}
