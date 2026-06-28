import { createHash } from "node:crypto";
import { existsSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";

const modelPath = join("resources", "ai", "models", "qwen3.5-0.8b.gguf");
const minimumModelBytes = 300 * 1024 * 1024;

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!existsSync(modelPath)) {
  fail("缺少內建 AI 模型，請把 qwen3.5-0.8b.gguf 放到 resources/ai/models/ 再重新打包。");
}

const modelSize = statSync(modelPath).size;
if (modelSize < minimumModelBytes) {
  fail(`內建 AI 模型檔案太小：${modelSize} bytes，請確認 qwen3.5-0.8b.gguf 大於 300MB。`);
}

if (process.env.AI_MODEL_SHA256) {
  const actualHash = createHash("sha256").update(readFileSync(modelPath)).digest("hex");
  if (actualHash.toLowerCase() !== process.env.AI_MODEL_SHA256.toLowerCase()) {
    fail("內建 AI 模型 sha256 驗證失敗，請確認模型檔案來源。");
  }
}

function defaultRuntimeIds() {
  if (process.platform === "darwin") {
    return ["darwin-arm64"];
  }
  if (process.platform === "win32") {
    return ["win32-x64"];
  }
  return [`${process.platform}-${process.arch}`];
}

const runtimeIds = (process.env.AI_REQUIRED_RUNTIMES || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const requiredRuntimeIds = runtimeIds.length > 0 ? runtimeIds : defaultRuntimeIds();
const missingBinaries = [];
const nonExecutableBinaries = [];

for (const runtimeId of requiredRuntimeIds) {
  const binaryName = runtimeId.startsWith("win32-") ? "llama-server.exe" : "llama-server";
  const binaryPath = join("resources", "ai", "bin", runtimeId, binaryName);
  if (!existsSync(binaryPath)) {
    missingBinaries.push(runtimeId);
    continue;
  }
  if (!runtimeId.startsWith("win32-") && (statSync(binaryPath).mode & 0o111) === 0) {
    nonExecutableBinaries.push(binaryPath);
  }
}

if (missingBinaries.length > 0) {
  fail(
    `缺少 llama.cpp sidecar runtime：${missingBinaries.join(", ")}。請放到 resources/ai/bin/<platform-arch>/llama-server 再重新打包。`,
  );
}

if (nonExecutableBinaries.length > 0) {
  fail(`llama.cpp sidecar runtime 不可執行，請 chmod +x：${nonExecutableBinaries.join(", ")}`);
}

console.log(`AI 模型檢查通過：${modelPath}`);
console.log(`模型大小：${modelSize} bytes`);
console.log(`llama.cpp runtime 檢查通過：${requiredRuntimeIds.join(", ")}`);
