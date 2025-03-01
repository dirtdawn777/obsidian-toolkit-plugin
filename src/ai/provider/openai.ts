import { openai, createOpenAI } from '@ai-sdk/openai';
import { LanguageModel,EmbeddingModel } from 'ai';
import { AIProviderConfig, AIProviderChat, 
         AIProviderEmbed, AIProviderModel, AIProviderSettings } from './client';

export default class OpenAi implements AIProviderConfig, AIProviderChat, AIProviderEmbed, AIProviderModel {
  private api: typeof openai;

  configure = (settings: AIProviderSettings): void => {
    this.api = createOpenAI({
      apiKey: settings.apiKey,
      compatibility: 'strict',
    });
  }

  getModel(modelId: string, settings?: Record<string, unknown>): LanguageModel | EmbeddingModel<string> {
    return this.api(modelId, settings);
  }

  chat = (modelId: string, settings?: Record<string, unknown>): LanguageModel => {
    return this.api.chat(modelId, settings);
  }

  embedding = (modelId: string, settings?: Record<string, unknown>): EmbeddingModel<string> => {
    return this.api.embedding(modelId, settings);
  }
}