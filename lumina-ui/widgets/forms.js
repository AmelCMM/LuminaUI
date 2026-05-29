import {
  applyFieldFocus,
  cleanStyle,
  clearFieldFocus,
  ensureGlobalStyle,
  fieldStyle,
  luminaTheme,
  normalizeWidgetArgs,
  omitProps,
  px,
} from "./utils.js";

function ensureFormStyles() {
  ensureGlobalStyle(
    "lumina-form-styles",
    `
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

export function Form(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: "form",
    props: {
      ...omitProps(props, ["onSubmit", "gap"]),
      noValidate: props.noValidate ?? true,
      onSubmit: (event) => {
        event.preventDefault();
        if (props.onSubmit) props.onSubmit(event);
      },
      style: cleanStyle({
        display: "flex",
        flexDirection: "column",
        gap: px(props.gap ?? 12),
        color: luminaTheme.colors.text,
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function FormField(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const {
    label,
    helperText,
    errorText,
    required = false,
    style = {},
  } = props;

  return {
    tag: "label",
    props: {
      ...omitProps(props, ["label", "helperText", "errorText", "required"]),
      style: cleanStyle({
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        color: "inherit",
        ...style,
      }),
    },
    children: [
      label
        ? {
            tag: "span",
            props: {
              style: {
                display: "inline-flex",
                gap: "4px",
                fontSize: "13px",
                fontWeight: 600,
                color: luminaTheme.colors.text,
              },
            },
            children: [
              label,
              required
                ? {
                    tag: "span",
                    props: { style: { color: luminaTheme.colors.danger } },
                    children: ["*"],
                  }
                : "",
            ],
          }
        : null,
      ...children,
      helperText || errorText
        ? {
            tag: "span",
            props: {
              style: {
                minHeight: "16px",
                fontSize: "12px",
                color: errorText ? luminaTheme.colors.danger : luminaTheme.colors.muted,
              },
            },
            children: [errorText || helperText],
          }
        : null,
    ],
    key: props.key,
  };
}

export function Radio({
  value,
  groupValue,
  onChange,
  label = "",
  name,
  disabled = false,
  style = {},
  ...props
}) {
  ensureFormStyles();
  return {
    tag: "label",
    props: {
      ...props,
      style: cleanStyle({
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        color: luminaTheme.colors.text,
        fontSize: "14px",
        lineHeight: 1.4,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        userSelect: "none",
        ...style,
      }),
    },
    children: [
      {
        tag: "input",
        props: {
          type: "radio",
          name,
          value,
          checked: value === groupValue,
          disabled,
          style: {
            width: "16px",
            height: "16px",
            accentColor: luminaTheme.colors.primary,
            cursor: disabled ? "not-allowed" : "pointer",
          },
          onChange: () => {
            if (!disabled && onChange) onChange(value);
          },
        },
        children: [],
      },
      label,
    ],
    key: props.key,
  };
}

export function RadioGroup(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, givenChildren] = normalizeWidgetArgs(
    propsOrChildren,
    maybeChildren,
  );
  const options = props.options || [];
  const children = givenChildren.length
    ? givenChildren
    : options.map((option) =>
        Radio({
          key: option.value,
          name: props.name,
          value: option.value,
          groupValue: props.value,
          label: option.label,
          disabled: option.disabled,
          onChange: props.onChange,
        }),
      );

  return {
    tag: "div",
    props: {
      ...omitProps(props, ["options", "value", "onChange", "name", "gap"]),
      role: "radiogroup",
      style: cleanStyle({
        display: "flex",
        flexDirection: props.direction === "horizontal" ? "row" : "column",
        gap: px(props.gap ?? 8),
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function Slider({
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled = false,
  style = {},
  ...props
}) {
  return {
    tag: "input",
    props: {
      ...props,
      type: "range",
      min,
      max,
      step,
      value,
      disabled,
      onInput: (event) => {
        if (props.onInput) props.onInput(event);
        if (onChange) onChange(Number(event.target.value));
      },
      style: cleanStyle({
        width: "100%",
        accentColor: luminaTheme.colors.primary,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }),
    },
    children: [],
    key: props.key,
  };
}

export function Dropdown({
  value,
  options = [],
  onChange,
  placeholder,
  disabled = false,
  style = {},
  ...props
}) {
  return {
    tag: "select",
    props: {
      ...props,
      value: value ?? "",
      disabled,
      onChange: (event) => {
        if (onChange) onChange(event.target.value);
      },
      onFocus: (event) => {
        if (props.onFocus) props.onFocus(event);
        if (!event.defaultPrevented) applyFieldFocus(event, style);
      },
      onBlur: (event) => {
        if (props.onBlur) props.onBlur(event);
        if (!event.defaultPrevented) clearFieldFocus(event, style);
      },
      style: fieldStyle({
        appearance: "auto",
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }),
      className: ["lumina-field", props.className].filter(Boolean).join(" "),
    },
    children: [
      placeholder
        ? {
            tag: "option",
            props: { value: "", disabled: true },
            children: [placeholder],
          }
        : null,
      ...options.map((option) => ({
        tag: "option",
        props: {
          value: option.value,
          disabled: option.disabled,
          selected: option.value === value,
        },
        children: [option.label],
        key: option.value,
      })),
    ],
    key: props.key,
  };
}

export function TextArea({
  value = "",
  onChange,
  rows = 4,
  placeholder = "",
  style = {},
  ...props
}) {
  ensureFormStyles();
  return {
    tag: "textarea",
    props: {
      ...props,
      value,
      rows,
      placeholder,
      onInput: (event) => {
        if (props.onInput) props.onInput(event);
        if (onChange) onChange(event.target.value);
      },
      onFocus: (event) => {
        if (props.onFocus) props.onFocus(event);
        if (!event.defaultPrevented) applyFieldFocus(event, style);
      },
      onBlur: (event) => {
        if (props.onBlur) props.onBlur(event);
        if (!event.defaultPrevented) clearFieldFocus(event, style);
      },
      style: fieldStyle({
        resize: "vertical",
        minHeight: "96px",
        lineHeight: 1.5,
        ...style,
      }),
      className: ["lumina-field", props.className].filter(Boolean).join(" "),
    },
    children: [],
    key: props.key,
  };
}
