/**
 * StripeWebhookService — Processes Stripe webhook events
 * Authoritative source for subscription state changes.
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { USER_REPOSITORY, IUserRepository } from '../../domain/repositories/user.repository';
import { AUDIT_REPOSITORY, IAuditRepository } from '../../domain/repositories/audit.repository';
import { SubscriptionPlan } from '../../domain/entities/user.entity';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(AUDIT_REPOSITORY) private readonly auditRepo: IAuditRepository,
  ) {}

  async handleEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        this.logger.log(`Unhandled event: ${event.type}`);
    }
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    const user = await this.userRepo.findByStripeCustomerId(customerId);
    if (!user) return;

    await this.userRepo.update(user.id, { subscriptionStatus: 'active' });
    await this.auditRepo.create({ userId: user.id, action: 'invoice.paid', metadata: { invoiceId: invoice.id } });
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    const user = await this.userRepo.findByStripeCustomerId(customerId);
    if (!user) return;

    await this.userRepo.update(user.id, { subscriptionStatus: 'past_due' });
    await this.auditRepo.create({ userId: user.id, action: 'invoice.payment_failed', metadata: { invoiceId: invoice.id } });
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    const user = await this.userRepo.findByStripeCustomerId(customerId);
    if (!user) return;

    const plan = (subscription.metadata?.plan as SubscriptionPlan) || user.subscriptionPlan;
    const status = subscription.status === 'active' ? 'active'
      : subscription.status === 'past_due' ? 'past_due'
      : subscription.status === 'canceled' ? 'canceled'
      : 'trialing';

    await this.userRepo.update(user.id, { subscriptionPlan: plan, subscriptionStatus: status });
    await this.auditRepo.create({ userId: user.id, action: 'subscription.updated', metadata: { plan, status } });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    const user = await this.userRepo.findByStripeCustomerId(customerId);
    if (!user) return;

    await this.userRepo.update(user.id, {
      subscriptionPlan: 'free',
      subscriptionStatus: 'canceled',
      stripeSubscriptionId: undefined,
    });
    await this.auditRepo.create({ userId: user.id, action: 'subscription.deleted' });
  }
}
