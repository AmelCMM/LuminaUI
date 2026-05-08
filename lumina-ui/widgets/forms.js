import {
  cleanStyle,
  normalizeWidgetArgs,
  omitProps,
  px,
} from "./utils.js";

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
        gap: "6px",
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
                fontWeight: 700,
              },
            },
            children: [label, required ? "*" : ""],
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
                color: errorText ? "#dc2626" : "#6b7280",
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
  return {
    tag: "label",
    props: {
      ...props,
      style: cleanStyle({
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
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
        if (onChange) onChange(Number(event.target.value));
      },
      style: cleanStyle({
        width: "100%",
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
      style: cleanStyle({
        width: "100%",
        padding: "8px 10px",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
        backgroundColor: "#ffffff",
        color: "inherit",
        font: "inherit",
        outline: "none",
        ...style,
      }),
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
  return {
    tag: "textarea",
    props: {
      ...props,
      value,
      rows,
      placeholder,
      onInput: (event) => {
        if (onChange) onChange(event.target.value);
      },
      style: cleanStyle({
        width: "100%",
        resize: "vertical",
        padding: "8px 10px",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
        backgroundColor: "#ffffff",
        color: "inherit",
        font: "inherit",
        outline: "none",
        ...style,
      }),
    },
    children: [],
    key: props.key,
  };
}
