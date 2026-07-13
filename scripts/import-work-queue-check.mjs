import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as manualImportQueue from "../src/utils/manualImportQueue.ts";

const { runManualImportQueue, createTimedBatcher } = manualImportQueue;

assert.equal(typeof createTimedBatcher, "function");

const scheduledTimers = new Map();
const clearedTimers = [];
const flushedBatches = [];
let nextTimerId = 0;
const batcher = createTimedBatcher({
  delayMs: 100,
  schedule: (callback, delayMs) => {
    assert.equal(delayMs, 100);
    const timerId = ++nextTimerId;
    scheduledTimers.set(timerId, callback);
    return timerId;
  },
  clear: (timerId) => {
    clearedTimers.push(timerId);
    scheduledTimers.delete(timerId);
  },
  onFlush: (items) => flushedBatches.push(items),
});

batcher.add("first");
batcher.add("second");
assert.equal(scheduledTimers.size, 1);
assert.deepEqual(flushedBatches, []);
const firstTimer = scheduledTimers.get(1);
scheduledTimers.delete(1);
firstTimer?.();
assert.deepEqual(flushedBatches, [["first", "second"]]);

batcher.add("final");
batcher.flush();
assert.deepEqual(flushedBatches, [["first", "second"], ["final"]]);
assert.deepEqual(clearedTimers, [2]);
assert.equal(batcher.pendingCount, 0);

const discardedItems = [];
const disposableBatcher = createTimedBatcher({
  delayMs: 100,
  schedule: (callback) => {
    const timerId = ++nextTimerId;
    scheduledTimers.set(timerId, callback);
    return timerId;
  },
  clear: (timerId) => {
    clearedTimers.push(timerId);
    scheduledTimers.delete(timerId);
  },
  onFlush: (items) => flushedBatches.push(items),
  onDiscard: (items) => discardedItems.push(...items),
});
disposableBatcher.add("unmounted");
disposableBatcher.dispose();
disposableBatcher.add("late");
assert.deepEqual(discardedItems, ["unmounted", "late"]);
assert.equal(disposableBatcher.pendingCount, 0);
assert.deepEqual(clearedTimers, [2, 3]);

const slowScheduledTimers = new Map();
const slowFlushedBatches = [];
let nextSlowTimerId = 0;
const boundedBatcher = createTimedBatcher({
  delayMs: 100,
  minimumBatchSize: 100,
  keyFor: (item) => item.trackId,
  schedule: (callback) => {
    const timerId = ++nextSlowTimerId;
    slowScheduledTimers.set(timerId, callback);
    return timerId;
  },
  clear: (timerId) => slowScheduledTimers.delete(timerId),
  onFlush: (items) => slowFlushedBatches.push(items),
});

for (let index = 0; index < 10_000; index += 1) {
  boundedBatcher.add({ trackId: `slow-${index}` });
  const dueTimers = Array.from(slowScheduledTimers.entries());
  slowScheduledTimers.clear();
  dueTimers.forEach(([, callback]) => callback());
}
boundedBatcher.flush();

assert.ok(
  slowFlushedBatches.length <= 101,
  `10,000 slow results must use at most 100 bounded commits plus one final commit; got ${slowFlushedBatches.length}`,
);
assert.deepEqual(
  slowFlushedBatches.flat().map((item) => item.trackId),
  Array.from({ length: 10_000 }, (_, index) => `slow-${index}`),
);

let running = 0;
let maximumRunning = 0;
const progress = [];
const result = await runManualImportQueue({
  items: ["first", "broken", "last"],
  limit: 2,
  worker: async (item) => {
    running += 1;
    maximumRunning = Math.max(maximumRunning, running);
    await new Promise((resolve) => setTimeout(resolve, item === "first" ? 15 : 5));
    running -= 1;
    if (item === "broken") throw new Error("expected item failure");
    return item;
  },
  onProgress: (next) => progress.push(next),
});

assert.equal(maximumRunning, 2);
assert.deepEqual(result.completed, ["first", "last"]);
assert.equal(result.failed, 1);
assert.equal(result.canceled, false);
assert.deepEqual(progress.at(-1), { completed: 3, total: 3 });

let releaseLateWorker;
const lateWorkerGate = new Promise((resolve) => {
  releaseLateWorker = resolve;
});
const dequeuedItems = [];
const revokedArtwork = [];
let disposedImport = false;
const disposedResult = runManualImportQueue({
  items: ["in-flight", "must-not-dequeue"],
  limit: 1,
  worker: async (item) => {
    dequeuedItems.push(item);
    await lateWorkerGate;
    return {
      item,
      discard: () => revokedArtwork.push(item),
    };
  },
  isCanceled: () => disposedImport,
  shouldDiscardResult: () => disposedImport,
  onDiscardResult: (result) => result.discard(),
});

disposedImport = true;
releaseLateWorker();
const disposedQueueResult = await disposedResult;
assert.deepEqual(dequeuedItems, ["in-flight"]);
assert.deepEqual(disposedQueueResult.completed, []);
assert.deepEqual(revokedArtwork, ["in-flight"]);

const localTracksSource = readFileSync("src/hooks/useLocalTracks.ts", "utf8");
const selectedFileSource = readFileSync("electron/selectedFile.ts", "utf8");
const mainSource = readFileSync("electron/main.ts", "utf8");
assert.match(localTracksSource, /runManualImportQueue/);
assert.match(localTracksSource, /limit:\s*2/);
assert.match(localTracksSource, /createTimedBatcher<PendingMetadataUpdate>/);
assert.match(localTracksSource, /minimumBatchSize/);
assert.match(localTracksSource, /metadataGenerationRef/);
assert.match(localTracksSource, /invalidateMetadataJobs/);
assert.match(localTracksSource, /onProgress:\s*\(progress\)\s*=>\s*\{[\s\S]*metadataGeneration\s*===\s*metadataGenerationRef\.current/);
assert.match(localTracksSource, /metadataBatcher\.flush\(\)/);
assert.match(localTracksSource, /onTrackMetadataBatchComplete/);
assert.match(selectedFileSource, /Math\.min\(4, filePaths\.length\)/);
assert.match(selectedFileSource, /results\[index\] = await toSelectedFile/);
const collectAudioFilesSource = mainSource.slice(
  mainSource.indexOf("async function collectAudioFiles"),
  mainSource.indexOf("function getCustomImagesRoot"),
);
assert.doesNotMatch(collectAudioFilesSource, /Promise\.all/);
assert.match(collectAudioFilesSource, /while \(folders\.length > 0\)/);

console.log("import-work-queue-check PASS");
