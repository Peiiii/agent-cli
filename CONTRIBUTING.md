# AI Agent CLI 架构设计文档

## 项目结构

```
ai-agent-cli/
├── packages/
│   ├── sdk/                    # 共享 SDK 包
│   │   ├── src/
│   │   │   ├── types/         # 类型定义
│   │   │   ├── interfaces/    # 接口定义
│   │   │   └── utils/         # 通用工具
│   │   └── package.json
│   │
│   └── cli/                   # 主程序包
│       ├── src/
│       │   ├── core/          # 核心功能
│       │   │   ├── plugin/    # 插件系统
│       │   │   ├── ai/        # AI 能力 
│       │   │   ├── config/    # 配置管理
│       │   │   └── utils/     # 工具函数
│       │   └── index.ts       # 入口文件
│       └── package.json
│
├── examples/                  # 示例插件
│   ├── git-assistant/
│   └── hello-world/
│
└── pnpm-workspace.yaml       # 工作区配置
```

## 核心模块设计

### SDK (@ai-agent/sdk)

SDK 包含了所有插件开发所需的接口定义和类型：

```typescript
// 插件接口
export interface Plugin {
  name: string;
  version: string;
  description?: string;
  commands: Record<string, CommandHandler>;
  commandPrefix?: string;
}

// 命令处理器
export interface CommandHandler {
  description: string;
  setup?: (command: Command) => void;
  execute: (args: any[], context: CommandContext) => Promise<void>;
}

// 命令上下文
export interface CommandContext {
  logger: Logger;
  ai: AIService;
  config: ConfigService;
}

// AI 服务接口
export interface AIService {
  generate(options: { prompt: string }): Promise<string>;
}

// 配置服务接口
export interface ConfigService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
}
```

### CLI 核心功能 (@ai-agent/cli)

#### 1. 插件管理系统

```typescript
class PluginLoader {
  // 加载插件
  async load(path: string): Promise<void>;
  // 卸载插件
  async unload(name: string): Promise<void>;
  // 列出已安装插件
  list(): Plugin[];
  // 获取插件
  get(name: string): Plugin | null;
}
```

#### 2. 配置管理

```typescript
class ConfigManager {
  // 读取配置
  async get<T>(key: string): Promise<T | null>;
  // 更新配置
  async set<T>(key: string, value: T): Promise<void>;
  // 初始化配置
  async init(): Promise<void>;
}
```

#### 3. AI 服务

```typescript
class AIService {
  // 生成回复
  async generate(options: { prompt: string }): Promise<string>;
  // 流式生成
  async streamGenerate(options: { prompt: string }): AsyncIterator<string>;
}
```

## 工作流程

### 插件加载流程

1. 发现插件
2. 验证插件格式
3. 加载插件代码
4. 注册命令
5. 初始化插件

### 命令执行流程

1. 解析命令
2. 查找插件
3. 准备上下文
4. 执行命令
5. 处理结果

## 配置文件结构

```json
{
  "ai": {
    "provider": "openai",
    "model": "gpt-4",
    "apiKey": "sk-xxx"
  },
  "plugins": {
    "enabled": ["git-assistant"],
    "registry": "https://registry.npmjs.org"
  },
  "logging": {
    "level": "info",
    "file": "~/.ai-agent/logs/agent.log"
  }
}
```

## 开发规范

1. **TypeScript 规范**
   - 使用严格模式 (`strict: true`)
   - 所有公共 API 必须有完整的类型定义
   - 避免使用 `any` 类型

2. **插件开发规范**
   - 必须继承 SDK 中的基础接口
   - 插件命令需要提供清晰的描述
   - 支持命令参数的自动补全

3. **异步处理**
   - 所有 I/O 操作使用异步函数
   - 正确处理异步错误
   - 支持命令的异步执行

4. **错误处理**
   - 使用自定义错误类
   - 提供清晰的错误信息
   - 统一的错误处理流程

5. **测试要求**
   - 单元测试覆盖率 > 80%
   - 包含集成测试
   - 提供测试文档

## 贡献指南

1. Fork 项目并克隆到本地
2. 创建新的功能分支
3. 提交变更并确保通过所有测试
4. 提交 Pull Request

## 发布流程

1. 更新版本号
2. 生成变更日志
3. 构建项目
4. 发布到 npm
