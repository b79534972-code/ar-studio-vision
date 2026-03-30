/**
 * AI Credit Cost Configuration
 * Centralized pricing for all AI features.
 * Backend should mirror these values for server-side enforcement.
 */

export type AIFeatureId =
  | "layout_suggest"
  | "style_transform"
  | "product_recommend"
  | "budget_optimize"
  | "photorealistic_render"
  | "full_room_redesign";

export interface AIFeatureConfig {
  id: AIFeatureId;
  name: string;
  nameKey: string;
  descriptionKey: string;
  creditCost: number;
  icon: string; // lucide icon name
  requiredPlan: "free" | "basic" | "advanced" | "pro";
  category: "layout" | "style" | "render" | "analysis";
}

export const AI_FEATURES: AIFeatureConfig[] = [
  {
    id: "layout_suggest",
    name: "AI Layout Suggest",
    nameKey: "ai.feature.layoutSuggest",
    descriptionKey: "ai.feature.layoutSuggestDesc",
    creditCost: 1,
    icon: "LayoutGrid",
    requiredPlan: "free",
    category: "layout",
  },
  {
    id: "style_transform",
    name: "AI Style Transform",
    nameKey: "ai.feature.styleTransform",
    descriptionKey: "ai.feature.styleTransformDesc",
    creditCost: 2,
    icon: "Palette",
    requiredPlan: "basic",
    category: "style",
  },
  {
    id: "product_recommend",
    name: "AI Product Recommend",
    nameKey: "ai.feature.productRecommend",
    descriptionKey: "ai.feature.productRecommendDesc",
    creditCost: 1,
    icon: "ShoppingBag",
    requiredPlan: "basic",
    category: "analysis",
  },
  {
    id: "budget_optimize",
    name: "AI Budget Optimize",
    nameKey: "ai.feature.budgetOptimize",
    descriptionKey: "ai.feature.budgetOptimizeDesc",
    creditCost: 1,
    icon: "PiggyBank",
    requiredPlan: "basic",
    category: "analysis",
  },
  {
    id: "photorealistic_render",
    name: "AI Photorealistic Render",
    nameKey: "ai.feature.photoRender",
    descriptionKey: "ai.feature.photoRenderDesc",
    creditCost: 3,
    icon: "Camera",
    requiredPlan: "advanced",
    category: "render",
  },
  {
    id: "full_room_redesign",
    name: "AI Full Room Redesign",
    nameKey: "ai.feature.fullRedesign",
    descriptionKey: "ai.feature.fullRedesignDesc",
    creditCost: 5,
    icon: "Wand2",
    requiredPlan: "pro",
    category: "layout",
  },
];

export function getFeatureCost(featureId: AIFeatureId): number {
  return AI_FEATURES.find((f) => f.id === featureId)?.creditCost ?? 1;
}

export function getFeatureConfig(featureId: AIFeatureId): AIFeatureConfig | undefined {
  return AI_FEATURES.find((f) => f.id === featureId);
}
