import OpenAi from "./openai";

export type AIProvider = 'openai';

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
  chat (model: string, prompt: string): Promise<string>;
}

class AIClient {
  private providersSettings: AIProvidersSettings;
  private providerConfigs: Record<AIProvider, AIProviderConfig> = {
    openai: new OpenAi(),
  };

  constructor(providersSettings: AIProvidersSettings) {
    this.providersSettings = providersSettings;
  }

  configure(): void {
    for (const [provider, settings] of Object.entries(this.providersSettings.settings)) {
      const providerConfig: AIProviderConfig = this.providerConfigs[provider as AIProvider];
      providerConfig.configure(settings);
    }
  }

  async chat(model: string, prompt: string): Promise<string> {
    const settings = this.providersSettings.settings[provider];
    if (!settings) {
      throw new Error(`Provider ${provider} settings not found`);
    }

    const providerConfig = this.providerConfigs[provider];
    if (!providerConfig) {
      throw new Error(`Provider ${provider} configuration not found. Ensure it's initialized.`);
    }

    try {
      // Pass settings.options to the chat method if needed, or handle options within the providerConfig.chat method.
      return await providerConfig.chat(prompt, settings.options); // Call the chat method of the configured provider
    } catch (error) {
      console.error(`Error during chat with provider ${provider}:`, error);
      throw new Error(`Failed to chat with provider ${provider}: ${error instanceof Error ? error.message : String(error)}`); // Re-throw error for handling upstream
    }
  }
}

export default AIClient;