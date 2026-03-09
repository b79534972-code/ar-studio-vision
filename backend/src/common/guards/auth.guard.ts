/**
 * AuthGuard — Extracts JWT from httpOnly cookie and validates
 */

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { USER_REPOSITORY, IUserRepository } from '../../domain/repositories/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';

interface JwtPayload {
  sub: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
  userEntity?: UserEntity;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const token = request.cookies?.['token'] || bearerToken;

    if (!token) throw new UnauthorizedException('Authentication required');

    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepo.findById(payload.sub);
      if (!user) throw new UnauthorizedException('User not found');

      request.user = payload as JwtPayload;
      request.userEntity = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
