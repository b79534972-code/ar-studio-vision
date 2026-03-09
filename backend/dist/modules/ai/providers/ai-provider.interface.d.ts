export declare const AI_PROVIDER: unique symbol;
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
        dimensions: {
            width: number;
            height: number;
            depth: number;
        };
    }>;
    style?: string;
    budget?: {
        min: number;
        max: number;
        currency: 'VND' | 'USD';
    };
}
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
export interface ProductRecommendation {
    name: string;
    category: string;
    reason: string;
    estimatedPrice: {
        amount: number;
        currency: string;
    };
    dimensions: {
        width: number;
        height: number;
        depth: number;
    };
    style: string;
    imageUrl?: string;
    purchaseUrl?: string;
}
export interface BudgetOptimization {
    totalEstimate: {
        amount: number;
        currency: string;
    };
    savings: {
        amount: number;
        currency: string;
    };
    suggestions: Array<{
        objectId?: string;
        action: 'replace' | 'remove' | 'diy' | 'alternative';
        description: string;
        savingsAmount: number;
    }>;
}
export interface PhotoRenderResult {
    imageUrl: string;
    format: 'png' | 'jpg' | 'webp';
    resolution: {
        width: number;
        height: number;
    };
    renderTimeMs: number;
}
export interface FullRedesignResult {
    concept: string;
    style: string;
    colorPalette: string[];
    layouts: LayoutSuggestion[];
    moodboardUrl?: string;
    estimatedBudget?: {
        amount: number;
        currency: string;
    };
}
export interface IAIProvider {
    readonly name: string;
    suggestLayouts(context: AIContext): Promise<LayoutSuggestion[]>;
    optimizeLayout(context: AIContext): Promise<LayoutSuggestion>;
    transformStyle(context: AIContext, targetStyle: string): Promise<StyleTransformResult>;
    recommendProducts(context: AIContext, count?: number): Promise<ProductRecommendation[]>;
    optimizeBudget(context: AIContext): Promise<BudgetOptimization>;
    renderPhotorealistic(context: AIContext, cameraAngle?: string): Promise<PhotoRenderResult>;
    fullRedesign(context: AIContext, preferences?: Record<string, unknown>): Promise<FullRedesignResult>;
}
