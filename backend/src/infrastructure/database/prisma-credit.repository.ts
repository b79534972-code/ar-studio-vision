/**
 * Prisma Implementation — Credit Repository
 * FIFO credit batch management with atomic consumption.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ICreditRepository } from '../../domain/repositories/credit.repository';
import { CreditPurchaseEntity } from '../../domain/entities/credit.entity';
import { SubscriptionPlan } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaCreditRepository implements ICreditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveBatches(userId: string): Promise<CreditPurchaseEntity[]> {
    return this.prisma.creditPurchase.findMany({
      where: {
        userId,
        status: 'completed',
        creditsRemaining: { gt: 0 },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { expiresAt: 'asc' },
    }) as unknown as CreditPurchaseEntity[];
  }

  async getAllBatches(userId: string): Promise<CreditPurchaseEntity[]> {
    return this.prisma.creditPurchase.findMany({
      where: { userId, status: 'completed' },
      orderBy: { purchasedAt: 'desc' },
    }) as unknown as CreditPurchaseEntity[];
  }

  async createBatch(data: {
    userId: string;
    plan: SubscriptionPlan;
    creditAmount: number;
    priceAmount: number;
    currency: 'VND' | 'USD';
    expiresAt: Date;
    stripePaymentId?: string;
    stripeInvoiceId?: string;
  }): Promise<CreditPurchaseEntity> {
    return this.prisma.creditPurchase.create({
      data: {
        ...data,
        creditsRemaining: data.creditAmount,
        status: 'completed',
      },
    }) as unknown as CreditPurchaseEntity;
  }

  async updateBatch(id: string, data: Partial<CreditPurchaseEntity>): Promise<CreditPurchaseEntity> {
    return this.prisma.creditPurchase.update({
      where: { id },
      data,
    }) as unknown as CreditPurchaseEntity;
  }

  /**
   * Atomic FIFO credit consumption inside a transaction.
   * Deducts from earliest-expiring batches first.
   */
  async atomicConsumeCredits(userId: string, amount: number): Promise<{ success: boolean; totalRemaining: number }> {
    return this.prisma.$transaction(async (tx) => {
      // Get active batches sorted by expiry (FIFO)
      const batches = await tx.creditPurchase.findMany({
        where: {
          userId,
          status: 'completed',
          creditsRemaining: { gt: 0 },
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
        orderBy: { expiresAt: 'asc' },
      });

      const totalRemaining = batches.reduce((sum, b) => sum + b.creditsRemaining, 0);
      if (totalRemaining < amount) {
        return { success: false, totalRemaining };
      }

      let remaining = amount;
      for (const batch of batches) {
        if (remaining <= 0) break;
        const deduct = Math.min(batch.creditsRemaining, remaining);
        await tx.creditPurchase.update({
          where: { id: batch.id },
          data: { creditsRemaining: { decrement: deduct } },
        });
        remaining -= deduct;
      }

      return { success: true, totalRemaining: totalRemaining - amount };
    });
  }

  async getTotalRemaining(userId: string): Promise<number> {
    const result = await this.prisma.creditPurchase.aggregate({
      where: {
        userId,
        status: 'completed',
        creditsRemaining: { gt: 0 },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      _sum: { creditsRemaining: true },
    });
    return result._sum.creditsRemaining ?? 0;
  }
}
