import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { toSelectedFile } from "../dist-electron/selectedFile.js";

const tempDir = await mkdtemp(path.join(tmpdir(), "aquariusgirl-selected-file-"));
const filePath = path.join(tempDir, "song.mp3");

try {
  await writeFile(filePath, Buffer.alloc(1024));
  const selected = await toSelectedFile(filePath, tempDir);
  const restored = await toSelectedFile(filePath, tempDir, { readMetadata: false });
  assert.equal(selected.name, "song.mp3");
  assert.equal(selected.type, "audio/mpeg");
  assert.equal(selected.size, 1024);
  assert.equal(selected.sourcePath, filePath);
  assert.equal(selected.relativePath, "song.mp3");
  assert.equal(selected.localUrl.startsWith("file:"), true);
  assert.equal("buffer" in selected, false);
  assert.equal(restored.metadata, undefined);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

const selectedFileSource = readFileSync("electron/selectedFile.ts", "utf8");
const mainSource = readFileSync("electron/main.ts", "utf8");
assert.match(selectedFileSource, /readMetadata = true/);
assert.match(mainSource, /readMetadata: false/);

console.log("electron-selected-file-check PASS");
