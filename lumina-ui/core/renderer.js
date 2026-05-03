import { createElement } from "./element.js";

// vnode shape: { tag, props, children, key }
// function widgets: (forceUpdate) => vnode

let currentUpdateId = 0;

export function mount(componentFn, container) {
  let currentTree = null;
  let mounted = true;
  const updateId = currentUpdateId++;

  const forceUpdate = () => {
    if (!mounted) return;
    render();
  };

  function render() {
    const newTree = renderWidget(componentFn, forceUpdate);
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

  // return an unmountable forceUpdate
  const teardown = () => {
    mounted = false;
  };
  const wrappedForce = () => {
    if (mounted) forceUpdate();
  };

  return wrappedForce;
}

function renderWidget(widget, forceUpdate) {
  // primitives
  if (widget === null || widget === undefined)
    return document.createTextNode("");
  if (typeof widget === "string" || typeof widget === "number")
    return document.createTextNode(String(widget));

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
  if (Array.isArray(v))
    return { tag: "fragment", children: v.map(normalizeVNode) };
  if (v && v.tag) return v;
  return { tag: "text", children: [String(v)] };
}

function patchWidget(parent, oldWidget, newWidget, index = 0) {
  // Normalize to vnodes
  const oldV = normalizeVNode(oldWidget);
  const newV = normalizeVNode(newWidget);

  const dom = parent.childNodes[index];
  if (!dom) return;

  // Replace if different tag or key
  const oldTag = oldV.tag;
  const newTag = newV.tag;
  const oldKey = oldV.key ?? (oldV.props && oldV.props.key);
  const newKey = newV.key ?? (newV.props && newV.props.key);

  if (oldKey != null || newKey != null) {
    // keyed children are handled at parent's loop level — here we fall back to replace if mismatched
    if (oldKey !== newKey || oldTag !== newTag) {
      const newDom = renderWidget(newWidget);
      parent.replaceChild(newDom, dom);
      return;
    }
  } else if (oldTag !== newTag) {
    const newDom = renderWidget(newWidget);
    parent.replaceChild(newDom, dom);
    return;
  }

  // Text node
  if (
    newTag === "text" ||
    typeof newWidget === "string" ||
    typeof newWidget === "number"
  ) {
    if (
      dom &&
      dom.nodeType === Node.TEXT_NODE &&
      dom.textContent !== String(newV.children?.[0] ?? newWidget)
    ) {
      dom.textContent = String(newV.children?.[0] ?? newWidget);
    } else if (dom && dom.nodeType !== Node.TEXT_NODE) {
      parent.replaceChild(renderWidget(newWidget), dom);
    }
    return;
  }

  // Update props
  const newProps = newV.props || {};
  const oldProps = oldV.props || {};
  updateProps(dom, oldProps, newProps);

  // Reconcile children (simple keyed-first pass)
  const oldChildren = oldV.children || [];
  const newChildren = newV.children || [];

  // Build key -> index map for old children
  const keyed = {};
  oldChildren.forEach((c, i) => {
    const k = (c && c.key) ?? (c && c.props && c.props.key);
    if (k != null) keyed[k] = { vnode: c, index: i };
  });

  // If any new child has a key, do keyed reconciliation
  const anyKeyed = newChildren.some(
    (c) => c && (c.key != null || (c.props && c.props.key != null)),
  );
  if (anyKeyed) {
    // Create a temporary list of DOM nodes for comparison
    const childNodes = Array.from(dom.childNodes);
    newChildren.forEach((nc, i) => {
      const nk = (nc && nc.key) ?? (nc && nc.props && nc.props.key);
      if (nk != null && keyed[nk]) {
        // patch the DOM at the position of the matched old index
        const oldIndex = keyed[nk].index;
        patchWidget(dom, oldChildren[oldIndex], nc, oldIndex);
        // move DOM node to correct position if needed
        const nodeToMove = childNodes[oldIndex];
        const targetNode = dom.childNodes[i];
        if (nodeToMove && nodeToMove !== targetNode) {
          dom.insertBefore(nodeToMove, targetNode || null);
        }
      } else {
        // new node: render and insert at position i
        const newDom = renderWidget(nc);
        const reference = dom.childNodes[i] || null;
        dom.insertBefore(newDom, reference);
      }
    });

    // Remove old nodes not present in newChildren keys
    oldChildren.forEach((oc) => {
      const ok = (oc && oc.key) ?? (oc && oc.props && oc.props.key);
      if (
        ok == null ||
        !newChildren.some(
          (nc) => (nc && (nc.key ?? (nc.props && nc.props.key))) === ok,
        )
      ) {
        // find its DOM node and remove
        const idx = Array.from(dom.childNodes).findIndex(
          (n) => n._vnodeKey === ok,
        );
        if (idx >= 0) dom.removeChild(dom.childNodes[idx]);
      }
    });

    return;
  }

  // Fallback index-based reconciliation
  const maxLen = Math.max(oldChildren.length, newChildren.length);
  for (let i = 0; i < maxLen; i++) {
    const oldC = oldChildren[i];
    const newC = newChildren[i];
    if (!oldC && newC) {
      const newDom = renderWidget(newC);
      dom.appendChild(newDom);
    } else if (oldC && !newC) {
      if (dom.childNodes[i]) dom.removeChild(dom.childNodes[i]);
    } else {
      patchWidget(dom, oldC, newC, i);
    }
  }
}

function updateProps(dom, oldProps = {}, newProps = {}) {
  if (!dom) return;

  // Remove old event listeners and attributes not in newProps
  Object.keys(oldProps).forEach((key) => {
    const oldVal = oldProps[key];
    if (key.startsWith("on") && typeof oldVal === "function") {
      const event = key.slice(2).toLowerCase();
      dom.removeEventListener(event, oldVal);
    }
    if (!(key in newProps)) {
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

    if (value === oldValue) return;

    if (key === "style" && typeof value === "object") {
      Object.assign(dom.style, value);
    } else if (key.startsWith("on") && typeof value === "function") {
      const event = key.slice(2).toLowerCase();
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
    } else if (key !== "children" && value !== undefined && value !== null) {
      dom.setAttribute(key, String(value));
    }
  });
}
