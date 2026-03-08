import { UserEntity, UserUsageEntity, SubscriptionPlan } from '../../domain/entities/user.entity';
interface PlanLimits {
    maxModels: number | null;
    maxLayouts: number | null;
    maxAIRequests: number | null;
    maxProjects: number | null;
    advancedAI: boolean;
    versionHistory: boolean;
}
export declare class FeatureGuardService {
    getLimits(plan: SubscriptionPlan): PlanLimits;
    canUploadModel(user: UserEntity, usage: UserUsageEntity): void;
    canCreateLayout(user: UserEntity, usage: UserUsageEntity): void;
    canUseAI(user: UserEntity, usage: UserUsageEntity): void;
    canUseAdvancedAI(user: UserEntity): void;
    canCreateVersion(user: UserEntity): void;
    getAILimit(plan: SubscriptionPlan): number | null;
}
export {};
