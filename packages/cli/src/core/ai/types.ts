export interface AIClient {
  generate(options: {
    prompt: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string>;
} 