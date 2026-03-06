/**
 * AuthGuard — Extracts JWT from httpOnly cookie and validates
 */

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.['token'];

    if (!token) throw new UnauthorizedException('Authentication required');

    try {
      const payload = this.jwtService.verify(token);
      (request as any).user = payload; // { sub, role }
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
