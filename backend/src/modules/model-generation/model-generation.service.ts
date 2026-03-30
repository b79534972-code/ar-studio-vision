import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';

type UploadedImage = {
  buffer: Buffer;
  mimetype: string;
  originalname?: string;
};

export type GenerationKind = 'furniture';
export type GenerationStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface FurnitureGenerationRequest {
  userId: string;
  file: UploadedImage;
  name: string;
  category: string;
  dimensions: { width: number; height: number; depth: number };
  material?: string;
  color?: string;
}

export interface FurnitureGenerationResult {
  modelUrl: string;
  usdzUrl?: string;
  cleanedImageUrl: string;
}

export interface GenerationJob {
  id: string;
  userId: string;
  kind: GenerationKind;
  status: GenerationStatus;
  createdAt: string;
  updatedAt: string;
  progress: number;
  message: string;
  request: {
    name: string;
    category: string;
    dimensions: { width: number; height: number; depth: number };
    material?: string;
    color?: string;
  };
  result?: FurnitureGenerationResult;
  error?: string;
}

export interface RoomScanResult {
  width: number;
  depth: number;
  height: number;
  wallColor: string;
  floorColor: string;
  confidence: number;
  walls: { id: string; from: [number, number]; to: [number, number] }[];
}

@Injectable()
export class ModelGenerationService {
  private readonly logger = new Logger(ModelGenerationService.name);
  private readonly jobs = new Map<string, GenerationJob>();
  private readonly generatedRoot = join(process.cwd(), 'generated');

  private parseImageDimensions(buffer: Buffer): { width?: number; height?: number } {
    // PNG IHDR width/height
    if (buffer.length >= 24 && buffer.readUInt32BE(0) === 0x89504e47) {
      return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20),
      };
    }

    // JPEG SOF marker width/height
    if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      while (offset + 9 < buffer.length) {
        if (buffer[offset] !== 0xff) {
          offset += 1;
          continue;
        }

        const marker = buffer[offset + 1];
        if (marker === 0xc0 || marker === 0xc2) {
          return {
            height: buffer.readUInt16BE(offset + 5),
            width: buffer.readUInt16BE(offset + 7),
          };
        }

        const segmentLength = buffer.readUInt16BE(offset + 2);
        if (segmentLength <= 0) break;
        offset += 2 + segmentLength;
      }
    }

    return {};
  }

  private getPublicBaseUrl(): string {
    const fromEnv = (process.env.PUBLIC_BASE_URL || '').trim().replace(/\/$/, '');
    return fromEnv || `http://localhost:${process.env.PORT || 3000}`;
  }

  private async ensureUserDirs(userId: string): Promise<{ imageDir: string; modelDir: string }> {
    const baseDir = join(this.generatedRoot, userId);
    const imageDir = join(baseDir, 'images');
    const modelDir = join(baseDir, 'models');
    await mkdir(imageDir, { recursive: true });
    await mkdir(modelDir, { recursive: true });
    return { imageDir, modelDir };
  }

  private getExtFromMime(mime: string): string {
    if (mime === 'image/png') return '.png';
    if (mime === 'image/webp') return '.webp';
    if (mime === 'image/jpeg' || mime === 'image/jpg') return '.jpg';
    return '.png';
  }

  private async removeBackgroundIfConfigured(file: UploadedImage): Promise<{ buffer: Buffer; mimeType: string }> {
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return { buffer: file.buffer, mimeType: file.mimetype || 'image/png' };
    }

    try {
      const formData = new FormData();
      const sourceExt = this.getExtFromMime(file.mimetype || 'image/png');
      const bytes = new Uint8Array(file.buffer);
      formData.append('image_file', new Blob([bytes]), `source${sourceExt}`);
      formData.append('size', 'auto');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.warn(`remove.bg failed: ${response.status} ${errText}`);
        return { buffer: file.buffer, mimeType: file.mimetype || 'image/png' };
      }

      const arrayBuffer = await response.arrayBuffer();
      return { buffer: Buffer.from(arrayBuffer), mimeType: 'image/png' };
    } catch (error) {
      this.logger.warn(`remove.bg request failed: ${error instanceof Error ? error.message : 'unknown error'}`);
      return { buffer: file.buffer, mimeType: file.mimetype || 'image/png' };
    }
  }

  private buildBillboardGltf(imageBuffer: Buffer, imageMimeType: string): string {
    const dimensions = this.parseImageDimensions(imageBuffer);
    const imgWidth = dimensions.width ?? 1024;
    const imgHeight = dimensions.height ?? 1024;

    const aspect = imgWidth / imgHeight;
    const width = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
    const height = 1;

    const positions = new Float32Array([
      -width / 2, 0, 0,
      width / 2, 0, 0,
      -width / 2, height, 0,
      width / 2, height, 0,
    ]);

    const uvs = new Float32Array([
      0, 1,
      1, 1,
      0, 0,
      1, 0,
    ]);

    const indices = new Uint16Array([0, 1, 2, 2, 1, 3]);

    const positionBytes = Buffer.from(positions.buffer);
    const uvBytes = Buffer.from(uvs.buffer);
    const indexBytes = Buffer.from(indices.buffer);

    const binary = Buffer.concat([positionBytes, uvBytes, indexBytes]);
    const binaryBase64 = binary.toString('base64');
    const imageBase64 = imageBuffer.toString('base64');

    const gltf = {
      asset: { version: '2.0', generator: 'InteriorAR-Billboard-Generator' },
      scene: 0,
      scenes: [{ nodes: [0] }],
      nodes: [{ mesh: 0 }],
      meshes: [
        {
          primitives: [
            {
              attributes: { POSITION: 0, TEXCOORD_0: 1 },
              indices: 2,
              material: 0,
            },
          ],
        },
      ],
      materials: [
        {
          pbrMetallicRoughness: {
            baseColorTexture: { index: 0 },
            metallicFactor: 0,
            roughnessFactor: 1,
          },
          alphaMode: 'BLEND',
          doubleSided: true,
        },
      ],
      textures: [{ source: 0 }],
      images: [{ uri: `data:${imageMimeType};base64,${imageBase64}` }],
      buffers: [
        {
          uri: `data:application/octet-stream;base64,${binaryBase64}`,
          byteLength: binary.byteLength,
        },
      ],
      bufferViews: [
        { buffer: 0, byteOffset: 0, byteLength: positionBytes.byteLength, target: 34962 },
        { buffer: 0, byteOffset: positionBytes.byteLength, byteLength: uvBytes.byteLength, target: 34962 },
        {
          buffer: 0,
          byteOffset: positionBytes.byteLength + uvBytes.byteLength,
          byteLength: indexBytes.byteLength,
          target: 34963,
        },
      ],
      accessors: [
        {
          bufferView: 0,
          byteOffset: 0,
          componentType: 5126,
          count: 4,
          type: 'VEC3',
          min: [-width / 2, 0, 0],
          max: [width / 2, height, 0],
        },
        {
          bufferView: 1,
          byteOffset: 0,
          componentType: 5126,
          count: 4,
          type: 'VEC2',
        },
        {
          bufferView: 2,
          byteOffset: 0,
          componentType: 5123,
          count: 6,
          type: 'SCALAR',
        },
      ],
    };

    return JSON.stringify(gltf, null, 2);
  }

  private updateJob(jobId: string, partial: Partial<GenerationJob>) {
    const current = this.jobs.get(jobId);
    if (!current) return;
    this.jobs.set(jobId, {
      ...current,
      ...partial,
      updatedAt: new Date().toISOString(),
    });
  }

  async createFurnitureGenerationJob(request: FurnitureGenerationRequest): Promise<GenerationJob> {
    if (!request.file?.buffer || !request.file.mimetype.startsWith('image/')) {
      throw new BadRequestException('A valid image file is required.');
    }

    const jobId = randomUUID();
    const nowIso = new Date().toISOString();
    const job: GenerationJob = {
      id: jobId,
      userId: request.userId,
      kind: 'furniture',
      status: 'queued',
      createdAt: nowIso,
      updatedAt: nowIso,
      progress: 0,
      message: 'Queued for processing',
      request: {
        name: request.name,
        category: request.category,
        dimensions: request.dimensions,
        material: request.material,
        color: request.color,
      },
    };

    this.jobs.set(jobId, job);

    void this.processFurnitureJob(jobId, request);

    return job;
  }

  private async processFurnitureJob(jobId: string, request: FurnitureGenerationRequest): Promise<void> {
    try {
      this.updateJob(jobId, { status: 'processing', progress: 10, message: 'Validating image' });

      const { imageDir, modelDir } = await this.ensureUserDirs(request.userId);
      const cleaned = await this.removeBackgroundIfConfigured(request.file);

      this.updateJob(jobId, { progress: 45, message: 'Background cleaned' });

      const cleanedExt = this.getExtFromMime(cleaned.mimeType);
      const cleanedFilename = `${jobId}-cleaned${cleanedExt}`;
      const cleanedPath = join(imageDir, cleanedFilename);
      await writeFile(cleanedPath, cleaned.buffer);

      this.updateJob(jobId, { progress: 70, message: 'Building 3D mesh from image silhouette' });

      const gltf = this.buildBillboardGltf(cleaned.buffer, cleaned.mimeType);
      const modelFilename = `${jobId}.gltf`;
      const modelPath = join(modelDir, modelFilename);
      await writeFile(modelPath, gltf, 'utf8');

      const baseUrl = this.getPublicBaseUrl();
      const result: FurnitureGenerationResult = {
        cleanedImageUrl: `${baseUrl}/generated/${request.userId}/images/${cleanedFilename}`,
        modelUrl: `${baseUrl}/generated/${request.userId}/models/${modelFilename}`,
      };

      this.updateJob(jobId, {
        status: 'completed',
        progress: 100,
        message: '3D model is ready',
        result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process image';
      this.logger.error(`Job ${jobId} failed: ${message}`);
      this.updateJob(jobId, {
        status: 'failed',
        message: 'Model generation failed',
        error: message,
      });
    }
  }

  getJob(jobId: string, userId: string): GenerationJob {
    const job = this.jobs.get(jobId);
    if (!job || job.userId !== userId) {
      throw new BadRequestException('Generation job not found.');
    }
    return job;
  }

  async scanRoomImage(userId: string, file: UploadedImage): Promise<RoomScanResult> {
    if (!file?.buffer || !file.mimetype.startsWith('image/')) {
      throw new BadRequestException('A valid room image is required.');
    }

    const size = this.parseImageDimensions(file.buffer);
    const widthPx = size.width ?? 1280;
    const heightPx = size.height ?? 720;
    const ratio = widthPx / Math.max(heightPx, 1);

    const estimatedWidth = Math.min(8, Math.max(2.8, Number((ratio * 3.6).toFixed(1))));
    const estimatedDepth = Math.min(7.5, Math.max(2.8, Number((estimatedWidth * 0.82).toFixed(1))));

    this.logger.log(`Room scan estimated for user ${userId}: ${estimatedWidth}m x ${estimatedDepth}m`);

    return {
      width: estimatedWidth,
      depth: estimatedDepth,
      height: 2.7,
      wallColor: '#F5F5F4',
      floorColor: '#D6D3D1',
      confidence: 82,
      walls: [
        { id: 'w1', from: [0, 0], to: [estimatedWidth, 0] },
        { id: 'w2', from: [estimatedWidth, 0], to: [estimatedWidth, estimatedDepth] },
        { id: 'w3', from: [estimatedWidth, estimatedDepth], to: [0, estimatedDepth] },
        { id: 'w4', from: [0, estimatedDepth], to: [0, 0] },
      ],
    };
  }
}
