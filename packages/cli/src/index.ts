#!/usr/bin/env node

import { Command } from "commander";
import os from 'os';
import path from "path";
import { AIClient } from "./core/ai";
import { ConfigManager } from "./core/config";
import { PluginLoader } from "./core/plugin/loader";
import { CommandContext, PluginError } from "./core/utils/errors";
import { Logger } from "./core/utils/logger";

const logger = new Logger();
const configManager = new ConfigManager(path.join(os.homedir(), '.ai-agent', 'config.json'));
const pluginLoader = new PluginLoader(logger, configManager);
const aiClient = new AIClient();
const commandContext: CommandContext = {
  logger: logger,
  ai: aiClient,
  config: configManager,
};

// 将初始化逻辑放在主函数中
async function main() {
  // 启动时加载已保存的插件
  await pluginLoader.loadSavedPlugins();

  const program = new Command();

  console.log("[agent] 启动中...");

  program
    .version("1.0.0")
    .description(
      "A CLI agent that supports command line access and extensibility"
    );

  pluginLoader.list().forEach((plugin) => {
    let cmd: Command;
    if (plugin.commandPrefix) {
      cmd = program.command(plugin.commandPrefix);
    } else {
      cmd = program.command(plugin.name);
    }

    cmd
      .description(plugin.description)
      .addHelpText("after", plugin.description);
    Object.entries(plugin.commands || {}).forEach(([cmdPath, cmdHandler]) => {
      cmd
        .command(cmdPath)
        .description(cmdHandler.description)
        .addHelpText("after", cmdHandler.description)
        .action(async (...args: string[]) => {
            await cmdHandler.execute(args, commandContext);
        });
    });
  });

  const pluginCommand = program
    .command("plugin")
    .description("插件管理命令")
    .addHelpText(
      "after",
      `
示例:
  $ agent plugin list                  # 列出所有插件
  $ agent plugin remove git-assistant  # 移除 git-assistant 插件
  $ agent plugin load ./my-plugin      # 从本地路径加载插件
  $ agent plugin dev ./my-plugin       # 开发模式：监视插件变化

注意:
  - 插件安装后需要重启 CLI 才能生效
  - 本地插件路径可以是相对路径或绝对路径
  - 使用 -h 或 --help 查看此帮助信息
`
    );

  pluginCommand
    .command("remove <name>")
    .description("移除插件，例如: agent plugin remove git-assistant")
    .action(async (name: string) => {
      try {
        await pluginLoader.unload(name);
        logger.info(`插件 ${name} 移除成功`);
      } catch (error) {
        handleError(error);
      }
    });

  pluginCommand
    .command("list")
    .description("列出所有已安装的插件")
    .addHelpText(
      "after",
      `
plugin list 命令用于列出所有已安装的插件。
`
    )
    .action(() => {
      const plugins = pluginLoader.list();
      if (plugins.length === 0) {
        console.log("当前没有已安装的插件");
      } else {
        console.log("已安装的插件：");
        plugins.forEach((p) => {
          console.log(`${p.name}@${p.version} - ${p.description}`);
        });
      }
    });

  pluginCommand
    .command("load <path>")
    .description("从本地路径加载插件，例如: agent plugin load ./my-plugin")
    .action(async (pluginPath: string) => {
      try {
        await pluginLoader.load(pluginPath);
        logger.info(`插件从 ${pluginPath} 加载成功`);
      } catch (error) {
        handleError(error);
      }
    });

  pluginCommand
    .command("dev <path>")
    .description("开发模式：监视插件变化并自动重新加载")
    .action(async (pluginPath: string) => {
      try {
        logger.info(`开发模式：监视插件 ${pluginPath}`);

        const { spawn } = await import("child_process");
        const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
        const watcher = spawn(npmCmd, ["run", "watch"], {
          cwd: path.resolve(pluginPath),
          stdio: "inherit",
        });

        watcher.on("close", (code) => {
          if (code !== 0) {
            logger.error(`插件编译进程异常退出，代码: ${code}`);
          }
        });

        await pluginLoader.load(pluginPath);
        logger.info("插件加载完成，正在监视变化...");
      } catch (error) {
        handleError(error);
      }
    });

  // 添加错误处理辅助函数
  function handleError(error: unknown) {
    if (error instanceof PluginError) {
      logger.error(error.message);
    } else if (error instanceof Error) {
      logger.error(`意外错误: ${error.message}`);
    } else {
      logger.error("发生未知错误");
    }
  }

  program.parse(process.argv);
}

// 执行主函数
main().catch((error) => {
  logger.error(`Failed to start CLI: ${error}`);
  process.exit(1);
});
