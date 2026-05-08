export function isDomNode(value) {
  return typeof Node !== "undefined" && value instanceof Node;
}

export function isVNode(value) {
  return value && typeof value === "object" && typeof value.tag === "string";
}

export function isRenderable(value) {
  return (
    value === null ||
    value === undefined ||
    Array.isArray(value) ||
    isDomNode(value) ||
    isVNode(value) ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "function"
  );
}

export function childrenOf(children) {
  if (children === null || children === undefined) return [];
  return Array.isArray(children) ? children : [children];
}

export function normalizeWidgetArgs(propsOrChildren = {}, maybeChildren = undefined) {
  if (isRenderable(propsOrChildren)) {
    return [{}, childrenOf(propsOrChildren)];
  }

  const props = propsOrChildren || {};
  const propChildren =
    props.child !== undefined ? props.child : props.children;
  const children =
    propChildren !== undefined && maybeChildren === undefined
      ? propChildren
      : maybeChildren;

  return [props, childrenOf(children)];
}

export function px(value, fallback = undefined) {
  if (value === undefined || value === null) return fallback;
  return typeof value === "number" ? `${value}px` : value;
}

export function edgeInsets(value, fallback = undefined) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "number" || typeof value === "string") return px(value);

  const all = value.all;
  const vertical = value.vertical ?? all ?? 0;
  const horizontal = value.horizontal ?? all ?? 0;

  return [
    px(value.top ?? vertical),
    px(value.right ?? horizontal),
    px(value.bottom ?? vertical),
    px(value.left ?? horizontal),
  ].join(" ");
}

export function flexMainAlignment(value, fallback = "flex-start") {
  const map = {
    start: "flex-start",
    end: "flex-end",
    center: "center",
    spaceBetween: "space-between",
    "space-between": "space-between",
    spaceAround: "space-around",
    "space-around": "space-around",
    spaceEvenly: "space-evenly",
    "space-evenly": "space-evenly",
  };

  return map[value] || value || fallback;
}

export function flexCrossAlignment(value, fallback = "stretch") {
  const map = {
    start: "flex-start",
    end: "flex-end",
    center: "center",
    stretch: "stretch",
    baseline: "baseline",
  };

  return map[value] || value || fallback;
}

export function alignmentStyle(alignment = "center") {
  const map = {
    center: ["center", "center"],
    topCenter: ["center", "flex-start"],
    bottomCenter: ["center", "flex-end"],
    centerLeft: ["flex-start", "center"],
    centerRight: ["flex-end", "center"],
    topLeft: ["flex-start", "flex-start"],
    topRight: ["flex-end", "flex-start"],
    bottomLeft: ["flex-start", "flex-end"],
    bottomRight: ["flex-end", "flex-end"],
    start: ["flex-start", "center"],
    end: ["flex-end", "center"],
  };

  const [justifyContent, alignItems] = map[alignment] || map.center;
  return { justifyContent, alignItems };
}

export function decorationStyle(decoration = {}) {
  if (!decoration || typeof decoration !== "object") return {};

  return {
    backgroundColor: decoration.color,
    border: decoration.border,
    borderRadius: px(decoration.borderRadius),
    boxShadow: decoration.boxShadow,
    backgroundImage: decoration.gradient,
  };
}

export function cleanStyle(style) {
  return Object.fromEntries(
    Object.entries(style || {}).filter(([, value]) => value !== undefined),
  );
}

export function omitProps(props = {}, omitted = []) {
  const omittedSet = new Set(["child", "children", "style", "key", ...omitted]);
  return Object.fromEntries(
    Object.entries(props).filter(([key]) => !omittedSet.has(key)),
  );
}

export function ensureGlobalStyle(id, css) {
  if (
    typeof document === "undefined" ||
    !document.head ||
    typeof document.getElementById !== "function" ||
    document.getElementById(id)
  ) {
    return;
  }

  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}
