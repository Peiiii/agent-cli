export interface IConfigManager {
  get<T>(key: string): Promise<T>;
  set<T>(key: string, value: T): Promise<void>;
} 