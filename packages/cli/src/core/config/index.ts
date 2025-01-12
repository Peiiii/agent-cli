import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { IConfigManager } from "./types";

export class ConfigManager implements IConfigManager {
    constructor(private configPath: string) {
      this.configPath = configPath || path.join(os.homedir(), '.ai-agent', 'plugins.json');
    }
  
    private async ensureConfigDir(): Promise<void> {
      const configDir = path.dirname(this.configPath);
      await fs.mkdir(configDir, { recursive: true });
    }
  
    private async loadConfig<T extends Record<string, unknown>>(): Promise<T> {
      try {
        const content = await fs.readFile(this.configPath, 'utf-8');
        return JSON.parse(content) as T;
      } catch {
        return {} as T;
      }
    }
  
    private async saveConfig<T extends Record<string, unknown>>(config: T): Promise<void> {
      await this.ensureConfigDir();
      await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
    }
  
    get<T>(key: string): Promise<T> {
      return this.loadConfig().then(config => config[key] as T);
    }
  
    set<T>(key: string, value: T): Promise<void> {
      return this.loadConfig().then(config => {
        config[key] = value;
        return this.saveConfig(config);
      });
    }
  }
  