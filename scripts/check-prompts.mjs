import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const promptDir = join("private", "prompts");
const requiredPromptFiles = [
  "character_prompt.txt",
  "ai_router_prompt.txt",
  "ai_reply_prompt.txt",
];
const encryptedPromptDir = join("resources", "ai", "prompts");

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!existsSync(promptDir)) {
  fail(`缺少開源 prompt 目錄：${promptDir}`);
}

for (const fileName of requiredPromptFiles) {
  const filePath = join(promptDir, fileName);
  if (!existsSync(filePath)) {
    fail(`缺少 AI prompt：${filePath}`);
  }
  if (statSync(filePath).size === 0) {
    fail(`AI prompt 是空檔案：${filePath}`);
  }
}

if (existsSync(encryptedPromptDir)) {
  const encryptedFiles = readdirSync(encryptedPromptDir)
    .filter((fileName) => fileName.endsWith(".bin"));

  if (encryptedFiles.length > 0) {
    fail(`偵測到舊的加密 prompt bundle，請移除：${encryptedFiles.join(", ")}`);
  }
}

console.log(`開源 prompt 檢查通過：${requiredPromptFiles.join(", ")}`);
