import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { UserEntity } from '../../domain/entities/user.entity';
import { ModelGenerationService } from './model-generation.service';

type UploadedImage = {
  buffer: Buffer;
  mimetype: string;
  originalname?: string;
};

@Controller('model-generation')
@UseGuards(AuthGuard)
export class ModelGenerationController {
  constructor(private readonly modelGenerationService: ModelGenerationService) {}

  @Post('furniture')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async createFurnitureJob(
    @CurrentUser() user: UserEntity,
    @UploadedFile() image: UploadedImage,
    @Body()
    body: {
      name: string;
      category: string;
      width: string;
      height: string;
      depth: string;
      material?: string;
      color?: string;
    },
  ) {
    const job = await this.modelGenerationService.createFurnitureGenerationJob({
      userId: user.id,
      file: image,
      name: body.name,
      category: body.category,
      dimensions: {
        width: Number(body.width),
        height: Number(body.height),
        depth: Number(body.depth),
      },
      material: body.material,
      color: body.color,
    });

    return {
      jobId: job.id,
      status: job.status,
      message: job.message,
    };
  }

  @Get('jobs/:jobId')
  async getJob(
    @CurrentUser() user: UserEntity,
    @Param('jobId') jobId: string,
  ) {
    return this.modelGenerationService.getJob(jobId, user.id);
  }

  @Post('room-scan')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async scanRoom(
    @CurrentUser() user: UserEntity,
    @UploadedFile() image: UploadedImage,
  ) {
    const result = await this.modelGenerationService.scanRoomImage(user.id, image);
    return {
      success: true,
      result,
    };
  }
}
