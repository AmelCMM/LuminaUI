import {
  cleanStyle,
  luminaTheme,
  normalizeWidgetArgs,
  omitProps,
  px,
} from "./utils.js";

export function Scaffold(props = {}) {
  const children = [
    props.appBar || null,
    {
      tag: "main",
      props: {
        style: cleanStyle({
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          color: luminaTheme.colors.text,
          ...props.bodyStyle,
        }),
      },
      children: props.body ? [props.body] : [],
    },
    props.bottomNavigationBar || null,
    props.drawer || null,
  ];

  return {
    tag: "div",
    props: {
      ...omitProps(props, [
        "appBar",
        "body",
        "bottomNavigationBar",
        "drawer",
        "bodyStyle",
      ]),
      style: cleanStyle({
        display: "flex",
        flexDirection: "column",
        minHeight: px(props.minHeight, "100%"),
        backgroundColor: props.backgroundColor || "transparent",
        color: luminaTheme.colors.text,
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function AppBar(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: "header",
    props: {
      ...omitProps(props, ["title", "leading", "actions", "height"]),
      style: cleanStyle({
        minHeight: px(props.height ?? 56),
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "0 16px",
        borderBottom: `1px solid ${luminaTheme.colors.border}`,
        backgroundColor: luminaTheme.colors.surface,
        color: luminaTheme.colors.text,
        boxShadow: luminaTheme.shadow.xs,
        ...props.style,
      }),
    },
    children: children.length
      ? children
      : [
          props.leading || null,
          {
            tag: "div",
            props: {
              style: {
                flex: 1,
                minWidth: 0,
                fontSize: "18px",
                fontWeight: 800,
              },
            },
            children: [props.title || ""],
          },
          ...(props.actions || []),
        ],
    key: props.key,
  };
}

export function TabBar({
  tabs = [],
  value,
  onChange,
  color = luminaTheme.colors.primary,
  style = {},
  ...props
}) {
  return {
    tag: "div",
    props: {
      ...props,
      role: "tablist",
      style: cleanStyle({
        display: "flex",
        gap: "4px",
        borderBottom: `1px solid ${luminaTheme.colors.border}`,
        ...style,
      }),
    },
    children: tabs.map((tab, index) => {
      const selected = value === tab.value || value === index;
      return {
        tag: "button",
        props: {
          key: tab.value ?? index,
          role: "tab",
          "aria-selected": selected,
          type: "button",
          onClick: () => {
            if (onChange) onChange(tab.value ?? index);
          },
          style: cleanStyle({
            appearance: "none",
            border: "1px solid transparent",
            borderBottom: `2px solid ${selected ? color : "transparent"}`,
            borderRadius: "8px 8px 0 0",
            backgroundColor: selected ? luminaTheme.colors.primarySoft : "transparent",
            color: selected ? color : luminaTheme.colors.muted,
            padding: "10px 12px",
            font: "inherit",
            fontWeight: selected ? 800 : 600,
            cursor: "pointer",
            transition: `background-color ${luminaTheme.transition}, color ${luminaTheme.transition}, border-color ${luminaTheme.transition}`,
          }),
        },
        children: [tab.label],
        key: tab.value ?? index,
      };
    }),
    key: props.key,
  };
}

export function TabBarView({ tabs = [], value, style = {}, ...props }) {
  const active =
    tabs.find((tab, index) => tab.value === value || index === value) ||
    tabs[0];

  return {
    tag: "div",
    props: {
      ...props,
      style: cleanStyle({
        minWidth: 0,
        minHeight: 0,
        ...style,
      }),
    },
    children: active ? [active.child] : [],
    key: props.key,
  };
}

export function BottomNavigationBar({
  items = [],
  value,
  onChange,
  color = luminaTheme.colors.primary,
  style = {},
  ...props
}) {
  return {
    tag: "nav",
    props: {
      ...props,
      "aria-label": props["aria-label"] || "Bottom navigation",
      style: cleanStyle({
        display: "grid",
        gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, 1fr)`,
        borderTop: `1px solid ${luminaTheme.colors.border}`,
        backgroundColor: luminaTheme.colors.surface,
        boxShadow: "0 -1px 2px rgba(15, 23, 42, 0.04)",
        ...style,
      }),
    },
    children: items.map((item, index) => {
      const selected = value === item.value || value === index;
      return {
        tag: "button",
        props: {
          key: item.value ?? index,
          type: "button",
          "aria-current": selected ? "page" : undefined,
          onClick: () => {
            if (onChange) onChange(item.value ?? index);
          },
          style: cleanStyle({
            border: "none",
            borderRadius: luminaTheme.radius.md,
            backgroundColor: selected ? luminaTheme.colors.primarySoft : "transparent",
            color: selected ? color : luminaTheme.colors.muted,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            padding: "10px 8px",
            font: "inherit",
            fontSize: "12px",
            fontWeight: selected ? 800 : 600,
            cursor: "pointer",
            transition: `background-color ${luminaTheme.transition}, color ${luminaTheme.transition}`,
          }),
        },
        children: [item.icon || null, item.label],
        key: item.value ?? index,
      };
    }),
    key: props.key,
  };
}

export function Drawer(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  if (props.open === false) return null;

  return {
    tag: "aside",
    props: {
      ...omitProps(props, ["open", "width"]),
      style: cleanStyle({
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: props.zIndex ?? 1000,
        width: px(props.width ?? 300),
        maxWidth: "86vw",
        backgroundColor: luminaTheme.colors.surface,
        borderRight: `1px solid ${luminaTheme.colors.border}`,
        boxShadow: luminaTheme.shadow.lg,
        transform: props.open === false ? "translateX(-100%)" : "translateX(0)",
        transition: "transform 180ms ease",
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function NavigationRail({
  items = [],
  value,
  onChange,
  color = luminaTheme.colors.primary,
  style = {},
  ...props
}) {
  return {
    tag: "nav",
    props: {
      ...props,
      "aria-label": props["aria-label"] || "Navigation rail",
      style: cleanStyle({
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        width: px(props.width ?? 88),
        padding: "8px",
        borderRight: `1px solid ${luminaTheme.colors.border}`,
        backgroundColor: luminaTheme.colors.surface,
        ...style,
      }),
    },
    children: items.map((item, index) => {
      const selected = value === item.value || value === index;
      return {
        tag: "button",
        props: {
          key: item.value ?? index,
          type: "button",
          onClick: () => {
            if (onChange) onChange(item.value ?? index);
          },
          style: cleanStyle({
            border: "none",
            borderRadius: luminaTheme.radius.md,
            backgroundColor: selected ? luminaTheme.colors.primarySoft : "transparent",
            color: selected ? color : luminaTheme.colors.muted,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            padding: "10px 6px",
            font: "inherit",
            fontSize: "12px",
            fontWeight: selected ? 800 : 600,
            cursor: "pointer",
            transition: `background-color ${luminaTheme.transition}, color ${luminaTheme.transition}`,
          }),
        },
        children: [item.icon || null, item.label],
        key: item.value ?? index,
      };
    }),
    key: props.key,
  };
}
