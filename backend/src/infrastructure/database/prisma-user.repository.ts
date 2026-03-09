/**
 * Prisma Implementation — User Repository
 * Only file that imports PrismaService for user operations.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { UserEntity, UserUsageEntity } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { id } }) as Promise<UserEntity | null>;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { email } }) as Promise<UserEntity | null>;
  }

  async findByLoginIdentifier(identifier: string): Promise<UserEntity | null> {
    const trimmed = identifier.trim();
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: trimmed, mode: 'insensitive' } },
          { name: { equals: trimmed, mode: 'insensitive' } },
        ],
      },
    }) as Promise<UserEntity | null>;
  }

  async findByStripeCustomerId(customerId: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { stripeCustomerId: customerId } }) as Promise<UserEntity | null>;
  }

  async create(data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity> {
    return this.prisma.user.create({ data }) as Promise<UserEntity>;
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    return this.prisma.user.update({ where: { id }, data }) as Promise<UserEntity>;
  }

  async getUsage(userId: string): Promise<UserUsageEntity | null> {
    return this.prisma.userUsage.findUnique({ where: { userId } }) as Promise<UserUsageEntity | null>;
  }

  async createUsage(userId: string): Promise<UserUsageEntity> {
    return this.prisma.userUsage.create({ data: { userId } }) as Promise<UserUsageEntity>;
  }

  async incrementUsage(userId: string, field: keyof Pick<UserUsageEntity, 'modelsCount' | 'layoutsCount' | 'aiRequestsCount' | 'arSessionsCount'>): Promise<UserUsageEntity> {
    return this.prisma.userUsage.update({
      where: { userId },
      data: { [field]: { increment: 1 } },
    }) as Promise<UserUsageEntity>;
  }

  async decrementUsage(userId: string, field: keyof Pick<UserUsageEntity, 'aiRequestsCount'>): Promise<UserUsageEntity> {
    return this.prisma.userUsage.update({
      where: { userId },
      data: { [field]: { decrement: 1 } },
    }) as Promise<UserUsageEntity>;
  }

  /**
   * Atomic AI increment with limit check inside a transaction.
   * Returns { allowed, current } — if not allowed, no increment occurs.
   */
  async atomicAIIncrement(userId: string, maxAllowed: number | null): Promise<{ allowed: boolean; current: number }> {
    return this.prisma.$transaction(async (tx) => {
      const usage = await tx.userUsage.findUnique({ where: { userId } });
      if (!usage) throw new Error('Usage record not found');

      if (maxAllowed !== null && usage.aiRequestsCount >= maxAllowed) {
        return { allowed: false, current: usage.aiRequestsCount };
      }

      const updated = await tx.userUsage.update({
        where: { userId },
        data: { aiRequestsCount: { increment: 1 } },
      });

      return { allowed: true, current: updated.aiRequestsCount };
    });
  }
}
