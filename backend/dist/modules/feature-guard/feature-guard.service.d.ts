import { UserEntity, UserUsageEntity, SubscriptionPlan } from '../../domain/entities/user.entity';
import { ICreditRepository } from '../../domain/repositories/credit.repository';
interface PlanLimits {
    maxModels: number | null;
    maxLayouts: number | null;
    maxProjects: number | null;
    advancedAI: boolean;
    versionHistory: boolean;
}
export declare class FeatureGuardService {
    private readonly creditRepo;
    constructor(creditRepo: ICreditRepository);
    getLimits(plan: SubscriptionPlan): PlanLimits;
    canUploadModel(user: UserEntity, usage: UserUsageEntity): void;
    canCreateLayout(user: UserEntity, usage: UserUsageEntity): void;
    canUseAI(userId: string, creditCost?: number): Promise<void>;
    consumeAICredits(userId: string, amount: number): Promise<{
        success: boolean;
        totalRemaining: number;
    }>;
    canUseAdvancedAI(user: UserEntity): void;
    canCreateVersion(user: UserEntity): void;
    getCreditsRemaining(userId: string): Promise<number>;
}
export {};
