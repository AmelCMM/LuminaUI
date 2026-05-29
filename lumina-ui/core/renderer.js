import { createElement } from "./element.js";
import { captureRenderError } from "./errors.js";
import { addWrappedListener, removeWrappedListener, getWrappedHandler } from "./handlers.js";

// vnode shape: { tag, props, children, key }
// function widgets: (forceUpdate) => vnode

export function mount(componentFn, container) {
  let currentTree = null;
  let mounted = true;
  let rendering = false;
  let pendingRender = false;
  const cleanupFns = new Set();

  const forceUpdate = () => {
    if (!mounted) return;
    if (rendering) {
      pendingRender = true;
      return;
    }
    render();
  };
  forceUpdate.onUnmount = (cleanup) => {
    if (typeof cleanup !== "function") return () => {};
    cleanupFns.add(cleanup);
    return () => cleanupFns.delete(cleanup);
  };

  function render() {
    rendering = true;
    try {
      const rawTree =
        typeof componentFn === "function" ? componentFn(forceUpdate) : componentFn;
      const newTree = resolveWidget(rawTree, forceUpdate);
      if (!currentTree) {
        const dom = renderWidget(newTree, forceUpdate);
        container.innerHTML = "";
        container.appendChild(dom);
      } else if (isRootFragment(currentTree) || isRootFragment(newTree)) {
        const dom = renderWidget(newTree, forceUpdate);
        container.innerHTML = "";
        container.appendChild(dom);
      } else {
        patchWidget(container, currentTree, newTree, 0, null, forceUpdate);
      }
      currentTree = newTree;
    } catch (error) {
      console.error("[LuminaUI render error]", error);
      captureRenderError(error, { phase: "mount" });
      if (!currentTree) {
        const fallback = document.createComment(" render error ");
        container.innerHTML = "";
        container.appendChild(fallback);
        currentTree = { tag: "comment", children: [] };
      }
    } finally {
      rendering = false;
      if (pendingRender) {
        pendingRender = false;
        render();
      }
    }
  }

  render();

  const wrappedForce = () => {
    if (mounted) forceUpdate();
  };
  wrappedForce.unmount = () => {
    mounted = false;
    cleanupFns.forEach((cleanup) => {
      try {
        cleanup();
      } catch (e) {
        captureRenderError(e, { phase: "unmount" });
      }
    });
    cleanupFns.clear();
    container.innerHTML = "";
  };

  return wrappedForce;
}

function renderWidget(widget, forceUpdate) {
  try {
    if (isEmptyWidget(widget))
      return document.createTextNode("");
    if (typeof widget === "string" || typeof widget === "number")
      return document.createTextNode(String(widget));
    if (typeof Node !== "undefined" && widget instanceof Node) return widget;

    if (Array.isArray(widget)) {
      const fragment = document.createDocumentFragment();
      flattenChildren(widget).forEach((child) => {
        const childDom = renderWidget(child, forceUpdate);
        if (childDom) fragment.appendChild(childDom);
      });
      return fragment;
    }

    if (typeof widget === "function") {
      return renderWidget(widget(forceUpdate), forceUpdate);
    }

    if (widget.tag) {
      const props = widget.props || {};
      const children = flattenChildren(widget.children || []);

      const element = createElement(widget.tag, {
        ...(props || {}),
        children: [],
      });

      element._vnodeKey = widget.key ?? props.key ?? null;

      (children || []).forEach((child) => {
        const childDom = renderWidget(child, forceUpdate);
        if (childDom) element.appendChild(childDom);
      });

      return element;
    }

    return document.createTextNode("");
  } catch (error) {
    captureRenderError(error, {
      phase: "render",
      tag: widget?.tag || (typeof widget === "function" ? "component" : null),
    });
    return document.createComment(" render error ");
  }
}

function normalizeVNode(v, forceUpdate = null) {
  if (typeof v === "function") v = v(forceUpdate);
  if (isEmptyWidget(v)) return { tag: "empty", children: [] };
  if (Array.isArray(v))
    return {
      tag: "fragment",
      children: flattenChildren(v).map((child) =>
        normalizeVNode(child, forceUpdate),
      ),
    };
  if (v && v.tag) {
    return {
      ...v,
      children: flattenChildren(v.children || []),
    };
  }
  return { tag: "text", children: [String(v)] };
}

function patchWidget(parent, oldWidget, newWidget, index = 0, currentDom = null, forceUpdate = null) {
  try {
    const oldV = normalizeVNode(oldWidget, forceUpdate);
    const newV = normalizeVNode(newWidget, forceUpdate);

    const dom = currentDom || parent.childNodes[index];
    if (!dom) return;

    const oldTag = oldV.tag;
    const newTag = newV.tag;
    const oldKey = oldV.key ?? (oldV.props && oldV.props.key);
    const newKey = newV.key ?? (newV.props && newV.props.key);

    if (oldTag === "empty" && newTag === "empty") return;

    if (oldKey != null || newKey != null) {
      if (oldKey !== newKey || oldTag !== newTag) {
        const newDom = renderWidget(newWidget, forceUpdate);
        parent.replaceChild(newDom, dom);
        return newDom;
      }
    } else if (oldTag !== newTag) {
      const newDom = renderWidget(newWidget, forceUpdate);
      parent.replaceChild(newDom, dom);
      return newDom;
    }

    if (
      newTag === "empty" ||
      newTag === "text" ||
      typeof newWidget === "string" ||
      typeof newWidget === "number"
    ) {
      const nextText =
        newTag === "empty" ? "" : String(newV.children?.[0] ?? newWidget);
      if (dom && dom.nodeType === Node.TEXT_NODE && dom.textContent !== nextText) {
        dom.textContent = nextText;
      } else if (dom && dom.nodeType !== Node.TEXT_NODE) {
        const newDom = renderWidget(newWidget, forceUpdate);
        parent.replaceChild(newDom, dom);
        return newDom;
      }
      return dom;
    }

    const newProps = newV.props || {};
    const oldProps = oldV.props || {};
    updateProps(dom, oldProps, newProps);

    const oldChildren = flattenChildren(oldV.children || []);
    const newChildren = flattenChildren(newV.children || []);

    const keyed = new Map();
    oldChildren.forEach((c, i) => {
      const k = widgetKey(c);
      const node = dom.childNodes[i];
      if (k != null && node) keyed.set(k, { vnode: c, node });
    });

    const anyKeyed = newChildren.some((c) => widgetKey(c) != null);
    if (anyKeyed) {
      const usedKeys = new Set();
      newChildren.forEach((nc, i) => {
        const nk = widgetKey(nc);
        let node;
        if (nk != null && keyed.has(nk)) {
          const oldEntry = keyed.get(nk);
          usedKeys.add(nk);
          node = patchWidget(dom, oldEntry.vnode, nc, 0, oldEntry.node, forceUpdate);
        } else {
          node = renderWidget(nc, forceUpdate);
        }
        const targetNode = dom.childNodes[i] || null;
        if (node && node !== targetNode) dom.insertBefore(node, targetNode);
      });
      keyed.forEach((entry, key) => {
        if (!usedKeys.has(key) && entry.node.parentNode === dom) dom.removeChild(entry.node);
      });
      while (dom.childNodes.length > newChildren.length) dom.removeChild(dom.lastChild);
      return dom;
    }

    const maxLen = Math.max(oldChildren.length, newChildren.length);
    for (let i = 0; i < maxLen; i++) {
      const oldC = oldChildren[i];
      const newC = newChildren[i];
      const oldEmpty = isEmptyWidget(oldC);
      const newEmpty = isEmptyWidget(newC);
      if (oldEmpty && newEmpty) continue;
      if (oldEmpty && !newEmpty) {
        const newDom = renderWidget(newC, forceUpdate);
        if (dom.childNodes[i]) dom.replaceChild(newDom, dom.childNodes[i]);
        else dom.insertBefore(newDom, dom.childNodes[i] || null);
      } else if (!oldEmpty && newEmpty) {
        const emptyDom = renderWidget(newC, forceUpdate);
        if (dom.childNodes[i]) dom.replaceChild(emptyDom, dom.childNodes[i]);
        else dom.insertBefore(emptyDom, dom.childNodes[i] || null);
      } else {
        patchWidget(dom, oldC, newC, i, null, forceUpdate);
      }
    }
    return dom;
  } catch (error) {
    captureRenderError(error, { phase: "patch" });
    return currentDom || parent.childNodes[index] || null;
  }
}

function updateProps(dom, oldProps = {}, newProps = {}) {
  if (!dom) return;

  Object.keys(oldProps).forEach((key) => {
    const oldVal = oldProps[key];
    const nextVal = newProps[key];
    if (key.startsWith("on") && typeof oldVal === "function" && oldVal !== nextVal) {
      const event = normalizeEventName(key);
      removeWrappedListener(dom, event);
    }
    if (!(key in newProps) || newProps[key] === undefined || newProps[key] === null) {
      // cleanup reflecting props and attributes
      if (key === "style") {
        dom.removeAttribute("style");
        if (dom.style) dom.style.cssText = "";
      } else if (key === "className") {
        dom.className = "";
        dom.removeAttribute("class");
      } else if (key === "dataset" && typeof oldVal === "object") {
        Object.keys(oldVal).forEach((k) => delete dom.dataset[k]);
      } else if (key === "value") {
        try {
          dom.value = "";
        } catch (e) {
          dom.removeAttribute(key);
        }
      } else if (
        key === "checked" ||
        key === "disabled" ||
        key === "selected"
      ) {
        try {
          dom[key] = false;
        } catch (e) {
          dom.removeAttribute(key);
        }
      } else {
        dom.removeAttribute(key);
      }
    }
  });

  // Set new props
  Object.keys(newProps).forEach((key) => {
    const value = newProps[key];
    const oldValue = oldProps[key];

    if (value === undefined || value === null) return;
    if (value === oldValue && !isReflectedDomProp(key)) return;

    if (key === "style" && typeof value === "object") {
      const previous = oldProps.style || {};
      Object.keys(previous).forEach((styleKey) => {
        if (!(styleKey in value)) setStyleValue(dom, styleKey, "");
      });
      Object.entries(value).forEach(([styleKey, styleValue]) =>
        setStyleValue(dom, styleKey, styleValue),
      );
    } else if (key.startsWith("on") && typeof value === "function") {
      const event = normalizeEventName(key);
      addWrappedListener(dom, event, value);
    } else if (key === "className") {
      if (Array.isArray(value)) {
        dom.className = value.filter((v) => v && typeof v === "string").join(" ");
      } else {
        dom.className = value ? String(value) : "";
      }
    } else if (key === "dataset" && typeof value === "object") {
      const previous = oldProps.dataset || {};
      Object.keys(previous).forEach((k) => {
        if (!(k in value)) delete dom.dataset[k];
      });
      Object.keys(value).forEach((k) => (dom.dataset[k] = value[k]));
    } else if (
      key === "checked" ||
      key === "value" ||
      key === "disabled" ||
      key === "selected"
    ) {
      try {
        dom[key] = value;
      } catch (e) {
        dom.setAttribute(key, String(value));
      }
    } else if (key === "tabIndex") {
      dom.tabIndex = value;
    } else if (key === "htmlFor") {
      dom.setAttribute("for", String(value));
    } else if (
      key !== "children" &&
      key !== "key" &&
      value !== undefined &&
      value !== null
    ) {
      dom.setAttribute(key, String(value));
    }
  });
}

function flattenChildren(children = []) {
  const output = [];
  const list = Array.isArray(children) ? children : [children];

  list.forEach((child) => {
    if (Array.isArray(child)) output.push(...flattenChildren(child));
    else output.push(child);
  });

  return output;
}

function resolveWidget(widget, forceUpdate) {
  if (typeof widget === "function") {
    return resolveWidget(widget(forceUpdate), forceUpdate);
  }

  if (Array.isArray(widget)) {
    return flattenChildren(widget).map((child) => resolveWidget(child, forceUpdate));
  }

  if (widget && widget.tag) {
    return {
      ...widget,
      children: flattenChildren(widget.children || []).map((child) =>
        resolveWidget(child, forceUpdate),
      ),
    };
  }

  return widget;
}

function isRootFragment(widget) {
  return normalizeVNode(widget).tag === "fragment";
}

function widgetKey(widget) {
  if (!widget || Array.isArray(widget) || typeof widget !== "object") return null;
  return widget.key ?? (widget.props && widget.props.key) ?? null;
}

function isReflectedDomProp(key) {
  return (
    key === "checked" ||
    key === "value" ||
    key === "disabled" ||
    key === "selected"
  );
}

function normalizeEventName(onName) {
  const name = onName.slice(2);
  const lower = name.toLowerCase();
  if (lower === "doubleclick" || lower === "dblclick") return "dblclick";
  return lower;
}

function setStyleValue(dom, key, value) {
  if (key.startsWith("--") && dom.style && dom.style.setProperty) {
    if (value === undefined || value === null || value === "") {
      dom.style.removeProperty?.(key);
    } else {
      dom.style.setProperty(key, String(value));
    }
  } else if (dom.style) {
    dom.style[key] = value ?? "";
  }
}

function isEmptyWidget(widget) {
  return (
    widget === null ||
    widget === undefined ||
    widget === false ||
    widget === true
  );
}
