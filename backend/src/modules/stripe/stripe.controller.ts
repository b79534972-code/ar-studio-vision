/**
 * StripeController — Payment endpoints + Webhook receiver
 */

import { Controller, Post, Body, Req, Res, HttpCode, Inject, UseGuards, Headers, RawBodyRequest } from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeService } from './stripe.service';
import { StripeWebhookService } from './stripe-webhook.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity, SubscriptionPlan } from '../../domain/entities/user.entity';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly webhookService: StripeWebhookService,
  ) {}

  @Post('setup-intent')
  @UseGuards(AuthGuard)
  async createSetupIntent(@CurrentUser() user: UserEntity) {
    return this.stripeService.createSetupIntent(user.id);
  }

  @Post('subscribe')
  @UseGuards(AuthGuard)
  async subscribe(
    @CurrentUser() user: UserEntity,
    @Body() body: { plan: Exclude<SubscriptionPlan, 'free'>; paymentMethodId: string },
  ) {
    return this.stripeService.createSubscription(user.id, body.plan, body.paymentMethodId);
  }

  @Post('purchase-demo')
  @UseGuards(AuthGuard)
  async purchaseDemo(
    @CurrentUser() user: UserEntity,
    @Body() body: { plan: Exclude<SubscriptionPlan, 'free'>; currency?: 'VND' | 'USD' },
  ) {
    return this.stripeService.purchaseDemoCredits(user.id, body.plan, body.currency || 'VND');
  }

  @Post('cancel')
  @UseGuards(AuthGuard)
  async cancel(@CurrentUser() user: UserEntity) {
    await this.stripeService.cancelSubscription(user.id);
    return { success: true };
  }

  /**
   * Webhook — raw body required for signature verification.
   * Never trust frontend. Webhook is authoritative.
   */
  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const event = this.stripeService.constructWebhookEvent(req.rawBody!, signature);
    await this.webhookService.handleEvent(event);
    return { received: true };
  }
}
