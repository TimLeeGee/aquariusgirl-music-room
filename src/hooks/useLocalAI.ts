import { useCallback, useEffect, useMemo, useState } from "react";
import type { AIChatMessage, AIStatus } from "../utils/platform";

const unavailableStatus: AIStatus = {
  available: false,
  isModelLoading: false,
  isModelReady: false,
  isGenerating: false,
  runtime: "llama.cpp sidecar",
  error: "請使用桌面版開啟內建 AI。",
};

function getAIAPI() {
  return window.aquariusgirlAPI?.ai;
}

export function useLocalAI() {
  const [status, setStatus] = useState<AIStatus>(unavailableStatus);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [aiError, setAIError] = useState("");

  const refreshStatus = useCallback(async () => {
    const api = getAIAPI();
    if (!api) {
      setStatus(unavailableStatus);
      return unavailableStatus;
    }

    const nextStatus = await api.getAIStatus();
    setStatus(nextStatus);
    setAIError(nextStatus.error ?? "");
    return nextStatus;
  }, []);

  const initAI = useCallback(async () => {
    const api = getAIAPI();
    if (!api) {
      setAIError(unavailableStatus.error ?? "");
      setStatus(unavailableStatus);
      return unavailableStatus;
    }

    setAIError("");
    const nextStatus = await api.initAI();
    setStatus(nextStatus);
    setAIError(nextStatus.error ?? "");
    return nextStatus;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const api = getAIAPI();
    const trimmed = content.trim();
    if (!api || !trimmed) return;

    const userMessage: AIChatMessage = { role: "user", content: trimmed };
    const assistantMessage: AIChatMessage = { role: "assistant", content: "" };
    const nextMessages = [...messages, userMessage, assistantMessage];
    setMessages(nextMessages);
    setAIError("");
    setStatus((current) => ({ ...current, isGenerating: true }));

    const result = await api.sendAIMessage(
      // ponytail: no chat memory for this small model; send only the current prompt.
      [userMessage],
      (token) => {
        setMessages((current) => {
          const next = [...current];
          const last = next[next.length - 1];
          if (last?.role === "assistant") {
            next[next.length - 1] = { ...last, content: last.content + token };
          }
          return next;
        });
      },
    );

    if (!result.ok) {
      setAIError(result.error);
      setMessages((current) => {
        const next = [...current];
        const last = next[next.length - 1];
        if (last?.role === "assistant" && !last.content) {
          next[next.length - 1] = { ...last, content: result.canceled ? "已取消。" : result.error };
        }
        return next;
      });
    } else {
      if (result.text) {
        setMessages((current) => {
          const next = [...current];
          const last = next[next.length - 1];
          if (last?.role === "assistant" && !last.content) {
            next[next.length - 1] = { ...last, content: result.text };
          }
          return next;
        });
      }
    }

    await refreshStatus();
  }, [messages, refreshStatus]);

  const cancel = useCallback(async () => {
    await getAIAPI()?.cancelAI();
    await refreshStatus();
  }, [refreshStatus]);

  const appendLocalMessages = useCallback((nextMessages: AIChatMessage[]) => {
    setMessages((current) => [
      ...current,
      ...nextMessages.filter((message) => message.content.trim()),
    ]);
  }, []);

  const parseMusicSearchIntent = useCallback(async (userText: string, librarySummary: unknown) => {
    const api = getAIAPI();
    if (!api) return { ok: false as const, error: unavailableStatus.error ?? "AI 不可用。" };
    return api.parseMusicSearchIntent(userText, librarySummary);
  }, []);

  const composeToolReply = useCallback(async (toolResult: unknown, fallbackText: string) => {
    const api = getAIAPI();
    if (!api) return { ok: true as const, text: fallbackText };
    return api.composeAIReply(toolResult, fallbackText);
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  return useMemo(() => ({
    isAIAvailable: status.available,
    isModelLoading: status.isModelLoading,
    isModelReady: status.isModelReady,
    isGenerating: status.isGenerating,
    aiError,
    messages,
    status,
    refreshStatus,
    initAI,
    sendMessage,
    cancel,
    appendLocalMessages,
    parseMusicSearchIntent,
    composeToolReply,
  }), [
    appendLocalMessages,
    aiError,
    cancel,
    composeToolReply,
    initAI,
    messages,
    parseMusicSearchIntent,
    refreshStatus,
    sendMessage,
    status,
  ]);
}
