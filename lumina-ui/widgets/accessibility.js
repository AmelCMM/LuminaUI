import { cleanStyle, normalizeWidgetArgs, omitProps } from "./utils.js";

export function Semantics(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: props.as || "div",
    props: {
      ...omitProps(props, [
        "as",
        "label",
        "hint",
        "role",
        "hidden",
        "liveRegion",
      ]),
      role: props.role,
      "aria-label": props.label,
      "aria-description": props.hint,
      "aria-hidden": props.hidden ? "true" : undefined,
      "aria-live": props.liveRegion ? "polite" : undefined,
      style: cleanStyle(props.style),
    },
    children,
    key: props.key,
  };
}

export function ExcludeSemantics(
  propsOrChildren = {},
  maybeChildren = undefined,
) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: "div",
    props: {
      ...omitProps(props),
      "aria-hidden": "true",
      style: cleanStyle(props.style),
    },
    children,
    key: props.key,
  };
}
