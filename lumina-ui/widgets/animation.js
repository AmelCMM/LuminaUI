import {
  cleanStyle,
  normalizeWidgetArgs,
  omitProps,
  px,
} from "./utils.js";

function transition(duration = 200, curve = "ease", properties = "all") {
  return `${properties} ${duration}ms ${curve}`;
}

export function AnimatedContainer(
  propsOrChildren = {},
  maybeChildren = undefined,
) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: "div",
    props: {
      ...omitProps(props, ["duration", "curve", "transition"]),
      style: cleanStyle({
        transition: props.transition || transition(props.duration, props.curve),
        width: px(props.width),
        height: px(props.height),
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function AnimatedOpacity(
  propsOrChildren = {},
  maybeChildren = undefined,
) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: "div",
    props: {
      ...omitProps(props, ["opacity", "duration", "curve"]),
      style: cleanStyle({
        opacity: props.opacity ?? 1,
        transition: transition(props.duration, props.curve, "opacity"),
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function AnimatedScale(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: "div",
    props: {
      ...omitProps(props, ["scale", "duration", "curve", "origin"]),
      style: cleanStyle({
        transform: `scale(${props.scale ?? 1})`,
        transformOrigin: props.origin || "center",
        transition: transition(props.duration, props.curve, "transform"),
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function AnimatedSlide(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const offset = props.offset || { x: 0, y: 0 };

  return {
    tag: "div",
    props: {
      ...omitProps(props, ["offset", "duration", "curve"]),
      style: cleanStyle({
        transform: `translate(${px(offset.x ?? 0)}, ${px(offset.y ?? 0)})`,
        transition: transition(props.duration, props.curve, "transform"),
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function AnimatedSwitcher({
  child,
  duration = 180,
  curve = "ease",
  style = {},
  ...props
}) {
  return {
    tag: "div",
    props: {
      ...props,
      style: cleanStyle({
        transition: transition(duration, curve, "opacity, transform"),
        ...style,
      }),
    },
    children: [child],
    key: props.key,
  };
}
