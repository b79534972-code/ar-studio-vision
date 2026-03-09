/**
 * StripeService — Subscription + Card Payment Management
 *
 * Handles SetupIntent creation, subscription lifecycle.
 * Webhook is authoritative for status updates.
 */

import { Injectable, Inject } from '@nestjs/common';
import Stripe from 'stripe';
import { USER_REPOSITORY, IUserRepository } from '../../domain/repositories/user.repository';
import { SubscriptionPlan } from '../../domain/entities/user.entity';
import { CREDIT_REPOSITORY, ICreditRepository } from '../../domain/repositories/credit.repository';
import { AUDIT_REPOSITORY, IAuditRepository } from '../../domain/repositories/audit.repository';

const PLAN_PRICE_IDS: Record<Exclude<SubscriptionPlan, 'free'>, string> = {
  basic: process.env.STRIPE_PRICE_BASIC || 'price_basic',
  advanced: process.env.STRIPE_PRICE_ADVANCED || 'price_advanced',
  pro: process.env.STRIPE_PRICE_PRO || 'price_pro',
};

const PLAN_CREDIT_CONFIG: Record<Exclude<SubscriptionPlan, 'free'>, { credits: number; validityMonths: number; priceVND: number; priceUSD: number }> = {
  basic: { credits: 20, validityMonths: 3, priceVND: 49000, priceUSD: 2 },
  advanced: { credits: 50, validityMonths: 6, priceVND: 99000, priceUSD: 4 },
  pro: { credits: 120, validityMonths: 12, priceVND: 199000, priceUSD: 8 },
};

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(CREDIT_REPOSITORY) private readonly creditRepo: ICreditRepository,
    @Inject(AUDIT_REPOSITORY) private readonly auditRepo: IAuditRepository,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
  }

  async purchaseDemoCredits(
    userId: string,
    plan: Exclude<SubscriptionPlan, 'free'>,
    currency: 'VND' | 'USD',
  ): Promise<{ success: true; plan: Exclude<SubscriptionPlan, 'free'>; creditsAdded: number }> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('User not found');

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

  /**
   * Step 1: Create or retrieve Stripe customer + SetupIntent
   * Frontend uses the client_secret to collect card via Elements.
   */
  async createSetupIntent(userId: string): Promise<{ clientSecret: string; customerId: string }> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('User not found');

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
      payment_method_types: ['card'], // Visa, Mastercard, Amex, debit
      usage: 'off_session',
    });

    return { clientSecret: setupIntent.client_secret!, customerId };
  }

  /**
   * Step 2: Create subscription after card is attached
   */
  async createSubscription(userId: string, plan: Exclude<SubscriptionPlan, 'free'>, paymentMethodId: string): Promise<{ subscriptionId: string; status: string }> {
    const user = await this.userRepo.findById(userId);
    if (!user?.stripeCustomerId) throw new Error('Customer not found');

    // Set default payment method
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

    // Optimistic update — webhook is authoritative
    await this.userRepo.update(userId, {
      stripeSubscriptionId: subscription.id,
      subscriptionPlan: plan,
      subscriptionStatus: subscription.status === 'active' ? 'active' : 'trialing',
    });

    return { subscriptionId: subscription.id, status: subscription.status };
  }

  async cancelSubscription(userId: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user?.stripeSubscriptionId) throw new Error('No active subscription');

    await this.stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
  }

  /**
   * Construct and verify webhook event
   */
  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  }
}
