import { ILayoutRepository } from '../../domain/repositories/layout.repository';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { FeatureGuardService } from '../feature-guard/feature-guard.service';
import { UserEntity, LayoutEntity } from '../../domain/entities/user.entity';
export declare class LayoutService {
    private readonly layoutRepo;
    private readonly userRepo;
    private readonly featureGuard;
    constructor(layoutRepo: ILayoutRepository, userRepo: IUserRepository, featureGuard: FeatureGuardService);
    getUserLayouts(userId: string): Promise<LayoutEntity[]>;
    createLayout(user: UserEntity, data: {
        name: string;
        roomId: string;
        objects: Record<string, unknown>[];
    }): Promise<LayoutEntity>;
    updateLayout(user: UserEntity, layoutId: string, data: Partial<LayoutEntity>): Promise<LayoutEntity>;
    deleteLayout(user: UserEntity, layoutId: string): Promise<void>;
    getVersionHistory(user: UserEntity, layoutId: string): Promise<import("../../domain/entities/user.entity").LayoutVersionEntity[]>;
}
