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
exports.LayoutService = void 0;
const common_1 = require("@nestjs/common");
const layout_repository_1 = require("../../domain/repositories/layout.repository");
const user_repository_1 = require("../../domain/repositories/user.repository");
const feature_guard_service_1 = require("../feature-guard/feature-guard.service");
let LayoutService = class LayoutService {
    constructor(layoutRepo, userRepo, featureGuard) {
        this.layoutRepo = layoutRepo;
        this.userRepo = userRepo;
        this.featureGuard = featureGuard;
    }
    async getUserLayouts(userId) {
        return this.layoutRepo.findByUserId(userId);
    }
    async createLayout(user, data) {
        const usage = await this.userRepo.getUsage(user.id);
        if (!usage)
            throw new common_1.NotFoundException('Usage record not found');
        this.featureGuard.canCreateLayout(user, usage);
        const layout = await this.layoutRepo.create({
            userId: user.id,
            name: data.name,
            roomId: data.roomId,
            version: 1,
            objects: data.objects,
        });
        await this.userRepo.incrementUsage(user.id, 'layoutsCount');
        return layout;
    }
    async updateLayout(user, layoutId, data) {
        const layout = await this.layoutRepo.findById(layoutId);
        if (!layout || layout.userId !== user.id)
            throw new common_1.NotFoundException('Layout not found');
        try {
            this.featureGuard.canCreateVersion(user);
            await this.layoutRepo.createVersion(layoutId, { objects: layout.objects, version: layout.version });
        }
        catch {
        }
        return this.layoutRepo.update(layoutId, { ...data, version: layout.version + 1 });
    }
    async deleteLayout(user, layoutId) {
        const layout = await this.layoutRepo.findById(layoutId);
        if (!layout || layout.userId !== user.id)
            throw new common_1.NotFoundException('Layout not found');
        await this.layoutRepo.delete(layoutId);
    }
    async getVersionHistory(user, layoutId) {
        this.featureGuard.canCreateVersion(user);
        return this.layoutRepo.getVersions(layoutId);
    }
};
exports.LayoutService = LayoutService;
exports.LayoutService = LayoutService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(layout_repository_1.LAYOUT_REPOSITORY)),
    __param(1, (0, common_1.Inject)(user_repository_1.USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, feature_guard_service_1.FeatureGuardService])
], LayoutService);
//# sourceMappingURL=layout.service.js.map