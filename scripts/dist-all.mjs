import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    const printable = [command, ...args].join(" ");
    throw new Error(`Command failed: ${printable}`);
  }
}

function electronBuilderArgsForPlatform() {
  if (process.platform === "darwin") {
    return [
      ["--mac", "dmg", "--arm64", "--x64"],
      ["--win", "nsis", "--x64"],
    ];
  }

  if (process.platform === "win32") {
    return [["--win", "nsis", "--x64"]];
  }

  return [];
}

const targetArgs = electronBuilderArgsForPlatform();

if (targetArgs.length === 0) {
  console.error(
    `No release target is configured for platform "${process.platform}". Use GitHub Actions for Windows/macOS installers.`,
  );
  process.exit(1);
}

run("npm", ["run", "build"]);
run("npm", ["run", "electron:compile"]);

for (const args of targetArgs) {
  run("npx", ["electron-builder", ...args]);
}

run("node", ["scripts/sync-installers.mjs"]);
