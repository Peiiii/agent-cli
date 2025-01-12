export interface IAIClient {
  generate(options: {
    prompt: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string>;
} 