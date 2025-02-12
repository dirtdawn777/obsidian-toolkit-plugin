import { google, createGoogleGenerativeAI  } from '@ai-sdk/google';
import { LanguageModel,EmbeddingModel } from 'ai';
import { AIProviderConfig, AIProviderChat, 
         AIProviderEmbed, AIProviderModel, AIProviderSettings } from './client';

export default class Google implements AIProviderConfig, AIProviderChat, AIProviderEmbed, AIProviderModel {
  private api: typeof google;

  configure = (settings: AIProviderSettings): void => {
    this.api = createGoogleGenerativeAI({
      apiKey: settings.apiKey,
    });
  }

  getModel(modelId: string, settings?: Record<string, unknown>): LanguageModel | EmbeddingModel<string> {
    if (!settings || !('safetySettings' in settings)) {
      const value =  [
        { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      ];
      settings = settings === undefined ? { safetySettings: value } as Record<string, unknown>
        : { ...settings, safetySettings : value };
    }
    console.log(settings);
    return this.api(modelId, settings);
  }

  chat = (modelId: string, settings?: Record<string, unknown>): LanguageModel => {
    return this.api.chat(modelId, settings);
  }

  embedding = (modelId: string, settings?: Record<string, unknown>): EmbeddingModel<string> => {
    return this.api.textEmbeddingModel(modelId, settings);
  }
}