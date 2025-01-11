import { Logger } from '../utils/logger.js';
import { AgentPlugin, PluginManager } from './types.js';
export declare class PluginLoader implements PluginManager {
    private plugins;
    private logger;
    private configPath;
    constructor(logger: Logger);
    private ensureConfigDir;
    private loadConfig;
    private saveConfig;
    load(pluginPath: string): Promise<void>;
    unload(pluginName: string): Promise<void>;
    loadSavedPlugins(): Promise<void>;
    list(): AgentPlugin[];
    get(pluginName: string): AgentPlugin | undefined;
    private validatePlugin;
}
//# sourceMappingURL=loader.d.ts.map