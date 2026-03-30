/**
 * Root Application Module
 */

import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { AIModule } from './modules/ai/ai.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { JobsModule } from './infrastructure/jobs/jobs.module';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';
import { ModelGenerationModule } from './modules/model-generation/model-generation.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    StripeModule,
    AIModule,
    ModelGenerationModule,
    StorageModule,
    JobsModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RateLimitMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
