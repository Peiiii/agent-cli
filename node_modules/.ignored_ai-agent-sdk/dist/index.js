"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginError = void 0;
// 错误类
class PluginError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PluginError';
    }
}
exports.PluginError = PluginError;
