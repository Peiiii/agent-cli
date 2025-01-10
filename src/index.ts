#!/usr/bin/env node

import { Command } from "commander";
import { PluginLoader } from "./core/plugin/loader.js";
import { PluginError } from "./core/utils/errors.js";
import { Logger } from "./core/utils/logger.js";
import { CommandHandler } from "ai-agent-sdk";
import path from 'path';

const logger = new Logger();
const pluginLoader = new PluginLoader(logger);

// 将初始化逻辑放在主函数中
async function main() {
  // 启动时加载已保存的插件
  await pluginLoader.loadSavedPlugins();

  const program = new Command();

  program
    .version("1.0.0")
    .description(
      "A CLI agent that supports command line access and extensibility"
    );

  // 注册插件命令
  for (const plugin of pluginLoader.list()) {
    if (!plugin.commands) continue;
    for (const [cmdName, cmd] of Object.entries(plugin.commands)) {
      const command = program.command(cmdName).description((cmd as CommandHandler).description);
      
      // 允许插件设置自己的命令参数
      const handler = cmd as CommandHandler;
      if (handler.setup) {
        handler.setup(command);
      }
      
      // 通用的命令处理
      command.action(async (name: string, options: any) => {
        try {
          // 收集所有参数
          const args: string[] = [];
          if (name) args.push(name);
          
          await handler.execute(args, {
            logger,
            ai: { 
              generate: async ({ prompt }: { prompt: string }) => {
                console.log('Debug - AI 收到的 prompt:', prompt);
                return '测试提交: 更新了代码';
              }
            },
            config: {
              get: async () => null,
              set: async () => {}
            },
          });
        } catch (error) {
          if (error instanceof Error) {
            logger.error(error.message);
          } else {
            logger.error("命令执行失败");
          }
        }
      });
    }
  }

  program
    .command("plugin")
    .description("插件管理命令")
    .option(
      "-i, --install <name>",
      "安装插件，例如: agent plugin -i git-assistant"
    )
    .option(
      "-r, --remove <name>",
      "移除插件，例如: agent plugin -r git-assistant"
    )
    .option("-l, --list", "列出所有已安装的插件")
    .option(
      "-d, --load <path>",
      "从本地路径加载插件，例如: agent plugin -d ./my-plugin"
    )
    .option(
      "--dev <path>",
      "开发模式：监视插件变化并自动重新加载"
    )
    .addHelpText(
      "after",
      `
示例:
  $ agent plugin -l                    # 列出所有插件
  $ agent plugin -i git-assistant      # 安装 git-assistant 插件
  $ agent plugin -r git-assistant      # 移除 git-assistant 插件
  $ agent plugin -d ./my-plugin        # 从本地路径加载插件
  $ agent plugin --dev ./my-plugin     # 开发模式：监视插件变化

注意:
  - 插件安装后需要重启 CLI 才能生效
  - 本地插件路径可以是相对路径或绝对路径
  - 使用 -h 或 --help 查看此帮助信息
  `
    )
    .action(async (cmd) => {
      try {
        if (cmd.list) {
          const plugins = pluginLoader.list();
          if (plugins.length === 0) {
            console.log("当前没有已安装的插件");
          } else {
            console.log("已安装的插件：");
            plugins.forEach((p) => {
              console.log(`${p.name}@${p.version} - ${p.description}`);
            });
          }
        } else if (cmd.load) {
          await pluginLoader.load(cmd.load);
        } else if (cmd.remove) {
          await pluginLoader.unload(cmd.remove);
        } else if (cmd.dev) {
          // 开发模式：监视插件变化
          const pluginPath = cmd.dev;
          logger.info(`开发模式：监视插件 ${pluginPath}`);
          
          // 启动插件的 watch 模式
          const { spawn } = await import('child_process');
          const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
          const watcher = spawn(npmCmd, ['run', 'watch'], {
            cwd: path.resolve(pluginPath),
            stdio: 'inherit'
          });

          // 监听进程退出
          watcher.on('close', (code) => {
            if (code !== 0) {
              logger.error(`插件编译进程异常退出，代码: ${code}`);
            }
          });

          // 加载插件
          await pluginLoader.load(pluginPath);
          logger.info('插件加载完成，正在监视变化...');
        }
      } catch (error) {
        if (error instanceof PluginError) {
          logger.error(error.message);
        } else if (error instanceof Error) {
          logger.error(`Unexpected error: ${error.message}`);
        } else {
          logger.error("An unknown error occurred");
        }
      }
    });

  program.parse(process.argv);
}

// 执行主函数
main().catch((error) => {
  logger.error(`Failed to start CLI: ${error}`);
  process.exit(1);
});
