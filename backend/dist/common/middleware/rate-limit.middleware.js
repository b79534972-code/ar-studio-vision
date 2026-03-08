"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitMiddleware = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const TIER_LIMITS = {
    free: { requests: 30, windowSeconds: 60 },
    basic: { requests: 60, windowSeconds: 60 },
    advanced: { requests: 120, windowSeconds: 60 },
    pro: { requests: 300, windowSeconds: 60 },
};
let RateLimitMiddleware = class RateLimitMiddleware {
    constructor() {
        if (process.env.REDIS_URL) {
            this.redis = new ioredis_1.default(process.env.REDIS_URL);
        }
        else {
            this.redis = new ioredis_1.default({
                host: process.env.REDIS_HOST || 'redis',
                port: Number(process.env.REDIS_PORT) || 6379,
                password: process.env.REDIS_PASSWORD || undefined,
            });
        }
    }
    async use(req, res, next) {
        const userId = req.user?.sub;
        const plan = req.userEntity?.subscriptionPlan || 'free';
        if (!userId)
            return next();
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
};
exports.RateLimitMiddleware = RateLimitMiddleware;
exports.RateLimitMiddleware = RateLimitMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RateLimitMiddleware);
//# sourceMappingURL=rate-limit.middleware.js.map