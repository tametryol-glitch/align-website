type Metadata = Record<string, string | number | boolean | null | undefined>;

const PERF_EVENT = 'perf_timing';

export function startTrace(name: string, meta: Metadata = {}) {
  const startedAt = Date.now();
  let done = false;

  return (endMeta: Metadata = {}) => {
    if (done) return;
    done = true;
    const durationMs = Date.now() - startedAt;
    const merged = { ...meta, ...endMeta };

    if (typeof window !== 'undefined' && window.performance) {
      try {
        performance.mark(`${name}_end`);
        performance.measure(name, { start: startedAt, end: startedAt + durationMs });
      } catch {}
    }

    if (process.env.NODE_ENV === 'development') {
      console.debug(`[perf] ${name} ${durationMs}ms`, merged);
    }
  };
}

export async function traceAsync<T>(
  name: string,
  fn: () => Promise<T>,
  meta: Metadata = {},
): Promise<T> {
  const end = startTrace(name, meta);
  try {
    const out = await fn();
    end({ ok: true });
    return out;
  } catch (err) {
    end({ ok: false });
    throw err;
  }
}
