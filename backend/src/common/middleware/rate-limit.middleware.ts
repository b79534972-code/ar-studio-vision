/**
 * RateLimitMiddleware — Per-tier rate limiting using Redis
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { getRedisConnectionOptions } from '../redis.config';

const TIER_LIMITS: Record<string, { requests: number; windowSeconds: number }> = {
  free: { requests: 30, windowSeconds: 60 },
  basic: { requests: 60, windowSeconds: 60 },
  advanced: { requests: 120, windowSeconds: 60 },
  pro: { requests: 300, windowSeconds: 60 },
};

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(getRedisConnectionOptions());
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const userId = (req as any).user?.sub;
    const plan = (req as any).userEntity?.subscriptionPlan || 'free';

    if (!userId) return next();

    const limits = TIER_LIMITS[plan] || TIER_LIMITS.free;
    const key = `rate:${userId}:${Math.floor(Date.now() / (limits.windowSeconds * 1000))}`;

    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, limits.windowSeconds);
    }

    res.setHeader('X-RateLimit-Limit', limits.requests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limits.requests - current));

    if (current > limits.requests) {
      res.status(429).json({
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.',
        retryAfter: limits.windowSeconds,
      });
      return;
    }

    next();
  }
}
