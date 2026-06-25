let idCounter = 0;

function createErrorBus() {
  const entries = [];
  const listeners = new Set();
  let globalHandlersSet = false;

  function setupGlobalHandlers() {
    if (globalHandlersSet || typeof window === "undefined") return;
    globalHandlersSet = true;

    window.addEventListener("error", (event) => {
      const error =
        event.error || new Error(event.message || "Unknown error");
      capture(error, {
        source: "unhandled",
        phase: "global",
        message: event.message,
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      const error = event.reason;
      capture(error instanceof Error ? error : new Error(String(error)), {
        source: "unhandled",
        phase: "promise",
      });
    });
  }

  function capture(error, meta = {}) {
    if (!error) return;
    const err = error instanceof Error ? error : new Error(String(error));
    const entry = {
      id: ++idCounter,
      timestamp: Date.now(),
      message: meta.message || err.message || String(err),
      stack: meta.stack || err.stack,
      source: meta.source || "unknown",
      phase: meta.phase || "",
      error: err,
    };
    entries.push(entry);
    if (entries.length > 50) entries.shift();
    listeners.forEach((fn) => {
      try { fn(entry); } catch (e) { /* swallow */ }
    });
    return entry;
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function clear() {
    entries.length = 0;
    listeners.forEach((fn) => {
      try { fn({ type: "clear" }); } catch (e) { /* swallow */ }
    });
  }

  function getEntries() {
    return entries;
  }

  setupGlobalHandlers();

  return { capture, subscribe, clear, getEntries };
}

export const errorBus = createErrorBus();

export function captureError(error, meta) {
  return errorBus.capture(error, meta);
}

export function captureRenderError(error, componentInfo) {
  return errorBus.capture(error, { source: "render", ...componentInfo });
}

export function captureStateError(error, meta) {
  return errorBus.capture(error, { source: "state", ...meta });
}

export function captureEffectError(error, meta) {
  return errorBus.capture(error, { source: "effect", ...meta });
}
