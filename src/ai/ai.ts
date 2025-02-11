import { App, Notice } from 'obsidian';
import { AIProvider, AIProvidersSettings } from './provider/client'; 
import AIClient from './provider/client'; 

class AiApi {
  private app: App;
  private client: AIClient;

  constructor(app: App) {
    this.app = app;
  }

  configure = (providersSettings: AIProvidersSettings): void => {
    this.client = new AIClient(providersSettings);
    this.client.configure();
  };

  startChat = (provider: AIProvider, modelId: string, settings?: Record<string, unknown>): string => {
    try {
      return this.client.startChat(provider, modelId, settings);
    } catch (error) {
      new Notice(`Failed to start chat with AI: ${error instanceof Error ? error.message : String(error)}`);
      return '';
    }
  }

  chat = async (chatId: string, request: Record<string, unknown>): Promise<string> => {
    try {
      return await this.client.chat(chatId, request);
    } catch (error) {
      new Notice(`Failed to chat with AI: ${error instanceof Error ? error.message : String(error)}`);
      return '';
    }
  }

  embed = async (provider: AIProvider, modelId: string, value: string, options?: Record<string, unknown>): Promise<number[]> => {
    try {
      return await this.client.embed(provider, modelId, value, options);
    } catch (error) {
      new Notice(`Failed to embed with AI: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }
  
  embedMany = async (provider: AIProvider, modelId: string, values: string[], options?: Record<string, unknown>): Promise<number[][]> => {
    try {
      return await this.client.embedMany(provider, modelId, values, options);
    } catch (error) {
      new Notice(`Failed to embed many with AI: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  similarity = (p: number[], q: number[], options?: Record<string, unknown>): number => {
    try {
      return this.client.similarity(p, q, options);
    } catch (error) {
      new Notice(`Failed to calculate similarity: ${error instanceof Error ? error.message : String(error)}`);
      return 0;
    }
  }
}

export default AiApi;
