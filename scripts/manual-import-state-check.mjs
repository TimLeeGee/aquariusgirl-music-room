import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runManualImportQueue } from "../src/utils/manualImportQueue.ts";

let cancel = false;
const result = await runManualImportQueue({
  items: ["first", "second", "third"],
  limit: 1,
  isCanceled: () => cancel,
  worker: async (item) => {
    cancel = true;
    return item;
  },
});
assert.deepEqual(result.completed, ["first"]);
assert.equal(result.canceled, true);

const appSource = readFileSync("src/App.tsx", "utf8");
const localTracksSource = readFileSync("src/hooks/useLocalTracks.ts", "utf8");
const headerSource = readFileSync("src/components/Header.tsx", "utf8");
const dragSource = readFileSync("src/hooks/useDragAndDrop.ts", "utf8");
const preloadSource = readFileSync("electron/preload.ts", "utf8");
const mainSource = readFileSync("electron/main.ts", "utf8");

assert.match(appSource, /manualImport/);
assert.match(appSource, /cancelManualImport/);
assert.match(localTracksSource, /isCanceled/);
assert.match(localTracksSource, /onMetadataProgress/);
assert.match(headerSource, /manualImport/);
assert.match(headerSource, /disabled=\{isImportBusy\}/);
assert.match(dragSource, /disabled/);
assert.match(dragSource, /dropEffect = "none"/);
assert.match(preloadSource, /cancelManualImport/);
assert.match(preloadSource, /createRequestId/);
assert.match(preloadSource, /\.finally\(/);
assert.match(mainSource, /manualImportJobs/);
assert.match(mainSource, /aquariusgirl:cancel-manual-import/);
assert.match(mainSource, /event\.sender\.isDestroyed\(\)/);

const clearHandler = appSource.match(
  /const handleClearTracks = useCallback\(\(\) => \{[\s\S]*?\n  \}, \[[^\]]*\]\);/,
);
assert.ok(clearHandler, "handleClearTracks must keep its existing callback boundary");
const clearHandlerSource = clearHandler[0];
assert.match(clearHandlerSource, /manualImportCanceledRef\.current = true/);
assert.match(clearHandlerSource, /cancelManualImport\?\.\(\)/);
assert.match(clearHandlerSource, /finishManualImport\(\)/);
assert.ok(
  clearHandlerSource.indexOf("manualImportCanceledRef.current = true") <
    clearHandlerSource.indexOf("clearTracks()") &&
    clearHandlerSource.indexOf("clearTracks()") < clearHandlerSource.indexOf("finishManualImport()"),
  "clear must invalidate the import before discarding its queue, then release App-owned busy state",
);
assert.match(
  appSource,
  /manualImportCanceledRef\.current = false[\s\S]*?const scanning = \{ phase: "scanning" as const/,
);
for (const handlerName of ["handleNativeFilesSelected", "handleNativeFolderSelected"]) {
  const handler = appSource.match(
    new RegExp(`const ${handlerName} = useCallback\\(async \\(\\) => \\{[\\s\\S]*?\\n  \\}, \\[[^\\]]*\\]\\);`),
  );
  assert.ok(handler, `${handlerName} must keep its existing callback boundary`);
  const resetIndex = handler[0].indexOf("manualImportCanceledRef.current = false");
  assert.notEqual(
    resetIndex,
    -1,
    `${handlerName} must reset a cancellation left by clear before starting a new job`,
  );
  assert.ok(
    resetIndex < handler[0].indexOf('const scanning = { phase: "scanning" as const'),
    `${handlerName} must start a new job after clear instead of inheriting its cancellation flag`,
  );
}
assert.match(
  localTracksSource,
  /if \(metadataGeneration === metadataGenerationRef\.current\) \{[\s\S]*?options\.onMetadataProgress\?\.\(progress\)/,
);
assert.match(
  localTracksSource,
  /\.then\(\(\{ canceled \}\) => \{\n        if \(metadataGeneration !== metadataGenerationRef\.current\) return;/,
);

console.log("manual-import-state-check PASS");
