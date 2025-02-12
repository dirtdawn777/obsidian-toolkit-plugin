import { ollama, createOllama  } from 'ollama-ai-provider';
import { LanguageModel, EmbeddingModel } from 'ai';
import { AIProviderConfig, AIProviderChat, 
         AIProviderEmbed, AIProviderModel, AIProviderSettings } from './client';

export default class Ollama implements AIProviderConfig, AIProviderChat, AIProviderEmbed, AIProviderModel {
  private api: typeof ollama;

  configure = (settings: AIProviderSettings): void => {
    this.api = createOllama ({
      baseURL: settings.baseURL ?? 'http://localhost:11434/api',
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