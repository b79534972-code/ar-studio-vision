import { LayoutEntity, LayoutVersionEntity } from '../entities/user.entity';
export declare const LAYOUT_REPOSITORY: unique symbol;
export interface ILayoutRepository {
    findById(id: string): Promise<LayoutEntity | null>;
    findByUserId(userId: string): Promise<LayoutEntity[]>;
    create(data: Omit<LayoutEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<LayoutEntity>;
    update(id: string, data: Partial<LayoutEntity>): Promise<LayoutEntity>;
    delete(id: string): Promise<void>;
    createVersion(layoutId: string, version: number, snapshot: Record<string, unknown>): Promise<LayoutVersionEntity>;
    getVersions(layoutId: string): Promise<LayoutVersionEntity[]>;
}
