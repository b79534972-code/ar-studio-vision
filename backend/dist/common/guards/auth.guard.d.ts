import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from '../../domain/repositories/user.repository';
export declare class AuthGuard implements CanActivate {
    private readonly jwtService;
    private readonly userRepo;
    constructor(jwtService: JwtService, userRepo: IUserRepository);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
