/**
 * AI Provider Interface — Pluggable Provider Pattern
 * 
 * Implement this interface to connect ANY AI provider:
 * - OpenAI (GPT-4, GPT-5)
 * - Google (Gemini)
 * - Replicate (Stable Diffusion, etc.)
 * - Anthropic (Claude)
 * - Custom self-hosted models
 * 
 * Each method receives structured input and returns structured output.
 * The AIService handles credits, gating, locking — providers only handle AI calls.
 */

export const AI_PROVIDER = Symbol('AI_PROVIDER');

/** Common context passed to every AI call */
export interface AIContext {
  userId: string;
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
  budget?: { min: number; max: number; currency: 'VND' | 'USD' };
}

/** Layout suggestion result */
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
    action: 'replace' | 'remove' | 'diy' | 'alternative';
    description: string;
    savingsAmount: number;
  }>;
}

/** Photorealistic render result */
export interface PhotoRenderResult {
  imageUrl: string;
  format: 'png' | 'jpg' | 'webp';
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
 * IAIProvider — The contract every AI provider must implement.
 * 
 * To add your provider:
 * 1. Create a new file: `backend/src/modules/ai/providers/your-provider.ts`
 * 2. Implement IAIProvider
 * 3. Register in ai.module.ts: { provide: AI_PROVIDER, useClass: YourProvider }
 * 
 * Methods can throw errors — AIService will handle rollback & error responses.
 * Return `null` for features your provider doesn't support.
 */
export interface IAIProvider {
  /** Provider name for logging */
  readonly name: string;

  /** Suggest furniture layouts for a room */
  suggestLayouts(context: AIContext): Promise<LayoutSuggestion[]>;

  /** Optimize existing layout for space/flow */
  optimizeLayout(context: AIContext): Promise<LayoutSuggestion>;

  /** Transform room style (modern → scandinavian, etc.) */
  transformStyle(context: AIContext, targetStyle: string): Promise<StyleTransformResult>;

  /** Recommend products based on room analysis */
  recommendProducts(context: AIContext, count?: number): Promise<ProductRecommendation[]>;

  /** Optimize furniture choices within a budget */
  optimizeBudget(context: AIContext): Promise<BudgetOptimization>;

  /** Generate photorealistic render of the room */
  renderPhotorealistic(context: AIContext, cameraAngle?: string): Promise<PhotoRenderResult>;

  /** Full room redesign with AI */
  fullRedesign(context: AIContext, preferences?: Record<string, unknown>): Promise<FullRedesignResult>;
}
