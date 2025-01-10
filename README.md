# 🤖 AI Agent CLI

## 简介
AI Agent CLI 是一个由 AI 驱动的智能命令行代理工具。它提供少量核心命令，通过插件系统实现无限扩展。

## 🌟 核心命令

```bash
# 启动交互式 AI 助手
agent chat

# 执行任意指令（自然语言）
agent exec "你的指令"

# 插件管理
agent plugin [install|remove|list|update]

# 查看帮助
agent help
```

## 🔌 插件系统

插件可以扩展任何功能，例如：

```bash
# 安装 Git 助手插件
agent plugin install git-assistant

# 使用插件功能
agent git commit "feat: add new feature"
```

## 🔧 配置

```json
{
  "ai": {
    "provider": "openai",
    "model": "gpt-4",
    "apiKey": "your-api-key"
  },
  "plugins": {
    "enabled": []
  }
}
```

## 🚀 示例

```bash
# 通过自然语言执行任务
agent exec "创建一个新的 React 项目"
agent exec "检查并修复代码中的 TypeScript 错误"
agent exec "部署当前项目到生产环境"

# 交互式对话
agent chat
> 帮我优化这段代码的性能
> 解释一下这个错误信息
```

## 📚 插件开发

参考 [插件开发指南](./docs/plugin-development.md) 来创建你自己的插件。

## 📄 许可证

MIT License