export type AICompletionConfig = {
  temperature: number;
  topP: number;
  repeatPenalty: number;
  maxTokens: number;
  timeoutMs: number;
  json?: boolean;
};

export const aiModelConfig = {
  provider: "llama.cpp sidecar",
  modelFileName: "qwen3.5-0.8b.gguf",
  contextSize: 4096,
  serverStartTimeoutMs: 120_000,
  chat: {
    temperature: 0.1,
    topP: 0.8,
    repeatPenalty: 1.1,
    maxTokens: 300,
    timeoutMs: 60_000,
  },
  router: {
    temperature: 0.1,
    topP: 0.8,
    repeatPenalty: 1.1,
    maxTokens: 300,
    timeoutMs: 20_000,
    json: true,
  },
  reply: {
    temperature: 0.1,
    topP: 0.8,
    repeatPenalty: 1.1,
    maxTokens: 160,
    timeoutMs: 12_000,
  },
} as const satisfies {
  provider: string;
  modelFileName: string;
  contextSize: number;
  serverStartTimeoutMs: number;
  chat: AICompletionConfig;
  router: AICompletionConfig;
  reply: AICompletionConfig;
};
