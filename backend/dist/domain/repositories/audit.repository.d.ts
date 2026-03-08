import { AuditLogEntity } from '../entities/user.entity';
export declare const AUDIT_REPOSITORY: unique symbol;
export interface IAuditRepository {
    create(data: Omit<AuditLogEntity, 'id' | 'createdAt'>): Promise<AuditLogEntity>;
    findByUserId(userId: string, limit?: number): Promise<AuditLogEntity[]>;
}
