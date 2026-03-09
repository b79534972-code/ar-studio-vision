/**
 * FeatureGuard — Server-Side Feature Enforcement
 *
 * Single source of truth for plan limits.
 * AI credit checks now use FIFO credit batches via ICreditRepository.
 * Returns structured errors with code, feature, current, limit.
 */

import { Injectable, ForbiddenException, Inject } from '@nestjs/common';
import { UserEntity, UserUsageEntity, SubscriptionPlan } from '../../domain/entities/user.entity';
import { CREDIT_REPOSITORY, ICreditRepository } from '../../domain/repositories/credit.repository';

interface PlanLimits {
  maxModels: number | null;
  maxLayouts: number | null;
  maxProjects: number | null;
  advancedAI: boolean;
  versionHistory: boolean;
}

const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free:     { maxModels: 5,    maxLayouts: 5,    maxProjects: 3,    advancedAI: false, versionHistory: false },
  basic:    { maxModels: 20,   maxLayouts: 20,   maxProjects: 5,    advancedAI: false, versionHistory: false },
  advanced: { maxModels: 50,   maxLayouts: 50,   maxProjects: 10,   advancedAI: true,  versionHistory: true },
  pro:      { maxModels: null,  maxLayouts: null,  maxProjects: null, advancedAI: true,  versionHistory: true },
};

@Injectable()
export class FeatureGuardService {
  constructor(
    @Inject(CREDIT_REPOSITORY) private readonly creditRepo: ICreditRepository,
  ) {}

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

  /**
   * Check if user can use AI by checking FIFO credit batches.
   * Does NOT consume credits — call consumeAICredits() after successful processing.
   */
  async canUseAI(userId: string, creditCost: number = 1): Promise<void> {
    const remaining = await this.creditRepo.getTotalRemaining(userId);
    if (remaining < creditCost) {
      throw new ForbiddenException({
        code: 'CREDITS_EXHAUSTED',
        feature: 'AI_REQUEST',
        remaining,
        required: creditCost,
        message: 'Not enough AI credits. Purchase a credit pack to continue.',
      });
    }
  }

  /**
   * Consume AI credits using FIFO (earliest expiry first).
   * Should be called after AI processing succeeds.
   */
  async consumeAICredits(userId: string, amount: number): Promise<{ success: boolean; totalRemaining: number }> {
    return this.creditRepo.atomicConsumeCredits(userId, amount);
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

  /** Get total remaining credits for a user */
  async getCreditsRemaining(userId: string): Promise<number> {
    return this.creditRepo.getTotalRemaining(userId);
  }
}
