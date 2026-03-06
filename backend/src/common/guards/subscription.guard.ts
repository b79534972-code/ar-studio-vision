/**
 * SubscriptionGuard — Blocks paid features if subscription is not active
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { USER_REPOSITORY, IUserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;
    if (!userId) throw new ForbiddenException('Not authenticated');

    const user = await this.userRepo.findById(userId);
    if (!user) throw new ForbiddenException('User not found');

    if (user.subscriptionStatus !== 'active' && user.subscriptionPlan !== 'free') {
      throw new ForbiddenException({
        code: 'SUBSCRIPTION_INACTIVE',
        status: user.subscriptionStatus,
        message: 'Your subscription is not active. Please update your payment method.',
      });
    }

    request['userEntity'] = user;
    return true;
  }
}
