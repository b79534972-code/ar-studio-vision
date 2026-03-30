/**
 * AuthService — Authentication Business Logic
 * Depends on IUserRepository (injected), never on Prisma directly.
 */

import { Injectable, Inject, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
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
    const normalizedName = (name || '').trim();
    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedPassword = password || '';

    if (!normalizedName) throw new BadRequestException('Username is required');
    if (!normalizedEmail) throw new BadRequestException('Email is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new BadRequestException('Email format is invalid');
    }
    if (!normalizedPassword) throw new BadRequestException('Password is required');
    if (normalizedPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const existingEmail = await this.userRepo.findByLoginIdentifier(normalizedEmail);
    if (existingEmail && existingEmail.email.toLowerCase() === normalizedEmail) {
      throw new ConflictException('Email already registered');
    }

    const existingName = await this.userRepo.findByLoginIdentifier(normalizedName);
    if (existingName && existingName.name.toLowerCase() === normalizedName.toLowerCase()) {
      throw new ConflictException('Username already taken');
    }

    const passwordHash = await bcrypt.hash(normalizedPassword, 12);
    const user = await this.userRepo.create({
      name: normalizedName,
      email: normalizedEmail,
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

  async login(identifier: string, password: string): Promise<{ user: UserEntity; token: string }> {
    const normalizedIdentifier = (identifier || '').trim();
    const normalizedPassword = password || '';

    if (!normalizedIdentifier) {
      throw new BadRequestException('Username or email is required');
    }
    if (!normalizedPassword) {
      throw new BadRequestException('Password is required');
    }

    const user = await this.userRepo.findByLoginIdentifier(normalizedIdentifier);
    if (!user) throw new UnauthorizedException('Incorrect username or password');

    const valid = await bcrypt.compare(normalizedPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Incorrect username or password');

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
