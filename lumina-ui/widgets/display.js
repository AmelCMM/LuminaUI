import {
  cleanStyle,
  normalizeWidgetArgs,
  omitProps,
  px,
} from "./utils.js";

const icons = {
  add: "+",
  remove: "-",
  close: "x",
  check: "v",
  search: "?",
  menu: "=",
  home: "^",
  settings: "*",
  person: "@",
  info: "i",
  warning: "!",
  error: "!",
  delete: "del",
  edit: "edit",
  save: "save",
  star: "*",
  favorite: "<3",
  arrowBack: "<",
  arrowForward: ">",
  play: ">",
  pause: "||",
};

export function Icon(propsOrName = {}, maybeProps = {}) {
  const props =
    typeof propsOrName === "string"
      ? { ...maybeProps, name: propsOrName }
      : propsOrName;
  const {
    name = "info",
    label,
    size = 24,
    color = "currentColor",
    style = {},
  } = props;

  return {
    tag: "span",
    props: {
      ...omitProps(props, ["name", "label", "size", "color"]),
      role: label ? "img" : undefined,
      "aria-label": label,
      "aria-hidden": label ? undefined : "true",
      style: cleanStyle({
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: px(size),
        height: px(size),
        color,
        fontSize: px(size),
        fontWeight: 700,
        lineHeight: 1,
        fontFamily: "system-ui, sans-serif",
        flexShrink: 0,
        ...style,
      }),
    },
    children: [icons[name] || name],
    key: props.key,
  };
}

export function Image(props = {}) {
  const {
    src,
    alt = "",
    width,
    height,
    fit = "cover",
    radius,
    loading = "lazy",
    style = {},
  } = props;

  return {
    tag: "img",
    props: {
      ...omitProps(props, ["src", "alt", "width", "height", "fit", "radius", "loading"]),
      src,
      alt,
      loading,
      style: cleanStyle({
        display: "block",
        width: px(width, "100%"),
        height: px(height, "auto"),
        objectFit: fit,
        borderRadius: px(radius),
        ...style,
      }),
    },
    children: [],
    key: props.key,
  };
}

export function CircleAvatar(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const {
    src,
    alt = "",
    initials,
    size = 40,
    backgroundColor = "#e5e7eb",
    color = "#111827",
    style = {},
  } = props;

  const content = src
    ? [
        Image({
          src,
          alt,
          width: "100%",
          height: "100%",
          fit: "cover",
        }),
      ]
    : children.length
      ? children
      : [String(initials || "?").slice(0, 2).toUpperCase()];

  return {
    tag: "div",
    props: {
      ...omitProps(props, [
        "src",
        "alt",
        "initials",
        "size",
        "backgroundColor",
        "color",
      ]),
      style: cleanStyle({
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: px(size),
        height: px(size),
        borderRadius: "50%",
        overflow: "hidden",
        backgroundColor,
        color,
        fontSize: px(Math.max(12, Number(size) * 0.38 || 16)),
        fontWeight: 700,
        flexShrink: 0,
        ...style,
      }),
    },
    children: content,
    key: props.key,
  };
}

export function Placeholder(props = {}) {
  const {
    width = "100%",
    height = 120,
    color = "#94a3b8",
    label = "Placeholder",
    style = {},
  } = props;

  return {
    tag: "div",
    props: {
      ...omitProps(props, ["width", "height", "color", "label"]),
      role: "img",
      "aria-label": label,
      style: cleanStyle({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: px(width),
        height: px(height),
        color,
        border: `1px dashed ${color}`,
        backgroundImage: `linear-gradient(135deg, transparent 48%, ${color} 49%, ${color} 51%, transparent 52%),
          linear-gradient(45deg, transparent 48%, ${color} 49%, ${color} 51%, transparent 52%)`,
        backgroundSize: "100% 100%",
        fontSize: "12px",
        fontWeight: 600,
        ...style,
      }),
    },
    children: [label],
    key: props.key,
  };
}

export function Badge(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const {
    label,
    color = "#ef4444",
    textColor = "#ffffff",
    alignment = "topRight",
    style = {},
  } = props;

  const position = {
    topRight: { top: 0, right: 0, transform: "translate(35%, -35%)" },
    topLeft: { top: 0, left: 0, transform: "translate(-35%, -35%)" },
    bottomRight: { right: 0, bottom: 0, transform: "translate(35%, 35%)" },
    bottomLeft: { left: 0, bottom: 0, transform: "translate(-35%, 35%)" },
  }[alignment] || {};

  return {
    tag: "span",
    props: {
      ...omitProps(props, ["label", "color", "textColor", "alignment"]),
      style: cleanStyle({
        display: "inline-flex",
        position: "relative",
        ...style,
      }),
    },
    children: [
      ...children,
      {
        tag: "span",
        props: {
          style: cleanStyle({
            position: "absolute",
            minWidth: label === undefined ? "10px" : "18px",
            height: label === undefined ? "10px" : "18px",
            padding: label === undefined ? 0 : "0 5px",
            borderRadius: "999px",
            backgroundColor: color,
            color: textColor,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 700,
            lineHeight: 1,
            ...position,
          }),
        },
        children: label === undefined ? [] : [label],
      },
    ],
    key: props.key,
  };
}

export function ClipRRect(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  return {
    tag: "div",
    props: {
      ...omitProps(props, ["radius"]),
      style: cleanStyle({
        overflow: "hidden",
        borderRadius: px(props.radius ?? 8),
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}
