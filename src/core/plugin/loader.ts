import { AgentPlugin, PluginManager } from './types.js';
import { Logger } from '../utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class PluginLoader implements PluginManager {
  private plugins: Map<string, AgentPlugin> = new Map();
  private logger: Logger;
  private configPath: string;

  constructor(logger: Logger) {
    this.logger = logger;
    this.configPath = path.join(os.homedir(), '.ai-agent', 'plugins.json');
  }

  private async ensureConfigDir(): Promise<void> {
    const configDir = path.dirname(this.configPath);
    await fs.mkdir(configDir, { recursive: true });
  }

  private async loadConfig(): Promise<Record<string, string>> {
    try {
      const content = await fs.readFile(this.configPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  private async saveConfig(pluginPaths: Record<string, string>): Promise<void> {
    await this.ensureConfigDir();
    await fs.writeFile(this.configPath, JSON.stringify(pluginPaths, null, 2));
  }

  async load(pluginPath: string): Promise<void> {
    try {
      const fullPath = path.resolve(pluginPath);
      const modulePath = `file://${path.join(fullPath, 'dist', 'index.js')}`;
      const module = await import(modulePath);
      console.log('Debug - module.default:', module.default);
      const PluginClass = module.default;
      
      const plugin: AgentPlugin = new PluginClass();
      
      // 验证插件接口实现
      this.validatePlugin(plugin);
      
      // 调用插件加载钩子
      if (plugin.onLoad) {
        await plugin.onLoad();
      }
      
      // 保存插件路径到配置文件
      const config = await this.loadConfig();
      config[plugin.name] = pluginPath;
      await this.saveConfig(config);
      
      this.plugins.set(plugin.name, plugin);
      this.logger.info(`插件 ${plugin.name}@${plugin.version} 已加载并保存配置`);
    } catch (error: any) {
      this.logger.error(`加载插件失败: ${error.message}`);
      throw error;
    }
  }

  async unload(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`);
    }

    if (plugin.onUnload) {
      await plugin.onUnload();
    }

    this.plugins.delete(pluginName);
    this.logger.info(`插件 ${pluginName} 已卸载并移除配置`);
    
    // 从配置文件中移除插件
    const config = await this.loadConfig();
    delete config[pluginName];
    await this.saveConfig(config);
  }

  // 新增: 启动时加载所有已保存的插件
  async loadSavedPlugins(): Promise<void> {
    try {
      const config = await this.loadConfig();
      for (const [name, path] of Object.entries(config)) {
        try {
          await this.load(path);
        } catch (error: Error | unknown) {
          if (error instanceof Error) {
            this.logger.warn(`加载保存的插件 ${name} 失败: ${error.message}`);
          } else {
            this.logger.warn(`加载保存的插件 ${name} 失败: 未知错误`);
          }
        }
      }
    } catch (error) {
      this.logger.error('加载保存的插件配置失败');
    }
  }

  list(): AgentPlugin[] {
    return Array.from(this.plugins.values());
  }

  get(pluginName: string): AgentPlugin | undefined {
    return this.plugins.get(pluginName);
  }

  private validatePlugin(plugin: AgentPlugin): void {
    if (!plugin.name) throw new Error('Plugin name is required');
    if (!plugin.version) throw new Error('Plugin version is required');
    if (!plugin.description) throw new Error('Plugin description is required');
  }
} 