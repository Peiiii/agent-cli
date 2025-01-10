import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
const execAsync = promisify(exec);
export default class GitAssistantPlugin {
    constructor() {
        this.name = 'git-assistant';
        this.version = '1.0.0';
        this.description = 'Git 操作助手插件';
        this.commands = {
            commit: {
                description: '智能提交代码',
                setup: (command) => {
                    command
                        .option('-m, --message <message>', '手动指定提交信息')
                        .option('-d, --dry-run', '仅显示将要执行的操作，不实际提交')
                        .option('-C, --dir <path>', '指定 Git 仓库目录');
                },
                execute: async (args, context) => {
                    try {
                        console.log('Debug - commit 命令参数:', args);
                        const options = args[args.length - 1];
                        const cwd = options.dir ? path.resolve(options.dir) : process.cwd();
                        console.log('Debug - 当前工作目录:', cwd);
                        // 获取 git 状态
                        const { stdout: status } = await execAsync('git status --porcelain', { cwd });
                        if (!status) {
                            context.logger.info('没有需要提交的更改');
                            return;
                        }
                        console.log('Debug - Git 状态:', status);
                        // 使用 AI 生成提交信息
                        const commitMessage = await context.ai.generate({
                            prompt: `基于以下 git 更改生成简洁的提交信息：\n${status}`,
                            maxTokens: 50
                        });
                        console.log('Debug - 生成的提交信息:', commitMessage);
                        // 执行提交
                        await execAsync('git add .', { cwd });
                        await execAsync(`git commit -m "${commitMessage.trim()}"`, { cwd });
                        context.logger.info(`成功提交: ${commitMessage}`);
                    }
                    catch (error) {
                        if (error instanceof Error) {
                            context.logger.error(`Git 操作失败: ${error.message}`);
                        }
                    }
                }
            },
            status: {
                description: '查看仓库状态',
                setup: (command) => {
                    command
                        .option('-s, --short', '显示简短状态输出')
                        .option('-C, --dir <path>', '指定 Git 仓库目录');
                },
                execute: async (args, context) => {
                    try {
                        console.log('Debug - status 命令参数:', args);
                        const options = args[args.length - 1];
                        const cwd = options.dir ? path.resolve(options.dir) : process.cwd();
                        console.log('Debug - 当前工作目录:', cwd);
                        const cmd = options.short ? 'git status -s' : 'git status';
                        const { stdout } = await execAsync(cmd, { cwd });
                        context.logger.info(stdout);
                    }
                    catch (error) {
                        if (error instanceof Error) {
                            context.logger.error(`获取状态失败: ${error.message}`);
                        }
                    }
                }
            }
        };
    }
    async onLoad() {
        console.log('Git 助手插件已加载');
    }
}
