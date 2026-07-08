import { app } from "electron";
import { spawn, type ChildProcess } from "node:child_process";
import { access } from "node:fs/promises";
import { createServer, type AddressInfo } from "node:net";
import path from "node:path";
import { aiModelConfig } from "./aiModelConfig.js";
import { loadPromptSet, type AIPromptSet } from "./promptService.js";

export type AIChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AIStatus = {
  available: boolean;
  isModelLoading: boolean;
  isModelReady: boolean;
  isGenerating: boolean;
  runtime: "llama.cpp sidecar";
  error?: string;
};

type ChatOptions = {
  onToken?: (token: string) => void;
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getAIResourceRoot() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "ai")
    : path.join(app.getAppPath(), "resources", "ai");
}

function getRuntimeId() {
  return `${process.platform}-${process.arch}`;
}

function getLlamaServerPath() {
  const binaryName = process.platform === "win32" ? "llama-server.exe" : "llama-server";
  return path.join(getAIResourceRoot(), "bin", getRuntimeId(), binaryName);
}

function getModelPath() {
  return path.join(getAIResourceRoot(), "models", aiModelConfig.modelFileName);
}

function safeText(value: unknown, maxLength = 4000) {
  return typeof value === "string" ? value.slice(0, maxLength) : "";
}

// 0.1.45 A2: CJK 每字約 1 token、其餘約 4 字元 1 token 的保守估算，防止歷史撐爆 4096 ctx。
const cjkCharPattern = /[⺀-鿿가-힯豈-﫿＀-￯]/;

function estimateTokens(text: string) {
  let cjkCount = 0;
  for (const char of text) {
    if (cjkCharPattern.test(char)) {
      cjkCount += 1;
    }
  }
  return cjkCount + Math.ceil((text.length - cjkCount) / 4);
}

function trimMessagesToBudget(messages: AIChatMessage[], budget: number) {
  const kept: AIChatMessage[] = [];
  let used = 0;

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    const cost = estimateTokens(message.content) + 8;

    if (kept.length === 0 && cost > budget) {
      // 最新一則單獨超標：硬切內容保留開頭，至少送得出去。
      kept.unshift({ ...message, content: message.content.slice(0, budget) });
      break;
    }

    if (used + cost > budget) break;
    kept.unshift(message);
    used += cost;
  }

  return kept;
}

function sanitizeMessages(messages: unknown): AIChatMessage[] {
  if (!Array.isArray(messages)) return [];

  const cleaned = messages
    .map((message): AIChatMessage | null => {
      if (!message || typeof message !== "object") return null;
      const role = (message as { role?: unknown }).role;
      if (role !== "user" && role !== "assistant") return null;
      const content = safeText((message as { content?: unknown }).content);
      return content.trim() ? { role, content } : null;
    })
    .filter((message): message is AIChatMessage => Boolean(message))
    .slice(-20);

  return trimMessagesToBudget(cleaned, aiModelConfig.historyTokenBudget);
}

async function getFreePort() {
  return new Promise<number>((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address() as AddressInfo;
      server.close(() => resolve(address.port));
    });
  });
}

function extractFirstJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("json-not-found");
  }
  return JSON.parse(text.slice(start, end + 1));
}

function cleanReplyText(value: unknown) {
  const text = safeText(value, 500)
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return text.startsWith("{") ? "" : text;
}

export class LocalAIService {
  private serverProcess: ChildProcess | null = null;
  private serverPort: number | null = null;
  private loadingPromise: Promise<AIStatus> | null = null;
  private generatingController: AbortController | null = null;
  private prompts: AIPromptSet | null = null;
  private lastError = "";
  private consecutiveFailures = 0;

  getStatus(): AIStatus {
    return {
      available: Boolean(this.serverProcess && this.serverPort && this.prompts),
      isModelLoading: Boolean(this.loadingPromise),
      isModelReady: Boolean(this.serverProcess && this.serverPort && this.prompts),
      isGenerating: Boolean(this.generatingController),
      runtime: "llama.cpp sidecar",
      error: this.lastError || undefined,
    };
  }

  async init() {
    if (this.serverProcess && this.serverPort && this.prompts) {
      return this.getStatus();
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this.startServer()
      .then(() => {
        this.lastError = "";
        return this.getStatus();
      })
      .catch(() => {
        this.shutdown();
        this.lastError = "AI 暫時不可用，播放器仍可正常播放音樂。";
        return this.getStatus();
      })
      .finally(() => {
        this.loadingPromise = null;
      });

    return this.loadingPromise;
  }

  async chat(messages: unknown, options: ChatOptions = {}) {
    if (this.generatingController) {
      return { ok: false, error: "水瓶罐子正在回覆中，請先取消或等她說完。" };
    }

    const initStatus = await this.init();
    if (!initStatus.isModelReady) {
      return { ok: false, error: initStatus.error ?? "AI 暫時不可用。" };
    }

    const userMessages = sanitizeMessages(messages);
    if (userMessages.length === 0) {
      return { ok: false, error: "請先輸入想聊的內容。" };
    }

    if (!this.prompts) {
      return { ok: false, error: "AI 提示詞尚未載入。" };
    }

    return this.completeChat(userMessages, this.prompts.character, {
      ...aiModelConfig.chat,
      stream: true,
      onToken: options.onToken,
    });
  }

  async parseMusicSearchIntent(userText: unknown, librarySummary: unknown) {
    const input = safeText(userText, 1200).trim();
    if (!input) {
      return { ok: false, error: "請輸入想找的音樂。" };
    }

    const initStatus = await this.init();
    if (!initStatus.isModelReady) {
      return { ok: false, error: initStatus.error ?? "AI 暫時不可用。" };
    }

    const summary = safeText(JSON.stringify(librarySummary ?? {}), 5000);
    if (!this.prompts) {
      return { ok: false, error: "AI 提示詞尚未載入。" };
    }

    const result = await this.completeChat(
      [
        {
          role: "user",
          content: [
            `user_input: ${JSON.stringify(input)}`,
            `library_summary: ${summary}`,
          ].join("\n"),
        },
      ],
      this.prompts.router,
      { ...aiModelConfig.router, stream: false },
    );

    if (!result.ok) return result;

    try {
      return { ok: true, intent: extractFirstJsonObject(result.text) };
    } catch {
      return { ok: false, error: "AI 搜尋條件解析失敗，請換句話試試。" };
    }
  }

  async composeToolReply(toolResult: unknown, fallbackText: unknown) {
    const fallback = cleanReplyText(fallbackText) || "已完成。";

    if (this.generatingController) {
      return { ok: true, text: fallback };
    }

    const initStatus = await this.init();
    if (!initStatus.isModelReady || !this.prompts) {
      return { ok: true, text: fallback };
    }

    const result = await this.completeChat(
      [
        {
          role: "user",
          content: [
            `程式結果 JSON: ${safeText(JSON.stringify(toolResult ?? {}), 4000)}`,
            `備用回覆: ${fallback}`,
          ].join("\n"),
        },
      ],
      this.prompts.reply,
      { ...aiModelConfig.reply, stream: false },
    );

    if (!result.ok) return { ok: true, text: fallback };
    return { ok: true, text: cleanReplyText(result.text) || fallback };
  }

  cancel() {
    if (!this.generatingController) {
      return { ok: true, canceled: false };
    }

    this.generatingController.abort();
    return { ok: true, canceled: true };
  }

  shutdown() {
    this.generatingController?.abort();
    this.generatingController = null;
    this.prompts = null;
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
    }
    this.serverPort = null;
  }

  private async startServer() {
    const [prompts, port] = await Promise.all([
      loadPromptSet(),
      getFreePort(),
      access(getModelPath()),
      access(getLlamaServerPath()),
    ]);

    this.prompts = prompts;
    this.serverPort = port;
    const llamaServerPath = getLlamaServerPath();
    const modelPath = getModelPath();
    // ponytail: llama-server keeps the model resident; swap only if node-llama-cpp becomes package-safe here.
    this.serverProcess = spawn(
      llamaServerPath,
      [
        "--model",
        modelPath,
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--ctx-size",
        String(aiModelConfig.contextSize),
        "--n-gpu-layers",
        "-1",
      ],
      {
        env: { ...process.env, LLAMA_ARG_NO_WEBUI: "1" },
        stdio: ["ignore", "ignore", "ignore"],
      },
    );

    this.serverProcess.once("exit", () => {
      this.serverProcess = null;
      this.serverPort = null;
    });

    await this.waitForServerReady();
  }

  private async waitForServerReady() {
    const deadline = Date.now() + aiModelConfig.serverStartTimeoutMs;
    while (Date.now() < deadline) {
      if (!this.serverProcess || !this.serverPort) {
        throw new Error("ai-server-exited");
      }

      try {
        const response = await fetch(`http://127.0.0.1:${this.serverPort}/health`);
        if (response.ok) return;
      } catch {
        // Server is still loading the model.
      }

      await delay(500);
    }

    throw new Error("ai-server-timeout");
  }

  private async completeChat(
    messages: AIChatMessage[],
    systemPrompt: string,
    options: {
      maxTokens: number;
      stream: boolean;
      json?: boolean;
      timeoutMs?: number;
      temperature?: number;
      topP?: number;
      repeatPenalty?: number;
      onToken?: (token: string) => void;
    },
  ): Promise<{ ok: true; text: string } | { ok: false; error: string; canceled?: boolean; busy?: boolean }> {
    const result = await this.completeChatOnce(messages, systemPrompt, options);

    // 0.1.45 A3: 連續兩次真失敗（非使用者取消、非 busy 早退）多半是 sidecar 卡死；重啟比對僵屍除錯便宜。
    if (result.ok) {
      this.consecutiveFailures = 0;
    } else if (!result.canceled && !result.busy) {
      this.consecutiveFailures += 1;
      if (this.consecutiveFailures >= 2) {
        this.consecutiveFailures = 0;
        this.shutdown();
      }
    }

    return result;
  }

  private async completeChatOnce(
    messages: AIChatMessage[],
    systemPrompt: string,
    options: {
      maxTokens: number;
      stream: boolean;
      json?: boolean;
      timeoutMs?: number;
      temperature?: number;
      topP?: number;
      repeatPenalty?: number;
      onToken?: (token: string) => void;
    },
  ): Promise<{ ok: true; text: string } | { ok: false; error: string; canceled?: boolean; busy?: boolean }> {
    if (!this.serverPort) {
      // busy: 早退 guard，不是真正送出後失敗，不列入連續失敗計數。
      return { ok: false, error: "AI 尚未啟動。", busy: true };
    }
    if (this.generatingController) {
      return { ok: false, error: "水瓶罐子正在回覆中，請先取消或等她說完。", busy: true };
    }

    const controller = new AbortController();
    this.generatingController = controller;
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, options.timeoutMs ?? 60_000);
    // 0.1.45 A3: streaming 首 token 逾時——卡死的 sidecar 不用陪等滿 60 秒。
    let firstTokenSeen = false;
    const firstTokenTimeout = options.stream
      ? setTimeout(() => {
          if (!firstTokenSeen) {
            timedOut = true;
            controller.abort();
          }
        }, aiModelConfig.firstTokenTimeoutMs)
      : null;
    const handleToken = (token: string) => {
      if (!firstTokenSeen) {
        firstTokenSeen = true;
        if (firstTokenTimeout) clearTimeout(firstTokenTimeout);
      }
      options.onToken?.(token);
    };
    const body = {
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: options.stream,
      temperature: options.temperature ?? aiModelConfig.chat.temperature,
      top_p: options.topP ?? aiModelConfig.chat.topP,
      repeat_penalty: options.repeatPenalty ?? aiModelConfig.chat.repeatPenalty,
      max_tokens: options.maxTokens,
      num_predict: options.maxTokens,
      response_format: options.json ? { type: "json_object" } : undefined,
      // ponytail: Qwen3.5 returns reasoning_content first unless thinking is off; UI only needs final content.
      chat_template_kwargs: { enable_thinking: false },
    };

    try {
      const response = await fetch(`http://127.0.0.1:${this.serverPort}/v1/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        return { ok: false, error: "AI 回覆失敗，請稍後再試。" };
      }

      if (!options.stream) {
        const json = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
        return { ok: true, text: json.choices?.[0]?.message?.content ?? "" };
      }

      return await this.readStreamingResponse(response, handleToken);
    } catch (error) {
      if (controller.signal.aborted) {
        return timedOut
          ? { ok: false, error: "AI 回覆逾時，播放器仍可正常播放音樂。" }
          : { ok: false, canceled: true, error: "已取消 AI 回覆。" };
      }
      return { ok: false, error: "AI 回覆失敗，播放器仍可正常播放音樂。" };
    } finally {
      clearTimeout(timeout);
      if (firstTokenTimeout) clearTimeout(firstTokenTimeout);
      if (this.generatingController === controller) {
        this.generatingController = null;
      }
    }
  }

  private async readStreamingResponse(
    response: Response,
    onToken?: (token: string) => void,
  ): Promise<{ ok: true; text: string } | { ok: false; error: string; canceled?: boolean }> {
    const reader = response.body?.getReader();
    if (!reader) {
      return { ok: false, error: "AI streaming 不可用。" };
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";

    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;

        try {
          const json = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> };
          const token = json.choices?.[0]?.delta?.content ?? "";
          if (token) {
            text += token;
            onToken?.(token);
          }
        } catch {
          // Ignore malformed SSE fragments; the server continues sending the next token.
        }
      }

      if (done) break;
    }

    return { ok: true, text };
  }
}
