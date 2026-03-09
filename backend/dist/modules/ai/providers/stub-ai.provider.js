"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StubAIProvider = void 0;
const common_1 = require("@nestjs/common");
let StubAIProvider = class StubAIProvider {
    constructor() {
        this.logger = new common_1.Logger(StubAIProvider.name);
        this.name = 'stub';
    }
    simulateDelay(ms = 500) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async suggestLayouts(context) {
        var _a, _b, _c, _d;
        this.logger.log(`[STUB] suggestLayouts for user ${context.userId}`);
        await this.simulateDelay();
        const roomWidth = ((_a = context.roomConfig) === null || _a === void 0 ? void 0 : _a.width) ?? 6;
        const roomDepth = ((_b = context.roomConfig) === null || _b === void 0 ? void 0 : _b.depth) ?? 5;
        return [
            {
                name: 'Open Flow Layout',
                description: 'Maximizes walking space with furniture along walls',
                score: 0.92,
                objects: [
                    { id: 'sofa-1', name: 'Sofa', category: 'sofa', position: [roomWidth / 2, 0, 0.5], rotation: [0, 0, 0] },
                    { id: 'table-1', name: 'Coffee Table', category: 'table', position: [roomWidth / 2, 0, 2], rotation: [0, 0, 0] },
                    { id: 'chair-1', name: 'Accent Chair', category: 'chair', position: [1, 0, 2.5], rotation: [0, Math.PI / 4, 0] },
                ],
            },
            {
                name: 'Cozy Conversation',
                description: 'Furniture arranged for face-to-face interaction',
                score: 0.87,
                objects: [
                    { id: 'sofa-1', name: 'Sofa', category: 'sofa', position: [roomWidth / 2, 0, 1], rotation: [0, 0, 0] },
                    { id: 'sofa-2', name: 'Loveseat', category: 'sofa', position: [roomWidth / 2, 0, roomDepth - 1], rotation: [0, Math.PI, 0] },
                    { id: 'table-1', name: 'Coffee Table', category: 'table', position: [roomWidth / 2, 0, roomDepth / 2], rotation: [0, 0, 0] },
                ],
            },
        ];
    }
    async optimizeLayout(context) {
        var _a;
        this.logger.log(`[STUB] optimizeLayout for user ${context.userId}`);
        await this.simulateDelay();
        return {
            name: 'Optimized Layout',
            description: 'Space usage improved by 23%. Better traffic flow.',
            score: 0.95,
            objects: ((_a = context.objects) === null || _a === void 0 ? void 0 : _a.map((obj) => ({
                id: obj.id,
                name: obj.name,
                category: obj.category,
                position: obj.position,
                rotation: [0, 0, 0],
            }))) ?? [],
        };
    }
    async transformStyle(context, targetStyle) {
        var _a;
        this.logger.log(`[STUB] transformStyle → ${targetStyle} for user ${context.userId}`);
        await this.simulateDelay();
        const stylePalettes = {
            modern: ['#1a1a2e', '#16213e', '#0f3460', '#e94560'],
            scandinavian: ['#f5f5f0', '#d4c5a9', '#b8a88a', '#6b705c'],
            minimalist: ['#ffffff', '#f0f0f0', '#333333', '#e0e0e0'],
            industrial: ['#2d2d2d', '#8b7355', '#cd853f', '#d2691e'],
            japanese: ['#f5e6d3', '#c9b99a', '#8b7355', '#2d4a22'],
        };
        return {
            styleName: targetStyle,
            colorPalette: stylePalettes[targetStyle] ?? stylePalettes.modern,
            suggestedChanges: [
                { objectId: 'wall', property: 'color', from: ((_a = context.roomConfig) === null || _a === void 0 ? void 0 : _a.wallColor) ?? '#F5F5F4', to: (stylePalettes[targetStyle] === null || stylePalettes[targetStyle] === void 0 ? void 0 : stylePalettes[targetStyle][0]) ?? '#ffffff' },
                { objectId: 'floor', property: 'material', from: 'default', to: targetStyle === 'industrial' ? 'concrete' : 'wood' },
            ],
            moodDescription: `A ${targetStyle} transformation with carefully selected colors and materials for a cohesive aesthetic.`,
        };
    }
    async recommendProducts(context, count = 3) {
        var _a, _b;
        this.logger.log(`[STUB] recommendProducts (${count}) for user ${context.userId}`);
        await this.simulateDelay();
        const currency = ((_a = context.budget) === null || _a === void 0 ? void 0 : _a.currency) ?? 'VND';
        const products = [
            { name: 'IKEA KIVIK Sofa', category: 'sofa', reason: 'Perfect fit for the room dimensions.', estimatedPrice: { amount: currency === 'VND' ? 15000000 : 599, currency }, dimensions: { width: 2.28, height: 0.83, depth: 0.95 }, style: ((_b = context.style) !== null && _b !== void 0 ? _b : 'modern') },
            { name: 'Mid-Century Coffee Table', category: 'table', reason: 'Compact footprint with storage shelf.', estimatedPrice: { amount: currency === 'VND' ? 5000000 : 199, currency }, dimensions: { width: 1.2, height: 0.45, depth: 0.6 }, style: context.style ?? 'modern' },
            { name: 'Monstera Plant', category: 'plant', reason: 'Adds natural warmth.', estimatedPrice: { amount: currency === 'VND' ? 500000 : 25, currency }, dimensions: { width: 0.6, height: 1.2, depth: 0.6 }, style: 'any' },
        ];
        return products.slice(0, count);
    }
    async optimizeBudget(context) {
        var _a;
        this.logger.log(`[STUB] optimizeBudget for user ${context.userId}`);
        await this.simulateDelay();
        const currency = ((_a = context.budget) === null || _a === void 0 ? void 0 : _a.currency) ?? 'VND';
        const isVND = currency === 'VND';
        return {
            totalEstimate: { amount: isVND ? 25000000 : 1000, currency },
            savings: { amount: isVND ? 8000000 : 320, currency },
            suggestions: [
                { action: 'alternative', description: 'Consider IKEA alternatives for the accent chair.', savingsAmount: isVND ? 3000000 : 120 },
                { action: 'diy', description: 'DIY floating shelves instead of buying a bookcase.', savingsAmount: isVND ? 2000000 : 80 },
                { action: 'replace', description: 'Second-hand coffee table in excellent condition.', savingsAmount: isVND ? 3000000 : 120, objectId: 'table-1' },
            ],
        };
    }
    async renderPhotorealistic(context, cameraAngle) {
        this.logger.log(`[STUB] renderPhotorealistic (angle: ${cameraAngle !== null && cameraAngle !== void 0 ? cameraAngle : 'default'}) for user ${context.userId}`);
        await this.simulateDelay(1000);
        return {
            imageUrl: 'https://placehold.co/1920x1080/1a1a2e/ffffff?text=AI+Render+Placeholder',
            format: 'png',
            resolution: { width: 1920, height: 1080 },
            renderTimeMs: 1000,
        };
    }
    async fullRedesign(context, preferences) {
        var _a, _b;
        this.logger.log(`[STUB] fullRedesign for user ${context.userId}`);
        await this.simulateDelay(1500);
        const style = (preferences === null || preferences === void 0 ? void 0 : preferences.style) ?? context.style ?? 'modern';
        return {
            concept: `Complete ${style} transformation with an emphasis on natural light and functional zones.`,
            style,
            colorPalette: ['#f5f5f0', '#d4c5a9', '#333333', '#e94560'],
            layouts: await this.suggestLayouts(context),
            estimatedBudget: { amount: ((_a = context.budget) === null || _a === void 0 ? void 0 : _a.currency) === 'USD' ? 2500 : 60000000, currency: ((_b = context.budget) === null || _b === void 0 ? void 0 : _b.currency) ?? 'VND' },
        };
    }
};
exports.StubAIProvider = StubAIProvider;
exports.StubAIProvider = StubAIProvider = __decorate([
    (0, common_1.Injectable)()
], StubAIProvider);
//# sourceMappingURL=stub-ai.provider.js.map
