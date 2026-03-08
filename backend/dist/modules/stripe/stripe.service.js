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
const PLAN_PRICE_IDS = {
    basic: process.env.STRIPE_PRICE_BASIC || 'price_basic',
    advanced: process.env.STRIPE_PRICE_ADVANCED || 'price_advanced',
    pro: process.env.STRIPE_PRICE_PRO || 'price_pro',
};
let StripeService = class StripeService {
    constructor(userRepo) {
        this.userRepo = userRepo;
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
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
    __metadata("design:paramtypes", [Object])
], StripeService);
//# sourceMappingURL=stripe.service.js.map