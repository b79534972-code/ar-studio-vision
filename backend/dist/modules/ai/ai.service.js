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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const user_repository_1 = require("../../domain/repositories/user.repository");
const feature_guard_service_1 = require("../feature-guard/feature-guard.service");
let AIService = class AIService {
    constructor(userRepo, featureGuard) {
        this.userRepo = userRepo;
        this.featureGuard = featureGuard;
        this.redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
    }
    async executeAIRequest(user, operation) {
        const usage = await this.userRepo.getUsage(user.id);
        if (!usage)
            return { success: false, error: 'Usage record not found' };
        this.featureGuard.canUseAI(user, usage);
        const lockKey = `ai_lock:${user.id}`;
        const acquired = await this.redis.set(lockKey, '1', 'EX', 10, 'NX');
        if (!acquired)
            return { success: false, error: 'AI request already in progress' };
        try {
            const limit = this.featureGuard.getAILimit(user.subscriptionPlan);
            const { allowed, current } = await this.userRepo.atomicAIIncrement(user.id, limit);
            if (!allowed) {
                return { success: false, error: `AI limit reached (${current}/${limit})` };
            }
            try {
                const result = await operation();
                return { success: true, data: result };
            }
            catch (aiError) {
                await this.userRepo.decrementUsage(user.id, 'aiRequestsCount');
                return { success: false, error: 'AI processing failed' };
            }
        }
        finally {
            await this.redis.del(lockKey);
        }
    }
    async suggestPlacement(user, modelId, roomId) {
        return this.executeAIRequest(user, async () => {
            return { position: { x: 0, y: 0, z: -2 }, confidence: 0.92 };
        });
    }
    async generateLayouts(user, roomId) {
        this.featureGuard.canUseAdvancedAI(user);
        return this.executeAIRequest(user, async () => {
            return { layouts: [{ name: 'Modern Minimal', score: 0.95 }] };
        });
    }
};
exports.AIService = AIService;
exports.AIService = AIService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_1.USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object, feature_guard_service_1.FeatureGuardService])
], AIService);
//# sourceMappingURL=ai.service.js.map