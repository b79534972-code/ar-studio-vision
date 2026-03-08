import { PrismaService } from './prisma.service';
import { IAuditRepository } from '../../domain/repositories/audit.repository';
import { AuditLogEntity } from '../../domain/entities/user.entity';
export declare class PrismaAuditRepository implements IAuditRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Omit<AuditLogEntity, 'id' | 'createdAt'>): Promise<AuditLogEntity>;
    findByUserId(userId: string, limit?: number): Promise<AuditLogEntity[]>;
}
