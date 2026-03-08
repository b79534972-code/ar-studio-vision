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
exports.StripeController = void 0;
const common_1 = require("@nestjs/common");
const stripe_service_1 = require("./stripe.service");
const stripe_webhook_service_1 = require("./stripe-webhook.service");
const auth_guard_1 = require("../../common/guards/auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let StripeController = class StripeController {
    constructor(stripeService, webhookService) {
        this.stripeService = stripeService;
        this.webhookService = webhookService;
    }
    async createSetupIntent(user) {
        return this.stripeService.createSetupIntent(user.id);
    }
    async subscribe(user, body) {
        return this.stripeService.createSubscription(user.id, body.plan, body.paymentMethodId);
    }
    async cancel(user) {
        await this.stripeService.cancelSubscription(user.id);
        return { success: true };
    }
    async webhook(signature, req) {
        const event = this.stripeService.constructWebhookEvent(req.rawBody, signature);
        await this.webhookService.handleEvent(event);
        return { received: true };
    }
};
exports.StripeController = StripeController;
__decorate([
    (0, common_1.Post)('setup-intent'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "createSetupIntent", null);
__decorate([
    (0, common_1.Post)('subscribe'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "subscribe", null);
__decorate([
    (0, common_1.Post)('cancel'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Headers)('stripe-signature')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "webhook", null);
exports.StripeController = StripeController = __decorate([
    (0, common_1.Controller)('stripe'),
    __metadata("design:paramtypes", [stripe_service_1.StripeService,
        stripe_webhook_service_1.StripeWebhookService])
], StripeController);
//# sourceMappingURL=stripe.controller.js.map