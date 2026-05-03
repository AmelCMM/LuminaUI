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
  const variants = {
    primary: { backgroundColor: "#6200ee", color: "white", border: "none" },
    secondary: {
      backgroundColor: "transparent",
      color: "#6200ee",
      border: "1px solid #6200ee",
    },
    text: { backgroundColor: "transparent", color: "#6200ee", border: "none" },
    danger: { backgroundColor: "#dc3545", color: "white", border: "none" },
  };

  const finalStyle = {
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
    opacity: disabled ? 0.5 : 1,
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
    },
    children: [text],
  };
}

export function Input({
  value,
  onChange,
  placeholder = "",
  type = "text",
  id,
  style = {},
  ...props
}) {
  const isCheckbox = type === "checkbox";
  const finalId = id || genId("input");

  return {
    tag: "input",
    props: {
      id: finalId,
      type,
      ...(isCheckbox ? { checked: !!value } : { value: value ?? "" }),
      placeholder: placeholder || undefined,
      onChange: (e) => {
        if (!onChange) return;
        if (isCheckbox) onChange(e.target.checked);
        else onChange(e.target.value);
      },
      onFocus: (e) => {
        e.target.style.borderColor = "#6200ee";
      },
      onBlur: (e) => {
        e.target.style.borderColor = "#ddd";
      },
      style: {
        padding: "8px 12px",
        borderRadius: "4px",
        border: "1px solid #ddd",
        fontSize: "14px",
        outline: "none",
        transition: "border-color 0.2s",
        ...style,
      },
      ...props,
    },
    children: [],
  };
}

export function Checkbox({
  checked = false,
  onChange,
  label = "",
  id,
  style = {},
  ...props
}) {
  const finalId = id || genId("checkbox");

  return {
    tag: "label",
    props: {
      htmlFor: finalId,
      style: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
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
          onChange: (e) => {
            if (onChange) onChange(e.target.checked);
          },
          style: { cursor: "pointer" },
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
  const base = {
    width: "48px",
    height: "24px",
    borderRadius: "12px",
    backgroundColor: value ? "#6200ee" : "#ccc",
    border: "none",
    cursor: "pointer",
    position: "relative",
    transition: "background-color 0.2s",
    outline: "none",
    ...style,
  };

  return {
    tag: "button",
    props: {
      role: "switch",
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
    },
    children: [
      {
        tag: "div",
        props: {
          style: {
            width: "20px",
            height: "20px",
            borderRadius: "10px",
            backgroundColor: "white",
            position: "absolute",
            top: "2px",
            left: value ? "26px" : "2px",
            transition: "left 0.2s",
          },
        },
        children: [],
      },
    ],
  };
}
