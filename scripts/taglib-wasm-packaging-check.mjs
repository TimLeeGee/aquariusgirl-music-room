import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const songInfoWriterSource = await readFile("electron/songInfoWriter.ts", "utf8");

const extraResources = packageJson.build?.extraResources ?? [];
const taglibWasmResource = extraResources.find(
  (entry) =>
    entry?.from === "node_modules/taglib-wasm/dist/taglib-web.wasm" &&
    entry?.to === "taglib-wasm/taglib-web.wasm",
);

assert.ok(
  taglibWasmResource,
  "taglib-web.wasm must be copied outside app.asar for Windows packaged metadata reads",
);

for (const scriptName of ["dist:release", "dist:mac", "dist:win"]) {
  assert.match(packageJson.scripts?.[scriptName] ?? "", /check:taglib-wasm-packaging/);
}

assert.match(songInfoWriterSource, /pathToFileURL/);
assert.match(songInfoWriterSource, /AQUARIUSGIRL_TAGLIB_WASM_DIR/);
assert.match(songInfoWriterSource, /forceWasmType: "emscripten"/);
assert.doesNotMatch(songInfoWriterSource, /from "taglib-wasm\/simple"/);

console.log("taglib-wasm-packaging-check PASS");
