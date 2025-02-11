import { anthropic, createAnthropic } from '@ai-sdk/anthropic';
import { LanguageModel,EmbeddingModel } from 'ai';
import { AIProviderConfig, AIProviderChat, 
         AIProviderEmbed, AIProviderModel, AIProviderSettings } from './client';

export default class Anthropic implements AIProviderConfig, AIProviderChat, AIProviderEmbed, AIProviderModel {
  private api: typeof anthropic;

  configure = (settings: AIProviderSettings): void => {
    this.api = createAnthropic({
      apiKey: settings.apiKey,
      headers: {
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      fetch: undefined        
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