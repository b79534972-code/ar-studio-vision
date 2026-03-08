import { IUserRepository } from '../../domain/repositories/user.repository';
import { FeatureGuardService } from '../feature-guard/feature-guard.service';
import { UserEntity } from '../../domain/entities/user.entity';
export interface AIResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}
export declare class AIService {
    private readonly userRepo;
    private readonly featureGuard;
    private redis;
    constructor(userRepo: IUserRepository, featureGuard: FeatureGuardService);
    executeAIRequest<T>(user: UserEntity, operation: () => Promise<T>): Promise<AIResult<T>>;
    suggestPlacement(user: UserEntity, modelId: string, roomId: string): Promise<AIResult>;
    generateLayouts(user: UserEntity, roomId: string): Promise<AIResult>;
}
