/**
 * Prisma Implementation — Audit Repository
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IAuditRepository } from '../../domain/repositories/audit.repository';
import { AuditLogEntity } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaAuditRepository implements IAuditRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: Omit<AuditLogEntity, 'id' | 'createdAt'>): Promise<AuditLogEntity> {
    return this.prisma.auditLog.create({ data: data as any }) as Promise<AuditLogEntity>;
  }

  async findByUserId(userId: string, limit = 50): Promise<AuditLogEntity[]> {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }) as Promise<AuditLogEntity[]>;
  }
}
