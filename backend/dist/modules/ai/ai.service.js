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
var AIService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const user_repository_1 = require("../../domain/repositories/user.repository");
const audit_repository_1 = require("../../domain/repositories/audit.repository");
const feature_guard_service_1 = require("../feature-guard/feature-guard.service");
const ai_provider_interface_1 = require("./providers/ai-provider.interface");
const CREDIT_COSTS = {
    layout_suggest: 1,
    layout_optimize: 1,
    style_transform: 2,
    product_recommend: 1,
    budget_optimize: 1,
    photorealistic_render: 3,
    full_room_redesign: 5,
};
let AIService = AIService_1 = class AIService {
    constructor(userRepo, auditRepo, aiProvider, featureGuard) {
        this.userRepo = userRepo;
        this.auditRepo = auditRepo;
        this.aiProvider = aiProvider;
        this.featureGuard = featureGuard;
        this.logger = new common_1.Logger(AIService_1.name);
        this.redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
        this.logger.log(`AI Provider initialized: ${this.aiProvider.name}`);
    }
    async execute(user, feature, operation, metadata) {
        const creditCost = CREDIT_COSTS[feature];
        await this.featureGuard.canUseAI(user.id, creditCost);
        const lockKey = `ai_lock:${user.id}`;
        const acquired = await this.redis.set(lockKey, '1', 'EX', 30, 'NX');
        if (!acquired) {
            return { success: false, error: 'AI request already in progress. Please wait.' };
        }
        const startTime = Date.now();
        try {
            const result = await operation();
            const { success: consumed, totalRemaining } = await this.featureGuard.consumeAICredits(user.id, creditCost);
            if (!consumed) {
                return { success: false, error: 'Failed to consume credits after processing.' };
            }
            const processingMs = Date.now() - startTime;
            await this.auditRepo.create({
                userId: user.id,
                action: `ai.${feature}`,
                metadata: { provider: this.aiProvider.name, creditCost, creditsRemaining: totalRemaining, processingMs, ...metadata },
            });
            this.logger.log(`AI [${feature}] completed for user ${user.id} in ${processingMs}ms (credits: -${creditCost}, remaining: ${totalRemaining})`);
            return { success: true, data: result, creditsUsed: creditCost, creditsRemaining: totalRemaining };
        }
        catch (error) {
            this.logger.error(`AI [${feature}] failed for user ${user.id}: ${error}`);
            return { success: false, error: error instanceof Error ? error.message : 'AI processing failed' };
        }
        finally {
            await this.redis.del(lockKey);
        }
    }
    async suggestLayouts(user, context) {
        const ctx = { ...context, userId: user.id };
        return this.execute(user, 'layout_suggest', () => this.aiProvider.suggestLayouts(ctx), { roomConfig: context.roomConfig });
    }
    async optimizeLayout(user, context) {
        const ctx = { ...context, userId: user.id };
        return this.execute(user, 'layout_optimize', () => this.aiProvider.optimizeLayout(ctx), { objectCount: context.objects?.length });
    }
    async transformStyle(user, context, targetStyle) {
        const ctx = { ...context, userId: user.id };
        this.featureGuard.canUseAdvancedAI(user);
        return this.execute(user, 'style_transform', () => this.aiProvider.transformStyle(ctx, targetStyle), { targetStyle });
    }
    async recommendProducts(user, context, count) {
        const ctx = { ...context, userId: user.id };
        return this.execute(user, 'product_recommend', () => this.aiProvider.recommendProducts(ctx, count), { requestedCount: count });
    }
    async optimizeBudget(user, context) {
        const ctx = { ...context, userId: user.id };
        return this.execute(user, 'budget_optimize', () => this.aiProvider.optimizeBudget(ctx), { budget: context.budget });
    }
    async renderPhotorealistic(user, context, cameraAngle) {
        const ctx = { ...context, userId: user.id };
        this.featureGuard.canUseAdvancedAI(user);
        return this.execute(user, 'photorealistic_render', () => this.aiProvider.renderPhotorealistic(ctx, cameraAngle), { cameraAngle });
    }
    async fullRedesign(user, context, preferences) {
        const ctx = { ...context, userId: user.id };
        this.featureGuard.canUseAdvancedAI(user);
        return this.execute(user, 'full_room_redesign', () => this.aiProvider.fullRedesign(ctx, preferences), { preferences });
    }
    getProviderName() {
        return this.aiProvider.name;
    }
    async getCreditsRemaining(userId) {
        return this.featureGuard.getCreditsRemaining(userId);
    }
};
exports.AIService = AIService;
exports.AIService = AIService = AIService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_1.USER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(audit_repository_1.AUDIT_REPOSITORY)),
    __param(2, (0, common_1.Inject)(ai_provider_interface_1.AI_PROVIDER)),
    __metadata("design:paramtypes", [Object, Object, Object, feature_guard_service_1.FeatureGuardService])
], AIService);
//# sourceMappingURL=ai.service.js.map
