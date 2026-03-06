/**
 * AuthService — Authentication Business Logic
 * Depends on IUserRepository (injected), never on Prisma directly.
 */

import { Injectable, Inject, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY, IUserRepository } from '../../domain/repositories/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string): Promise<{ user: UserEntity; token: string }> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.userRepo.create({
      name,
      email,
      passwordHash,
      role: 'user',
      subscriptionPlan: 'free',
      subscriptionStatus: 'active',
    });

    // Create initial usage record
    await this.userRepo.createUsage(user.id);

    const token = this.jwtService.sign({ sub: user.id, role: user.role });
    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: UserEntity; token: string }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ sub: user.id, role: user.role });
    return { user, token };
  }

  async validateToken(token: string): Promise<UserEntity> {
    const payload = this.jwtService.verify(token);
    const user = await this.userRepo.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }
}
