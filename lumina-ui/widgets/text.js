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
  if (content instanceof Node) children.push(content);
  else if (Array.isArray(content))
    content.forEach((c) =>
      children.push(c instanceof Node ? c : String(c ?? "")),
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
  return Text(content, { size: 12, color: "#666", ...props });
}
