import { CanActivate, ExecutionContext } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository';
export declare class SubscriptionGuard implements CanActivate {
    private readonly userRepo;
    constructor(userRepo: IUserRepository);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
