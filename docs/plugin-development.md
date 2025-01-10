# AI Agent CLI 插件开发指南

## 目录
- [插件结构](#插件结构)
- [插件接口](#插件接口)
- [示例插件](#示例插件)
- [开发步骤](#开发步骤)
- [最佳实践](#最佳实践)
- [调试技巧](#调试技巧)
- [注意事项](#注意事项)
- [API 参考](#api-参考)

## 插件结构

一个标准的插件包结构如下：

```
my-agent-plugin/
├── package.json
├── src/
│   ├── index.ts          # 插件入口
│   ├── commands/         # 命令实现
│   ├── handlers/         # 处理器
│   └── types.ts          # 类型定义
└── README.md
```

## 插件接口

每个插件都需要实现以下 TypeScript 接口：

```typescript
interface AgentPlugin {
  // 插件元数据
  name: string;
  version: string;
  description: string;

  // 生命周期钩子
  onLoad?: () => Promise<void>;
  onUnload?: () => Promise<void>;

  // 命令处理器
  commands?: Record<string, CommandHandler>;
  
  // 中间件
  middleware?: PluginMiddleware[];
}

interface CommandHandler {
  execute: (args: string[], context: CommandContext) => Promise<void>;
  description: string;
}

interface CommandContext {
  ai: AIClient;
  logger: Logger;
  config: Config;
}
```

## 示例插件

这是一个简单的 Git 助手插件示例：

```typescript
import { AgentPlugin, CommandContext } from 'ai-agent-cli';

export class GitAssistantPlugin implements AgentPlugin {
  name = 'git-assistant';
  version = '1.0.0';
  description = 'Git 操作助手插件';

  commands = {
    commit: {
      description: '智能提交代码',
      execute: async (args: string[], context: CommandContext) => {
        const { ai, logger } = context;
        
        // 使用 AI 生成提交信息
        const message = await ai.generate({
          prompt: `根据以下改动生成提交信息: ${args.join(' ')}`
        });

        // 执行 git 命令
        logger.info('代码提交成功');
      }
    }
  };

  async onLoad() {
    // 插件初始化逻辑
  }
}
```

## 开发步骤

### 1. 创建插件项目

```bash
agent plugin create my-plugin
```

### 2. 实现插件接口
- 实现必要的接口方法
- 定义命令处理器
- 添加中间件（可选）

### 3. 测试插件

```bash
# 在开发模式下加载插件
agent plugin load --dev ./my-plugin

# 执行插件命令
agent my-plugin <command>
```

### 4. 发布插件

```bash
# 发布到 npm
npm publish

# 或发布到插件市场
agent plugin publish
```

## 最佳实践

### 错误处理
```typescript
try {
  // 执行操作
} catch (error) {
  context.logger.error(`操作失败: ${error.message}`);
  throw error;
}
```

### 使用 AI 能力
```typescript
const result = await context.ai.generate({
  prompt: '用户输入',
  temperature: 0.7,
  maxTokens: 100
});
```

### 配置管理
```typescript
// 读取插件配置
const config = context.config.get('my-plugin');

// 保存配置
await context.config.set('my-plugin', {
  // 配置项
});
```

## 调试技巧

### 启用调试日志
```bash
DEBUG=agent:* agent my-plugin command
```

### 使用开发模式
```bash
agent plugin dev ./my-plugin
```

## 注意事项

1. **独立性**
   - 插件应该是独立的，不应该依赖其他插件
   - 保持功能的单一性和专注性

2. **资源使用**
   - 合理使用 AI 资源，避免过度请求
   - 实现适当的缓存机制

3. **错误处理**
   - 做好错误处理和用户提示
   - 提供清晰的错误信息

4. **文档**
   - 提供清晰的文档和使用示例
   - 包含配置说明和 API 用法

## API 参考

详细的 API 文档请参考 [API 文档](./api-reference.md)。

---

> 注：本文档持续更新中，如有问题请提交 Issue 或 PR。 