/**
 * AIService — Atomic Usage Tracking + AI Execution
 *
 * Flow: auth → gate check → atomic increment → call provider → return
 * If AI fails → rollback increment.
 * Redis lock prevents concurrent spam.
 */

import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { USER_REPOSITORY, IUserRepository } from '../../domain/repositories/user.repository';
import { FeatureGuardService } from '../feature-guard/feature-guard.service';
import { UserEntity } from '../../domain/entities/user.entity';

export interface AIResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

@Injectable()
export class AIService {
  private redis: Redis;

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    private readonly featureGuard: FeatureGuardService,
  ) {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async executeAIRequest<T>(user: UserEntity, operation: () => Promise<T>): Promise<AIResult<T>> {
    // 1. Get usage & check gate
    const usage = await this.userRepo.getUsage(user.id);
    if (!usage) return { success: false, error: 'Usage record not found' };

    this.featureGuard.canUseAI(user, usage); // Throws 403 if exceeded

    // 2. Redis lock to prevent concurrent spam
    const lockKey = `ai_lock:${user.id}`;
    const acquired = await this.redis.set(lockKey, '1', 'EX', 10, 'NX');
    if (!acquired) return { success: false, error: 'AI request already in progress' };

    try {
      // 3. Atomic increment with limit check
      const limit = this.featureGuard.getAILimit(user.subscriptionPlan);
      const { allowed, current } = await this.userRepo.atomicAIIncrement(user.id, limit);
      if (!allowed) {
        return { success: false, error: `AI limit reached (${current}/${limit})` };
      }

      // 4. Call AI provider
      try {
        const result = await operation();
        return { success: true, data: result };
      } catch (aiError) {
        // 5. Rollback on AI failure
        await this.userRepo.decrementUsage(user.id, 'aiRequestsCount');
        return { success: false, error: 'AI processing failed' };
      }
    } finally {
      await this.redis.del(lockKey);
    }
  }

  // Example: Suggest placement
  async suggestPlacement(user: UserEntity, modelId: string, roomId: string): Promise<AIResult> {
    return this.executeAIRequest(user, async () => {
      // Replace with actual AI provider call
      return { position: { x: 0, y: 0, z: -2 }, confidence: 0.92 };
    });
  }

  // Example: Generate layouts (advanced AI)
  async generateLayouts(user: UserEntity, roomId: string): Promise<AIResult> {
    this.featureGuard.canUseAdvancedAI(user); // Extra gate for advanced
    return this.executeAIRequest(user, async () => {
      return { layouts: [{ name: 'Modern Minimal', score: 0.95 }] };
    });
  }
}
