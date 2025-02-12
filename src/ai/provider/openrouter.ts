import { openrouter, createOpenRouter  } from '@openrouter/ai-sdk-provider';
import { LanguageModel, EmbeddingModel } from 'ai';
import { AIProviderConfig, AIProviderChat, 
         AIProviderEmbed, AIProviderModel, AIProviderSettings } from './client';

export default class OpenAi implements AIProviderConfig, AIProviderChat, AIProviderEmbed, AIProviderModel {
  private api: typeof openrouter;

  configure = (settings: AIProviderSettings): void => {
    this.api = createOpenRouter ({
      apiKey: settings.apiKey,
      compatibility: 'strict',
    });
  }

  getModel(modelId: string, settings?: Record<string, unknown>): LanguageModel | EmbeddingModel<string> {
    return this.api(modelId, settings);
  }

  chat = (modelId: string, settings?: Record<string, unknown>): LanguageModel => {
    return this.api.languageModel(modelId, settings);
  }

  embedding = (modelId: string): EmbeddingModel<string> => {
    throw new Error('Unsupported functionality.');

  }
}