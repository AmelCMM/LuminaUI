import {
  applyFieldFocus,
  cleanStyle,
  clearFieldFocus,
  ensureGlobalStyle,
  fieldStyle,
  luminaTheme,
  omitProps,
  px,
} from "./utils.js";

function ensureSelectionStyles() {
  ensureGlobalStyle(
    "lumina-selection-styles",
    `
.lumina-combobox-option:hover,
.lumina-combobox-option[aria-selected="true"] {
  background-color: ${luminaTheme.colors.primarySoft};
}
.lumina-combobox-input:focus-visible {
  outline: 2px solid ${luminaTheme.colors.focus};
  outline-offset: 2px;
}
`,
  );
}

function genId(prefix = "lumina-id") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function ComboBox({
  value,
  inputValue,
  options = [],
  open = false,
  onChange,
  onInputChange,
  onOpenChange,
  placeholder = "",
  disabled = false,
  id,
  listboxId,
  emptyText = "No options",
  maxHeight = 260,
  clearable = false,
  optionToString = defaultOptionLabel,
  style = {},
  inputStyle = {},
  inputClassName,
  listStyle = {},
  optionStyle = {},
  ...props
} = {}) {
  ensureSelectionStyles();
  const finalId = id || genId("lumina-combobox");
  const finalListboxId = listboxId || `${finalId}-listbox`;
  const normalizedOptions = options.map(normalizeOption);
  const selectedOption = normalizedOptions.find((option) => option.value === value);
  const displayValue =
    inputValue !== undefined
      ? inputValue
      : selectedOption
        ? optionToString(selectedOption)
        : "";

  return {
    tag: "div",
    props: {
      ...omitProps(props, [
        "value",
        "inputValue",
        "options",
        "open",
        "onChange",
        "onInputChange",
        "onOpenChange",
        "placeholder",
        "disabled",
        "id",
        "listboxId",
        "emptyText",
        "maxHeight",
        "clearable",
        "optionToString",
        "inputStyle",
        "inputClassName",
        "listStyle",
        "optionStyle",
        "onInput",
        "onFocus",
        "onBlur",
        "onKeyDown",
      ]),
      style: cleanStyle({
        position: "relative",
        width: "100%",
        color: luminaTheme.colors.text,
        ...style,
      }),
    },
    children: [
      {
        tag: "input",
        props: {
          id: finalId,
          role: "combobox",
          type: "text",
          value: displayValue,
          placeholder,
          disabled,
          autoComplete: "off",
          "aria-expanded": open ? "true" : "false",
          "aria-autocomplete": "list",
          "aria-controls": finalListboxId,
          onInput: (event) => {
            if (props.onInput) props.onInput(event);
            if (onInputChange) onInputChange(event.target.value, event);
            if (onOpenChange) onOpenChange(true, event);
          },
          onFocus: (event) => {
            if (props.onFocus) props.onFocus(event);
            if (!event.defaultPrevented) applyFieldFocus(event, inputStyle);
            if (!disabled && onOpenChange) onOpenChange(true, event);
          },
          onBlur: (event) => {
            if (props.onBlur) props.onBlur(event);
            if (!event.defaultPrevented) clearFieldFocus(event, inputStyle);
          },
          onKeyDown: (event) => {
            if (props.onKeyDown) props.onKeyDown(event);
            handleComboKeyDown({
              event,
              open,
              options: normalizedOptions,
              onChange,
              onOpenChange,
            });
          },
          style: fieldStyle({
            paddingRight: clearable && displayValue ? "36px" : undefined,
            cursor: disabled ? "not-allowed" : "text",
            ...inputStyle,
          }),
          className: ["lumina-combobox-input", inputClassName]
            .filter(Boolean)
            .join(" "),
        },
        children: [],
      },
      clearable && displayValue && !disabled
        ? {
            tag: "button",
            props: {
              type: "button",
              "aria-label": "Clear selection",
              onClick: (event) => {
                if (onInputChange) onInputChange("", event);
                if (onChange) onChange(undefined, undefined, event);
                if (onOpenChange) onOpenChange(false, event);
              },
              style: {
                position: "absolute",
                top: "50%",
                right: "8px",
                transform: "translateY(-50%)",
                width: "24px",
                height: "24px",
                border: "none",
                borderRadius: luminaTheme.radius.pill,
                backgroundColor: "transparent",
                color: luminaTheme.colors.muted,
                cursor: "pointer",
                font: "inherit",
                lineHeight: 1,
              },
            },
            children: ["x"],
          }
        : null,
      open
        ? {
            tag: "div",
            props: {
              id: finalListboxId,
              role: "listbox",
              style: cleanStyle({
                position: "absolute",
                left: 0,
                right: 0,
                top: "calc(100% + 6px)",
                zIndex: 1100,
                maxHeight: px(maxHeight),
                overflowY: "auto",
                border: `1px solid ${luminaTheme.colors.border}`,
                borderRadius: luminaTheme.radius.md,
                backgroundColor: luminaTheme.colors.surface,
                boxShadow: luminaTheme.shadow.md,
                padding: "4px",
                ...listStyle,
              }),
            },
            children: normalizedOptions.length
              ? normalizedOptions.map((option) =>
                  comboOption({
                    option,
                    selected: option.value === value,
                    onChange,
                    onOpenChange,
                    optionStyle,
                  }),
                )
              : [
                  {
                    tag: "div",
                    props: {
                      role: "presentation",
                      style: {
                        padding: "10px 12px",
                        color: luminaTheme.colors.muted,
                        fontSize: "13px",
                      },
                    },
                    children: [emptyText],
                  },
                ],
          }
        : null,
    ],
    key: props.key,
  };
}

export function Autocomplete({
  options = [],
  inputValue = "",
  filter = defaultFilter,
  limit = 8,
  ...props
} = {}) {
  const filteredOptions = filterOptions(options, inputValue, {
    filter,
    limit,
  });

  return ComboBox({
    ...props,
    inputValue,
    options: filteredOptions,
    open: props.open ?? inputValue.length > 0,
  });
}

export const AutoComplete = Autocomplete;

export function filterOptions(
  options = [],
  inputValue = "",
  { filter = defaultFilter, limit = Infinity } = {},
) {
  const query = String(inputValue || "").trim();
  const matches = options
    .map(normalizeOption)
    .filter((option) => filter(option, query));

  return matches.slice(0, limit);
}

function comboOption({
  option,
  selected,
  onChange,
  onOpenChange,
  optionStyle,
}) {
  return {
    tag: "button",
    props: {
      type: "button",
      role: "option",
      disabled: option.disabled,
      "aria-selected": selected ? "true" : "false",
      onMouseDown: (event) => event.preventDefault?.(),
      onClick: (event) => {
        if (option.disabled) return;
        if (onChange) onChange(option.value, option, event);
        if (onOpenChange) onOpenChange(false, event);
      },
      style: cleanStyle({
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: option.description ? "2px" : 0,
        minHeight: "36px",
        padding: "8px 10px",
        border: "none",
        borderRadius: luminaTheme.radius.sm,
        backgroundColor: selected ? luminaTheme.colors.primarySoft : "transparent",
        color: option.disabled ? luminaTheme.colors.muted : luminaTheme.colors.text,
        font: "inherit",
        textAlign: "left",
        cursor: option.disabled ? "not-allowed" : "pointer",
        opacity: option.disabled ? 0.56 : 1,
        ...optionStyle,
        ...option.style,
      }),
      className: "lumina-combobox-option",
    },
    children: [
      {
        tag: "span",
        props: {
          style: {
            fontSize: "14px",
            fontWeight: selected ? 800 : 650,
          },
        },
        children: [option.label],
      },
      option.description
        ? {
            tag: "span",
            props: {
              style: {
                color: luminaTheme.colors.muted,
                fontSize: "12px",
                lineHeight: 1.35,
              },
            },
            children: [option.description],
          }
        : null,
    ],
    key: option.value,
  };
}

function handleComboKeyDown({
  event,
  open,
  options,
  onChange,
  onOpenChange,
}) {
  if (event.defaultPrevented) return;
  if (event.key === "Escape") {
    onOpenChange?.(false, event);
    return;
  }
  if (event.key === "ArrowDown") {
    event.preventDefault?.();
    onOpenChange?.(true, event);
    focusFirstOption(event.currentTarget);
    return;
  }
  if (event.key === "Enter" && open) {
    const firstEnabled = options.find((option) => !option.disabled);
    if (firstEnabled && onChange) {
      event.preventDefault?.();
      onChange(firstEnabled.value, firstEnabled, event);
      onOpenChange?.(false, event);
    }
  }
}

function focusFirstOption(input) {
  const listbox = input?.parentNode?.querySelector?.('[role="listbox"]');
  const option = listbox?.querySelector?.(
    '[role="option"]:not([disabled]):not([aria-disabled="true"])',
  );
  option?.focus?.();
}

function normalizeOption(option) {
  if (
    option === null ||
    option === undefined ||
    typeof option === "string" ||
    typeof option === "number"
  ) {
    return { label: String(option), value: option };
  }

  return {
    ...option,
    label: option.label ?? String(option.value ?? ""),
    value: option.value ?? option.label,
  };
}

function defaultOptionLabel(option) {
  return option.label ?? String(option.value ?? "");
}

function defaultFilter(option, query) {
  if (!query) return true;
  const haystack = `${option.label} ${option.description || ""}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}
