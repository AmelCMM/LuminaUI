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
  filter: brightness(1.06);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.10);
}
.lumina-button:not(:disabled):active {
  filter: brightness(0.96);
  transform: translateY(0);
  box-shadow: none;
}
.lumina-button:focus-visible,
.lumina-switch:focus-visible,
.lumina-field:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px ${luminaTheme.colors.focus};
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
      border: `1px solid ${luminaTheme.colors.primaryDark}`,
      boxShadow: "0 1px 3px rgba(37, 99, 235, 0.24)",
    },
    secondary: {
      backgroundColor: luminaTheme.colors.surface,
      color: luminaTheme.colors.primary,
      border: `1px solid ${luminaTheme.colors.borderStrong}`,
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
    },
    text: {
      backgroundColor: "transparent",
      color: luminaTheme.colors.primary,
      border: "1px solid transparent",
    },
    danger: {
      backgroundColor: luminaTheme.colors.danger,
      color: "white",
      border: `1px solid ${luminaTheme.colors.dangerDark}`,
      boxShadow: "0 1px 3px rgba(220, 38, 38, 0.24)",
    },
  };

  const finalStyle = {
    minHeight: "38px",
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
  disabled = false,
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
        cursor: disabled ? "not-allowed" : "pointer",
        userSelect: "none",
        opacity: disabled ? 0.6 : 1,
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
          disabled,
          onChange: (e) => {
            if (!disabled && onChange) onChange(e.target.checked);
          },
          style: {
            width: "16px",
            height: "16px",
            accentColor: luminaTheme.colors.primary,
            cursor: disabled ? "not-allowed" : "pointer",
          },
        },
        children: [],
      },
      label || "",
    ],
  };
}

export function Switch({
  value,
  checked,
  onChange,
  ariaLabel,
  disabled = false,
  style = {},
  ...props
}) {
  ensureControlStyles();
  const currentValue =
    checked !== undefined ? !!checked : value !== undefined ? !!value : false;
  const base = {
    width: "46px",
    height: "24px",
    borderRadius: luminaTheme.radius.pill,
    backgroundColor: currentValue
      ? luminaTheme.colors.primary
      : luminaTheme.colors.track,
    border: `1px solid ${currentValue ? luminaTheme.colors.primary : luminaTheme.colors.borderStrong}`,
    cursor: disabled ? "not-allowed" : "pointer",
    position: "relative",
    transition: `background-color ${luminaTheme.transition}, border-color ${luminaTheme.transition}, box-shadow ${luminaTheme.transition}`,
    outline: "none",
    boxShadow: currentValue ? "0 1px 3px rgba(37, 99, 235, 0.30)" : "none",
    opacity: disabled ? 0.6 : 1,
    ...style,
  };

  return {
    tag: "button",
    props: {
      ...props,
      role: "switch",
      type: props.type || "button",
      "aria-checked": currentValue,
      "aria-label": ariaLabel || "toggle",
      disabled,
      tabIndex: 0,
      onClick: (event) => {
        if (props.onClick) props.onClick(event);
        if (event.defaultPrevented) return;
        if (!disabled && onChange) onChange(!currentValue);
      },
      onKeyDown: props.onKeyDown,
      style: base,
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
            left: currentValue ? "22px" : "1px",
            transition: `left ${luminaTheme.transition}, transform ${luminaTheme.transition}`,
            boxShadow: "0 2px 4px rgba(15, 23, 42, 0.18)",
          },
        },
        children: [],
      },
    ],
  };
}
