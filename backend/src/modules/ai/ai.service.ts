/**
 * AIService — Orchestrator with Pluggable Provider
 *
 * Flow: auth → gate check → credit check → Redis lock → call provider → consume credits → return
 * If AI fails → no credits consumed (check-then-consume pattern).
 * 
 * The actual AI logic lives in the injected IAIProvider.
 * Swap providers by changing the binding in ai.module.ts.
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { USER_REPOSITORY, IUserRepository } from '../../domain/repositories/user.repository';
import { AUDIT_REPOSITORY, IAuditRepository } from '../../domain/repositories/audit.repository';
import { getRedisConnectionOptions } from '../../common/redis.config';
import { FeatureGuardService } from '../feature-guard/feature-guard.service';
import { UserEntity } from '../../domain/entities/user.entity';
import {
  AI_PROVIDER,
  IAIProvider,
  AIContext,
  LayoutSuggestion,
  StyleTransformResult,
  ProductRecommendation,
  BudgetOptimization,
  PhotoRenderResult,
  FullRedesignResult,
} from './providers/ai-provider.interface';

/** Credit costs per feature — mirrors frontend aiCreditCosts.ts */
const CREDIT_COSTS = {
  layout_suggest: 1,
  layout_optimize: 1,
  style_transform: 2,
  product_recommend: 1,
  budget_optimize: 1,
  photorealistic_render: 3,
  full_room_redesign: 5,
} as const;

type AIFeatureType = keyof typeof CREDIT_COSTS;

export interface AIResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  creditsUsed?: number;
  creditsRemaining?: number;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private redis: Redis;

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(AUDIT_REPOSITORY) private readonly auditRepo: IAuditRepository,
    @Inject(AI_PROVIDER) private readonly aiProvider: IAIProvider,
    private readonly featureGuard: FeatureGuardService,
  ) {
    this.redis = new Redis(getRedisConnectionOptions());
    this.logger.log(`AI Provider initialized: ${this.aiProvider.name}`);
  }

  /**
   * Core execution wrapper — handles credits, locking, audit logging.
   * Provider methods are called inside this wrapper.
   */
  private async execute<T>(
    user: UserEntity,
    feature: AIFeatureType,
    operation: () => Promise<T>,
    metadata?: Record<string, unknown>,
  ): Promise<AIResult<T>> {
    const creditCost = CREDIT_COSTS[feature];

    // 1. Check credit availability (does NOT consume)
    await this.featureGuard.canUseAI(user.id, creditCost);

    // 2. Redis lock to prevent concurrent spam
    const lockKey = `ai_lock:${user.id}`;
    const acquired = await this.redis.set(lockKey, '1', 'EX', 30, 'NX');
    if (!acquired) {
      return { success: false, error: 'AI request already in progress. Please wait.' };
    }

    const startTime = Date.now();

    try {
      // 3. Call the AI provider
      const result = await operation();

      // 4. Consume credits AFTER successful processing
      const { success: consumed, totalRemaining } = await this.featureGuard.consumeAICredits(user.id, creditCost);
      if (!consumed) {
        return { success: false, error: 'Failed to consume credits after processing.' };
      }

      // 5. Audit log
      const processingMs = Date.now() - startTime;
      await this.auditRepo.create({
        userId: user.id,
        action: `ai.${feature}`,
        metadata: {
          provider: this.aiProvider.name,
          creditCost,
          creditsRemaining: totalRemaining,
          processingMs,
          ...metadata,
        },
      });

      this.logger.log(
        `AI [${feature}] completed for user ${user.id} in ${processingMs}ms (credits: -${creditCost}, remaining: ${totalRemaining})`,
      );

      return {
        success: true,
        data: result,
        creditsUsed: creditCost,
        creditsRemaining: totalRemaining,
      };
    } catch (error) {
      // No credits consumed on failure
      this.logger.error(`AI [${feature}] failed for user ${user.id}: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'AI processing failed',
      };
    } finally {
      await this.redis.del(lockKey);
    }
  }

  // ─── Public Feature Methods ────────────────────────────────

  async suggestLayouts(user: UserEntity, context: Omit<AIContext, 'userId'>): Promise<AIResult<LayoutSuggestion[]>> {
    const ctx: AIContext = { ...context, userId: user.id };
    return this.execute(user, 'layout_suggest', () => this.aiProvider.suggestLayouts(ctx), {
      roomConfig: context.roomConfig,
    });
  }

  async optimizeLayout(user: UserEntity, context: Omit<AIContext, 'userId'>): Promise<AIResult<LayoutSuggestion>> {
    const ctx: AIContext = { ...context, userId: user.id };
    return this.execute(user, 'layout_optimize', () => this.aiProvider.optimizeLayout(ctx), {
      objectCount: context.objects?.length,
    });
  }

  async transformStyle(user: UserEntity, context: Omit<AIContext, 'userId'>, targetStyle: string): Promise<AIResult<StyleTransformResult>> {
    const ctx: AIContext = { ...context, userId: user.id };
    this.featureGuard.canUseAdvancedAI(user); // Requires basic+ plan
    return this.execute(user, 'style_transform', () => this.aiProvider.transformStyle(ctx, targetStyle), {
      targetStyle,
    });
  }

  async recommendProducts(user: UserEntity, context: Omit<AIContext, 'userId'>, count?: number): Promise<AIResult<ProductRecommendation[]>> {
    const ctx: AIContext = { ...context, userId: user.id };
    return this.execute(user, 'product_recommend', () => this.aiProvider.recommendProducts(ctx, count), {
      requestedCount: count,
    });
  }

  async optimizeBudget(user: UserEntity, context: Omit<AIContext, 'userId'>): Promise<AIResult<BudgetOptimization>> {
    const ctx: AIContext = { ...context, userId: user.id };
    return this.execute(user, 'budget_optimize', () => this.aiProvider.optimizeBudget(ctx), {
      budget: context.budget,
    });
  }

  async renderPhotorealistic(user: UserEntity, context: Omit<AIContext, 'userId'>, cameraAngle?: string): Promise<AIResult<PhotoRenderResult>> {
    const ctx: AIContext = { ...context, userId: user.id };
    this.featureGuard.canUseAdvancedAI(user); // Requires advanced+ plan
    return this.execute(user, 'photorealistic_render', () => this.aiProvider.renderPhotorealistic(ctx, cameraAngle), {
      cameraAngle,
    });
  }

  async fullRedesign(user: UserEntity, context: Omit<AIContext, 'userId'>, preferences?: Record<string, unknown>): Promise<AIResult<FullRedesignResult>> {
    const ctx: AIContext = { ...context, userId: user.id };
    this.featureGuard.canUseAdvancedAI(user); // Requires pro plan
    return this.execute(user, 'full_room_redesign', () => this.aiProvider.fullRedesign(ctx, preferences), {
      preferences,
    });
  }

  // ─── Utility ──────────────────────────────────────────────

  /** Get current provider name (for health check / debugging) */
  getProviderName(): string {
    return this.aiProvider.name;
  }

  /** Get remaining credits for a user */
  async getCreditsRemaining(userId: string): Promise<number> {
    return this.featureGuard.getCreditsRemaining(userId);
  }
}
