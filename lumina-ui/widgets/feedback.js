import {
  cleanStyle,
  ensureGlobalStyle,
  normalizeWidgetArgs,
  omitProps,
  px,
} from "./utils.js";

function ensureFeedbackStyles() {
  ensureGlobalStyle(
    "lumina-feedback-styles",
    `
@keyframes lumina-spin {
  to { transform: rotate(360deg); }
}
@keyframes lumina-progress {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}
`,
  );
}

export function ModalBarrier(props = {}) {
  return {
    tag: "div",
    props: {
      ...omitProps(props, ["color", "dismissible", "onDismiss"]),
      onClick: props.dismissible === false ? undefined : props.onDismiss,
      style: cleanStyle({
        position: "fixed",
        inset: 0,
        backgroundColor: props.color || "rgba(15, 23, 42, 0.56)",
        zIndex: props.zIndex ?? 1000,
        ...props.style,
      }),
    },
    children: [],
    key: props.key,
  };
}

export function Dialog(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  if (props.open === false) return null;

  const zIndex = props.zIndex ?? 1000;

  return {
    tag: "div",
    props: {
      role: "presentation",
      style: cleanStyle({
        position: "fixed",
        inset: 0,
        zIndex,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: px(props.padding ?? 20),
        ...props.overlayStyle,
      }),
    },
    children: [
      ModalBarrier({
        color: props.barrierColor,
        dismissible: props.dismissible,
        onDismiss: props.onDismiss,
        zIndex,
      }),
      {
        tag: "div",
        props: {
          ...omitProps(props, [
            "open",
            "barrierColor",
            "dismissible",
            "onDismiss",
            "padding",
            "overlayStyle",
            "width",
          ]),
          role: "dialog",
          "aria-modal": "true",
          style: cleanStyle({
            position: "relative",
            zIndex: zIndex + 1,
            width: px(props.width, "min(100%, 420px)"),
            maxWidth: "100%",
            borderRadius: "10px",
            backgroundColor: "#ffffff",
            boxShadow: "0 24px 64px rgba(15, 23, 42, 0.28)",
            ...props.style,
          }),
        },
        children,
      },
    ],
    key: props.key,
  };
}

export function AlertDialog(props = {}) {
  const actions = props.actions || [];
  return Dialog(
    {
      open: props.open,
      onDismiss: props.onDismiss,
      dismissible: props.dismissible,
      width: props.width,
      style: props.style,
    },
    [
      {
        tag: "div",
        props: {
          style: {
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          },
        },
        children: [
          props.title
            ? {
                tag: "h2",
                props: { style: { margin: 0, fontSize: "20px" } },
                children: [props.title],
              }
            : null,
          props.content
            ? {
                tag: "div",
                props: { style: { lineHeight: 1.5 } },
                children: Array.isArray(props.content)
                  ? props.content
                  : [props.content],
              }
            : null,
          actions.length
            ? {
                tag: "div",
                props: {
                  style: {
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    marginTop: "8px",
                  },
                },
                children: actions,
              }
            : null,
        ],
      },
    ],
  );
}

export function SnackBar(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  if (props.open === false) return null;

  return {
    tag: "div",
    props: {
      ...omitProps(props, ["open", "message", "action", "position"]),
      role: "status",
      style: cleanStyle({
        position: "fixed",
        left: "50%",
        bottom: props.position === "top" ? undefined : "20px",
        top: props.position === "top" ? "20px" : undefined,
        transform: "translateX(-50%)",
        zIndex: props.zIndex ?? 1100,
        display: "flex",
        alignItems: "center",
        gap: "16px",
        minWidth: "min(420px, calc(100vw - 32px))",
        maxWidth: "calc(100vw - 32px)",
        padding: "12px 14px",
        borderRadius: "8px",
        backgroundColor: "#111827",
        color: "#ffffff",
        boxShadow: "0 14px 36px rgba(15, 23, 42, 0.28)",
        ...props.style,
      }),
    },
    children: [
      {
        tag: "div",
        props: { style: { flex: 1 } },
        children: children.length ? children : [props.message || ""],
      },
      props.action || null,
    ],
    key: props.key,
  };
}

export function Tooltip(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  return {
    tag: "span",
    props: {
      ...omitProps(props, ["message"]),
      title: props.message,
      style: cleanStyle({
        display: "inline-flex",
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function LinearProgressIndicator(props = {}) {
  ensureFeedbackStyles();
  const value = props.value;
  const determinate = typeof value === "number";

  return {
    tag: "div",
    props: {
      ...omitProps(props, ["value", "color", "trackColor", "height"]),
      role: "progressbar",
      "aria-valuemin": determinate ? 0 : undefined,
      "aria-valuemax": determinate ? 1 : undefined,
      "aria-valuenow": determinate ? value : undefined,
      style: cleanStyle({
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: px(props.height ?? 4),
        borderRadius: "999px",
        backgroundColor: props.trackColor || "#e5e7eb",
        ...props.style,
      }),
    },
    children: [
      {
        tag: "div",
        props: {
          style: cleanStyle({
            position: "absolute",
            inset: 0,
            width: determinate
              ? `${Math.max(0, Math.min(1, value)) * 100}%`
              : "55%",
            backgroundColor: props.color || "#2563eb",
            borderRadius: "inherit",
            animation: determinate
              ? undefined
              : "lumina-progress 1.3s ease-in-out infinite",
          }),
        },
        children: [],
      },
    ],
    key: props.key,
  };
}

export function CircularProgressIndicator(props = {}) {
  ensureFeedbackStyles();
  const size = props.size ?? 32;
  const strokeWidth = props.strokeWidth ?? 4;

  return {
    tag: "span",
    props: {
      ...omitProps(props, ["size", "strokeWidth", "color", "trackColor"]),
      role: "progressbar",
      style: cleanStyle({
        display: "inline-block",
        width: px(size),
        height: px(size),
        borderRadius: "50%",
        border: `${px(strokeWidth)} solid ${props.trackColor || "#e5e7eb"}`,
        borderTopColor: props.color || "#2563eb",
        animation: "lumina-spin 0.8s linear infinite",
        ...props.style,
      }),
    },
    children: [],
    key: props.key,
  };
}
