import { existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

function archName(value) {
  if (value === "x64" || value === 1) return "x64";
  if (value === "arm64" || value === 3) return "arm64";
  return String(value);
}

function findAIResourceRoots(root) {
  if (!existsSync(root)) return [];
  const entries = readdirSync(root, { withFileTypes: true });
  const roots = [];

  for (const entry of entries) {
    const itemPath = join(root, entry.name);
    if (!entry.isDirectory()) continue;
    if (entry.name === "ai" && existsSync(join(itemPath, "bin"))) {
      roots.push(itemPath);
      continue;
    }
    roots.push(...findAIResourceRoots(itemPath));
  }

  return roots;
}

export default async function pruneAIRuntimes(context) {
  const targetRuntime = `${context.electronPlatformName}-${archName(context.arch)}`;
  for (const aiRoot of findAIResourceRoots(context.appOutDir)) {
    const binRoot = join(aiRoot, "bin");
    for (const entry of readdirSync(binRoot, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === targetRuntime) continue;
      // ponytail: Stage all runtimes for local checks, prune per target so each installer carries only one native runtime.
      rmSync(join(binRoot, entry.name), { recursive: true, force: true });
    }
  }
}
