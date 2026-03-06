/**
 * Repository Interface — Audit Log
 */

import { AuditLogEntity } from '../entities/user.entity';

export const AUDIT_REPOSITORY = Symbol('AUDIT_REPOSITORY');

export interface IAuditRepository {
  create(data: Omit<AuditLogEntity, 'id' | 'createdAt'>): Promise<AuditLogEntity>;
  findByUserId(userId: string, limit?: number): Promise<AuditLogEntity[]>;
}
