/**
 * AI Module — Wiring
 * 
 * To switch AI providers, change the AI_PROVIDER binding:
 *   { provide: AI_PROVIDER, useClass: YourRealProvider }
 * 
 * Currently using StubAIProvider (mock data for development).
 */

import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { FeatureGuardService } from '../feature-guard/feature-guard.service';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AI_PROVIDER } from './providers/ai-provider.interface';
import { StubAIProvider } from './providers/stub-ai.provider';

@Module({
  imports: [DatabaseModule],
  providers: [
    AIService,
    FeatureGuardService,
    // ─── SWAP PROVIDER HERE ───
    // Replace StubAIProvider with your real provider:
    // e.g. { provide: AI_PROVIDER, useClass: OpenAIProvider }
    { provide: AI_PROVIDER, useClass: StubAIProvider },
  ],
  exports: [AIService],
})
export class AIModule {}
