/**
 * FeatureGuard — Server-Side Feature Enforcement
 *
 * Single source of truth for plan limits.
 * Returns structured errors with code, feature, current, limit.
 */

import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserEntity, UserUsageEntity, SubscriptionPlan } from '../../domain/entities/user.entity';

interface PlanLimits {
  maxModels: number | null;
  maxLayouts: number | null;
  maxAIRequests: number | null;
  maxProjects: number | null;
  advancedAI: boolean;
  versionHistory: boolean;
}

const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free:     { maxModels: 5,    maxLayouts: 5,    maxAIRequests: 5,    maxProjects: 3,    advancedAI: false, versionHistory: false },
  basic:    { maxModels: 20,   maxLayouts: 20,   maxAIRequests: 20,   maxProjects: 5,    advancedAI: false, versionHistory: false },
  advanced: { maxModels: 50,   maxLayouts: 50,   maxAIRequests: 50,   maxProjects: 10,   advancedAI: true,  versionHistory: true },
  pro:      { maxModels: null,  maxLayouts: null,  maxAIRequests: null, maxProjects: null, advancedAI: true,  versionHistory: true },
};

@Injectable()
export class FeatureGuardService {
  getLimits(plan: SubscriptionPlan): PlanLimits {
    return PLAN_LIMITS[plan];
  }

  canUploadModel(user: UserEntity, usage: UserUsageEntity): void {
    const limits = PLAN_LIMITS[user.subscriptionPlan];
    if (limits.maxModels !== null && usage.modelsCount >= limits.maxModels) {
      throw new ForbiddenException({
        code: 'LIMIT_EXCEEDED',
        feature: 'MODEL_UPLOAD',
        current: usage.modelsCount,
        limit: limits.maxModels,
      });
    }
  }

  canCreateLayout(user: UserEntity, usage: UserUsageEntity): void {
    const limits = PLAN_LIMITS[user.subscriptionPlan];
    if (limits.maxLayouts !== null && usage.layoutsCount >= limits.maxLayouts) {
      throw new ForbiddenException({
        code: 'LIMIT_EXCEEDED',
        feature: 'LAYOUT_CREATE',
        current: usage.layoutsCount,
        limit: limits.maxLayouts,
      });
    }
  }

  canUseAI(user: UserEntity, usage: UserUsageEntity): void {
    const limits = PLAN_LIMITS[user.subscriptionPlan];
    if (limits.maxAIRequests !== null && usage.aiRequestsCount >= limits.maxAIRequests) {
      throw new ForbiddenException({
        code: 'LIMIT_EXCEEDED',
        feature: 'AI_REQUEST',
        current: usage.aiRequestsCount,
        limit: limits.maxAIRequests,
      });
    }
  }

  canUseAdvancedAI(user: UserEntity): void {
    const limits = PLAN_LIMITS[user.subscriptionPlan];
    if (!limits.advancedAI) {
      throw new ForbiddenException({
        code: 'FEATURE_RESTRICTED',
        feature: 'ADVANCED_AI',
        requiredPlan: 'advanced',
      });
    }
  }

  canCreateVersion(user: UserEntity): void {
    const limits = PLAN_LIMITS[user.subscriptionPlan];
    if (!limits.versionHistory) {
      throw new ForbiddenException({
        code: 'FEATURE_RESTRICTED',
        feature: 'VERSION_HISTORY',
        requiredPlan: 'advanced',
      });
    }
  }

  getAILimit(plan: SubscriptionPlan): number | null {
    return PLAN_LIMITS[plan].maxAIRequests;
  }
}
