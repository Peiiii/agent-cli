export default class HelloPlugin {
    constructor() {
        this.name = 'hello-plugin';
        this.version = '1.0.0';
        this.description = '一个示例插件';
        this.commands = {
            hello: {
                description: '打印问候信息',
                setup: (command) => {
                    command.argument('[name]', '名称参数');
                },
                execute: async (args, context) => {
                    console.log('Debug - 插件收到的参数:', JSON.stringify(args));
                    const name = typeof args[0] === 'string' ? args[0] : 'World';
                    console.log('Debug - 处理后的名字:', JSON.stringify(name));
                    context.logger.info(`Hello, ${name}!`);
                }
            }
        };
    }
    async onLoad() {
        console.log('Hello plugin loaded!');
    }
}
