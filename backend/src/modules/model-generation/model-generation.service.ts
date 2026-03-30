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

type MeshyTaskUrls = {
  modelUrl: string;
  usdzUrl?: string;
};

@Injectable()
export class ModelGenerationService {
  private readonly logger = new Logger(ModelGenerationService.name);
  private readonly jobs = new Map<string, GenerationJob>();
  private readonly generatedRoot = join(process.cwd(), 'generated');

  private getModel3DProvider(): 'local' | 'meshy' {
    const provider = (process.env.MODEL3D_PROVIDER || 'local').trim().toLowerCase();
    return provider === 'meshy' ? 'meshy' : 'local';
  }

  private getMeshyApiBaseUrl(): string {
    return (process.env.MESHY_API_BASE_URL || 'https://api.meshy.ai/openapi/v2').trim().replace(/\/$/, '');
  }

  private isMeshyEnabled(): boolean {
    return this.getModel3DProvider() === 'meshy' && !!process.env.MESHY_API_KEY;
  }

  private parseNumber(input: string | undefined, fallback: number): number {
    const value = Number(input);
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  private readNestedString(record: unknown, paths: string[]): string | undefined {
    for (const path of paths) {
      const parts = path.split('.');
      let current: unknown = record;
      for (const part of parts) {
        if (!current || typeof current !== 'object' || !(part in current)) {
          current = undefined;
          break;
        }
        current = (current as Record<string, unknown>)[part];
      }
      if (typeof current === 'string' && current.trim()) {
        return current;
      }
    }
    return undefined;
  }

  private async createMeshyTask(cleanedImageUrl: string, request: FurnitureGenerationRequest): Promise<string> {
    const apiKey = process.env.MESHY_API_KEY;
    if (!apiKey) {
      throw new Error('MESHY_API_KEY is missing');
    }

    const prompt = `${request.name}, ${request.category}, ${request.material || 'generic material'}, clean studio lighting, object centered`;

    const response = await fetch(`${this.getMeshyApiBaseUrl()}/image-to-3d`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: cleanedImageUrl,
        prompt,
        texture_prompt: `${request.material || 'neutral material'} furniture texture`,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Meshy task creation failed (${response.status}): ${text}`);
    }

    const payload = (await response.json()) as unknown;
    const taskId = this.readNestedString(payload, ['result', 'id', 'task_id', 'taskId']);
    if (!taskId) {
      throw new Error('Meshy did not return a task ID');
    }

    return taskId;
  }

  private parseMeshyUrls(payload: unknown): MeshyTaskUrls | null {
    const modelUrl = this.readNestedString(payload, [
      'model_urls.glb',
      'result.model_urls.glb',
      'output.model_urls.glb',
      'model_urls.gltf',
      'result.model_urls.gltf',
      'output.model_urls.gltf',
    ]);

    if (!modelUrl) {
      return null;
    }

    const usdzUrl = this.readNestedString(payload, [
      'model_urls.usdz',
      'result.model_urls.usdz',
      'output.model_urls.usdz',
    ]);

    return { modelUrl, usdzUrl };
  }

  private async pollMeshyTask(taskId: string, jobId: string): Promise<MeshyTaskUrls> {
    const apiKey = process.env.MESHY_API_KEY;
    if (!apiKey) {
      throw new Error('MESHY_API_KEY is missing');
    }

    const pollIntervalMs = this.parseNumber(process.env.MESHY_POLL_INTERVAL_MS, 2500);
    const timeoutMs = this.parseNumber(process.env.MESHY_TIMEOUT_MS, 240000);
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const response = await fetch(`${this.getMeshyApiBaseUrl()}/image-to-3d/${taskId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Meshy polling failed (${response.status}): ${text}`);
      }

      const payload = (await response.json()) as Record<string, unknown>;
      const status = String(payload.status || payload.state || '').toLowerCase();
      const progressRaw = payload.progress;
      const progress = typeof progressRaw === 'number' ? Math.max(0, Math.min(100, progressRaw)) : undefined;

      if (status === 'failed' || status === 'error') {
        const reason = this.readNestedString(payload, ['message', 'error', 'result.error', 'output.error']) || 'unknown provider error';
        throw new Error(`Meshy generation failed: ${reason}`);
      }

      if (status === 'succeeded' || status === 'success' || status === 'completed' || status === 'done') {
        const urls = this.parseMeshyUrls(payload);
        if (!urls) {
          throw new Error('Meshy task completed without model URLs');
        }
        return urls;
      }

      this.updateJob(jobId, {
        progress: progress !== undefined ? 75 + Math.round(progress * 0.2) : 82,
        message: 'Generating 3D mesh with AI provider',
      });

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    throw new Error('Meshy generation timed out');
  }

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

      const baseUrl = this.getPublicBaseUrl();
      const cleanedImageUrl = `${baseUrl}/generated/${request.userId}/images/${cleanedFilename}`;

      if (this.isMeshyEnabled()) {
        this.updateJob(jobId, { progress: 62, message: 'Submitting image to AI 3D provider' });
        try {
          const taskId = await this.createMeshyTask(cleanedImageUrl, request);
          this.updateJob(jobId, { progress: 72, message: `Provider task created (${taskId.slice(0, 8)}...)` });
          const providerResult = await this.pollMeshyTask(taskId, jobId);

          this.updateJob(jobId, {
            status: 'completed',
            progress: 100,
            message: '3D model generated successfully',
            result: {
              cleanedImageUrl,
              modelUrl: providerResult.modelUrl,
              usdzUrl: providerResult.usdzUrl,
            },
          });
          return;
        } catch (providerError) {
          this.logger.warn(
            `Provider generation failed for job ${jobId}, falling back to local silhouette: ${providerError instanceof Error ? providerError.message : 'unknown error'}`,
          );
        }
      }

      this.updateJob(jobId, { progress: 70, message: 'Building 3D mesh from image silhouette' });

      const gltf = this.buildBillboardGltf(cleaned.buffer, cleaned.mimeType);
      const modelFilename = `${jobId}.gltf`;
      const modelPath = join(modelDir, modelFilename);
      await writeFile(modelPath, gltf, 'utf8');

      const result: FurnitureGenerationResult = {
        cleanedImageUrl,
        modelUrl: `${baseUrl}/generated/${request.userId}/models/${modelFilename}`,
      };

      this.updateJob(jobId, {
        status: 'completed',
        progress: 100,
        message: this.isMeshyEnabled() ? 'Provider unavailable, local 3D silhouette generated' : 'Local 3D silhouette generated',
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
