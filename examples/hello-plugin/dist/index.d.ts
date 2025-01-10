import { AgentPlugin, CommandContext } from 'ai-agent-sdk';
import { Command } from 'commander';
export default class HelloPlugin implements AgentPlugin {
    name: string;
    version: string;
    description: string;
    commands: {
        hello: {
            description: string;
            setup: (command: Command) => void;
            execute: (args: string[], context: CommandContext) => Promise<void>;
        };
    };
    onLoad(): Promise<void>;
}
