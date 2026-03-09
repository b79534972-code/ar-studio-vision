# AI Provider System

## How to add your own AI provider

1. **Create a new provider file** in this folder, e.g. `openai.provider.ts`
2. **Implement `IAIProvider`** interface from `ai-provider.interface.ts`
3. **Register in `ai.module.ts`**:

```typescript
// Replace StubAIProvider with your provider
import { YourProvider } from './providers/your-provider';

{ provide: AI_PROVIDER, useClass: YourProvider }
```

## Example: OpenAI Provider

```typescript
import { Injectable } from '@nestjs/common';
import { IAIProvider, AIContext, LayoutSuggestion, ... } from './ai-provider.interface';

@Injectable()
export class OpenAIProvider implements IAIProvider {
  readonly name = 'openai';
  private apiKey = process.env.OPENAI_API_KEY;

  async suggestLayouts(context: AIContext): Promise<LayoutSuggestion[]> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: 'You are an interior design AI...'
        }, {
          role: 'user', 
          content: `Suggest layouts for room ${context.roomConfig?.width}x${context.roomConfig?.depth}m`
        }],
      }),
    });
    // Parse and return LayoutSuggestion[]
  }

  // ... implement other methods
}
```

## Provider Methods

| Method | Feature | Credits | Description |
|--------|---------|---------|-------------|
| `suggestLayouts` | layout_suggest | 1 | Generate layout options |
| `optimizeLayout` | layout_optimize | 1 | Optimize existing layout |
| `transformStyle` | style_transform | 2 | Change room aesthetic |
| `recommendProducts` | product_recommend | 1 | Furniture recommendations |
| `optimizeBudget` | budget_optimize | 1 | Budget-aware alternatives |
| `renderPhotorealistic` | photorealistic_render | 3 | AI render of room |
| `fullRedesign` | full_room_redesign | 5 | Complete room overhaul |

## Environment Variables

Add your provider's API keys to `.env`:
```
OPENAI_API_KEY=sk-...
# or
REPLICATE_API_TOKEN=r8_...
# or
GOOGLE_AI_KEY=...
```
