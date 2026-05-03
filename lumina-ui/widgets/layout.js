function filterLayoutProps(props = {}, allowed = []) {
  const out = {};
  allowed.forEach((k) => {
    if (props[k] !== undefined) out[k] = props[k];
  });
  return out;
}

export function Column(props = {}, children = []) {
  const childrenArray = Array.isArray(children) ? children : [children];
  const gap = props.gap ?? 0;
  const padding = props.padding ?? 0;

  const style = {
    display: "flex",
    flexDirection: "column",
    gap: typeof gap === "number" ? `${gap}px` : gap,
    padding: typeof padding === "number" ? `${padding}px` : padding,
    alignItems: props.align || props.alignment || "stretch",
    justifyContent: props.justifyContent || "flex-start",
    ...props.style,
  };

  const safe = filterLayoutProps(props, [
    "id",
    "style",
    "className",
    "role",
    "aria-label",
  ]);

  return { tag: "div", props: { style, ...safe }, children: childrenArray };
}

export function Row(props = {}, children = []) {
  const childrenArray = Array.isArray(children) ? children : [children];
  const gap = props.gap ?? 0;
  const padding = props.padding ?? 0;

  const style = {
    display: "flex",
    flexDirection: "row",
    gap: typeof gap === "number" ? `${gap}px` : gap,
    padding: typeof padding === "number" ? `${padding}px` : padding,
    alignItems: props.align || props.alignment || "center",
    justifyContent: props.justifyContent || "flex-start",
    ...props.style,
  };

  const safe = filterLayoutProps(props, [
    "id",
    "style",
    "className",
    "role",
    "aria-label",
  ]);

  return { tag: "div", props: { style, ...safe }, children: childrenArray };
}

export function Container(props = {}, children = []) {
  const childrenArray = Array.isArray(children) ? children : [children];
  const style = { ...(props.style || {}) };

  if (props.width)
    style.width =
      typeof props.width === "number" ? `${props.width}px` : props.width;
  if (props.height)
    style.height =
      typeof props.height === "number" ? `${props.height}px` : props.height;
  if (props.color) style.backgroundColor = props.color;
  if (props.padding)
    style.padding =
      typeof props.padding === "number" ? `${props.padding}px` : props.padding;
  if (props.margin)
    style.margin =
      typeof props.margin === "number" ? `${props.margin}px` : props.margin;

  const safe = {
    ...filterLayoutProps(props, [
      "id",
      "style",
      "className",
      "role",
      "aria-label",
    ]),
    style,
  };

  return { tag: "div", props: safe, children: childrenArray };
}

export function Center(props = {}, children = []) {
  const childrenArray = Array.isArray(children) ? children : [children];
  const style = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    ...(props.style || {}),
  };
  const safe = filterLayoutProps(props, [
    "id",
    "style",
    "className",
    "role",
    "aria-label",
  ]);
  return { tag: "div", props: { style, ...safe }, children: childrenArray };
}

export function Expanded(props = {}, children = []) {
  const childrenArray = Array.isArray(children) ? children : [children];
  const style = { flex: props.flex ?? 1, ...(props.style || {}) };
  const safe = filterLayoutProps(props, [
    "id",
    "style",
    "className",
    "role",
    "aria-label",
  ]);
  return { tag: "div", props: { style, ...safe }, children: childrenArray };
}

export function Padding(props = {}, children = []) {
  const childrenArray = Array.isArray(children) ? children : [children];
  const pad = props.padding ?? 0;
  const style = {
    padding: typeof pad === "number" ? `${pad}px` : pad,
    ...(props.style || {}),
  };
  const safe = filterLayoutProps(props, [
    "id",
    "style",
    "className",
    "role",
    "aria-label",
  ]);
  return { tag: "div", props: { style, ...safe }, children: childrenArray };
}
