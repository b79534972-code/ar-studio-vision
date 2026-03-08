import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';
export declare class AuthService {
    private readonly userRepo;
    private readonly jwtService;
    constructor(userRepo: IUserRepository, jwtService: JwtService);
    register(name: string, email: string, password: string): Promise<{
        user: UserEntity;
        token: string;
    }>;
    login(email: string, password: string): Promise<{
        user: UserEntity;
        token: string;
    }>;
    validateToken(token: string): Promise<UserEntity>;
}
