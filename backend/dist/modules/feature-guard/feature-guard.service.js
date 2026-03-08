"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureGuardService = void 0;
const common_1 = require("@nestjs/common");
const PLAN_LIMITS = {
    free: { maxModels: 5, maxLayouts: 5, maxAIRequests: 5, maxProjects: 3, advancedAI: false, versionHistory: false },
    basic: { maxModels: 20, maxLayouts: 20, maxAIRequests: 20, maxProjects: 5, advancedAI: false, versionHistory: false },
    advanced: { maxModels: 50, maxLayouts: 50, maxAIRequests: 50, maxProjects: 10, advancedAI: true, versionHistory: true },
    pro: { maxModels: null, maxLayouts: null, maxAIRequests: null, maxProjects: null, advancedAI: true, versionHistory: true },
};
let FeatureGuardService = class FeatureGuardService {
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
    canUseAI(user, usage) {
        const limits = PLAN_LIMITS[user.subscriptionPlan];
        if (limits.maxAIRequests !== null && usage.aiRequestsCount >= limits.maxAIRequests) {
            throw new common_1.ForbiddenException({
                code: 'LIMIT_EXCEEDED',
                feature: 'AI_REQUEST',
                current: usage.aiRequestsCount,
                limit: limits.maxAIRequests,
            });
        }
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
    getAILimit(plan) {
        return PLAN_LIMITS[plan].maxAIRequests;
    }
};
exports.FeatureGuardService = FeatureGuardService;
exports.FeatureGuardService = FeatureGuardService = __decorate([
    (0, common_1.Injectable)()
], FeatureGuardService);
//# sourceMappingURL=feature-guard.service.js.map