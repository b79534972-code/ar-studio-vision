import { PrismaService } from './prisma.service';
import { ICreditRepository } from '../../domain/repositories/credit.repository';
import { CreditPurchaseEntity } from '../../domain/entities/credit.entity';
import { SubscriptionPlan } from '../../domain/entities/user.entity';
export declare class PrismaCreditRepository implements ICreditRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
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