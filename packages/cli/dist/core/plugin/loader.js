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
exports.PluginLoader = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
class PluginLoader {
    constructor(logger) {
        this.plugins = new Map();
        this.logger = logger;
        this.configPath = path_1.default.join(os_1.default.homedir(), '.ai-agent', 'plugins.json');
    }
    async ensureConfigDir() {
        const configDir = path_1.default.dirname(this.configPath);
        await promises_1.default.mkdir(configDir, { recursive: true });
    }
    async loadConfig() {
        try {
            const content = await promises_1.default.readFile(this.configPath, 'utf-8');
            return JSON.parse(content);
        }
        catch {
            return {};
        }
    }
    async saveConfig(pluginPaths) {
        await this.ensureConfigDir();
        await promises_1.default.writeFile(this.configPath, JSON.stringify(pluginPaths, null, 2));
    }
    async load(pluginPath) {
        try {
            const fullPath = path_1.default.resolve(pluginPath);
            const modulePath = `file://${path_1.default.join(fullPath, 'dist', 'index.js')}`;
            const module = await Promise.resolve(`${modulePath}`).then(s => __importStar(require(s)));
            console.log('Debug - module.default:', module.default);
            const PluginClass = module.default;
            const plugin = new PluginClass();
            // 验证插件接口实现
            this.validatePlugin(plugin);
            // 调用插件加载钩子
            if (plugin.onLoad) {
                await plugin.onLoad();
            }
            // 保存插件路径到配置文件
            const config = await this.loadConfig();
            config[plugin.name] = pluginPath;
            await this.saveConfig(config);
            this.plugins.set(plugin.name, plugin);
            this.logger.info(`插件 ${plugin.name}@${plugin.version} 已加载并保存配置`);
        }
        catch (error) {
            this.logger.error(`加载插件失败: ${error.message}`);
            throw error;
        }
    }
    async unload(pluginName) {
        const plugin = this.plugins.get(pluginName);
        if (!plugin) {
            throw new Error(`Plugin ${pluginName} not found`);
        }
        if (plugin.onUnload) {
            await plugin.onUnload();
        }
        this.plugins.delete(pluginName);
        this.logger.info(`插件 ${pluginName} 已卸载并移除配置`);
        // 从配置文件中移除插件
        const config = await this.loadConfig();
        delete config[pluginName];
        await this.saveConfig(config);
    }
    // 新增: 启动时加载所有已保存的插件
    async loadSavedPlugins() {
        try {
            const config = await this.loadConfig();
            for (const [name, path] of Object.entries(config)) {
                try {
                    await this.load(path);
                }
                catch (error) {
                    if (error instanceof Error) {
                        this.logger.warn(`加载保存的插件 ${name} 失败: ${error.message}`);
                    }
                    else {
                        this.logger.warn(`加载保存的插件 ${name} 失败: 未知错误`);
                    }
                }
            }
        }
        catch (error) {
            this.logger.error('加载保存的插件配置失败');
        }
    }
    list() {
        return Array.from(this.plugins.values());
    }
    get(pluginName) {
        return this.plugins.get(pluginName);
    }
    validatePlugin(plugin) {
        if (!plugin.name)
            throw new Error('Plugin name is required');
        if (!plugin.version)
            throw new Error('Plugin version is required');
        if (!plugin.description)
            throw new Error('Plugin description is required');
    }
}
exports.PluginLoader = PluginLoader;
