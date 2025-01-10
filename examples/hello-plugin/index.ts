import { AgentPlugin, CommandContext } from 'ai-agent-sdk';
import { Command } from 'commander';

export default class HelloPlugin implements AgentPlugin {
  name = 'hello-plugin';
  version = '1.0.0';
  description = '一个示例插件';

  commands = {
    hello: {
      description: '打印问候信息',
      setup: (command: Command) => {
        command.argument('[name]', '名称参数');
      },
      execute: async (args: string[], context: CommandContext) => {
        console.log('Debug - 插件收到的参数:', JSON.stringify(args));
        const name = typeof args[0] === 'string' ? args[0] : 'World';
        console.log('Debug - 处理后的名字:', JSON.stringify(name));
        context.logger.info(`Hello, ${name}!`);
      }
    }
  };

  async onLoad(): Promise<void> {
    console.log('Hello plugin loaded!');
  }
} 