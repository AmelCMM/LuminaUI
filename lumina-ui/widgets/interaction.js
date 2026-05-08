import {
  cleanStyle,
  luminaTheme,
  normalizeWidgetArgs,
  omitProps,
  px,
} from "./utils.js";

export function GestureDetector(
  propsOrChildren = {},
  maybeChildren = undefined,
) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: "div",
    props: {
      ...omitProps(props, [
        "onTap",
        "onDoubleTap",
        "onLongPress",
        "onPanStart",
        "onPanUpdate",
        "onPanEnd",
        "radius",
      ]),
      onClick: props.onTap,
      onDoubleClick: props.onDoubleTap,
      onPointerDown: props.onPanStart || props.onLongPress,
      onPointerMove: props.onPanUpdate,
      onPointerUp: props.onPanEnd,
      style: cleanStyle({
        touchAction: props.touchAction || "manipulation",
        cursor: props.cursor || (props.onTap ? "pointer" : undefined),
        borderRadius: px(props.radius),
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function AbsorbPointer(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const absorb = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };
  const absorbing = props.absorbing !== false;

  return {
    tag: "div",
    props: {
      ...omitProps(props, ["absorbing"]),
      style: cleanStyle({
        pointerEvents: absorbing ? "auto" : undefined,
        opacity: absorbing && props.dim ? 0.62 : undefined,
        ...props.style,
      }),
      onClick: absorbing ? absorb : props.onClick,
      onPointerDown: absorbing ? absorb : props.onPointerDown,
      onPointerUp: absorbing ? absorb : props.onPointerUp,
      onPointerMove: absorbing ? absorb : props.onPointerMove,
    },
    children,
    key: props.key,
  };
}

export function IgnorePointer(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: "div",
    props: {
      ...omitProps(props, ["ignoring"]),
      style: cleanStyle({
        pointerEvents: props.ignoring === false ? undefined : "none",
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function Dismissible(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  let startX = 0;
  let startY = 0;
  const threshold = props.threshold ?? 80;

  return {
    tag: "div",
    props: {
      ...omitProps(props, ["direction", "onDismissed", "threshold", "radius"]),
      tabIndex: props.tabIndex ?? 0,
      onClick: props.onClick,
      onPointerDown: (event) => {
        startX = event.clientX ?? 0;
        startY = event.clientY ?? 0;
        if (props.onPointerDown) props.onPointerDown(event);
      },
      onPointerUp: (event) => {
        const dx = (event.clientX ?? 0) - startX;
        const dy = (event.clientY ?? 0) - startY;
        const horizontal = Math.abs(dx) >= threshold;
        const vertical = Math.abs(dy) >= threshold;
        const direction = props.direction || "horizontal";
        const dismissed =
          direction === "any" ||
          (direction === "horizontal" && horizontal) ||
          (direction === "vertical" && vertical) ||
          (direction === "startToEnd" && dx >= threshold) ||
          (direction === "endToStart" && dx <= -threshold);
        if (dismissed && props.onDismissed) props.onDismissed(event);
        if (props.onPointerUp) props.onPointerUp(event);
      },
      onKeyDown: (event) => {
        if (event.key === "Delete" || event.key === "Backspace") {
          if (props.onDismissed) props.onDismissed(event);
        }
        if (props.onKeyDown) props.onKeyDown(event);
      },
      style: cleanStyle({
        touchAction: "pan-y",
        borderRadius: px(props.radius),
        transition: `opacity ${luminaTheme.transition}, transform ${luminaTheme.transition}, box-shadow ${luminaTheme.transition}`,
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function Draggable(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: "div",
    props: {
      ...omitProps(props, ["data", "onDragStarted", "onDragCompleted", "radius"]),
      draggable: true,
      onDragStart: (event) => {
        if (event.dataTransfer && props.data !== undefined) {
          event.dataTransfer.setData("text/plain", JSON.stringify(props.data));
        }
        if (props.onDragStarted) props.onDragStarted(event);
      },
      onDragEnd: props.onDragCompleted,
      style: cleanStyle({
        cursor: "grab",
        width: px(props.width),
        height: px(props.height),
        borderRadius: px(props.radius),
        transition: `box-shadow ${luminaTheme.transition}, transform ${luminaTheme.transition}`,
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}

export function DragTarget(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: "div",
    props: {
      ...omitProps(props, ["onAccept", "onWillAccept", "radius"]),
      onDragOver: (event) => {
        if (!props.onWillAccept || props.onWillAccept(event) !== false) {
          event.preventDefault();
        }
      },
      onDrop: (event) => {
        event.preventDefault();
        let data = event.dataTransfer?.getData("text/plain");
        try {
          data = data ? JSON.parse(data) : data;
        } catch (e) {}
        if (props.onAccept) props.onAccept(data, event);
      },
      style: cleanStyle({
        borderRadius: px(props.radius),
        transition: `background-color ${luminaTheme.transition}, border-color ${luminaTheme.transition}`,
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}
