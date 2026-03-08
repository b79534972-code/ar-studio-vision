import { UserEntity, UserUsageEntity } from '../entities/user.entity';
export declare const USER_REPOSITORY: unique symbol;
export interface IUserRepository {
    findById(id: string): Promise<UserEntity | null>;
    findByEmail(email: string): Promise<UserEntity | null>;
    findByStripeCustomerId(customerId: string): Promise<UserEntity | null>;
    create(data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity>;
    update(id: string, data: Partial<UserEntity>): Promise<UserEntity>;
    getUsage(userId: string): Promise<UserUsageEntity | null>;
    createUsage(userId: string): Promise<UserUsageEntity>;
    incrementUsage(userId: string, field: keyof Pick<UserUsageEntity, 'modelsCount' | 'layoutsCount' | 'aiRequestsCount' | 'arSessionsCount'>): Promise<UserUsageEntity>;
    decrementUsage(userId: string, field: keyof Pick<UserUsageEntity, 'aiRequestsCount'>): Promise<UserUsageEntity>;
    atomicAIIncrement(userId: string, maxAllowed: number | null): Promise<{
        allowed: boolean;
        current: number;
    }>;
}
