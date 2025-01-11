#!/usr/bin/env node

import { Command } from "commander";
import { PluginLoader } from "./core/plugin/loader";
import { PluginError } from "./core/utils/errors";
import { Logger } from "./core/utils/logger";
import { Plugin, CommandHandler } from "./types";
import path from "path";

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

    for (const [cmdPath, cmd] of Object.entries(plugin.commands)) {
      // 支持自定义命令路径
      const fullPath =
        (plugin as Plugin).commandPrefix !== undefined
          ? (plugin as Plugin).commandPrefix === "" // 检查是否为空字符串（根级别命令）
            ? cmdPath // 根级别命令
            : `${(plugin as Plugin).commandPrefix} ${cmdPath}` // 自定义前缀
          : `${plugin.name} ${cmdPath}`; // 默认使用插件名作为前缀

      // 检查命令路径是否已被注册
      if (program.commands.some((cmd) => cmd.name() === fullPath)) {
        logger.warn(`命令 "${fullPath}" 已被其他插件注册，跳过`);
        continue;
      }

      const command = program
        .command(fullPath)
        .description((cmd as CommandHandler).description || "无描述"); // 添加默认描述

      const handler = cmd as CommandHandler;
      if (handler.setup) {
        try {
          handler.setup(command);
        } catch (error) {
          logger.warn(
            `插件 ${plugin.name} 的命令 ${cmdPath} 设置参数时发生错误: ${error}`
          );
          continue;
        }
      }

      command.action(async (...args) => {
        try {
          await handler.execute(args.slice(0, -1), {
            logger,
            ai: {
              generate: async ({ prompt }: { prompt: string }) => {
                console.log("Debug - AI 收到的 prompt:", prompt);
                return "测试提交: 更新了代码";
              },
            },
            config: {
              get: async () => null,
              set: async () => {},
            },
          });
        } catch (error) {
          if (error instanceof Error) {
            logger.error(`${plugin.name} ${cmdPath}: ${error.message}`);
          } else {
            logger.error(`${plugin.name} ${cmdPath}: 命令执行失败`);
          }
        }
      });
    }
  }

  program
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

  program
    .command("plugin remove <name>")
    .description("移除插件，例如: agent plugin remove git-assistant")
    .action(async (name) => {
      try {
        await pluginLoader.unload(name);
        logger.info(`插件 ${name} 移除成功`);
      } catch (error) {
        handleError(error);
      }
    });

  program
    .command("plugin list")
    .description("列出所有已安装的插件")
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

  program
    .command("plugin load <path>")
    .description("从本地路径加载插件，例如: agent plugin load ./my-plugin")
    .action(async (pluginPath) => {
      try {
        await pluginLoader.load(pluginPath);
        logger.info(`插件从 ${pluginPath} 加载成功`);
      } catch (error) {
        handleError(error);
      }
    });

  program
    .command("plugin dev <path>")
    .description("开发模式：监视插件变化并自动重新加载")
    .action(async (pluginPath) => {
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
