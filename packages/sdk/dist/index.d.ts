export interface AgentPlugin {
    name: string;
    version: string;
    description: string;
    commandPrefix?: string;
    onLoad?: () => Promise<void>;
    onUnload?: () => Promise<void>;
    commands?: Record<string, CommandHandler>;
}
export interface CommandHandler {
    execute: (args: string[], context: CommandContext) => Promise<void>;
    description: string;
    setup?: (command: any) => void;
}
export interface CommandContext {
    ai: AIClient;
    logger: Logger;
    config: Config;
}
export interface AIClient {
    generate(options: {
        prompt: string;
        temperature?: number;
        maxTokens?: number;
    }): Promise<string>;
}
export interface Logger {
    info(message: string): void;
    error(message: string): void;
    warn(message: string): void;
    debug(message: string): void;
}
export interface Config {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
}
export declare class PluginError extends Error {
    constructor(message: string);
}
export interface PluginManager {
    load(pluginPath: string): Promise<void>;
    unload(pluginName: string): Promise<void>;
    list(): AgentPlugin[];
    get(pluginName: string): AgentPlugin | undefined;
}
export {};
//# sourceMappingURL=index.d.ts.map