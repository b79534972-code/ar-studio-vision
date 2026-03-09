/**
 * Domain Entity — CreditPurchase
 * Represents a purchased credit batch with FIFO expiration.
 */

import { SubscriptionPlan } from './user.entity';

export type PurchaseStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type Currency = 'VND' | 'USD';

export interface CreditPurchaseEntity {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  creditAmount: number;
  creditsRemaining: number;
  priceAmount: number;
  currency: Currency;
  stripePaymentId?: string;
  stripeInvoiceId?: string;
  status: PurchaseStatus;
  purchasedAt: Date;
  expiresAt: Date | null;
}
