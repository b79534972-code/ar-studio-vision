/**
 * LayoutService — Layout CRUD + Version History
 */

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LAYOUT_REPOSITORY, ILayoutRepository } from '../../domain/repositories/layout.repository';
import { USER_REPOSITORY, IUserRepository } from '../../domain/repositories/user.repository';
import { FeatureGuardService } from '../feature-guard/feature-guard.service';
import { UserEntity, LayoutEntity } from '../../domain/entities/user.entity';

@Injectable()
export class LayoutService {
  constructor(
    @Inject(LAYOUT_REPOSITORY) private readonly layoutRepo: ILayoutRepository,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    private readonly featureGuard: FeatureGuardService,
  ) {}

  async getUserLayouts(userId: string): Promise<LayoutEntity[]> {
    return this.layoutRepo.findByUserId(userId);
  }

  async createLayout(user: UserEntity, data: { name: string; roomId: string; objects: Record<string, unknown>[] }): Promise<LayoutEntity> {
    const usage = await this.userRepo.getUsage(user.id);
    if (!usage) throw new NotFoundException('Usage record not found');

    this.featureGuard.canCreateLayout(user, usage);

    const layout = await this.layoutRepo.create({
      userId: user.id,
      name: data.name,
      roomId: data.roomId,
      version: 1,
      objects: data.objects,
    });

    await this.userRepo.incrementUsage(user.id, 'layoutsCount');
    return layout;
  }

  async updateLayout(user: UserEntity, layoutId: string, data: Partial<LayoutEntity>): Promise<LayoutEntity> {
    const layout = await this.layoutRepo.findById(layoutId);
    if (!layout || layout.userId !== user.id) throw new NotFoundException('Layout not found');

    // Save version snapshot before update (Pro/Advanced only)
    try {
      this.featureGuard.canCreateVersion(user);
      await this.layoutRepo.createVersion(layoutId, layout.version, { objects: layout.objects });
    } catch {
      // Version history not available — skip silently
    }

    return this.layoutRepo.update(layoutId, { ...data, version: layout.version + 1 });
  }

  async deleteLayout(user: UserEntity, layoutId: string): Promise<void> {
    const layout = await this.layoutRepo.findById(layoutId);
    if (!layout || layout.userId !== user.id) throw new NotFoundException('Layout not found');
    await this.layoutRepo.delete(layoutId);
  }

  async getVersionHistory(user: UserEntity, layoutId: string) {
    this.featureGuard.canCreateVersion(user);
    return this.layoutRepo.getVersions(layoutId);
  }
}
