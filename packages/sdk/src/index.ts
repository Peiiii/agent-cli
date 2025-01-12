import { Command } from "commander";

// 插件接口
export interface AgentPlugin {
  name: string;
  version: string;
  description: string;
  commandPrefix?: string;

  onLoad?: () => Promise<void>;
  onUnload?: () => Promise<void>;

  commands?: Record<string, CommandHandler>;
}

export interface AgentPluginClass {
  new(): AgentPlugin;
}


// 命令处理器接口
export interface CommandHandler {
  execute: (args: string[], context: CommandContext) => Promise<void>;
  description: string;
  setup?: (command: Command) => void; // 用于设置命令参数和选项
}

// 命令上下文
export interface CommandContext {
  ai: AIClient;
  logger: Logger;
  config: Config;
}

// AI 客户端接口
export interface AIClient {
  generate(options: {
    prompt: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string>;
}

// 日志接口
export interface Logger {
  info(message: string): void;
  error(message: string): void;
  warn(message: string): void;
  debug(message: string): void;
}

// 配置接口
export interface Config {
  get<T>(key: string): Promise<T>;
  set<T>(key: string, value: T): Promise<void>;
}

// 错误类
export class PluginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PluginError";
  }
}

// 插件管理器接口
export interface PluginManager {
  load(pluginPath: string): Promise<void>;
  unload(pluginName: string): Promise<void>;
  list(): AgentPlugin[];
  get(pluginName: string): AgentPlugin | undefined;
}

export { };

