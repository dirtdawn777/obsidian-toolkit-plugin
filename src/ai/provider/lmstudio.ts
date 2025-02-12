import { OpenAICompatibleProvider, OpenAICompatibleProviderSettings, createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { LanguageModel, EmbeddingModel } from 'ai';
import { AIProviderConfig, AIProviderChat, 
         AIProviderEmbed, AIProviderModel, AIProviderSettings } from './client';

export default class LmStudio implements AIProviderConfig, AIProviderChat, AIProviderEmbed, AIProviderModel {
  private api: OpenAICompatibleProvider;

  configure = (settings: AIProviderSettings): void => {
    this.api = createOpenAICompatible ({
      baseURL: settings.baseURL ?? 'http://localhost:1234/v1',
    } as OpenAICompatibleProviderSettings);
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