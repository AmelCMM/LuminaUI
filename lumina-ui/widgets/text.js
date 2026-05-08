import { isVNode, luminaTheme } from "./utils.js";

export function Text(content = "", props = {}) {
  const {
    size,
    weight,
    align,
    color,
    lineHeight,
    maxLines,
    as,
    style: userStyle,
    ...rest
  } = props;

  const fontSize = typeof size === "number" ? `${size}px` : size || "14px";

  const style = {
    fontSize,
    fontWeight: weight || "normal",
    color: color || "inherit",
    textAlign: align || "left",
    margin: 0,
    lineHeight: lineHeight || "1.5",
    letterSpacing: "0",
    WebkitFontSmoothing: "antialiased",
    ...(userStyle || {}),
  };

  if (maxLines) {
    style.display = "-webkit-box";
    style.WebkitLineClamp = maxLines;
    style.WebkitBoxOrient = "vertical";
    style.overflow = "hidden";
  }

  const tag = as || "span";
  const safeProps = { style, ...rest };

  // Normalize content: preserve nodes if passed
  const children = [];
  const isNode = (value) => typeof Node !== "undefined" && value instanceof Node;

  if (isNode(content) || isVNode(content)) children.push(content);
  else if (Array.isArray(content))
    content.forEach((c) =>
      children.push(isNode(c) || isVNode(c) ? c : String(c ?? "")),
    );
  else children.push(String(content ?? ""));

  return { tag, props: safeProps, children };
}

export function Heading(props = {}, children = []) {
  const level = props.level ?? 1;
  const sizes = { 1: 32, 2: 28, 3: 24, 4: 20, 5: 18, 6: 16 };
  const content = Array.isArray(children) ? children : [children];
  return Text(content, {
    size: sizes[level] ?? 16,
    weight: "bold",
    as: `h${level}`,
    ...props,
  });
}

export function Caption(props = {}, children = []) {
  const content = Array.isArray(children) ? children : [children];
  return Text(content, { size: 12, color: luminaTheme.colors.muted, ...props });
}

export function DefaultTextStyle(props = {}, children = []) {
  const content = Array.isArray(children) ? children : [children];
  const {
    size,
    weight,
    color,
    align,
    lineHeight,
    style = {},
    ...rest
  } = props;

  return {
    tag: "div",
    props: {
      ...rest,
      style: {
        fontSize: typeof size === "number" ? `${size}px` : size,
        fontWeight: weight,
        color,
        textAlign: align,
        lineHeight,
        ...style,
      },
    },
    children: content,
    key: props.key,
  };
}

export function RichText({ spans = [], as = "span", style = {}, ...props } = {}) {
  return {
    tag: as,
    props: {
      ...props,
      style,
    },
    children: spans.map((span, index) => ({
      tag: span.as || "span",
      props: {
        key: span.key ?? index,
        style: span.style || {},
      },
      children: Array.isArray(span.children)
        ? span.children
        : [span.text ?? ""],
      key: span.key ?? index,
    })),
    key: props.key,
  };
}
