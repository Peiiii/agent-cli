# 🤖 AI Agent CLI

## 简介
AI Agent CLI 是一个由 AI 驱动的智能命令行代理工具。它采用模块化设计，通过强大的插件系统支持功能扩展。

## 🌟 核心功能

- 🎯 智能命令解析与执行
- 🔌 灵活的插件系统
- 🤖 AI 驱动的交互式助手
- 🛠️ 完整的开发工具链

## 📦 安装

```bash
npm install -g ai-agent-cli
# 或
yarn global add ai-agent-cli
```

## 🚀 快速开始

```bash
# 初始化配置
agent init

# 查看可用命令
agent help

# 启动交互式 AI 助手
agent chat

# 插件管理
agent plugin list                # 列出已安装插件
agent plugin install <name>      # 安装插件
agent plugin remove <name>       # 移除插件
agent plugin update [name]       # 更新插件
agent plugin create <name>       # 创建新插件
```

## ⚙️ 配置文件

配置文件位于 `~/.ai-agent/config.json`：

```json
{
  "ai": {
    "provider": "openai",
    "model": "gpt-4",
    "apiKey": "your-api-key"
  },
  "plugins": {
    "enabled": [],
    "registry": "https://registry.npmjs.org"
  },
  "logging": {
    "level": "info",
    "file": "~/.ai-agent/logs/agent.log"
  }
}
```

## 🔌 插件系统

### 插件结构
```
my-plugin/
├── package.json
├── src/
│   ├── index.ts          # 插件入口
│   ├── commands/         # 命令实现
│   └── types.ts          # 类型定义
└── README.md             # 插件文档
```

### 插件示例

```typescript
// my-plugin/src/index.ts
import { Plugin } from 'ai-agent-cli';

export default class MyPlugin implements Plugin {
  name = 'my-plugin';
  version = '1.0.0';
  
  commands = {
    'my-command': {
      description: '我的自定义命令',
      action: async (args) => {
        // 命令实现
      }
    }
  };
}
```

## 🛠️ 开发者指南

1. 克隆仓库
```bash
git clone https://github.com/your-username/ai-agent-cli.git
cd ai-agent-cli
```

2. 安装依赖
```bash
pnpm install
```

3. 开发模式运行
```bash
pnpm dev
```

4. 构建项目
```bash
pnpm build
```

## 📚 文档

- [完整文档](./docs/README.md)
- [插件开发指南](./docs/plugin-development.md)
- [API 参考](./docs/api-reference.md)
- [贡献指南](./CONTRIBUTING.md)

## 📄 许可证

MIT License © 2024