import Stripe from 'stripe';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { IAuditRepository } from '../../domain/repositories/audit.repository';
export declare class StripeWebhookService {
    private readonly userRepo;
    private readonly auditRepo;
    private readonly logger;
    constructor(userRepo: IUserRepository, auditRepo: IAuditRepository);
    handleEvent(event: Stripe.Event): Promise<void>;
    private handleInvoicePaid;
    private handlePaymentFailed;
    private handleSubscriptionUpdated;
    private handleSubscriptionDeleted;
}
