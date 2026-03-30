/**
 * Subscription & User Types
 * Central type definitions for the SaaS platform
 */

export type SubscriptionPlan = "free" | "basic" | "advanced" | "pro";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";
export type Currency = "VND" | "USD";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId?: string;
  createdAt: string;
}

export interface UserUsage {
  userId: string;
  modelsCount: number;
  layoutsCount: number;
  arSessionsCount: number;
  aiRequestsCount: number;
  aiCreditsUsed: number;
  aiCreditsTotal: number;
}

/**
 * CreditBatch — A purchased credit pack with expiration.
 * Credits are consumed FIFO (earliest expiry first).
 */
export interface CreditBatch {
  id: string;
  plan: SubscriptionPlan;
  creditsPurchased: number;
  creditsRemaining: number;
  purchasedAt: string;
  expiresAt: string;
}

export interface Layout {
  id: string;
  name: string;
  roomId: string;
  userId: string;
  version: number;
  objects: LayoutObject[];
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LayoutObject {
  id: string;
  modelId: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export interface Room {
  id: string;
  name: string;
  userId: string;
  dimensions?: { width: number; height: number; depth: number };
  thumbnail?: string;
  createdAt: string;
}

export interface Model3D {
  id: string;
  name: string;
  userId: string;
  fileUrl: string;
  thumbnailUrl?: string;
  dimensions: { width: number; height: number; depth: number };
  format: "glb" | "gltf" | "usdz";
  createdAt: string;
}

export interface PlanLimits {
  maxModels: number | null;
  maxLayouts: number | null;
  multiObjectAR: boolean;
  watermark: boolean;
  cloudSync: boolean;
  versionHistory: boolean;
  usdzAutoConvert: boolean;
  aiBasic: boolean;
  aiAdvanced: boolean;
  aiCredits: number | null;
  maxProjects: number | null;
}

export interface PlanPricing {
  plan: SubscriptionPlan;
  name: string;
  tagline: string;
  priceVND: number;
  priceUSD: number;
  highlighted?: boolean;
  features: string[];
  limits: PlanLimits;
  aiCredits?: number;
  creditValidity?: string;
  pricePerCredit?: number;
}

// Plan configuration
export const PLAN_CONFIG: Record<SubscriptionPlan, PlanPricing> = {
  free: {
    plan: "free",
    name: "Free",
    tagline: "Get started with AR design",
    priceVND: 0,
    priceUSD: 0,
    features: [
      "AR room scan & measurement",
      "Manual furniture placement (move, rotate, scale)",
      "Save up to 3 projects",
      "Standard AR preview quality",
      "5 AI credits per day (resets every 24h)",
      "Access to all AI features (limited by daily credits)",
    ],
    limits: {
      maxModels: 5,
      maxLayouts: 5,
      multiObjectAR: false,
      watermark: true,
      cloudSync: false,
      versionHistory: false,
      usdzAutoConvert: false,
      aiBasic: true,
      aiAdvanced: false,
      aiCredits: 5,
      maxProjects: 3,
    },
  },
  basic: {
    plan: "basic",
    name: "Basic",
    tagline: "Test multiple design styles",
    priceVND: 59000,
    priceUSD: 2,
    aiCredits: 30,
    creditValidity: "Valid 1 months",
    pricePerCredit: 1967,
    features: [
      "30 additional AI credits",
      "No daily AI limitation",
      "AI Product Recommendation",
      "AI Style Transformation",
      "AI Budget Optimization",
      "Extended project usage flexibility",
    ],
    limits: {
      maxModels: 20,
      maxLayouts: 20,
      multiObjectAR: true,
      watermark: false,
      cloudSync: true,
      versionHistory: false,
      usdzAutoConvert: false,
      aiBasic: true,
      aiAdvanced: false,
      aiCredits: 30,
      maxProjects: 5,
    },
  },
  advanced: {
    plan: "advanced",
    name: "Advanced",
    tagline: "Best value for serious redesign",
    priceVND: 119000,
    priceUSD: 4,
    highlighted: true,
    aiCredits: 60,
    creditValidity: "Valid 2 months",
    pricePerCredit: 1983,
    features: [
      "60 AI credits (lower cost per credit)",
      "AI Smart Layout Optimization",
      "AI Realistic Render (photorealistic)",
      "Faster AI processing",
      "Save up to 10 projects",
      "Compare multiple AI design versions",
    ],
    limits: {
      maxModels: 50,
      maxLayouts: 50,
      multiObjectAR: true,
      watermark: false,
      cloudSync: true,
      versionHistory: true,
      usdzAutoConvert: true,
      aiBasic: true,
      aiAdvanced: true,
      aiCredits: 60,
      maxProjects: 10,
    },
  },
  pro: {
    plan: "pro",
    name: "Pro",
    tagline: "Full-house redesign & professional workflows",
    priceVND: 219000,
    priceUSD: 8,
    aiCredits: 120,
    creditValidity: "Valid 3 months",
    pricePerCredit: 1825,
    features: [
      "120 AI credits (best price per credit)",
      "AI Full Room Redesign",
      "High-resolution realistic render export",
      "Save unlimited projects",
      "Priority AI processing queue",
    ],
    limits: {
      maxModels: null,
      maxLayouts: null,
      multiObjectAR: true,
      watermark: false,
      cloudSync: true,
      versionHistory: true,
      usdzAutoConvert: true,
      aiBasic: true,
      aiAdvanced: true,
      aiCredits: 120,
      maxProjects: null,
    },
  },
};

export function formatPrice(plan: SubscriptionPlan, currency: Currency): string {
  const config = PLAN_CONFIG[plan];
  if (currency === "VND") {
    return config.priceVND === 0 ? "Free" : `₫${config.priceVND.toLocaleString("vi-VN")}`;
  }
  return config.priceUSD === 0 ? "Free" : `$${config.priceUSD}`;
}

export const formatPerCredit = (
  plan: SubscriptionPlan,
  currency: Currency
) => {
  const config = PLAN_CONFIG[plan];

  if (!config.aiCredits) return "";

  const totalPrice =
    currency === "USD"
      ? config.priceUSD
      : config.priceVND;

  const perCredit = totalPrice / config.aiCredits;

  if (currency === "USD") {
    return `$${perCredit.toFixed(2)}`;
  }

  return `₫${perCredit.toLocaleString("vi-VN")}`;
};