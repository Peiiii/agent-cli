# @ai-agent/cli

AI Agent CLI 的核心实现包。

## 安装

```bash
npm install -g @ai-agent/cli
```

## 命令

```bash
# 查看帮助
agent help

# 插件管理
agent plugin list                # 列出已安装插件
agent plugin install <name>      # 安装插件
agent plugin remove <name>       # 移除插件
agent plugin update [name]       # 更新插件
```

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build
``` 