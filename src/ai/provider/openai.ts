import { openai, createOpenAI } from '@ai-sdk/openai';
import { AIProviderConfig, AIProviderChat, AIProviderSettings } from './client';

export default class OpenAi implements AIProviderConfig {
  private api: typeof openai;

  configure(settings: AIProviderSettings): void {
    this.api = createOpenAI({
      apiKey: settings.apiKey,
      compatibility: 'strict',
    });
  }
}