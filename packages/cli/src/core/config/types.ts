export interface Config {
  get(key: string): any;
  set(key: string, value: any): Promise<void>;
} 