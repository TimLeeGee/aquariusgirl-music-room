import { existsSync, mkdirSync, readdirSync, rmSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const buildOutputDir = "release";
const deliveryDir = join("release-delivery", "installers");
const installerPattern = /\.(dmg|exe)$/i;

if (!existsSync(buildOutputDir)) {
  throw new Error(`Build output folder not found: ${buildOutputDir}`);
}

mkdirSync(deliveryDir, { recursive: true });

const installerFileNames = readdirSync(buildOutputDir).filter((fileName) =>
  installerPattern.test(fileName),
);

if (installerFileNames.length === 0) {
  throw new Error(`No DMG/EXE installers found in ${buildOutputDir}`);
}

const outputExtensions = new Set(
  installerFileNames.map((fileName) => fileName.split(".").pop()?.toLowerCase()),
);

for (const fileName of readdirSync(deliveryDir)) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension && outputExtensions.has(extension)) {
    rmSync(join(deliveryDir, fileName), { force: true });
  }
}

for (const fileName of installerFileNames) {
  copyFileSync(join(buildOutputDir, fileName), join(deliveryDir, fileName));
}

rmSync(buildOutputDir, { recursive: true, force: true });

console.log(`Synced ${installerFileNames.length} installer(s) to ${deliveryDir}`);
console.log(`Removed temporary ${buildOutputDir}/ build output to avoid duplicate installers.`);
