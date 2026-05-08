import {
  applyFieldFocus,
  clearFieldFocus,
  ensureGlobalStyle,
  fieldStyle,
  luminaTheme,
} from "./utils.js";

function ensureControlStyles() {
  ensureGlobalStyle(
    "lumina-control-styles",
    `
.lumina-button:not(:disabled):hover {
  filter: saturate(1.06);
  transform: translateY(-1px);
}
.lumina-button:not(:disabled):active {
  transform: translateY(0);
}
.lumina-button:focus-visible,
.lumina-switch:focus-visible,
.lumina-field:focus-visible {
  outline: 2px solid ${luminaTheme.colors.focus};
  outline-offset: 2px;
}
.lumina-field:hover:not(:disabled) {
  border-color: ${luminaTheme.colors.primary} !important;
}
`,
  );
}

function genId(prefix = "id") {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function Button({
  text,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
  style = {},
  ...props
}) {
  ensureControlStyles();
  const variants = {
    primary: {
      backgroundColor: luminaTheme.colors.primary,
      color: "white",
      border: `1px solid ${luminaTheme.colors.primary}`,
      boxShadow: "0 8px 18px rgba(37, 99, 235, 0.20)",
    },
    secondary: {
      backgroundColor: luminaTheme.colors.surface,
      color: luminaTheme.colors.primary,
      border: `1px solid ${luminaTheme.colors.borderStrong}`,
      boxShadow: luminaTheme.shadow.xs,
    },
    text: {
      backgroundColor: "transparent",
      color: luminaTheme.colors.primary,
      border: "1px solid transparent",
    },
    danger: {
      backgroundColor: luminaTheme.colors.danger,
      color: "white",
      border: `1px solid ${luminaTheme.colors.danger}`,
      boxShadow: "0 8px 18px rgba(220, 38, 38, 0.18)",
    },
  };

  const finalStyle = {
    minHeight: "36px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "8px 14px",
    borderRadius: luminaTheme.radius.md,
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "14px",
    fontWeight: 700,
    fontFamily: "inherit",
    lineHeight: 1,
    whiteSpace: "nowrap",
    userSelect: "none",
    transition: `background-color ${luminaTheme.transition}, border-color ${luminaTheme.transition}, color ${luminaTheme.transition}, box-shadow ${luminaTheme.transition}, transform ${luminaTheme.transition}`,
    opacity: disabled ? 0.5 : 1,
    outline: "none",
    ...variants[variant],
    ...style,
  };

  return {
    tag: "button",
    props: {
      type,
      disabled,
      onClick,
      style: finalStyle,
      ...props,
      className: ["lumina-button", `lumina-button-${variant}`, props.className]
        .filter(Boolean)
        .join(" "),
    },
    children: [text],
  };
}

export function Input({
  value,
  onChange,
  onInput,
  placeholder = "",
  type = "text",
  id,
  style = {},
  ...props
}) {
  ensureControlStyles();
  const isCheckbox = type === "checkbox";
  const finalId = id || genId("input");
  const finalStyle = isCheckbox
    ? {
        width: "16px",
        height: "16px",
        accentColor: luminaTheme.colors.primary,
        cursor: props.disabled ? "not-allowed" : "pointer",
        ...style,
      }
    : fieldStyle(style);

  return {
    tag: "input",
    props: {
      id: finalId,
      type,
      ...(isCheckbox ? { checked: !!value } : { value: value ?? "" }),
      placeholder: placeholder || undefined,
      ...(isCheckbox
        ? {
            onChange: (e) => {
              if (onChange) onChange(e.target.checked);
            },
          }
        : {
            onInput: (e) => {
              if (onInput) onInput(e);
              if (onChange) onChange(e.target.value);
            },
            onChange: (e) => {
              if (onChange) onChange(e.target.value);
            },
          }),
      onFocus: (e) => {
        if (props.onFocus) props.onFocus(e);
        if (e.defaultPrevented) return;
        if (!isCheckbox) applyFieldFocus(e, style);
      },
      onBlur: (e) => {
        if (props.onBlur) props.onBlur(e);
        if (e.defaultPrevented) return;
        if (!isCheckbox) clearFieldFocus(e, style);
      },
      style: finalStyle,
      ...Object.fromEntries(
        Object.entries(props).filter(
          ([key]) => key !== "onFocus" && key !== "onBlur",
        ),
      ),
      className: [
        isCheckbox ? "lumina-checkbox-input" : "lumina-field",
        props.className,
      ]
        .filter(Boolean)
        .join(" "),
    },
    children: [],
  };
}

export function TextField(props) {
  return Input({ ...props, type: props.type || "text" });
}

export function Checkbox({
  checked = false,
  onChange,
  label = "",
  id,
  style = {},
  ...props
}) {
  ensureControlStyles();
  const finalId = id || genId("checkbox");

  return {
    tag: "label",
    props: {
      htmlFor: finalId,
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        color: luminaTheme.colors.text,
        fontSize: "14px",
        lineHeight: 1.4,
        cursor: props.disabled ? "not-allowed" : "pointer",
        userSelect: "none",
        ...style,
      },
      ...props,
    },
    children: [
      {
        tag: "input",
        props: {
          id: finalId,
          type: "checkbox",
          checked: !!checked,
          disabled: props.disabled,
          onChange: (e) => {
            if (onChange) onChange(e.target.checked);
          },
          style: {
            width: "16px",
            height: "16px",
            accentColor: luminaTheme.colors.primary,
            cursor: props.disabled ? "not-allowed" : "pointer",
          },
        },
        children: [],
      },
      label || "",
    ],
  };
}

export function Switch({
  value = false,
  onChange,
  ariaLabel,
  style = {},
  ...props
}) {
  ensureControlStyles();
  const base = {
    width: "46px",
    height: "24px",
    borderRadius: luminaTheme.radius.pill,
    backgroundColor: value ? luminaTheme.colors.primary : luminaTheme.colors.track,
    border: `1px solid ${value ? luminaTheme.colors.primary : luminaTheme.colors.borderStrong}`,
    cursor: "pointer",
    position: "relative",
    transition: `background-color ${luminaTheme.transition}, border-color ${luminaTheme.transition}, box-shadow ${luminaTheme.transition}`,
    outline: "none",
    boxShadow: value ? "0 8px 18px rgba(37, 99, 235, 0.16)" : "none",
    ...style,
  };

  return {
    tag: "button",
    props: {
      role: "switch",
      type: props.type || "button",
      "aria-checked": !!value,
      "aria-label": ariaLabel || "toggle",
      tabIndex: 0,
      onClick: () => {
        if (onChange) onChange(!value);
      },
      onKeyDown: (e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          if (onChange) onChange(!value);
        }
      },
      style: base,
      ...props,
      className: ["lumina-switch", props.className].filter(Boolean).join(" "),
    },
    children: [
      {
        tag: "div",
        props: {
          style: {
            width: "20px",
            height: "20px",
            borderRadius: "10px",
            backgroundColor: luminaTheme.colors.surface,
            position: "absolute",
            top: "1px",
            left: value ? "22px" : "1px",
            transition: `left ${luminaTheme.transition}, transform ${luminaTheme.transition}`,
            boxShadow: "0 2px 6px rgba(15, 23, 42, 0.22)",
          },
        },
        children: [],
      },
    ],
  };
}
