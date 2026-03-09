import { IUserRepository } from '../../domain/repositories/user.repository';
import { IAuditRepository } from '../../domain/repositories/audit.repository';
import { FeatureGuardService } from '../feature-guard/feature-guard.service';
import { UserEntity } from '../../domain/entities/user.entity';
import { IAIProvider, AIContext, LayoutSuggestion, StyleTransformResult, ProductRecommendation, BudgetOptimization, PhotoRenderResult, FullRedesignResult } from './providers/ai-provider.interface';
export interface AIResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    creditsUsed?: number;
    creditsRemaining?: number;
}
export declare class AIService {
    private readonly userRepo;
    private readonly auditRepo;
    private readonly aiProvider;
    private readonly featureGuard;
    private readonly logger;
    private redis;
    constructor(userRepo: IUserRepository, auditRepo: IAuditRepository, aiProvider: IAIProvider, featureGuard: FeatureGuardService);
    private execute;
    suggestLayouts(user: UserEntity, context: Omit<AIContext, 'userId'>): Promise<AIResult<LayoutSuggestion[]>>;
    optimizeLayout(user: UserEntity, context: Omit<AIContext, 'userId'>): Promise<AIResult<LayoutSuggestion>>;
    transformStyle(user: UserEntity, context: Omit<AIContext, 'userId'>, targetStyle: string): Promise<AIResult<StyleTransformResult>>;
    recommendProducts(user: UserEntity, context: Omit<AIContext, 'userId'>, count?: number): Promise<AIResult<ProductRecommendation[]>>;
    optimizeBudget(user: UserEntity, context: Omit<AIContext, 'userId'>): Promise<AIResult<BudgetOptimization>>;
    renderPhotorealistic(user: UserEntity, context: Omit<AIContext, 'userId'>, cameraAngle?: string): Promise<AIResult<PhotoRenderResult>>;
    fullRedesign(user: UserEntity, context: Omit<AIContext, 'userId'>, preferences?: Record<string, unknown>): Promise<AIResult<FullRedesignResult>>;
    getProviderName(): string;
    getCreditsRemaining(userId: string): Promise<number>;
}
