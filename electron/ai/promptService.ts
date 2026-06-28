import { app } from "electron";
import { readFile } from "node:fs/promises";
import path from "node:path";

export type AIPromptSet = {
  character: string;
  router: string;
  reply: string;
};

const promptFiles = {
  character: "character_prompt.txt",
  router: "ai_router_prompt.txt",
  reply: "ai_reply_prompt.txt",
} as const;

function getPromptRoot() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "prompts")
    : path.join(app.getAppPath(), "private", "prompts");
}

async function readPrompt(root: string, fileName: string) {
  const text = await readFile(path.join(root, fileName), "utf8");
  const trimmed = text.trim();
  if (!trimmed) throw new Error("empty-prompt");
  return trimmed;
}

export async function loadPromptSet(): Promise<AIPromptSet> {
  const root = getPromptRoot();

  try {
    const [character, router, reply] = await Promise.all([
      readPrompt(root, promptFiles.character),
      readPrompt(root, promptFiles.router),
      readPrompt(root, promptFiles.reply),
    ]);

    return { character, router, reply };
  } catch {
    throw new Error("AI 提示詞載入失敗");
  }
}
