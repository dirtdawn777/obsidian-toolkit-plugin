import { openai, createOpenAI } from '@ai-sdk/openai';

export default class OpenAi {
  private apiKey: string;
  private api: typeof openai;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.api = createOpenAI({
      apiKey: this.apiKey,
      compatibility: 'strict'
    });
  }

  listAvailableModels = async () => {
    const openaiModels = Object.keys(openai.);
    return this.api.listModels();
  }
}