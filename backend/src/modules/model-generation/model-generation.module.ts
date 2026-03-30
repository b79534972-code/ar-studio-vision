import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { ModelGenerationController } from './model-generation.controller';
import { ModelGenerationService } from './model-generation.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [ModelGenerationController],
  providers: [ModelGenerationService],
  exports: [ModelGenerationService],
})
export class ModelGenerationModule {}
