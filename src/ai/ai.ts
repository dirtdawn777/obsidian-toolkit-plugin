import { App, Notice } from 'obsidian';
import {}
export type ModelProvider = 'openai';

export type ModelType = 'chat' | 'completion' | 'embedding';

export type StreamingOptions = {
  enabled: boolean;
  onToken?: (token: string) => void;
};

export type BaseModelParams = {
  provider: ModelProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
};

export interface Model {
  generate(input: string, options?: BaseModelParams): Promise<string>;
  generateStream(input: string, options?: BaseModelParams & StreamingOptions): AsyncGenerator<string>;
}

export interface ChatModel extends Model {
  chat(messages: Array<{role: 'user' | 'assistant' | 'system', content: string}>, options?: BaseModelParams): Promise<string>;
  chatStream(messages: Array<{role: 'user' | 'assistant' | 'system', content: string}>, options?: BaseModelParams & StreamingOptions): AsyncGenerator<string>;
}

export interface EmbeddingModel {
  embed(input: string | string[], options?: BaseModelParams): Promise<number[]>;
}

export interface CoreModel {
  generateText(input: string, options?: BaseModelParams): Promise<string>;
  streamText(input: string, options?: BaseModelParams & StreamingOptions): AsyncGenerator<string>;
  generateObject<T>(input: string, options?: BaseModelParams): Promise<T>;
  streamObject<T>(input: string, options?: BaseModelParams & StreamingOptions): AsyncGenerator<T>;
}

export interface Provider {
  modelProvider: ModelProvider;
  chat: (input: string, model: string, systemPrompt?: string, maxReturnTokens?: number, maxOutgoingCharacters?: number) => Promise<string>;
}

export interface LlmOptions {
  model: string,
  systemPrompt?: string,
  maxReturnTokens?: number,
  maxOutgoingCharacters?: number
}

export interface Llm {
  generate (tp: unknown, prompt: string, options: LlmOptions): Promise<string>;
}

class AiApi implements Llm {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  generate = async (tp: unknown, prompt: string, options: LlmOptions): Promise<string> => {
    try {
      const result = await tp.ai.chat(
        prompt,
        options.model,
        options.systemPrompt,
        options.maxReturnTokens,
        options.maxOutgoingCharacters
      );
      return result;
    } catch (e) {
      console.error(e);
      new Notice(`Error generating text: ${e}`);
      throw e; 
    }  
  }
}

export default AiApi;
