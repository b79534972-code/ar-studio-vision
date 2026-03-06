/**
 * Database Module — DI Wiring
 * Binds repository interfaces to Prisma implementations.
 * Swap implementations here to change database provider.
 */

import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaLayoutRepository } from './prisma-layout.repository';
import { PrismaAuditRepository } from './prisma-audit.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { LAYOUT_REPOSITORY } from '../../domain/repositories/layout.repository';
import { AUDIT_REPOSITORY } from '../../domain/repositories/audit.repository';

@Module({
  providers: [
    PrismaService,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: LAYOUT_REPOSITORY, useClass: PrismaLayoutRepository },
    { provide: AUDIT_REPOSITORY, useClass: PrismaAuditRepository },
  ],
  exports: [USER_REPOSITORY, LAYOUT_REPOSITORY, AUDIT_REPOSITORY],
})
export class DatabaseModule {}
