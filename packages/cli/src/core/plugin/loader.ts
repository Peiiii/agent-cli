import { AgentPlugin, AgentPluginClass, PluginManager } from "@ai-agent/sdk";
import fs from "fs";
import path from "path";
import { IConfigManager } from "../config/types";
import { Logger } from "../utils/logger";

export type PluginModule = {
  default: AgentPluginClass;
};

export type PluginPackage = {
  name: string;
  version: string;
  description: string;
  main: string;
};

export class PluginLoader implements PluginManager {
  private plugins: Map<string, AgentPlugin> = new Map();
  constructor(private logger: Logger, private configManager: IConfigManager) {}

  async load(pluginPath: string): Promise<void> {
    try {
      const fullPath = path.resolve(pluginPath);
      const pkgPath = path.join(fullPath, "package.json");
      const pkg = JSON.parse(
        await fs.promises.readFile(pkgPath, "utf8")
      ) as PluginPackage;
      const modulePath = `file://${path.join(fullPath, pkg.main)}`;
      const module = (await import(modulePath)) as PluginModule;
      const PluginClass = module.default;
      const plugin = new PluginClass();

      // 验证插件接口实现
      this.validatePlugin(plugin);

      // 调用插件加载钩子
      if (plugin.onLoad) {
        await plugin.onLoad();
      }

      // 保存插件路径到配置文件
      const config = await this.configManager.get<Record<string, string>>(
        "plugins"
      );
      config[plugin.name] = pluginPath;
      await this.configManager.set("s", config);

      this.plugins.set(plugin.name, plugin);
      this.logger.info(
        `插件 ${plugin.name}@${plugin.version} 已加载并保存配置`
      );
    } catch (error: unknown) {
      this.logger.error(`加载插件失败: ${(error as Error).message}`);
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
    const config = await this.configManager.get<Record<string, string>>(
      "plugins"
    );
    delete config[pluginName];
    await this.configManager.set("plugins", config);
  }

  // 新增: 启动时加载所有已保存的插件
  async loadSavedPlugins(): Promise<void> {
    try {
      const config = await this.configManager.get<Record<string, string>>(
        "plugins"
      );
      for (const [name, path] of Object.entries(config)) {
        try {
          await this.load(path);
        } catch (error: unknown) {
          if (error instanceof Error) {
            this.logger.warn(`加载保存的插件 ${name} 失败: ${error.message}`);
          } else {
            this.logger.warn(`加载保存的插件 ${name} 失败: 未知错误`);
          }
        }
      }
    } catch (error) {
      this.logger.error("加载保存的插件配置失败");
    }
  }

  list(): AgentPlugin[] {
    return Array.from(this.plugins.values());
  }

  get(pluginName: string): AgentPlugin | undefined {
    return this.plugins.get(pluginName);
  }

  private validatePlugin(plugin: AgentPlugin): void {
    if (!plugin.name) throw new Error("Plugin name is required");
    if (!plugin.version) throw new Error("Plugin version is required");
    if (!plugin.description) throw new Error("Plugin description is required");
  }
}
