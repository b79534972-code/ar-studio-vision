import { CreditPurchaseEntity } from '../entities/credit.entity';
import { SubscriptionPlan } from '../entities/user.entity';
export declare const CREDIT_REPOSITORY: unique symbol;
export interface ICreditRepository {
    getActiveBatches(userId: string): Promise<CreditPurchaseEntity[]>;
    getAllBatches(userId: string): Promise<CreditPurchaseEntity[]>;
    createBatch(data: {
        userId: string;
        plan: SubscriptionPlan;
        creditAmount: number;
        priceAmount: number;
        currency: 'VND' | 'USD';
        expiresAt: Date;
        stripePaymentId?: string;
        stripeInvoiceId?: string;
    }): Promise<CreditPurchaseEntity>;
    updateBatch(id: string, data: Partial<CreditPurchaseEntity>): Promise<CreditPurchaseEntity>;
    atomicConsumeCredits(userId: string, amount: number): Promise<{
        success: boolean;
        totalRemaining: number;
    }>;
    getTotalRemaining(userId: string): Promise<number>;
}