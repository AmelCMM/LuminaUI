import {
  cleanStyle,
  edgeInsets,
  luminaTheme,
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
        scrollbarWidth: "thin",
        scrollbarColor: `${luminaTheme.colors.borderStrong} transparent`,
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
        scrollbarWidth: "thin",
        scrollbarColor: `${luminaTheme.colors.borderStrong} transparent`,
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
        scrollbarWidth: "thin",
        scrollbarColor: `${luminaTheme.colors.borderStrong} transparent`,
        ...style,
      }),
    },
    children,
    key: props.key,
  };
}

export function CustomScrollView(
  propsOrChildren = {},
  maybeChildren = undefined,
) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: "div",
    props: {
      ...omitProps(props, ["slivers", "direction", "padding"]),
      style: cleanStyle({
        display: "flex",
        flexDirection: props.direction === "horizontal" ? "row" : "column",
        overflow: "auto",
        WebkitOverflowScrolling: "touch",
        scrollBehavior: props.smooth ? "smooth" : undefined,
        padding: edgeInsets(props.padding),
        scrollbarWidth: "thin",
        scrollbarColor: `${luminaTheme.colors.borderStrong} transparent`,
        ...props.style,
      }),
    },
    children: children.length ? children : props.slivers || [],
    key: props.key,
  };
}

export function NestedScrollView(props = {}) {
  return {
    tag: "div",
    props: {
      ...omitProps(props, ["header", "body"]),
      style: cleanStyle({
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "thin",
        scrollbarColor: `${luminaTheme.colors.borderStrong} transparent`,
        ...props.style,
      }),
    },
    children: [props.header || null, props.body || null],
    key: props.key,
  };
}

export function PageView(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, givenChildren] = normalizeWidgetArgs(
    propsOrChildren,
    maybeChildren,
  );
  const children = givenChildren.length ? givenChildren : props.pages || [];
  const isVertical = props.direction === "vertical";

  return {
    tag: "div",
    props: {
      ...omitProps(props, ["pages", "direction", "gap"]),
      style: cleanStyle({
        display: "flex",
        flexDirection: isVertical ? "column" : "row",
        overflow: "auto",
        scrollSnapType: isVertical ? "y mandatory" : "x mandatory",
        WebkitOverflowScrolling: "touch",
        gap: px(props.gap ?? 0),
        scrollbarWidth: "thin",
        scrollbarColor: `${luminaTheme.colors.borderStrong} transparent`,
        ...props.style,
      }),
    },
    children: children.map((child, index) => ({
      tag: "div",
      props: {
        key: child?.key ?? index,
        style: {
          flex: "0 0 100%",
          scrollSnapAlign: "start",
        },
      },
      children: [child],
      key: child?.key ?? index,
    })),
    key: props.key,
  };
}

export function SliverAppBar(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: "header",
    props: {
      ...omitProps(props, ["title", "expandedHeight", "floating", "pinned"]),
      style: cleanStyle({
        position: props.pinned || props.floating ? "sticky" : undefined,
        top: props.pinned || props.floating ? 0 : undefined,
        zIndex: props.pinned || props.floating ? 10 : undefined,
        minHeight: px(props.expandedHeight ?? 56),
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        backgroundColor: luminaTheme.colors.surface,
        borderBottom: `1px solid ${luminaTheme.colors.border}`,
        boxShadow: luminaTheme.shadow.xs,
        ...props.style,
      }),
    },
    children: children.length ? children : [props.title || ""],
    key: props.key,
  };
}

export function SliverList(propsOrChildren = {}, maybeChildren = undefined) {
  return ListView(propsOrChildren, maybeChildren);
}

export function SliverGrid(propsOrChildren = {}, maybeChildren = undefined) {
  return GridView(propsOrChildren, maybeChildren);
}

export function SliverPadding(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: "div",
    props: {
      ...omitProps(props, ["padding"]),
      style: cleanStyle({
        padding: edgeInsets(props.padding ?? 0),
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function SliverToBoxAdapter(
  propsOrChildren = {},
  maybeChildren = undefined,
) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: "div",
    props: {
      ...omitProps(props),
      style: cleanStyle(props.style),
    },
    children,
    key: props.key,
  };
}
