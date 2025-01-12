
import { IAIClient } from "./types";

export class AIClient implements IAIClient {

  generate(options: { prompt: string }) {
    return Promise.resolve(`测试提交: ${options.prompt}`);
  }
}
