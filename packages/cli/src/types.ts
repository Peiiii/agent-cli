import { CommandHandler } from '@ai-agent/sdk';

export type { CommandHandler };  // 重新导出 CommandHandler 类型

export interface Plugin {
  name: string;
  version?: string;
  description?: string;
  commands?: Record<string, CommandHandler>;
  commandPrefix?: string;  // 自定义命令前缀，如果不设置则使用插件名
} 