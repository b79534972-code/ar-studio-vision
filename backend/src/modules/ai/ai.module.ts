import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { FeatureGuardService } from '../feature-guard/feature-guard.service';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [AIService, FeatureGuardService],
  exports: [AIService],
})
export class AIModule {}
