import Stripe from 'stripe';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { SubscriptionPlan } from '../../domain/entities/user.entity';
import { ICreditRepository } from '../../domain/repositories/credit.repository';
import { IAuditRepository } from '../../domain/repositories/audit.repository';
export declare class StripeService {
    private readonly userRepo;
    private readonly creditRepo;
    private readonly auditRepo;
    private stripe;
    constructor(userRepo: IUserRepository, creditRepo: ICreditRepository, auditRepo: IAuditRepository);
    purchaseDemoCredits(userId: string, plan: Exclude<SubscriptionPlan, 'free'>, currency: 'VND' | 'USD'): Promise<{
        success: true;
        plan: Exclude<SubscriptionPlan, 'free'>;
        creditsAdded: number;
    }>;
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
