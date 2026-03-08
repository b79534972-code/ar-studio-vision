import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { StripeWebhookService } from './stripe-webhook.service';
import { UserEntity, SubscriptionPlan } from '../../domain/entities/user.entity';
export declare class StripeController {
    private readonly stripeService;
    private readonly webhookService;
    constructor(stripeService: StripeService, webhookService: StripeWebhookService);
    createSetupIntent(user: UserEntity): Promise<{
        clientSecret: string;
        customerId: string;
    }>;
    subscribe(user: UserEntity, body: {
        plan: Exclude<SubscriptionPlan, 'free'>;
        paymentMethodId: string;
    }): Promise<{
        subscriptionId: string;
        status: string;
    }>;
    cancel(user: UserEntity): Promise<{
        success: boolean;
    }>;
    webhook(signature: string, req: RawBodyRequest<Request>): Promise<{
        received: boolean;
    }>;
}
