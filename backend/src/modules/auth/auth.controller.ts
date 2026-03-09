/**
 * AuthController — Handles login, register, logout
 * No business logic here. Delegates to AuthService.
 */

import { Controller, Post, Body, Res, HttpCode } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: { name: string; email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, token } = await this.authService.register(body.name, body.email, body.password);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, subscriptionPlan: user.subscriptionPlan, subscriptionStatus: user.subscriptionStatus, createdAt: user.createdAt } };
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: { identifier?: string; email?: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const identifier = body.identifier ?? body.email ?? '';
    const { user, token } = await this.authService.login(identifier, body.password);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, subscriptionPlan: user.subscriptionPlan, subscriptionStatus: user.subscriptionStatus, createdAt: user.createdAt } };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token');
    return { success: true };
  }
}
