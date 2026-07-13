type ManualImportQueueOptions<T, R> = {
  items: T[];
  limit: number;
  worker: (item: T) => Promise<R>;
  isCanceled?: () => boolean;
  shouldDiscardResult?: () => boolean;
  onResult?: (result: R) => void;
  onDiscardResult?: (result: R) => void;
  onProgress?: (progress: { completed: number; total: number }) => void;
};

type TimedBatcherOptions<T> = {
  delayMs: number;
  minimumBatchSize?: number;
  keyFor?: (item: T) => string;
  onFlush: (items: T[]) => void;
  onDiscard?: (items: T[]) => void;
  schedule?: (callback: () => void, delayMs: number) => unknown;
  clear?: (timer: unknown) => void;
};

export type TimedBatcher<T> = {
  add: (item: T) => void;
  flush: () => void;
  dispose: () => void;
  readonly pendingCount: number;
};

export function createTimedBatcher<T>({
  delayMs,
  minimumBatchSize = 1,
  keyFor,
  onFlush,
  onDiscard,
  schedule = (callback, delay) => setTimeout(callback, delay),
  clear = (timer) => clearTimeout(timer as ReturnType<typeof setTimeout>),
}: TimedBatcherOptions<T>): TimedBatcher<T> {
  let timer: unknown = null;
  let disposed = false;
  const pending: T[] = [];
  const pendingByKey = keyFor ? new Map<string, T>() : null;
  const requiredBatchSize = Math.max(1, Math.ceil(minimumBatchSize));

  const pendingCount = () => pendingByKey?.size ?? pending.length;
  const takePending = () => {
    if (pendingByKey) {
      const items = Array.from(pendingByKey.values());
      pendingByKey.clear();
      return items;
    }

    return pending.splice(0);
  };

  const flushPending = () => {
    const items = takePending();
    if (items.length > 0) onFlush(items);
  };

  const scheduleFlush = () => {
    if (timer !== null || pendingCount() < requiredBatchSize) return;
    timer = schedule(() => {
      timer = null;
      if (!disposed && pendingCount() >= requiredBatchSize) {
        flushPending();
      }
    }, delayMs);
  };

  const flush = () => {
    if (timer !== null) {
      clear(timer);
      timer = null;
    }

    if (disposed || pendingCount() === 0) return;
    flushPending();
  };

  return {
    add(item) {
      if (disposed) {
        onDiscard?.([item]);
        return;
      }

      if (pendingByKey && keyFor) {
        const key = keyFor(item);
        const replaced = pendingByKey.get(key);
        if (replaced) {
          onDiscard?.([replaced]);
        }
        pendingByKey.set(key, item);
      } else {
        pending.push(item);
      }

      scheduleFlush();
    },
    flush,
    dispose() {
      if (disposed) return;
      disposed = true;
      if (timer !== null) {
        clear(timer);
        timer = null;
      }
      const items = takePending();
      if (items.length > 0) onDiscard?.(items);
    },
    get pendingCount() {
      return pendingCount();
    },
  };
}

export async function runManualImportQueue<T, R>({
  items,
  limit,
  worker,
  isCanceled = () => false,
  shouldDiscardResult = () => false,
  onResult,
  onDiscardResult,
  onProgress,
}: ManualImportQueueOptions<T, R>) {
  const results: Array<R | undefined> = new Array(items.length);
  let nextIndex = 0;
  let processed = 0;
  let failed = 0;
  let canceled = false;

  const runWorker = async () => {
    while (nextIndex < items.length) {
      if (isCanceled()) {
        canceled = true;
        return;
      }

      const index = nextIndex;
      nextIndex += 1;
      try {
        const result = await worker(items[index]);
        if (shouldDiscardResult()) {
          onDiscardResult?.(result);
        } else {
          results[index] = result;
          onResult?.(result);
        }
      } catch {
        failed += 1;
      } finally {
        processed += 1;
        onProgress?.({ completed: processed, total: items.length });
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(Math.max(1, limit), items.length) }, () => runWorker()),
  );

  return {
    completed: results.filter((result): result is R => result !== undefined),
    failed,
    canceled,
  };
}
