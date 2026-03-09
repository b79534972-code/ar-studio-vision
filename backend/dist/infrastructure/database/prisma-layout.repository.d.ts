import { PrismaService } from './prisma.service';
import { ILayoutRepository } from '../../domain/repositories/layout.repository';
import { LayoutEntity, LayoutVersionEntity } from '../../domain/entities/user.entity';
export declare class PrismaLayoutRepository implements ILayoutRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<LayoutEntity | null>;
    findByUserId(userId: string): Promise<LayoutEntity[]>;
    create(data: Omit<LayoutEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<LayoutEntity>;
    update(id: string, data: Partial<LayoutEntity>): Promise<LayoutEntity>;
    delete(id: string): Promise<void>;
    createVersion(layoutId: string, version: number, snapshot: Record<string, unknown>): Promise<LayoutVersionEntity>;
    getVersions(layoutId: string): Promise<LayoutVersionEntity[]>;
}
