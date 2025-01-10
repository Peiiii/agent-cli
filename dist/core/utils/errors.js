export * from 'ai-agent-sdk';
export class PluginError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PluginError';
    }
}
