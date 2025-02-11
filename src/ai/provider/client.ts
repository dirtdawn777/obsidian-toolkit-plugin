import OpenAi from "./openai";
import Anthropic from "./anthropic";
import { generateText, LanguageModel, CoreMessage, embed, embedMany, cosineSimilarity, EmbeddingModel } from 'ai';

export type AIProvider = 'openai' | 'anthropic';

export type AIProviderSettings = {
  apiKey: string;
  options?: Record<string, unknown>;
};

export type AIProvidersSettings = {
  settings: Record<AIProvider, AIProviderSettings>;
};

export interface AIProviderConfig {
  configure(settings: AIProviderSettings): void;
}

export interface AIProviderChat {
  chat(modelId: string, settings?: Record<string, unknown>): LanguageModel;
}

export interface AIProviderEmbed {
  embedding(modelId: string): EmbeddingModel<string>;
}

export interface AIProviderModel {
  getModel(modelId: string, settings?: Record<string, unknown>): LanguageModel | EmbeddingModel<string>;
}

class AIClient {
  private providersSettings: AIProvidersSettings;
  private providerInstances: 
    Record<
      AIProvider, 
      AIProviderConfig & AIProviderChat & AIProviderEmbed & AIProviderModel
    > = {
      openai: new OpenAi(),
      anthropic: new Anthropic(),
    };
  private chatModelCache: Record<string, AIProviderChat> = {};
  private modelCache: Record<string, LanguageModel | EmbeddingModel<string>> = {};
  private chatCache: Record<string, [model: string, messages: CoreMessage[]]> = {};

  constructor(providersSettings: AIProvidersSettings) {
    this.providersSettings = providersSettings;
  }

  configure = (): void => {
    for (const [provider, settings] of Object.entries(this.providersSettings.settings)) {
      const providerConfig: AIProviderConfig = this.providerInstances[provider as AIProvider];
      if (providerConfig)
        providerConfig.configure(settings);
    }
  }
  getModel = (provider: AIProvider, modelId: string, settings?: Record<string, unknown>): LanguageModel | EmbeddingModel<string> => {
    const providerModel: AIProviderModel = this.providerInstances[provider];
    if (!providerModel) {
      throw new Error(`Provider ${provider} configuration not found. Ensure it's initialized.`);
    }

    const cacheId = `model:${modelId}`;
    if (!this.modelCache[cacheId]) {
      this.modelCache[cacheId] = providerModel.getModel(modelId, settings); 
    }
    return this.modelCache[cacheId];
  }

  startChat = (provider: AIProvider, modelId: string, settings?: Record<string, unknown>): string => {
    const providerChat: AIProviderChat = this.providerInstances[provider];
    if (!providerChat) {
      throw new Error(`Provider ${provider} configuration not found. Ensure it's initialized.`);
    }

    const cacheId = `chat:${modelId}`;
    if (!this.modelCache[cacheId]) {
      this.modelCache[cacheId] = providerChat.chat(modelId, settings); 
    }
    const chatId = crypto.randomUUID();
    this.chatCache[chatId] = [cacheId, []];
    return chatId;
  }

  
  chat = async (chatId: string, request: Record<string, unknown>): Promise<string> => {
    const [model, messages] = this.chatCache[chatId];
    if (!model) {
      throw new Error(`Chat ${chatId} not found. Ensure it's initialized.`);
    }

    if (!('doGenerate' in this.modelCache[model])) {
      throw new Error(`Model ${model} is not a LanguageModel.`);
    }

    if (!request.messages) {
      request.messages = [...messages, { role: 'user', content: request.prompt! }];
    }
    
    request.prompt = undefined;

    const result = await generateText({
      model: this.modelCache[model] as LanguageModel,
      ...request
    });

    this.chatCache[chatId] = [model, [...request.messages as CoreMessage[], { role: 'assistant', content: result.text }]];
    return result.text;
  }

  embed = async (provider: AIProvider, modelId: string, value: string, options?: Record<string, unknown>): Promise<number[]> => {
    const providerEmbed: AIProviderEmbed = this.providerInstances[provider];
    if (!providerEmbed) {
      throw new Error(`Provider ${provider} configuration not found. Ensure it's initialized.`);
    }

    const { embedding } = await embed({ 
      model: providerEmbed.embedding(modelId), 
      value: value,
      ...options
    });

    return embedding;
  }

  embedMany = async (provider: AIProvider, modelId: string, values: string[], options?: Record<string, unknown>): Promise<number[][]> => {
    const providerEmbed: AIProviderEmbed = this.providerInstances[provider];
    if (!providerEmbed) {
      throw new Error(`Provider ${provider} configuration not found. Ensure it's initialized.`);
    }

    const { embeddings } = await embedMany({ 
      model: providerEmbed.embedding(modelId), 
      values: values,
      ...options
    });

    return embeddings;
  }
  
  similarity = (p: number[], q: number[], options?: Record<string, unknown>): number => {
    return cosineSimilarity(p, q, options);
  }
}

export default AIClient;