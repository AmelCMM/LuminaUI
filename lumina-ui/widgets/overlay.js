import {
  cleanStyle,
  edgeInsets,
  ensureGlobalStyle,
  luminaTheme,
  normalizeWidgetArgs,
  omitProps,
  px,
} from "./utils.js";

function ensureOverlayStyles() {
  ensureGlobalStyle(
    "lumina-overlay-styles",
    `
.lumina-menu-item:not(:disabled):hover,
.lumina-popup-button:not(:disabled):hover {
  background-color: ${luminaTheme.colors.primarySoft};
}
.lumina-menu-item:focus-visible,
.lumina-popup-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px ${luminaTheme.colors.focus};
}
`,
  );
}

export function Overlay(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  if (props.open === false && !props.keepMounted) return null;

  const {
    modal = false,
    scrim = modal,
    closeOnBackdrop = true,
    onDismiss,
    placement = "center",
    panel = true,
    padding = 16,
    zIndex = 1300,
    style = {},
    panelStyle = {},
  } = props;
  const hidden = props.open === false;

  return {
    tag: "div",
    props: {
      ...omitProps(props, [
        "open",
        "keepMounted",
        "modal",
        "scrim",
        "closeOnBackdrop",
        "onDismiss",
        "placement",
        "panel",
        "padding",
        "zIndex",
        "panelStyle",
        "panelRole",
        "closeOnEscape",
      ]),
      role: props.role || (modal ? "presentation" : undefined),
      "aria-hidden": hidden ? "true" : undefined,
      style: cleanStyle({
        position: "fixed",
        inset: 0,
        zIndex,
        display: hidden ? "none" : "flex",
        pointerEvents: hidden ? "none" : "auto",
        padding: edgeInsets(padding),
        ...overlayPlacement(placement),
        ...style,
      }),
    },
    children: [
      scrim
        ? {
            tag: "div",
            props: {
              "aria-hidden": "true",
              onClick: (event) => {
                if (closeOnBackdrop && onDismiss) onDismiss(event);
              },
              style: {
                position: "absolute",
                inset: 0,
                backgroundColor: luminaTheme.colors.overlay,
              },
            },
            children: [],
          }
        : null,
      panel
        ? {
            tag: "div",
            props: {
              role: props.panelRole || (modal ? "dialog" : undefined),
              onClick: (event) => event.stopPropagation?.(),
              onKeyDown: (event) => {
                if (props.onKeyDown) props.onKeyDown(event);
                if (
                  event.key === "Escape" &&
                  props.closeOnEscape !== false &&
                  onDismiss
                ) {
                  onDismiss(event);
                }
              },
              style: cleanStyle({
                position: "relative",
                zIndex: 1,
                maxWidth: "min(92vw, 640px)",
                maxHeight: "calc(100vh - 32px)",
                overflow: "auto",
                borderRadius: luminaTheme.radius.lg,
                backgroundColor: luminaTheme.colors.surface,
                color: luminaTheme.colors.text,
                border: `1px solid ${luminaTheme.colors.border}`,
                boxShadow: "0 24px 60px rgba(15, 23, 42, 0.14)",
                ...panelStyle,
              }),
            },
            children,
          }
        : children,
    ],
    key: props.key,
  };
}

export function OverlayEntry(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  return Overlay({
    ...props,
    panel: false,
    children,
  });
}

export function Popover(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  if (props.open === false && !props.anchor) return null;

  const {
    anchor = null,
    content = children,
    open = true,
    placement = "bottom-start",
    offset = 8,
    width,
    minWidth = 220,
    zIndex = 1200,
    style = {},
    panelStyle = {},
  } = props;

  return {
    tag: "span",
    props: {
      ...omitProps(props, [
        "anchor",
        "content",
        "open",
        "placement",
        "offset",
        "width",
        "minWidth",
        "zIndex",
        "panelStyle",
        "closeOnEscape",
        "onDismiss",
        "onKeyDown",
        "role",
      ]),
      style: cleanStyle({
        position: "relative",
        display: "inline-flex",
        verticalAlign: "middle",
        ...style,
      }),
    },
    children: [
      anchor,
      open
        ? {
            tag: "div",
            props: {
              role: props.role || "dialog",
              onKeyDown: (event) => {
                if (props.onKeyDown) props.onKeyDown(event);
                if (
                  event.key === "Escape" &&
                  props.closeOnEscape !== false &&
                  props.onDismiss
                ) {
                  props.onDismiss(event);
                }
              },
              style: cleanStyle({
                position: "absolute",
                zIndex,
                minWidth: px(minWidth),
                width: px(width),
                borderRadius: luminaTheme.radius.md,
                backgroundColor: luminaTheme.colors.surface,
                color: luminaTheme.colors.text,
                border: `1px solid ${luminaTheme.colors.border}`,
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.10)",
                padding: "6px",
                ...popoverPlacement(placement, offset),
                ...panelStyle,
              }),
            },
            children: Array.isArray(content) ? content : [content],
          }
        : null,
    ],
    key: props.key,
  };
}

export function Menu(propsOrChildren = {}, maybeChildren = undefined) {
  ensureOverlayStyles();
  const [props, givenChildren] = normalizeWidgetArgs(
    propsOrChildren,
    maybeChildren,
  );
  const { items = [], onSelect, value, dense = false, style = {} } = props;
  const children = givenChildren.length
    ? givenChildren
    : items.map((item, index) =>
        item.separator
          ? MenuDivider({ key: item.key ?? `separator-${index}` })
          : MenuItem({
              ...item,
              key: item.key ?? item.value ?? index,
              selected: item.selected ?? item.value === value,
              dense,
              onSelect: (selectedValue, selectedItem, event) => {
                if (item.onSelect)
                  item.onSelect(selectedValue, selectedItem, event);
                if (onSelect) onSelect(selectedValue, selectedItem, event);
              },
            }),
      );

  return {
    tag: "div",
    props: {
      ...omitProps(props, ["items", "onSelect", "value", "dense"]),
      role: props.role || "menu",
      onKeyDown: (event) => {
        if (props.onKeyDown) props.onKeyDown(event);
        handleMenuKeyDown(event);
      },
      style: cleanStyle({
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        minWidth: "180px",
        color: luminaTheme.colors.text,
        borderRadius: luminaTheme.radius.md,
        border: `1px solid ${luminaTheme.colors.border}`,
        boxShadow: luminaTheme.shadow.sm,
        padding: "4px",
        ...style,
      }),
    },
    children,
    key: props.key,
  };
}

export function MenuItem({
  label,
  icon = null,
  trailing = null,
  value,
  item,
  selected = false,
  disabled = false,
  dense = false,
  danger = false,
  onSelect,
  style = {},
  ...props
} = {}) {
  ensureOverlayStyles();
  const finalItem = item || { label, value };

  return {
    tag: "button",
    props: {
      ...props,
      type: "button",
      role: props.role || "menuitem",
      disabled,
      "aria-disabled": disabled ? "true" : undefined,
      "aria-selected": selected ? "true" : undefined,
      onClick: (event) => {
        if (props.onClick) props.onClick(event);
        if (!event.defaultPrevented && !disabled && onSelect) {
          onSelect(value, finalItem, event);
        }
      },
      style: cleanStyle({
        width: "100%",
        display: "grid",
        gridTemplateColumns: `${icon ? "auto " : ""}1fr${trailing ? " auto" : ""}`,
        alignItems: "center",
        gap: "10px",
        minHeight: dense ? "32px" : "38px",
        padding: dense ? "6px 8px" : "8px 10px",
        border: "none",
        borderRadius: luminaTheme.radius.sm,
        backgroundColor: selected
          ? luminaTheme.colors.primarySoft
          : "transparent",
        color: danger ? luminaTheme.colors.danger : "inherit",
        font: "inherit",
        fontSize: "14px",
        fontWeight: selected ? 800 : 600,
        textAlign: "left",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.52 : 1,
        transition: `background-color ${luminaTheme.transition}, color ${luminaTheme.transition}`,
        ...style,
      }),
      className: ["lumina-menu-item", props.className]
        .filter(Boolean)
        .join(" "),
    },
    children: [icon, label ?? value, trailing],
    key: props.key,
  };
}

export function MenuDivider({ style = {}, ...props } = {}) {
  return {
    tag: "div",
    props: {
      ...props,
      role: "separator",
      style: cleanStyle({
        height: "1px",
        margin: "4px 2px",
        backgroundColor: luminaTheme.colors.border,
        ...style,
      }),
    },
    children: [],
    key: props.key,
  };
}

export function PopupMenuButton({
  open = false,
  onOpenChange,
  label = "Menu",
  items = [],
  onSelect,
  placement = "bottom-end",
  buttonStyle = {},
  menuStyle = {},
  ...props
} = {}) {
  ensureOverlayStyles();

  return Popover({
    open,
    placement,
    anchor: {
      tag: "button",
      props: {
        type: "button",
        "aria-haspopup": "menu",
        "aria-expanded": open ? "true" : "false",
        onClick: (event) => {
          if (props.onClick) props.onClick(event);
          if (!event.defaultPrevented && onOpenChange) onOpenChange(!open);
        },
        style: cleanStyle({
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          minHeight: "36px",
          padding: "8px 12px",
          borderRadius: luminaTheme.radius.md,
          border: `1px solid ${luminaTheme.colors.borderStrong}`,
          backgroundColor: open
            ? luminaTheme.colors.primarySoft
            : luminaTheme.colors.surface,
          color: luminaTheme.colors.text,
          boxShadow: luminaTheme.shadow.xs,
          font: "inherit",
          fontWeight: 700,
          cursor: "pointer",
          ...buttonStyle,
        }),
        className: ["lumina-popup-button", props.className]
          .filter(Boolean)
          .join(" "),
      },
      children: [label],
    },
    content: Menu({
      items,
      onSelect: (selectedValue, selectedItem, event) => {
        if (onSelect) onSelect(selectedValue, selectedItem, event);
        if (!event.defaultPrevented && onOpenChange) onOpenChange(false);
      },
      style: menuStyle,
    }),
    panelStyle: {
      padding: "6px",
      ...props.panelStyle,
    },
  });
}

function overlayPlacement(placement) {
  const placements = {
    center: { alignItems: "center", justifyContent: "center" },
    top: { alignItems: "flex-start", justifyContent: "center" },
    bottom: { alignItems: "flex-end", justifyContent: "center" },
    left: { alignItems: "center", justifyContent: "flex-start" },
    right: { alignItems: "center", justifyContent: "flex-end" },
    "top-left": { alignItems: "flex-start", justifyContent: "flex-start" },
    "top-right": { alignItems: "flex-start", justifyContent: "flex-end" },
    "bottom-left": { alignItems: "flex-end", justifyContent: "flex-start" },
    "bottom-right": { alignItems: "flex-end", justifyContent: "flex-end" },
  };

  return placements[placement] || placements.center;
}

function popoverPlacement(placement, offset) {
  const gap = px(offset);
  const placements = {
    "bottom-start": { top: `calc(100% + ${gap})`, left: 0 },
    "bottom-end": { top: `calc(100% + ${gap})`, right: 0 },
    bottom: {
      top: `calc(100% + ${gap})`,
      left: "50%",
      transform: "translateX(-50%)",
    },
    "top-start": { bottom: `calc(100% + ${gap})`, left: 0 },
    "top-end": { bottom: `calc(100% + ${gap})`, right: 0 },
    top: {
      bottom: `calc(100% + ${gap})`,
      left: "50%",
      transform: "translateX(-50%)",
    },
    "right-start": { left: `calc(100% + ${gap})`, top: 0 },
    "right-end": { left: `calc(100% + ${gap})`, bottom: 0 },
    right: {
      left: `calc(100% + ${gap})`,
      top: "50%",
      transform: "translateY(-50%)",
    },
    "left-start": { right: `calc(100% + ${gap})`, top: 0 },
    "left-end": { right: `calc(100% + ${gap})`, bottom: 0 },
    left: {
      right: `calc(100% + ${gap})`,
      top: "50%",
      transform: "translateY(-50%)",
    },
  };

  return placements[placement] || placements["bottom-start"];
}

function handleMenuKeyDown(event) {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  const root = event.currentTarget;
  const query = '[role="menuitem"]:not([disabled]):not([aria-disabled="true"])';
  if (!root?.querySelectorAll) return;

  const items = Array.from(root.querySelectorAll(query));
  if (!items.length) return;

  event.preventDefault?.();
  const active =
    typeof document !== "undefined" ? document.activeElement : null;
  const activeIndex = items.indexOf(active);
  const nextIndex =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? items.length - 1
        : event.key === "ArrowUp"
          ? Math.max(activeIndex - 1, 0)
          : Math.min(activeIndex + 1, items.length - 1);

  items[nextIndex]?.focus?.();
}
