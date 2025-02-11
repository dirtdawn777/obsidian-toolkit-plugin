import { openai, createOpenAI } from '@ai-sdk/openai';
import { LanguageModel,EmbeddingModel } from 'ai';
import { AIProviderConfig, AIProviderChat, 
         AIProviderEmbed, AIProviderSettings } from './client';

export default class OpenAi implements AIProviderConfig, AIProviderChat, AIProviderEmbed {
  private api: typeof openai;

  configure = (settings: AIProviderSettings): void => {
    this.api = createOpenAI({
      apiKey: settings.apiKey,
      compatibility: 'strict',
    });
  }

  chat = (modelId: string, settings?: Record<string, unknown>): LanguageModel => {
    return this.api.chat(modelId, settings);
  }

  embedding = (modelId: string): EmbeddingModel<string> => {
    return this.api.embedding(modelId);
  }
}