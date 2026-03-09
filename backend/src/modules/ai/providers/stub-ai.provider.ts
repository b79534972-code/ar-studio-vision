/**
 * Stub AI Provider — Development/Testing Placeholder
 * 
 * Returns realistic mock data for all AI features.
 * Replace with your real provider by implementing IAIProvider.
 * 
 * To switch providers, change the binding in ai.module.ts:
 *   { provide: AI_PROVIDER, useClass: YourRealProvider }
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  IAIProvider,
  AIContext,
  LayoutSuggestion,
  StyleTransformResult,
  ProductRecommendation,
  BudgetOptimization,
  PhotoRenderResult,
  FullRedesignResult,
} from './ai-provider.interface';

@Injectable()
export class StubAIProvider implements IAIProvider {
  private readonly logger = new Logger(StubAIProvider.name);
  readonly name = 'stub';

  private simulateDelay(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async suggestLayouts(context: AIContext): Promise<LayoutSuggestion[]> {
    this.logger.log(`[STUB] suggestLayouts for user ${context.userId}`);
    await this.simulateDelay();

    const roomWidth = context.roomConfig?.width ?? 6;
    const roomDepth = context.roomConfig?.depth ?? 5;

    return [
      {
        name: 'Open Flow Layout',
        description: 'Maximizes walking space with furniture along walls',
        score: 0.92,
        objects: [
          { id: 'sofa-1', name: 'Sofa', category: 'sofa', position: [roomWidth / 2, 0, 0.5], rotation: [0, 0, 0] },
          { id: 'table-1', name: 'Coffee Table', category: 'table', position: [roomWidth / 2, 0, 2], rotation: [0, 0, 0] },
          { id: 'chair-1', name: 'Accent Chair', category: 'chair', position: [1, 0, 2.5], rotation: [0, Math.PI / 4, 0] },
        ],
      },
      {
        name: 'Cozy Conversation',
        description: 'Furniture arranged for face-to-face interaction',
        score: 0.87,
        objects: [
          { id: 'sofa-1', name: 'Sofa', category: 'sofa', position: [roomWidth / 2, 0, 1], rotation: [0, 0, 0] },
          { id: 'sofa-2', name: 'Loveseat', category: 'sofa', position: [roomWidth / 2, 0, roomDepth - 1], rotation: [0, Math.PI, 0] },
          { id: 'table-1', name: 'Coffee Table', category: 'table', position: [roomWidth / 2, 0, roomDepth / 2], rotation: [0, 0, 0] },
        ],
      },
    ];
  }

  async optimizeLayout(context: AIContext): Promise<LayoutSuggestion> {
    this.logger.log(`[STUB] optimizeLayout for user ${context.userId}`);
    await this.simulateDelay();

    return {
      name: 'Optimized Layout',
      description: 'Space usage improved by 23%. Better traffic flow.',
      score: 0.95,
      objects: context.objects?.map((obj) => ({
        id: obj.id,
        name: obj.name,
        category: obj.category,
        position: obj.position,
        rotation: [0, 0, 0] as [number, number, number],
      })) ?? [],
    };
  }

  async transformStyle(context: AIContext, targetStyle: string): Promise<StyleTransformResult> {
    this.logger.log(`[STUB] transformStyle → ${targetStyle} for user ${context.userId}`);
    await this.simulateDelay();

    const stylePalettes: Record<string, string[]> = {
      modern: ['#1a1a2e', '#16213e', '#0f3460', '#e94560'],
      scandinavian: ['#f5f5f0', '#d4c5a9', '#b8a88a', '#6b705c'],
      minimalist: ['#ffffff', '#f0f0f0', '#333333', '#e0e0e0'],
      industrial: ['#2d2d2d', '#8b7355', '#cd853f', '#d2691e'],
      japanese: ['#f5e6d3', '#c9b99a', '#8b7355', '#2d4a22'],
    };

    return {
      styleName: targetStyle,
      colorPalette: stylePalettes[targetStyle] ?? stylePalettes.modern,
      suggestedChanges: [
        { objectId: 'wall', property: 'color', from: context.roomConfig?.wallColor ?? '#F5F5F4', to: stylePalettes[targetStyle]?.[0] ?? '#ffffff' },
        { objectId: 'floor', property: 'material', from: 'default', to: targetStyle === 'industrial' ? 'concrete' : 'wood' },
      ],
      moodDescription: `A ${targetStyle} transformation with carefully selected colors and materials for a cohesive aesthetic.`,
    };
  }

  async recommendProducts(context: AIContext, count: number = 3): Promise<ProductRecommendation[]> {
    this.logger.log(`[STUB] recommendProducts (${count}) for user ${context.userId}`);
    await this.simulateDelay();

    const currency = context.budget?.currency ?? 'VND';
    const products: ProductRecommendation[] = [
      {
        name: 'IKEA KIVIK Sofa',
        category: 'sofa',
        reason: 'Perfect fit for the room dimensions. Modern design matches the current style.',
        estimatedPrice: { amount: currency === 'VND' ? 15000000 : 599, currency },
        dimensions: { width: 2.28, height: 0.83, depth: 0.95 },
        style: context.style ?? 'modern',
      },
      {
        name: 'Mid-Century Coffee Table',
        category: 'table',
        reason: 'Compact footprint with storage shelf. Complements the sofa choice.',
        estimatedPrice: { amount: currency === 'VND' ? 5000000 : 199, currency },
        dimensions: { width: 1.2, height: 0.45, depth: 0.6 },
        style: context.style ?? 'modern',
      },
      {
        name: 'Monstera Plant',
        category: 'plant',
        reason: 'Adds natural warmth. Low maintenance and visually impactful in the corner.',
        estimatedPrice: { amount: currency === 'VND' ? 500000 : 25, currency },
        dimensions: { width: 0.6, height: 1.2, depth: 0.6 },
        style: 'any',
      },
    ];

    return products.slice(0, count);
  }

  async optimizeBudget(context: AIContext): Promise<BudgetOptimization> {
    this.logger.log(`[STUB] optimizeBudget for user ${context.userId}`);
    await this.simulateDelay();

    const currency = context.budget?.currency ?? 'VND';
    const isVND = currency === 'VND';

    return {
      totalEstimate: { amount: isVND ? 25000000 : 1000, currency },
      savings: { amount: isVND ? 8000000 : 320, currency },
      suggestions: [
        { action: 'alternative', description: 'Consider IKEA alternatives for the accent chair — similar aesthetic, 40% savings.', savingsAmount: isVND ? 3000000 : 120 },
        { action: 'diy', description: 'DIY floating shelves instead of buying a bookcase.', savingsAmount: isVND ? 2000000 : 80 },
        { action: 'replace', description: 'Second-hand coffee table in excellent condition.', savingsAmount: isVND ? 3000000 : 120, objectId: 'table-1' },
      ],
    };
  }

  async renderPhotorealistic(context: AIContext, cameraAngle?: string): Promise<PhotoRenderResult> {
    this.logger.log(`[STUB] renderPhotorealistic (angle: ${cameraAngle ?? 'default'}) for user ${context.userId}`);
    await this.simulateDelay(1000);

    return {
      imageUrl: 'https://placehold.co/1920x1080/1a1a2e/ffffff?text=AI+Render+Placeholder',
      format: 'png',
      resolution: { width: 1920, height: 1080 },
      renderTimeMs: 1000,
    };
  }

  async fullRedesign(context: AIContext, preferences?: Record<string, unknown>): Promise<FullRedesignResult> {
    this.logger.log(`[STUB] fullRedesign for user ${context.userId}, prefs: ${JSON.stringify(preferences)}`);
    await this.simulateDelay(1500);

    const style = (preferences?.style as string) ?? context.style ?? 'modern';

    return {
      concept: `Complete ${style} transformation with an emphasis on natural light and functional zones.`,
      style,
      colorPalette: ['#f5f5f0', '#d4c5a9', '#333333', '#e94560'],
      layouts: await this.suggestLayouts(context),
      estimatedBudget: { amount: context.budget?.currency === 'USD' ? 2500 : 60000000, currency: context.budget?.currency ?? 'VND' },
    };
  }
}
