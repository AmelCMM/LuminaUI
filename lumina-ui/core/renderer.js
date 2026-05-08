import { createElement } from "./element.js";

// vnode shape: { tag, props, children, key }
// function widgets: (forceUpdate) => vnode

export function mount(componentFn, container) {
  let currentTree = null;
  let mounted = true;

  const forceUpdate = () => {
    if (!mounted) return;
    render();
  };

  function render() {
    const newTree =
      typeof componentFn === "function" ? componentFn(forceUpdate) : componentFn;
    if (!currentTree) {
      const dom = renderWidget(newTree, forceUpdate);
      container.innerHTML = "";
      container.appendChild(dom);
    } else {
      patchWidget(container, currentTree, newTree);
    }
    currentTree = normalizeVNode(newTree);
  }

  render();

  const wrappedForce = () => {
    if (mounted) forceUpdate();
  };
  wrappedForce.unmount = () => {
    mounted = false;
    container.innerHTML = "";
  };

  return wrappedForce;
}

function renderWidget(widget, forceUpdate) {
  // primitives
  if (isEmptyWidget(widget))
    return document.createTextNode("");
  if (typeof widget === "string" || typeof widget === "number")
    return document.createTextNode(String(widget));
  if (typeof Node !== "undefined" && widget instanceof Node) return widget;

  // arrays -> fragment
  if (Array.isArray(widget)) {
    const fragment = document.createDocumentFragment();
    widget.forEach((child) => {
      const childDom = renderWidget(child, forceUpdate);
      if (childDom) fragment.appendChild(childDom);
    });
    return fragment;
  }

  // functional widget (component)
  if (typeof widget === "function") {
    return renderWidget(widget(forceUpdate), forceUpdate);
  }

  // vnode object
  if (widget.tag) {
    const props = widget.props || {};
    const children = widget.children || [];

    const element = createElement(widget.tag, {
      ...(props || {}),
      children: [],
    });

    // attach a backref for fast updates (optional)
    element._vnodeKey = widget.key ?? props.key ?? null;

    (children || []).forEach((child) => {
      const childDom = renderWidget(child, forceUpdate);
      if (childDom) element.appendChild(childDom);
    });

    return element;
  }

  return document.createTextNode("");
}

function normalizeVNode(v) {
  // If given a function, call it (no forceUpdate)
  if (typeof v === "function") v = v();
  if (isEmptyWidget(v)) return { tag: "empty", children: [] };
  if (Array.isArray(v))
    return { tag: "fragment", children: v.map(normalizeVNode) };
  if (v && v.tag) return v;
  return { tag: "text", children: [String(v)] };
}

function patchWidget(parent, oldWidget, newWidget, index = 0, currentDom = null) {
  // Normalize to vnodes
  const oldV = normalizeVNode(oldWidget);
  const newV = normalizeVNode(newWidget);

  const dom = currentDom || parent.childNodes[index];
  if (!dom) return;

  // Replace if different tag or key
  const oldTag = oldV.tag;
  const newTag = newV.tag;
  const oldKey = oldV.key ?? (oldV.props && oldV.props.key);
  const newKey = newV.key ?? (newV.props && newV.props.key);

  if (oldTag === "empty" && newTag === "empty") return;

  if (oldKey != null || newKey != null) {
    // keyed children are handled at parent's loop level — here we fall back to replace if mismatched
    if (oldKey !== newKey || oldTag !== newTag) {
      const newDom = renderWidget(newWidget);
      parent.replaceChild(newDom, dom);
      return newDom;
    }
  } else if (oldTag !== newTag) {
    const newDom = renderWidget(newWidget);
    parent.replaceChild(newDom, dom);
    return newDom;
  }

  // Text node
  if (
    newTag === "empty" ||
    newTag === "text" ||
    typeof newWidget === "string" ||
    typeof newWidget === "number"
  ) {
    const nextText =
      newTag === "empty" ? "" : String(newV.children?.[0] ?? newWidget);
    if (
      dom &&
      dom.nodeType === Node.TEXT_NODE &&
      dom.textContent !== nextText
    ) {
      dom.textContent = nextText;
    } else if (dom && dom.nodeType !== Node.TEXT_NODE) {
      const newDom = renderWidget(newWidget);
      parent.replaceChild(newDom, dom);
      return newDom;
    }
    return dom;
  }

  // Update props
  const newProps = newV.props || {};
  const oldProps = oldV.props || {};
  updateProps(dom, oldProps, newProps);

  // Reconcile children (simple keyed-first pass)
  const oldChildren = oldV.children || [];
  const newChildren = newV.children || [];

  // Build key -> index map for old children
  const keyed = new Map();
  oldChildren.forEach((c, i) => {
    const k = widgetKey(c);
    const node = dom.childNodes[i];
    if (k != null && node) keyed.set(k, { vnode: c, node });
  });

  // If any new child has a key, do keyed reconciliation
  const anyKeyed = newChildren.some((c) => widgetKey(c) != null);
  if (anyKeyed) {
    const usedKeys = new Set();

    newChildren.forEach((nc, i) => {
      const nk = widgetKey(nc);
      let node;

      if (nk != null && keyed.has(nk)) {
        const oldEntry = keyed.get(nk);
        usedKeys.add(nk);
        node = patchWidget(dom, oldEntry.vnode, nc, 0, oldEntry.node);
      } else {
        node = renderWidget(nc);
      }

      const targetNode = dom.childNodes[i] || null;
      if (node && node !== targetNode) {
        dom.insertBefore(node, targetNode);
      }
    });

    keyed.forEach((entry, key) => {
      if (!usedKeys.has(key) && entry.node.parentNode === dom) {
        dom.removeChild(entry.node);
      }
    });

    while (dom.childNodes.length > newChildren.length) {
      dom.removeChild(dom.lastChild);
    }

    return dom;
  }

  // Fallback index-based reconciliation
  const maxLen = Math.max(oldChildren.length, newChildren.length);
  for (let i = 0; i < maxLen; i++) {
    const oldC = oldChildren[i];
    const newC = newChildren[i];
    const oldEmpty = isEmptyWidget(oldC);
    const newEmpty = isEmptyWidget(newC);

    if (oldEmpty && newEmpty) {
      continue;
    } else if (oldEmpty && !newEmpty) {
      const newDom = renderWidget(newC);
      dom.insertBefore(newDom, dom.childNodes[i] || null);
    } else if (!oldEmpty && newEmpty) {
      if (dom.childNodes[i]) dom.removeChild(dom.childNodes[i]);
    } else {
      patchWidget(dom, oldC, newC, i);
    }
  }

  return dom;
}

function updateProps(dom, oldProps = {}, newProps = {}) {
  if (!dom) return;

  // Remove old event listeners and attributes not in newProps
  Object.keys(oldProps).forEach((key) => {
    const oldVal = oldProps[key];
    const nextVal = newProps[key];
    if (
      key.startsWith("on") &&
      typeof oldVal === "function" &&
      oldVal !== nextVal
    ) {
      const event = normalizeEventName(key);
      dom.removeEventListener(event, oldVal);
    }
    if (!(key in newProps) || newProps[key] === undefined || newProps[key] === null) {
      // cleanup reflecting props and attributes
      if (
        key === "value" ||
        key === "checked" ||
        key === "disabled" ||
        key === "selected"
      ) {
        try {
          dom[key] = undefined;
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
    if (value === oldValue) return;

    if (key === "style" && typeof value === "object") {
      const previous = oldProps.style || {};
      Object.keys(previous).forEach((styleKey) => {
        if (!(styleKey in value)) dom.style[styleKey] = "";
      });
      Object.assign(dom.style, value);
    } else if (key.startsWith("on") && typeof value === "function") {
      const event = normalizeEventName(key);
      dom.addEventListener(event, value);
    } else if (key === "className") {
      dom.className = value;
    } else if (key === "dataset" && typeof value === "object") {
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
    } else if (key !== "children" && value !== undefined && value !== null) {
      dom.setAttribute(key, String(value));
    }
  });
}

function widgetKey(widget) {
  if (!widget || Array.isArray(widget) || typeof widget !== "object") return null;
  return widget.key ?? (widget.props && widget.props.key) ?? null;
}

function normalizeEventName(onName) {
  const name = onName.slice(2);
  const lower = name.toLowerCase();
  if (lower === "doubleclick" || lower === "dblclick") return "dblclick";
  return lower;
}

function isEmptyWidget(widget) {
  return widget === null || widget === undefined || widget === false;
}
