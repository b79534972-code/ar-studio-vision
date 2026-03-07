/**
 * AIService — AI Engine Interface
 *
 * All AI calls go through this service.
 * The service checks feature gates before executing.
 * This is a stub — backend integration will be added with Azure Cloud.
 */

import { FeatureService } from "./FeatureService";
import type { User } from "@/types/subscription";

export interface AIResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export class AIService {
  // --- Basic AI (Starter+) ---

  static async suggestScale(user: User, _modelId: string, _roomId: string): Promise<AIResult> {
    const gate = FeatureService.canUseAI(user);
    if (!gate.allowed) return { success: false, error: gate.reason };
    // Stub: will call edge function
    return { success: true, data: { suggestedScale: 1.0, confidence: 0.92 } };
  }

  static async checkRoomFit(user: User, _modelId: string, _roomId: string): Promise<AIResult> {
    const gate = FeatureService.canUseAI(user);
    if (!gate.allowed) return { success: false, error: gate.reason };
    return { success: true, data: { fits: true, utilization: 0.65 } };
  }

  static async suggestPlacement(user: User, _modelId: string, _roomId: string): Promise<AIResult> {
    const gate = FeatureService.canUseAI(user);
    if (!gate.allowed) return { success: false, error: gate.reason };
    return { success: true, data: { position: { x: 0, y: 0, z: -2 } } };
  }

  static async autoNameLayout(user: User, _objects: string[]): Promise<AIResult<string>> {
    const gate = FeatureService.canUseAI(user);
    if (!gate.allowed) return { success: false, error: gate.reason };
    return { success: true, data: "Modern Living Room — Cozy Setup" };
  }

  // --- Advanced AI (Pro only) ---

  static async generateLayouts(user: User, _roomId: string): Promise<AIResult> {
    const gate = FeatureService.canUseAdvancedAI(user);
    if (!gate.allowed) return { success: false, error: gate.reason };
    return { success: true, data: { layouts: [] } };
  }

  static async optimizeSpace(user: User, _roomId: string): Promise<AIResult> {
    const gate = FeatureService.canUseAdvancedAI(user);
    if (!gate.allowed) return { success: false, error: gate.reason };
    return { success: true, data: { optimizedLayout: {} } };
  }

  static async analyzeRoomImage(user: User, _imageUrl: string): Promise<AIResult> {
    const gate = FeatureService.canUseAdvancedAI(user);
    if (!gate.allowed) return { success: false, error: gate.reason };
    return { success: true, data: { style: "minimalist", colors: ["#f5f5f5", "#333"] } };
  }

  static async chatInteriorAssistant(user: User, _message: string): Promise<AIResult<string>> {
    const gate = FeatureService.canUseAdvancedAI(user);
    if (!gate.allowed) return { success: false, error: gate.reason };
    return { success: true, data: "I'd suggest placing the sofa against the south wall for natural light." };
  }
}
