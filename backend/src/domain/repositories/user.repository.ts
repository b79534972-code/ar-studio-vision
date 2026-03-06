/**
 * Repository Interface — User
 * Services depend on this abstraction ONLY.
 */

import { UserEntity, UserUsageEntity } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByStripeCustomerId(customerId: string): Promise<UserEntity | null>;
  create(data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity>;
  update(id: string, data: Partial<UserEntity>): Promise<UserEntity>;

  // Usage
  getUsage(userId: string): Promise<UserUsageEntity | null>;
  createUsage(userId: string): Promise<UserUsageEntity>;
  incrementUsage(userId: string, field: keyof Pick<UserUsageEntity, 'modelsCount' | 'layoutsCount' | 'aiRequestsCount' | 'arSessionsCount'>): Promise<UserUsageEntity>;
  decrementUsage(userId: string, field: keyof Pick<UserUsageEntity, 'aiRequestsCount'>): Promise<UserUsageEntity>;

  // Transactional AI usage
  atomicAIIncrement(userId: string, maxAllowed: number | null): Promise<{ allowed: boolean; current: number }>;
}
