import { App, Notice } from 'obsidian';
import { createOpenAI, OpenAIProvider } from '@ai-sdk/openai'
//import { Provider } from 'ai';
import { generateText, LanguageModel } from 'ai';


export type Provider = 'openai';

export interface ProviderApiKeys {
  apiKeys: Record<Provider, string>;
}

/*
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
  embed(input: string | string[], options?: Provider): Promise<number[]>;
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
*/
class AiApi {
  private app: App;
  private openai: OpenAIProvider;
  private providerApiKeys: ProviderApiKeys;

  private modelFactories: {
    [providerModelType: string]: LanguageModel;
  } = {};

  constructor(app: App, providerApiKeys: ProviderApiKeys) {
    this.app = app;
    this.providerApiKeys = providerApiKeys;
  }

  createOpenAI = () => {
    this.openai = createOpenAI({
      apiKey: this.providerApiKeys.apiKeys['openai'],
      compatibility: 'strict',
    });
    this.modelFactories['openai:chat'] = this.openai.chat('gpt-4');
  }

  chat = async (model: string, prompt: string) => {
    const m = this.modelFactories[model];
    if (!m) {
      new Notice(`Model ${model} not found`);
      return;
    }
    const { text } = await generateText({
      model: m,
      prompt: prompt,
    });
    return text;
  }
}

export default AiApi;
