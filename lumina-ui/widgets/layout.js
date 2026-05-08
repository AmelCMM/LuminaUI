import {
  alignmentStyle,
  cleanStyle,
  decorationStyle,
  edgeInsets,
  flexCrossAlignment,
  flexMainAlignment,
  normalizeWidgetArgs,
  px,
} from "./utils.js";

function layoutProps(props, omitted = []) {
  const omittedSet = new Set([
    "align",
    "alignment",
    "crossAxisAlignment",
    "mainAxisAlignment",
    "justifyContent",
    "gap",
    "padding",
    "margin",
    "width",
    "height",
    "minWidth",
    "minHeight",
    "maxWidth",
    "maxHeight",
    "color",
    "decoration",
    "child",
    "children",
    "style",
    "key",
    ...omitted,
  ]);

  return Object.fromEntries(
    Object.entries(props).filter(([key]) => !omittedSet.has(key)),
  );
}

function flexLayout(direction, fallbackCross, propsOrChildren, maybeChildren) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const {
    gap = 0,
    padding = 0,
    mainAxisAlignment,
    crossAxisAlignment,
    justifyContent,
    align,
    alignment,
    style = {},
  } = props;

  const finalStyle = cleanStyle({
    display: "flex",
    flexDirection: direction,
    gap: px(gap),
    padding: edgeInsets(padding),
    alignItems: flexCrossAlignment(
      crossAxisAlignment ?? align ?? alignment,
      fallbackCross,
    ),
    justifyContent: flexMainAlignment(
      mainAxisAlignment ?? justifyContent,
      "flex-start",
    ),
    ...style,
  });

  return {
    tag: "div",
    props: { ...layoutProps(props), style: finalStyle },
    children,
    key: props.key,
  };
}

export function Column(propsOrChildren = {}, maybeChildren = undefined) {
  return flexLayout("column", "stretch", propsOrChildren, maybeChildren);
}

export function Row(propsOrChildren = {}, maybeChildren = undefined) {
  return flexLayout("row", "center", propsOrChildren, maybeChildren);
}

export function Container(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const {
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    color,
    padding,
    margin,
    alignment,
    decoration,
    style = {},
  } = props;

  const alignmentStyles = alignment
    ? { display: "flex", ...alignmentStyle(alignment) }
    : {};

  const finalStyle = cleanStyle({
    width: px(width),
    height: px(height),
    minWidth: px(minWidth),
    minHeight: px(minHeight),
    maxWidth: px(maxWidth),
    maxHeight: px(maxHeight),
    backgroundColor: color,
    padding: edgeInsets(padding),
    margin: edgeInsets(margin),
    ...decorationStyle(decoration),
    ...alignmentStyles,
    ...style,
  });

  return {
    tag: "div",
    props: { ...layoutProps(props), style: finalStyle },
    children,
    key: props.key,
  };
}

export function Center(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const finalStyle = cleanStyle({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: props.width === undefined ? "100%" : px(props.width),
    height: props.height === undefined ? "100%" : px(props.height),
    ...props.style,
  });

  return {
    tag: "div",
    props: { ...layoutProps(props), style: finalStyle },
    children,
    key: props.key,
  };
}

export function Align(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const finalStyle = cleanStyle({
    display: "flex",
    ...alignmentStyle(props.alignment || "center"),
    width: props.widthFactor ? "fit-content" : px(props.width, "100%"),
    height: props.heightFactor ? "fit-content" : px(props.height, "100%"),
    ...props.style,
  });

  return {
    tag: "div",
    props: {
      ...layoutProps(props, ["widthFactor", "heightFactor"]),
      style: finalStyle,
    },
    children,
    key: props.key,
  };
}

export function Padding(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const finalStyle = cleanStyle({
    padding: edgeInsets(props.padding ?? 0),
    ...props.style,
  });

  return {
    tag: "div",
    props: { ...layoutProps(props), style: finalStyle },
    children,
    key: props.key,
  };
}

export function SizedBox(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const finalStyle = cleanStyle({
    width: px(props.width),
    height: px(props.height),
    display: children.length ? undefined : "block",
    flexShrink: 0,
    ...props.style,
  });

  return {
    tag: "div",
    props: { ...layoutProps(props), style: finalStyle },
    children,
    key: props.key,
  };
}

export function Flexible(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const flex = props.flex ?? 1;
  const fit = props.fit || "loose";
  const finalStyle = cleanStyle({
    flex: `${flex} ${fit === "tight" ? 1 : 0} ${fit === "tight" ? "0%" : "auto"}`,
    minWidth: 0,
    minHeight: 0,
    ...props.style,
  });

  return {
    tag: "div",
    props: { ...layoutProps(props, ["flex", "fit"]), style: finalStyle },
    children,
    key: props.key,
  };
}

export function Expanded(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  return Flexible({ ...props, fit: "tight" }, children);
}

export function Spacer(props = {}) {
  const flex = props.flex ?? 1;
  return {
    tag: "div",
    props: {
      ...layoutProps(props, ["flex"]),
      "aria-hidden": "true",
      style: cleanStyle({ flex: `${flex} 1 0%`, ...props.style }),
    },
    children: [],
    key: props.key,
  };
}

export function Wrap(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const finalStyle = cleanStyle({
    display: "flex",
    flexWrap: "wrap",
    flexDirection: props.direction === "vertical" ? "column" : "row",
    gap: px(props.gap ?? props.spacing ?? 0),
    alignItems: flexCrossAlignment(props.crossAxisAlignment, "flex-start"),
    justifyContent: flexMainAlignment(props.alignment, "flex-start"),
    ...props.style,
  });

  return {
    tag: "div",
    props: {
      ...layoutProps(props, ["direction", "spacing"]),
      style: finalStyle,
    },
    children,
    key: props.key,
  };
}

export function Stack(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const finalStyle = cleanStyle({
    position: "relative",
    width: px(props.width, "100%"),
    height: px(props.height, "auto"),
    overflow: props.clip === false ? "visible" : "hidden",
    ...props.style,
  });

  return {
    tag: "div",
    props: { ...layoutProps(props, ["clip"]), style: finalStyle },
    children,
    key: props.key,
  };
}

export function Positioned(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const finalStyle = cleanStyle({
    position: "absolute",
    top: px(props.top),
    right: px(props.right),
    bottom: px(props.bottom),
    left: px(props.left),
    width: px(props.width),
    height: px(props.height),
    ...props.style,
  });

  return {
    tag: "div",
    props: {
      ...layoutProps(props, ["top", "right", "bottom", "left"]),
      style: finalStyle,
    },
    children,
    key: props.key,
  };
}

export function Divider(props = {}) {
  const finalStyle = cleanStyle({
    width: props.direction === "vertical" ? px(props.thickness ?? 1) : "100%",
    height: props.direction === "vertical" ? "auto" : px(props.thickness ?? 1),
    minHeight:
      props.direction === "vertical" ? px(props.height, "100%") : undefined,
    border: "none",
    backgroundColor: props.color || "#e0e0e0",
    margin: edgeInsets(
      props.margin ?? (props.direction === "vertical" ? "0 8px" : "8px 0"),
    ),
    flexShrink: 0,
    ...props.style,
  });

  return {
    tag: "div",
    props: {
      ...layoutProps(props, ["direction", "thickness"]),
      role: props.role || "separator",
      style: finalStyle,
    },
    children: [],
    key: props.key,
  };
}

export function Card(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  return Container(
    {
      ...props,
      decoration: {
        color: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: props.radius ?? 8,
        boxShadow: props.elevation
          ? `0 ${props.elevation}px ${props.elevation * 4}px rgba(15, 23, 42, 0.12)`
          : "0 1px 2px rgba(15, 23, 42, 0.08)",
        ...(props.decoration || {}),
      },
      padding: props.padding ?? 16,
      style: props.style,
    },
    children,
  );
}

export function AspectRatio(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const ratio = props.aspectRatio ?? props.ratio ?? 1;

  return {
    tag: "div",
    props: {
      ...layoutProps(props, ["aspectRatio", "ratio"]),
      style: cleanStyle({
        aspectRatio: String(ratio),
        width: px(props.width, "100%"),
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function Baseline(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: "div",
    props: {
      ...layoutProps(props, ["baseline", "baselineType"]),
      style: cleanStyle({
        display: "inline-flex",
        alignItems: "baseline",
        lineHeight: px(props.baseline) || undefined,
        verticalAlign: props.baselineType || "baseline",
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function ConstrainedBox(
  propsOrChildren = {},
  maybeChildren = undefined,
) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const constraints = props.constraints || {};

  return {
    tag: "div",
    props: {
      ...layoutProps(props, ["constraints"]),
      style: cleanStyle({
        minWidth: px(props.minWidth ?? constraints.minWidth),
        minHeight: px(props.minHeight ?? constraints.minHeight),
        maxWidth: px(props.maxWidth ?? constraints.maxWidth),
        maxHeight: px(props.maxHeight ?? constraints.maxHeight),
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function DecoratedBox(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: "div",
    props: {
      ...layoutProps(props, ["position"]),
      style: cleanStyle({
        ...decorationStyle(props.decoration),
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function FractionallySizedBox(
  propsOrChildren = {},
  maybeChildren = undefined,
) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const align = alignmentStyle(props.alignment || "center");

  return {
    tag: "div",
    props: {
      ...layoutProps(props, ["widthFactor", "heightFactor"]),
      style: cleanStyle({
        display: "flex",
        ...align,
        width:
          props.widthFactor === undefined
            ? undefined
            : `${props.widthFactor * 100}%`,
        height:
          props.heightFactor === undefined
            ? undefined
            : `${props.heightFactor * 100}%`,
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function LayoutBuilder(props = {}) {
  const constraints = props.constraints || {};
  const child =
    typeof props.builder === "function"
      ? props.builder(constraints)
      : props.child;

  return {
    tag: "div",
    props: {
      ...layoutProps(props, ["builder", "constraints"]),
      style: cleanStyle({
        width: "100%",
        ...props.style,
      }),
    },
    children: child === undefined ? [] : [child],
    key: props.key,
  };
}

export function LimitedBox(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: "div",
    props: {
      ...layoutProps(props),
      style: cleanStyle({
        maxWidth: px(props.maxWidth),
        maxHeight: px(props.maxHeight),
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function Offstage(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: "div",
    props: {
      ...layoutProps(props, ["offstage"]),
      "aria-hidden": props.offstage ? "true" : undefined,
      style: cleanStyle({
        display: props.offstage ? "none" : undefined,
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function OverflowBox(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: "div",
    props: {
      ...layoutProps(props),
      style: cleanStyle({
        overflow: "visible",
        minWidth: px(props.minWidth),
        minHeight: px(props.minHeight),
        maxWidth: px(props.maxWidth),
        maxHeight: px(props.maxHeight),
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function RotatedBox(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const turns = props.quarterTurns ?? 0;

  return {
    tag: "div",
    props: {
      ...layoutProps(props, ["quarterTurns"]),
      style: cleanStyle({
        display: "inline-block",
        transform: `rotate(${turns * 90}deg)`,
        transformOrigin: "center",
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function SizedOverflowBox(
  propsOrChildren = {},
  maybeChildren = undefined,
) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: "div",
    props: {
      ...layoutProps(props, ["size"]),
      style: cleanStyle({
        width: px(props.width ?? props.size?.width),
        height: px(props.height ?? props.size?.height),
        overflow: "visible",
        position: "relative",
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function Transform(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const translate = props.translate
    ? `translate(${px(props.translate.x ?? 0)}, ${px(props.translate.y ?? 0)})`
    : "";
  const rotate = props.rotate === undefined ? "" : `rotate(${props.rotate})`;
  const scale = props.scale === undefined ? "" : `scale(${props.scale})`;
  const skew = props.skew
    ? `skew(${props.skew.x ?? 0}, ${props.skew.y ?? 0})`
    : "";

  return {
    tag: "div",
    props: {
      ...layoutProps(props, [
        "transform",
        "translate",
        "rotate",
        "scale",
        "skew",
        "origin",
      ]),
      style: cleanStyle({
        display: "inline-block",
        transform:
          props.transform || [translate, rotate, scale, skew].filter(Boolean).join(" "),
        transformOrigin: props.origin || "center",
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}
