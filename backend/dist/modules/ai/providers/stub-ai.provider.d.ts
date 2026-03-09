import { IAIProvider, AIContext, LayoutSuggestion, StyleTransformResult, ProductRecommendation, BudgetOptimization, PhotoRenderResult, FullRedesignResult } from './ai-provider.interface';
export declare class StubAIProvider implements IAIProvider {
    private readonly logger;
    readonly name = "stub";
    private simulateDelay;
    suggestLayouts(context: AIContext): Promise<LayoutSuggestion[]>;
    optimizeLayout(context: AIContext): Promise<LayoutSuggestion>;
    transformStyle(context: AIContext, targetStyle: string): Promise<StyleTransformResult>;
    recommendProducts(context: AIContext, count?: number): Promise<ProductRecommendation[]>;
    optimizeBudget(context: AIContext): Promise<BudgetOptimization>;
    renderPhotorealistic(context: AIContext, cameraAngle?: string): Promise<PhotoRenderResult>;
    fullRedesign(context: AIContext, preferences?: Record<string, unknown>): Promise<FullRedesignResult>;
}
