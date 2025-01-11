#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const loader_1 = require("./core/plugin/loader");
const errors_1 = require("./core/utils/errors");
const logger_1 = require("./core/utils/logger");
const path_1 = __importDefault(require("path"));
const logger = new logger_1.Logger();
const pluginLoader = new loader_1.PluginLoader(logger);
// 将初始化逻辑放在主函数中
async function main() {
    // 启动时加载已保存的插件
    await pluginLoader.loadSavedPlugins();
    const program = new commander_1.Command();
    program
        .version("1.0.0")
        .description("A CLI agent that supports command line access and extensibility");
    // 注册插件命令
    for (const plugin of pluginLoader.list()) {
        if (!plugin.commands)
            continue;
        for (const [cmdPath, cmd] of Object.entries(plugin.commands)) {
            // 支持自定义命令路径
            const fullPath = plugin.commandPrefix !== undefined
                ? plugin.commandPrefix === "" // 检查是否为空字符串（根级别命令）
                    ? cmdPath // 根级别命令
                    : `${plugin.commandPrefix} ${cmdPath}` // 自定义前缀
                : `${plugin.name} ${cmdPath}`; // 默认使用插件名作为前缀
            // 检查命令路径是否已被注册
            if (program.commands.some((cmd) => cmd.name() === fullPath)) {
                logger.warn(`命令 "${fullPath}" 已被其他插件注册，跳过`);
                continue;
            }
            const command = program
                .command(fullPath)
                .description(cmd.description || "无描述"); // 添加默认描述
            const handler = cmd;
            if (handler.setup) {
                try {
                    handler.setup(command);
                }
                catch (error) {
                    logger.warn(`插件 ${plugin.name} 的命令 ${cmdPath} 设置参数时发生错误: ${error}`);
                    continue;
                }
            }
            command.action(async (...args) => {
                try {
                    await handler.execute(args.slice(0, -1), {
                        logger,
                        ai: {
                            generate: async ({ prompt }) => {
                                console.log("Debug - AI 收到的 prompt:", prompt);
                                return "测试提交: 更新了代码";
                            },
                        },
                        config: {
                            get: async () => null,
                            set: async () => { },
                        },
                    });
                }
                catch (error) {
                    if (error instanceof Error) {
                        logger.error(`${plugin.name} ${cmdPath}: ${error.message}`);
                    }
                    else {
                        logger.error(`${plugin.name} ${cmdPath}: 命令执行失败`);
                    }
                }
            });
        }
    }
    program
        .command("plugin")
        .description("插件管理命令")
        .addHelpText("after", `
示例:
  $ agent plugin list                  # 列出所有插件
  $ agent plugin remove git-assistant  # 移除 git-assistant 插件
  $ agent plugin load ./my-plugin      # 从本地路径加载插件
  $ agent plugin dev ./my-plugin       # 开发模式：监视插件变化

注意:
  - 插件安装后需要重启 CLI 才能生效
  - 本地插件路径可以是相对路径或绝对路径
  - 使用 -h 或 --help 查看此帮助信息
`);
    program
        .command("plugin remove <name>")
        .description("移除插件，例如: agent plugin remove git-assistant")
        .action(async (name) => {
        try {
            await pluginLoader.unload(name);
            logger.info(`插件 ${name} 移除成功`);
        }
        catch (error) {
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
        }
        else {
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
        }
        catch (error) {
            handleError(error);
        }
    });
    program
        .command("plugin dev <path>")
        .description("开发模式：监视插件变化并自动重新加载")
        .action(async (pluginPath) => {
        try {
            logger.info(`开发模式：监视插件 ${pluginPath}`);
            const { spawn } = await Promise.resolve().then(() => __importStar(require("child_process")));
            const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
            const watcher = spawn(npmCmd, ["run", "watch"], {
                cwd: path_1.default.resolve(pluginPath),
                stdio: "inherit",
            });
            watcher.on("close", (code) => {
                if (code !== 0) {
                    logger.error(`插件编译进程异常退出，代码: ${code}`);
                }
            });
            await pluginLoader.load(pluginPath);
            logger.info("插件加载完成，正在监视变化...");
        }
        catch (error) {
            handleError(error);
        }
    });
    // 添加错误处理辅助函数
    function handleError(error) {
        if (error instanceof errors_1.PluginError) {
            logger.error(error.message);
        }
        else if (error instanceof Error) {
            logger.error(`意外错误: ${error.message}`);
        }
        else {
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
