import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { StripeWebhookService } from './stripe-webhook.service';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [StripeController],
  providers: [StripeService, StripeWebhookService],
  exports: [StripeService],
})
export class StripeModule { }
