import { groq, createGroq  } from '@ai-sdk/groq';
import { LanguageModel, EmbeddingModel } from 'ai';
import { AIProviderConfig, AIProviderChat, 
         AIProviderEmbed, AIProviderModel, AIProviderSettings } from './client';

export default class OpenAi implements AIProviderConfig, AIProviderChat, AIProviderEmbed, AIProviderModel {
  private api: typeof groq;

  configure = (settings: AIProviderSettings): void => {
    this.api = createGroq ({
      apiKey: settings.apiKey,
    });
  }

  getModel(modelId: string, settings?: Record<string, unknown>): LanguageModel | EmbeddingModel<string> {
    return this.api(modelId, settings);
  }

  chat = (modelId: string, settings?: Record<string, unknown>): LanguageModel => {
    return this.api.languageModel(modelId, settings);
  }

  embedding = (modelId: string): EmbeddingModel<string> => {
    return this.api.textEmbeddingModel(modelId);
  }
}