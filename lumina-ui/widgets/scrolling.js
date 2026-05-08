import {
  cleanStyle,
  edgeInsets,
  normalizeWidgetArgs,
  omitProps,
  px,
} from "./utils.js";

export function SingleChildScrollView(
  propsOrChildren = {},
  maybeChildren = undefined,
) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const direction = props.scrollDirection || props.direction || "vertical";
  const isHorizontal = direction === "horizontal";

  return {
    tag: "div",
    props: {
      ...omitProps(props, ["scrollDirection", "direction", "padding"]),
      style: cleanStyle({
        overflowX: isHorizontal ? "auto" : "hidden",
        overflowY: isHorizontal ? "hidden" : "auto",
        WebkitOverflowScrolling: "touch",
        maxWidth: "100%",
        maxHeight: props.maxHeight ? px(props.maxHeight) : undefined,
        padding: edgeInsets(props.padding),
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function ListView(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, givenChildren] = normalizeWidgetArgs(
    propsOrChildren,
    maybeChildren,
  );
  const {
    items = [],
    itemBuilder,
    separatorBuilder,
    direction = "vertical",
    gap = 0,
    padding,
    empty,
    style = {},
  } = props;
  const isHorizontal = direction === "horizontal";
  const children = givenChildren.length
    ? givenChildren
    : items.length
      ? items.flatMap((item, index) => {
          const child = itemBuilder ? itemBuilder(item, index) : item;
          if (!separatorBuilder || index === items.length - 1) return [child];
          return [child, separatorBuilder(item, index)];
        })
      : empty
        ? [empty]
        : [];

  return {
    tag: "div",
    props: {
      ...omitProps(props, [
        "items",
        "itemBuilder",
        "separatorBuilder",
        "direction",
        "gap",
        "padding",
        "empty",
      ]),
      style: cleanStyle({
        display: "flex",
        flexDirection: isHorizontal ? "row" : "column",
        gap: px(gap),
        overflowX: isHorizontal ? "auto" : "hidden",
        overflowY: isHorizontal ? "hidden" : "auto",
        WebkitOverflowScrolling: "touch",
        padding: edgeInsets(padding),
        ...style,
      }),
    },
    children,
    key: props.key,
  };
}

export function GridView(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, givenChildren] = normalizeWidgetArgs(
    propsOrChildren,
    maybeChildren,
  );
  const {
    items = [],
    itemBuilder,
    columns,
    minColumnWidth = 140,
    gap = 12,
    padding,
    empty,
    style = {},
  } = props;
  const children = givenChildren.length
    ? givenChildren
    : items.length
      ? items.map((item, index) => (itemBuilder ? itemBuilder(item, index) : item))
      : empty
        ? [empty]
        : [];

  return {
    tag: "div",
    props: {
      ...omitProps(props, [
        "items",
        "itemBuilder",
        "columns",
        "minColumnWidth",
        "gap",
        "padding",
        "empty",
      ]),
      style: cleanStyle({
        display: "grid",
        gridTemplateColumns: columns
          ? `repeat(${columns}, minmax(0, 1fr))`
          : `repeat(auto-fit, minmax(${px(minColumnWidth)}, 1fr))`,
        gap: px(gap),
        overflow: "auto",
        WebkitOverflowScrolling: "touch",
        padding: edgeInsets(padding),
        ...style,
      }),
    },
    children,
    key: props.key,
  };
}
