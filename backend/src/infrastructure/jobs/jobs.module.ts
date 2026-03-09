/**
 * Background Jobs Module — BullMQ
 * Handles: AI processing, USDZ conversion, email, webhook retries
 */

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { getRedisConnectionOptions } from '../../common/redis.config';
import { AIJobProcessor } from './processors/ai-job.processor';
import { ConversionJobProcessor } from './processors/conversion-job.processor';

@Module({
  imports: [
    BullModule.forRoot({
      connection: getRedisConnectionOptions(),
    }),
    BullModule.registerQueue(
      { name: 'ai-processing' },
      { name: 'usdz-conversion' },
      { name: 'email' },
      { name: 'webhook-retry' },
    ),
  ],
  providers: [AIJobProcessor, ConversionJobProcessor],
  exports: [BullModule],
})
export class JobsModule { }
