import { AgentPlugin, CommandContext } from '@ai-agent/sdk';
import { Command } from 'commander';
export default class GitAssistantPlugin implements AgentPlugin {
    name: string;
    version: string;
    description: string;
    commands: {
        commit: {
            description: string;
            setup: (command: Command) => void;
            execute: (args: string[], context: CommandContext) => Promise<void>;
        };
        status: {
            description: string;
            setup: (command: Command) => void;
            execute: (args: string[], context: CommandContext) => Promise<void>;
        };
    };
    onLoad(): Promise<void>;
}
