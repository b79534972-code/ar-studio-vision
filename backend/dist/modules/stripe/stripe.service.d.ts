import Stripe from 'stripe';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { SubscriptionPlan } from '../../domain/entities/user.entity';
export declare class StripeService {
    private readonly userRepo;
    private stripe;
    constructor(userRepo: IUserRepository);
    createSetupIntent(userId: string): Promise<{
        clientSecret: string;
        customerId: string;
    }>;
    createSubscription(userId: string, plan: Exclude<SubscriptionPlan, 'free'>, paymentMethodId: string): Promise<{
        subscriptionId: string;
        status: string;
    }>;
    cancelSubscription(userId: string): Promise<void>;
    constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event;
}
