/**
 * Repository Interface — Layout
 */

import { LayoutEntity, LayoutVersionEntity } from '../entities/user.entity';

export const LAYOUT_REPOSITORY = Symbol('LAYOUT_REPOSITORY');

export interface ILayoutRepository {
  findById(id: string): Promise<LayoutEntity | null>;
  findByUserId(userId: string): Promise<LayoutEntity[]>;
  create(data: Omit<LayoutEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<LayoutEntity>;
  update(id: string, data: Partial<LayoutEntity>): Promise<LayoutEntity>;
  delete(id: string): Promise<void>;

  // Version history
  createVersion(layoutId: string, snapshot: Record<string, unknown>): Promise<LayoutVersionEntity>;
  getVersions(layoutId: string): Promise<LayoutVersionEntity[]>;
}
