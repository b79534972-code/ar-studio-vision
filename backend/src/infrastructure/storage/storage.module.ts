/**
 * Storage Module — Swap adapter via env: STORAGE_PROVIDER=s3|r2|local
 */

import { Module } from '@nestjs/common';
import { STORAGE_SERVICE } from './storage.interface';
import { S3StorageAdapter } from './s3-storage.adapter';

@Module({
  providers: [
    {
      provide: STORAGE_SERVICE,
      useClass: S3StorageAdapter, // Swap to CloudflareR2Adapter, LocalStorageAdapter, etc.
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
