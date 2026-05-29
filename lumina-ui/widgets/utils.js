export function isDomNode(value) {
  return typeof Node !== "undefined" && value instanceof Node;
}

export const luminaDefaultTheme = {
  colors: {
    primary: "#2563eb",
    primaryDark: "#1d4ed8",
    primarySoft: "rgba(37, 99, 235, 0.12)",
    danger: "#dc2626",
    dangerDark: "#b91c1c",
    dangerSoft: "rgba(220, 38, 38, 0.12)",
    surface: "#ffffff",
    surfaceMuted: "#f8fafc",
    surfaceRaised: "#ffffff",
    text: "#111827",
    muted: "#64748b",
    border: "#e5e7eb",
    borderStrong: "#cbd5e1",
    track: "#e2e8f0",
    shadow: "rgba(15, 23, 42, 0.12)",
    overlay: "rgba(15, 23, 42, 0.58)",
    focus: "rgba(37, 99, 235, 0.18)",
  },
  radius: {
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    pill: "999px",
  },
  shadow: {
    xs: "0 1px 2px rgba(15, 23, 42, 0.06)",
    sm: "0 8px 22px rgba(15, 23, 42, 0.08)",
    md: "0 18px 44px rgba(15, 23, 42, 0.14)",
    lg: "0 24px 70px rgba(15, 23, 42, 0.24)",
  },
  transition: "160ms ease",
};

function kebabCase(value) {
  return String(value).replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function cssVar(group, key, fallback) {
  return `var(--lumina-${group}-${kebabCase(key)}, ${fallback})`;
}

function tokenGroup(group, values) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, cssVar(group, key, value)]),
  );
}

export const luminaTheme = {
  colors: tokenGroup("color", luminaDefaultTheme.colors),
  radius: tokenGroup("radius", luminaDefaultTheme.radius),
  shadow: tokenGroup("shadow", luminaDefaultTheme.shadow),
  transition: `var(--lumina-transition, ${luminaDefaultTheme.transition})`,
};

export function createTheme(overrides = {}) {
  return {
    colors: {
      ...luminaDefaultTheme.colors,
      ...(overrides.colors || {}),
    },
    radius: {
      ...luminaDefaultTheme.radius,
      ...(overrides.radius || {}),
    },
    shadow: {
      ...luminaDefaultTheme.shadow,
      ...(overrides.shadow || {}),
    },
    transition: overrides.transition ?? luminaDefaultTheme.transition,
  };
}

export function themeToCssVariables(theme = {}) {
  const merged = createTheme(theme);
  const variables = {};

  Object.entries(merged.colors).forEach(([key, value]) => {
    variables[`--lumina-color-${kebabCase(key)}`] = value;
  });
  Object.entries(merged.radius).forEach(([key, value]) => {
    variables[`--lumina-radius-${kebabCase(key)}`] = value;
  });
  Object.entries(merged.shadow).forEach(([key, value]) => {
    variables[`--lumina-shadow-${kebabCase(key)}`] = value;
  });
  variables["--lumina-transition"] = merged.transition;

  return variables;
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
  if (typeof children === "function") return children;
  return Array.isArray(children) ? children : [children];
}

export function when(condition, factory) {
  return condition ? factory() : null;
}

export function normalizeWidgetArgs(
  propsOrChildren = {},
  maybeChildren = undefined,
) {
  if (isRenderable(propsOrChildren)) {
    return [{}, childrenOf(propsOrChildren)];
  }

  const props = propsOrChildren || {};
  const propChildren = props.child !== undefined ? props.child : props.children;
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

export function fieldStyle(style = {}) {
  return cleanStyle({
    width: "100%",
    minHeight: "38px",
    padding: "9px 12px",
    borderRadius: luminaTheme.radius.md,
    border: `1px solid ${luminaTheme.colors.borderStrong}`,
    backgroundColor: luminaTheme.colors.surface,
    color: luminaTheme.colors.text,
    font: "inherit",
    fontSize: "14px",
    outline: "none",
    transition: `border-color ${luminaTheme.transition}, box-shadow ${luminaTheme.transition}, background-color ${luminaTheme.transition}`,
    boxShadow: "0 1px 1px rgba(15, 23, 42, 0.03)",
    ...style,
  });
}

export function applyFieldFocus(event, style = {}) {
  event.target.style.borderColor =
    style.borderColor || luminaTheme.colors.primary;
  event.target.style.boxShadow =
    style.boxShadow || `0 0 0 3px ${luminaTheme.colors.focus}`;
}

export function clearFieldFocus(event, style = {}) {
  event.target.style.borderColor =
    style.borderColor || luminaTheme.colors.borderStrong;
  event.target.style.boxShadow =
    style.boxShadow || "0 1px 1px rgba(15, 23, 42, 0.03)";
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

export function upsertGlobalStyle(id, css) {
  if (
    typeof document === "undefined" ||
    !document.head ||
    typeof document.getElementById !== "function"
  ) {
    return;
  }

  const existing = document.getElementById(id);
  if (existing) {
    existing.textContent = css;
    return;
  }

  ensureGlobalStyle(id, css);
}
