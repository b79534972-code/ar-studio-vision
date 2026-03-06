/**
 * Prisma Implementation — Layout Repository
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma } from '@prisma/client';
import { ILayoutRepository } from '../../domain/repositories/layout.repository';
import { LayoutEntity, LayoutVersionEntity } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaLayoutRepository implements ILayoutRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string): Promise<LayoutEntity | null> {
    return this.prisma.layout.findUnique({ where: { id } }) as Promise<LayoutEntity | null>;
  }

  async findByUserId(userId: string): Promise<LayoutEntity[]> {
    return this.prisma.layout.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    }) as Promise<LayoutEntity[]>;
  }

  async create(data: Omit<LayoutEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<LayoutEntity> {
    return this.prisma.layout.create({ data: data as any }) as Promise<LayoutEntity>;
  }

  async update(id: string, data: Partial<LayoutEntity>): Promise<LayoutEntity> {
    return this.prisma.layout.update({ where: { id }, data: data as any }) as Promise<LayoutEntity>;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.layout.delete({ where: { id } });
  }

  async createVersion(layoutId: string, snapshot: Record<string, unknown>): Promise<LayoutVersionEntity> {
    return this.prisma.layoutVersion.create({
      data: { layoutId, snapshot: snapshot as Prisma.InputJsonValue },
    }) as Promise<LayoutVersionEntity>;
  }

  async getVersions(layoutId: string): Promise<LayoutVersionEntity[]> {
    return this.prisma.layoutVersion.findMany({
      where: { layoutId },
      orderBy: { createdAt: 'desc' },
    }) as Promise<LayoutVersionEntity[]>;
  }
}
