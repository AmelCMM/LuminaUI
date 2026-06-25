import { errorBus } from "../core/errors.js";
import { ensureGlobalStyle } from "./utils.js";

function injectDevToolsStyles() {
  ensureGlobalStyle(
    "lumina-devtools-styles",
    `
.lumina-devtools-btn {
  all: initial;
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 99999;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 44px;
  height: 44px;
  padding: 0 14px;
  border: none;
  border-radius: 999px;
  background: #1e293b;
  color: #f1f5f9;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0,0,0,0.28);
  transition: transform 0.15s, box-shadow 0.15s;
  user-select: none;
}
.lumina-devtools-btn:hover { transform: scale(1.05); box-shadow: 0 6px 24px rgba(0,0,0,0.35); }
.lumina-devtools-btn:active { transform: scale(0.95); }
.lumina-devtools-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.lumina-devtools-dot.error { background: #ef4444; }
.lumina-devtools-dot.idle { background: #22c55e; }
.lumina-devtools-count {
  min-width: 18px; text-align: center;
}
.lumina-devtools-panel {
  all: initial;
  position: fixed;
  bottom: 76px;
  right: 20px;
  z-index: 99998;
  width: min(480px, calc(100vw - 32px));
  max-height: min(520px, calc(100vh - 100px));
  display: flex;
  flex-direction: column;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 14px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.4);
  color: #e2e8f0;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
  font-size: 13px;
  line-height: 1.5;
  overflow: hidden;
}
.lumina-devtools-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid #334155;
  flex-shrink: 0;
}
.lumina-devtools-panel-title {
  font-weight: 700;
  font-size: 14px;
  color: #f1f5f9;
}
.lumina-devtools-panel-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.lumina-devtools-btn-sm {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border: 1px solid #475569;
  border-radius: 6px;
  background: transparent;
  color: #94a3b8;
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}
.lumina-devtools-btn-sm:hover { background: #334155; color: #f1f5f9; }
.lumina-devtools-entries {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.lumina-devtools-entry {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #1e293b;
  cursor: pointer;
  transition: background 0.12s;
}
.lumina-devtools-entry:hover { background: #334155; }
.lumina-devtools-entry-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.lumina-devtools-entry-source {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}
.lumina-devtools-source-render { background: #7c3aed22; color: #a78bfa; }
.lumina-devtools-source-state { background: #2563eb22; color: #60a5fa; }
.lumina-devtools-source-effect { background: #d9770622; color: #fbbf24; }
.lumina-devtools-source-event { background: #05966922; color: #34d399; }
.lumina-devtools-source-unhandled { background: #dc262622; color: #f87171; }
.lumina-devtools-entry-time {
  font-size: 10px;
  color: #64748b;
  flex-shrink: 0;
}
.lumina-devtools-entry-msg {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #e2e8f0;
  font-weight: 500;
}
.lumina-devtools-entry-dismiss {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}
.lumina-devtools-entry-dismiss:hover { background: #dc262644; color: #f87171; }
.lumina-devtools-stack {
  padding: 8px 10px;
  margin: 0;
  border-radius: 6px;
  background: #0f172a;
  color: #94a3b8;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
  font-size: 11px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}
.lumina-devtools-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
}
`,
  );
}

function formatTime(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

function sourceLabel(source) {
  const map = { render: "render", state: "state", effect: "effect", event: "event", unhandled: "crash" };
  return map[source] || source;
}

function sourceClass(source) {
  const map = { render: "render", state: "state", effect: "effect", event: "event", unhandled: "unhandled" };
  return `lumina-devtools-source-${map[source] || "unhandled"}`;
}

function stackLines(raw) {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.includes("node_modules") && !l.includes("/errors.js"));
}

const devtoolsSubscriptions = new WeakMap();

// Subscribe a render's forceUpdate to the error bus exactly once so the overlay
// refreshes as errors arrive. Errors thrown *during* render are skipped here:
// re-rendering in reaction to them would throw again and spin forever. They
// still surface on the next natural render. Bus signals (clear/remove) and
// runtime errors (event/state/effect/unhandled) safely schedule a refresh.
function subscribeErrorBus(forceUpdate) {
  if (typeof forceUpdate !== "function" || devtoolsSubscriptions.has(forceUpdate)) {
    return;
  }
  devtoolsSubscriptions.set(forceUpdate, true);

  let scheduled = false;
  const requestRender = () => {
    if (scheduled) return;
    scheduled = true;
    const run = () => {
      scheduled = false;
      forceUpdate();
    };
    if (typeof queueMicrotask === "function") queueMicrotask(run);
    else setTimeout(run, 0);
  };

  const cleanup = errorBus.subscribe((entry) => {
    if (entry && entry.source === "render") return;
    requestRender();
  });

  if (typeof forceUpdate.onUnmount === "function") {
    forceUpdate.onUnmount(() => {
      cleanup();
      devtoolsSubscriptions.delete(forceUpdate);
    });
  }
}

export function DevTools({ open = false, onOpenChange, maxErrors = 50 } = {}) {
  injectDevToolsStyles();

  return (forceUpdate) => {
    subscribeErrorBus(forceUpdate);

    const entries = errorBus.getEntries();
    const errorCount = entries.length;
    const visible = errorCount > 0 ? entries.slice(-maxErrors) : [];
    const hasErrors = errorCount > 0;

    const setOpen = (next) => {
      if (onOpenChange) onOpenChange(next);
      // The caller's open state may not be wired to this render; force a
      // refresh so the panel reliably opens/closes on its own.
      if (typeof forceUpdate === "function") forceUpdate();
    };

    return [
    {
      tag: "button",
      props: {
        className: "lumina-devtools-btn",
        "aria-label": "LuminaUI DevTools",
        title: `${errorCount} error${errorCount !== 1 ? "s" : ""}`,
        onClick: (e) => {
          e.stopPropagation();
          setOpen(!open);
        },
      },
      children: [
        {
          tag: "span",
          props: { className: `lumina-devtools-dot ${hasErrors ? "error" : "idle"}` },
          children: [],
        },
        {
          tag: "span",
          props: { className: "lumina-devtools-count" },
          children: [hasErrors ? String(errorCount) : "0"],
        },
      ],
      key: "devtools-btn",
    },
    open
      ? {
          tag: "div",
          props: {
            className: "lumina-devtools-panel",
            onClick: (e) => e.stopPropagation(),
          },
          children: [
            {
              tag: "div",
              props: { className: "lumina-devtools-panel-header" },
              children: [
                {
                  tag: "span",
                  props: { className: "lumina-devtools-panel-title" },
                  children: [`LuminaUI DevTools  ·  ${errorCount} caught`],
                },
                {
                  tag: "div",
                  props: { className: "lumina-devtools-panel-actions" },
                  children: [
                    errorCount > 0
                      ? {
                          tag: "button",
                          props: {
                            className: "lumina-devtools-btn-sm",
                            onClick: () => {
                              errorBus.clear();
                              if (typeof forceUpdate === "function") forceUpdate();
                            },
                          },
                          children: ["Clear"],
                        }
                      : null,
                    {
                      tag: "button",
                      props: {
                        className: "lumina-devtools-btn-sm",
                        onClick: () => setOpen(false),
                      },
                      children: ["Close"],
                    },
                  ],
                },
              ],
            },
            {
              tag: "div",
              props: { className: "lumina-devtools-entries" },
              children: visible.length
                ? visible.map((entry) => {
                    return {
                      tag: "div",
                      props: {
                        key: entry.id,
                        className: "lumina-devtools-entry",
                      },
                      children: [
                        {
                          tag: "div",
                          props: { className: "lumina-devtools-entry-row" },
                          children: [
                            {
                              tag: "span",
                              props: {
                                className: `lumina-devtools-entry-source ${sourceClass(entry.source)}`,
                              },
                              children: [sourceLabel(entry.source)],
                            },
                            {
                              tag: "span",
                              props: { className: "lumina-devtools-entry-time" },
                              children: [formatTime(entry.timestamp)],
                            },
                            {
                              tag: "span",
                              props: {
                                className: "lumina-devtools-entry-msg",
                                onClick: () => {
                                  entry._expanded = !entry._expanded;
                                  if (typeof forceUpdate === "function") forceUpdate();
                                },
                              },
                              children: [entry.message],
                            },
                            {
                              tag: "button",
                              props: {
                                className: "lumina-devtools-entry-dismiss",
                                title: "Dismiss",
                                onClick: (e) => {
                                  e.stopPropagation();
                                  errorBus.remove(entry.id);
                                  if (typeof forceUpdate === "function") forceUpdate();
                                },
                              },
                              children: ["x"],
                            },
                          ],
                        },
                        entry.stack && (entry._expanded || entry.source === "unhandled")
                          ? {
                              tag: "pre",
                              props: { className: "lumina-devtools-stack" },
                              children: stackLines(entry.stack),
                            }
                          : null,
                      ],
                    };
                  })
                : [
                    {
                      tag: "div",
                      props: { className: "lumina-devtools-empty" },
                      children: ["No errors caught  ✦"],
                    },
                  ],
            },
          ],
          key: "devtools-panel",
        }
      : null,
    ];
  };
}
