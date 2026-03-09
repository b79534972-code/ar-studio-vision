/**
 * Repository Interface — Credit Purchases
 * FIFO credit batch management.
 */

import { CreditPurchaseEntity } from '../entities/credit.entity';
import { SubscriptionPlan } from '../entities/user.entity';

export const CREDIT_REPOSITORY = Symbol('CREDIT_REPOSITORY');

export interface ICreditRepository {
  /** Get all active (non-expired, remaining > 0) batches for a user, sorted by expiresAt ASC (FIFO) */
  getActiveBatches(userId: string): Promise<CreditPurchaseEntity[]>;

  /** Get all batches for a user (including expired/depleted) for invoice history */
  getAllBatches(userId: string): Promise<CreditPurchaseEntity[]>;

  /** Create a new credit batch */
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

  /** Update a batch (e.g., decrement creditsRemaining) */
  updateBatch(id: string, data: Partial<CreditPurchaseEntity>): Promise<CreditPurchaseEntity>;

  /**
   * Atomic FIFO credit consumption.
   * Deducts `amount` credits from the earliest-expiring batches.
   * Returns { success, totalRemaining } — if not enough credits, no deduction occurs.
   */
  atomicConsumeCredits(userId: string, amount: number): Promise<{ success: boolean; totalRemaining: number }>;

  /** Get total remaining credits across all active batches */
  getTotalRemaining(userId: string): Promise<number>;
}
