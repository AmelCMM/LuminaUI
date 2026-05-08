export function createElement(tag, props = {}) {
  const { children, style, className, dataset, ...rest } = props;
  const element = document.createElement(tag);

  // Apply classes
  if (className) {
    if (Array.isArray(className)) element.classList.add(...className);
    else element.className = className;
  }

  // Apply dataset
  if (dataset && typeof dataset === "object") {
    Object.keys(dataset).forEach((k) => {
      element.dataset[k] = dataset[k];
    });
  }

  // Apply styles
  if (style && typeof style === "object") {
    Object.assign(element.style, style);
  }

  // Apply remaining props (reflecting properties for common DOM props)
  Object.entries(rest).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key.startsWith("on") && typeof value === "function") {
      const event = normalizeEventName(key);
      element.addEventListener(event, value);
    } else if (
      key === "checked" ||
      key === "value" ||
      key === "disabled" ||
      key === "selected"
    ) {
      // Reflect common boolean/value props
      try {
        element[key] = value;
      } catch (e) {
        element.setAttribute(key, String(value));
      }
    } else if (key === "htmlFor") {
      element.setAttribute("for", String(value));
    } else if (
      key === "id" ||
      key === "type" ||
      key === "name" ||
      key === "placeholder" ||
      key === "title" ||
      key === "role" ||
      key === "aria-label" ||
      key === "aria-checked" ||
      key.startsWith("aria-")
    ) {
      element.setAttribute(key, String(value));
    } else if (key === "tabIndex") {
      element.tabIndex = value;
    } else {
      // fallback to attribute
      element.setAttribute(key, String(value));
    }
  });

  // Append children if provided
  if (children !== undefined && children !== null) {
    const childrenArray = Array.isArray(children) ? children : [children];
    childrenArray.forEach((child) => {
      if (child === null || child === undefined) return;
      if (child instanceof Node) {
        element.appendChild(child);
      } else if (typeof child === "object" && child._dom) {
        // internal fast path if widget has a cached DOM
        element.appendChild(child._dom);
      } else {
        element.appendChild(document.createTextNode(String(child)));
      }
    });
  }

  return element;
}

export function Fragment({ children }) {
  const fragment = document.createDocumentFragment();
  if (children) {
    const childrenArray = Array.isArray(children) ? children : [children];
    childrenArray.forEach((child) => {
      if (child instanceof Node) fragment.appendChild(child);
      else if (child !== null && child !== undefined)
        fragment.appendChild(document.createTextNode(String(child)));
    });
  }
  return fragment;
}

export function applyStyles(element, styles) {
  if (!element || !styles) return element;
  Object.assign(element.style, styles);
  return element;
}

export function addClasses(element, ...classes) {
  if (!element) return element;
  element.classList.add(...classes.filter(Boolean));
  return element;
}

function normalizeEventName(onName) {
  // onClick -> click, onDoubleClick -> dblclick (common mapping)
  const name = onName.slice(2);
  const lower = name.toLowerCase();
  if (lower === "doubleclick" || lower === "dblclick") return "dblclick";
  return lower;
}
