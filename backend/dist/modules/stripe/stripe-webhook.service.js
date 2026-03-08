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
var StripeWebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeWebhookService = void 0;
const common_1 = require("@nestjs/common");
const user_repository_1 = require("../../domain/repositories/user.repository");
const audit_repository_1 = require("../../domain/repositories/audit.repository");
let StripeWebhookService = StripeWebhookService_1 = class StripeWebhookService {
    constructor(userRepo, auditRepo) {
        this.userRepo = userRepo;
        this.auditRepo = auditRepo;
        this.logger = new common_1.Logger(StripeWebhookService_1.name);
    }
    async handleEvent(event) {
        switch (event.type) {
            case 'invoice.paid':
                await this.handleInvoicePaid(event.data.object);
                break;
            case 'invoice.payment_failed':
                await this.handlePaymentFailed(event.data.object);
                break;
            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object);
                break;
            default:
                this.logger.log(`Unhandled event: ${event.type}`);
        }
    }
    async handleInvoicePaid(invoice) {
        const customerId = invoice.customer;
        const user = await this.userRepo.findByStripeCustomerId(customerId);
        if (!user)
            return;
        await this.userRepo.update(user.id, { subscriptionStatus: 'active' });
        await this.auditRepo.create({ userId: user.id, action: 'invoice.paid', metadata: { invoiceId: invoice.id } });
    }
    async handlePaymentFailed(invoice) {
        const customerId = invoice.customer;
        const user = await this.userRepo.findByStripeCustomerId(customerId);
        if (!user)
            return;
        await this.userRepo.update(user.id, { subscriptionStatus: 'past_due' });
        await this.auditRepo.create({ userId: user.id, action: 'invoice.payment_failed', metadata: { invoiceId: invoice.id } });
    }
    async handleSubscriptionUpdated(subscription) {
        const customerId = subscription.customer;
        const user = await this.userRepo.findByStripeCustomerId(customerId);
        if (!user)
            return;
        const plan = subscription.metadata?.plan || user.subscriptionPlan;
        const status = subscription.status === 'active' ? 'active'
            : subscription.status === 'past_due' ? 'past_due'
                : subscription.status === 'canceled' ? 'canceled'
                    : 'trialing';
        await this.userRepo.update(user.id, { subscriptionPlan: plan, subscriptionStatus: status });
        await this.auditRepo.create({ userId: user.id, action: 'subscription.updated', metadata: { plan, status } });
    }
    async handleSubscriptionDeleted(subscription) {
        const customerId = subscription.customer;
        const user = await this.userRepo.findByStripeCustomerId(customerId);
        if (!user)
            return;
        await this.userRepo.update(user.id, {
            subscriptionPlan: 'free',
            subscriptionStatus: 'canceled',
            stripeSubscriptionId: undefined,
        });
        await this.auditRepo.create({ userId: user.id, action: 'subscription.deleted' });
    }
};
exports.StripeWebhookService = StripeWebhookService;
exports.StripeWebhookService = StripeWebhookService = StripeWebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_1.USER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(audit_repository_1.AUDIT_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object])
], StripeWebhookService);
//# sourceMappingURL=stripe-webhook.service.js.map