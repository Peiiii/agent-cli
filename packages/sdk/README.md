# @ai-agent/sdk

AI Agent CLI 的插件开发 SDK。

## 安装

```bash
npm install @ai-agent/sdk
```

## 使用

```typescript
import { Plugin, CommandHandler } from '@ai-agent/sdk';

export default class MyPlugin implements Plugin {
  name = 'my-plugin';
  version = '1.0.0';
  
  commands = {
    'hello': {
      description: '示例命令',
      execute: async (args, context) => {
        console.log('Hello from my plugin!');
      }
    }
  };
}
```

## API

查看 [API 文档](../../docs/api-reference.md) 了解更多细节。 