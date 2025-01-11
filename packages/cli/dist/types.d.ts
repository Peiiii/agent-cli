import { CommandHandler } from '@ai-agent/sdk';
export type { CommandHandler };
export interface Plugin {
    name: string;
    version?: string;
    description?: string;
    commands?: Record<string, CommandHandler>;
    commandPrefix?: string;
}
//# sourceMappingURL=types.d.ts.map