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
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = require("stripe");
const user_repository_1 = require("../../domain/repositories/user.repository");
const credit_repository_1 = require("../../domain/repositories/credit.repository");
const audit_repository_1 = require("../../domain/repositories/audit.repository");
const PLAN_PRICE_IDS = {
    basic: process.env.STRIPE_PRICE_BASIC || 'price_basic',
    advanced: process.env.STRIPE_PRICE_ADVANCED || 'price_advanced',
    pro: process.env.STRIPE_PRICE_PRO || 'price_pro',
};
const PLAN_CREDIT_CONFIG = {
    basic: { credits: 20, validityMonths: 3, priceVND: 49000, priceUSD: 2 },
    advanced: { credits: 50, validityMonths: 6, priceVND: 99000, priceUSD: 4 },
    pro: { credits: 120, validityMonths: 12, priceVND: 199000, priceUSD: 8 },
};
let StripeService = class StripeService {
    constructor(userRepo, creditRepo, auditRepo) {
        this.userRepo = userRepo;
        this.creditRepo = creditRepo;
        this.auditRepo = auditRepo;
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
    }
    async purchaseDemoCredits(userId, plan, currency) {
        const user = await this.userRepo.findById(userId);
        if (!user)
            throw new Error('User not found');
        const config = PLAN_CREDIT_CONFIG[plan];
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + config.validityMonths);
        await this.creditRepo.createBatch({
            userId,
            plan,
            creditAmount: config.credits,
            priceAmount: currency === 'USD' ? config.priceUSD : config.priceVND,
            currency,
            expiresAt,
            stripePaymentId: `demo_${userId}_${plan}_${Date.now()}`,
        });
        await this.userRepo.update(userId, {
            subscriptionPlan: plan,
            subscriptionStatus: 'active',
        });
        await this.auditRepo.create({
            userId,
            action: 'credit.purchase.demo',
            metadata: { plan, currency, creditsAdded: config.credits },
        });
        return { success: true, plan, creditsAdded: config.credits };
    }
    async createSetupIntent(userId) {
        const user = await this.userRepo.findById(userId);
        if (!user)
            throw new Error('User not found');
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await this.stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { userId: user.id },
            });
            customerId = customer.id;
            await this.userRepo.update(userId, { stripeCustomerId: customerId });
        }
        const setupIntent = await this.stripe.setupIntents.create({
            customer: customerId,
            payment_method_types: ['card'],
            usage: 'off_session',
        });
        return { clientSecret: setupIntent.client_secret, customerId };
    }
    async createSubscription(userId, plan, paymentMethodId) {
        const user = await this.userRepo.findById(userId);
        if (!user?.stripeCustomerId)
            throw new Error('Customer not found');
        await this.stripe.customers.update(user.stripeCustomerId, {
            invoice_settings: { default_payment_method: paymentMethodId },
        });
        const subscription = await this.stripe.subscriptions.create({
            customer: user.stripeCustomerId,
            items: [{ price: PLAN_PRICE_IDS[plan] }],
            payment_settings: {
                payment_method_types: ['card'],
                save_default_payment_method: 'on_subscription',
            },
            expand: ['latest_invoice.payment_intent'],
            metadata: { userId: user.id, plan },
        });
        await this.userRepo.update(userId, {
            stripeSubscriptionId: subscription.id,
            subscriptionPlan: plan,
            subscriptionStatus: subscription.status === 'active' ? 'active' : 'trialing',
        });
        return { subscriptionId: subscription.id, status: subscription.status };
    }
    async cancelSubscription(userId) {
        const user = await this.userRepo.findById(userId);
        if (!user?.stripeSubscriptionId)
            throw new Error('No active subscription');
        await this.stripe.subscriptions.update(user.stripeSubscriptionId, {
            cancel_at_period_end: true,
        });
    }
    constructWebhookEvent(payload, signature) {
        return this.stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_1.USER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(credit_repository_1.CREDIT_REPOSITORY)),
    __param(2, (0, common_1.Inject)(audit_repository_1.AUDIT_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, Object])
], StripeService);
//# sourceMappingURL=stripe.service.js.map