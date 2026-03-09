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
exports.FeatureGuardService = void 0;
const common_1 = require("@nestjs/common");
const credit_repository_1 = require("../../domain/repositories/credit.repository");
const PLAN_LIMITS = {
    free: { maxModels: 5, maxLayouts: 5, maxProjects: 3, advancedAI: false, versionHistory: false },
    basic: { maxModels: 20, maxLayouts: 20, maxProjects: 5, advancedAI: false, versionHistory: false },
    advanced: { maxModels: 50, maxLayouts: 50, maxProjects: 10, advancedAI: true, versionHistory: true },
    pro: { maxModels: null, maxLayouts: null, maxProjects: null, advancedAI: true, versionHistory: true },
};
let FeatureGuardService = class FeatureGuardService {
    constructor(creditRepo) {
        this.creditRepo = creditRepo;
    }
    getLimits(plan) {
        return PLAN_LIMITS[plan];
    }
    canUploadModel(user, usage) {
        const limits = PLAN_LIMITS[user.subscriptionPlan];
        if (limits.maxModels !== null && usage.modelsCount >= limits.maxModels) {
            throw new common_1.ForbiddenException({
                code: 'LIMIT_EXCEEDED',
                feature: 'MODEL_UPLOAD',
                current: usage.modelsCount,
                limit: limits.maxModels,
            });
        }
    }
    canCreateLayout(user, usage) {
        const limits = PLAN_LIMITS[user.subscriptionPlan];
        if (limits.maxLayouts !== null && usage.layoutsCount >= limits.maxLayouts) {
            throw new common_1.ForbiddenException({
                code: 'LIMIT_EXCEEDED',
                feature: 'LAYOUT_CREATE',
                current: usage.layoutsCount,
                limit: limits.maxLayouts,
            });
        }
    }
    async canUseAI(userId, creditCost = 1) {
        const remaining = await this.creditRepo.getTotalRemaining(userId);
        if (remaining < creditCost) {
            throw new common_1.ForbiddenException({
                code: 'CREDITS_EXHAUSTED',
                feature: 'AI_REQUEST',
                remaining,
                required: creditCost,
                message: 'Not enough AI credits. Purchase a credit pack to continue.',
            });
        }
    }
    async consumeAICredits(userId, amount) {
        return this.creditRepo.atomicConsumeCredits(userId, amount);
    }
    canUseAdvancedAI(user) {
        const limits = PLAN_LIMITS[user.subscriptionPlan];
        if (!limits.advancedAI) {
            throw new common_1.ForbiddenException({
                code: 'FEATURE_RESTRICTED',
                feature: 'ADVANCED_AI',
                requiredPlan: 'advanced',
            });
        }
    }
    canCreateVersion(user) {
        const limits = PLAN_LIMITS[user.subscriptionPlan];
        if (!limits.versionHistory) {
            throw new common_1.ForbiddenException({
                code: 'FEATURE_RESTRICTED',
                feature: 'VERSION_HISTORY',
                requiredPlan: 'advanced',
            });
        }
    }
    async getCreditsRemaining(userId) {
        return this.creditRepo.getTotalRemaining(userId);
    }
};
exports.FeatureGuardService = FeatureGuardService;
exports.FeatureGuardService = FeatureGuardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(credit_repository_1.CREDIT_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], FeatureGuardService);
//# sourceMappingURL=feature-guard.service.js.map