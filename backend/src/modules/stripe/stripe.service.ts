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

const PLAN_PRICE_IDS: Record<Exclude<SubscriptionPlan, 'free'>, string> = {
  basic: process.env.STRIPE_PRICE_BASIC || 'price_basic',
  advanced: process.env.STRIPE_PRICE_ADVANCED || 'price_advanced',
  pro: process.env.STRIPE_PRICE_PRO || 'price_pro',
};

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
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
