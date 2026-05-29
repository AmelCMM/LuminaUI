import {
  cleanStyle,
  luminaTheme,
  normalizeWidgetArgs,
  omitProps,
} from "./utils.js";

const routeSubscriptions = new WeakMap();

export function createRouter(options = {}) {
  const config = Array.isArray(options) ? { routes: options } : options;
  let routes = config.routes || [];
  let currentPath = normalizePath(
    config.initialPath || readBrowserPath(config),
  );
  const listeners = new Set();

  const router = {
    get routes() {
      return routes;
    },
    getPath: () => currentPath,
    getMatch: () => matchRoute(routes, currentPath),
    href: (to = "/") => buildHref(to, config),
    navigate: (to = "/", navigateOptions = {}) => {
      const nextPath = normalizePath(to);
      const href = buildHref(to, config);
      const changed = nextPath !== currentPath;

      if (typeof window !== "undefined" && window.history) {
        const method = navigateOptions.replace ? "replaceState" : "pushState";
        window.history[method](navigateOptions.state || null, "", href);
      }

      currentPath = nextPath;
      if (changed || navigateOptions.notify !== false) notify();
    },
    setRoutes: (nextRoutes = [], { notify: shouldNotify = false } = {}) => {
      routes = nextRoutes;
      if (shouldNotify) notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  if (typeof window !== "undefined" && window.addEventListener) {
    const onPopState = () => {
      const nextPath = normalizePath(readBrowserPath(config));
      if (nextPath !== currentPath) {
        currentPath = nextPath;
        notify();
      }
    };
    window.addEventListener("popstate", onPopState);
    router.destroy = () => {
      window.removeEventListener("popstate", onPopState);
      listeners.clear();
    };
  } else {
    router.destroy = () => listeners.clear();
  }

  function notify() {
    listeners.forEach((listener) => {
      try {
        listener(currentPath);
      } catch (e) {
        /* keep router notifications isolated */
      }
    });
  }

  return router;
}

export const defaultRouter = createRouter();

export function Router(props = {}) {
  return RouteView(props);
}

export function RouteView({
  router = defaultRouter,
  routes = undefined,
  path = undefined,
  fallback = null,
  as = "div",
  style = {},
  ...props
} = {}) {
  return (forceUpdate) => {
    if (routes && router.setRoutes) router.setRoutes(routes);
    subscribeRouter(router, forceUpdate);

    const activeRoutes = routes || router.routes || [];
    const currentPath = path ?? router.getPath();
    const match = matchRoute(activeRoutes, currentPath);
    const child = match
      ? routeChild(match, router)
      : typeof fallback === "function"
        ? fallback({ path: currentPath, router })
        : fallback;

    return {
      tag: as,
      props: {
        ...props,
        style: cleanStyle({
          minWidth: 0,
          minHeight: 0,
          ...style,
        }),
      },
      children: [child],
      key: props.key,
    };
  };
}

export function Link(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const {
    to = "#",
    router = defaultRouter,
    replace = false,
    state,
    label,
    style = {},
  } = props;

  return {
    tag: "a",
    props: {
      ...omitProps(props, ["to", "router", "replace", "state", "label"]),
      href: router.href ? router.href(to) : String(to),
      onClick: (event) => {
        if (props.onClick) props.onClick(event);
        if (shouldIgnoreLinkClick(event, props.target)) return;
        event.preventDefault?.();
        router.navigate?.(to, { replace, state });
      },
      style: cleanStyle({
        color: luminaTheme.colors.primary,
        cursor: "pointer",
        textDecoration: "none",
        ...style,
      }),
    },
    children: children.length ? children : [label ?? String(to)],
    key: props.key,
  };
}

export function NavLink(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);
  const {
    router = defaultRouter,
    to = "#",
    match = to,
    exact = false,
    activeClassName = "lumina-nav-link-active",
    activeStyle = {},
  } = props;

  return (forceUpdate) => {
    subscribeRouter(router, forceUpdate);
    const active = isRouteActive(match, router.getPath(), exact);
    const className = [props.className, active ? activeClassName : ""]
      .filter(Boolean)
      .join(" ");

    return Link(
      {
        ...omitProps(props, [
          "router",
          "to",
          "match",
          "exact",
          "activeClassName",
          "activeStyle",
        ]),
        to,
        router,
        className,
        "aria-current": active ? props["aria-current"] || "page" : undefined,
        style: cleanStyle({
          fontWeight: active ? 800 : undefined,
          color: active ? luminaTheme.colors.primary : undefined,
          ...(active ? activeStyle : {}),
          ...props.style,
        }),
      },
      children,
    );
  };
}

export function matchRoute(routes = [], path = "/") {
  const location = splitPath(path);
  let wildcard = null;

  for (const route of routes) {
    const pattern = route.path ?? route.pattern ?? "/";
    if (pattern === "*" || pattern === "/*") {
      wildcard = route;
      continue;
    }

    const params = matchPath(pattern, location.pathname);
    if (params) return { route, params, ...location };
  }

  return wildcard ? { route: wildcard, params: {}, ...location } : null;
}

export function matchPath(pattern = "/", path = "/") {
  const routeSegments = trimSlashes(pattern).split("/").filter(Boolean);
  const pathSegments = trimSlashes(path).split("/").filter(Boolean);
  const params = {};

  if (pattern === "/" || pattern === "") {
    return pathSegments.length === 0 ? params : null;
  }

  for (let index = 0; index < routeSegments.length; index += 1) {
    const routeSegment = routeSegments[index];
    const pathSegment = pathSegments[index];

    if (routeSegment === "*") {
      params.wildcard = pathSegments.slice(index).join("/");
      return params;
    }
    if (!pathSegment) return null;
    if (routeSegment.startsWith(":")) {
      params[routeSegment.slice(1)] = safeDecode(pathSegment);
    } else if (routeSegment !== pathSegment) {
      return null;
    }
  }

  return routeSegments.length === pathSegments.length ? params : null;
}

export function isRouteActive(pattern = "/", path = "/", exact = false) {
  const location = splitPath(path);
  if (exact) return !!matchPath(pattern, location.pathname);

  const normalizedPattern = normalizePath(pattern).split(/[?#]/)[0];
  const normalizedPath = normalizePath(location.pathname);
  if (normalizedPattern === "/") return normalizedPath === "/";

  return (
    normalizedPath === normalizedPattern ||
    normalizedPath.startsWith(`${normalizedPattern.replace(/\/$/, "")}/`)
  );
}

function routeChild(match, router) {
  const route = match.route;
  const context = {
    match,
    params: match.params,
    route,
    router,
    navigate: router.navigate,
  };

  if (route.redirect) {
    defer(() => router.navigate(route.redirect, { replace: true }));
    return null;
  }
  if (route.component) return route.component(context);
  if (route.render) return route.render(context);
  if (route.child !== undefined) return route.child;
  return route.children ?? null;
}

function subscribeRouter(router, forceUpdate) {
  if (!router?.subscribe || !forceUpdate) return;

  let subscriptions = routeSubscriptions.get(forceUpdate);
  if (!subscriptions) {
    subscriptions = new WeakSet();
    routeSubscriptions.set(forceUpdate, subscriptions);
  }
  if (subscriptions.has(router)) return;

  const cleanup = router.subscribe(() => forceUpdate());
  subscriptions.add(router);
  forceUpdate.onUnmount?.(cleanup);
}

function shouldIgnoreLinkClick(event, target) {
  return (
    event?.defaultPrevented ||
    event?.button > 0 ||
    event?.metaKey ||
    event?.altKey ||
    event?.ctrlKey ||
    event?.shiftKey ||
    (target && target !== "_self")
  );
}

function readBrowserPath({ useHash = false, basePath = "" } = {}) {
  if (typeof window === "undefined" || !window.location) return "/";
  if (useHash) {
    return normalizePath(window.location.hash.replace(/^#/, "") || "/");
  }

  const pathname = stripBasePath(window.location.pathname || "/", basePath);
  return `${pathname}${window.location.search || ""}${window.location.hash || ""}`;
}

function buildHref(to = "/", { useHash = false, basePath = "" } = {}) {
  const path = normalizePath(to);
  const base = normalizeBasePath(basePath);
  return useHash ? `${base || "/"}#${path}` : `${base}${path}`;
}

function splitPath(path = "/") {
  const text = normalizePath(path);
  const [pathAndSearch, hash = ""] = text.split("#");
  const [pathname, search = ""] = pathAndSearch.split("?");
  return {
    fullPath: text,
    pathname: normalizePath(pathname).replace(/[?#].*$/, ""),
    search: search ? `?${search}` : "",
    query: parseQuery(search),
    hash: hash ? `#${hash}` : "",
  };
}

function parseQuery(search = "") {
  const query = {};
  if (!search) return query;

  search.split("&").forEach((part) => {
    if (!part) return;
    const [rawKey, rawValue = ""] = part.split("=");
    query[safeDecode(rawKey)] = safeDecode(rawValue);
  });
  return query;
}

function normalizePath(value = "/") {
  if (typeof value !== "string") return "/";
  let path = value.trim() || "/";

  try {
    if (/^https?:\/\//.test(path)) {
      const url = new URL(path);
      path = `${url.pathname}${url.search}${url.hash}`;
    }
  } catch (e) {
    /* leave the original path alone */
  }

  if (!path.startsWith("/")) path = `/${path}`;
  const [pathAndSearch, hash = ""] = path.split("#");
  const [pathname, search = ""] = pathAndSearch.split("?");
  const normalizedPathname = (pathname || "/").replace(/\/{2,}/g, "/");

  return `${normalizedPathname}${search ? `?${search}` : ""}${hash ? `#${hash}` : ""}`;
}

function normalizeBasePath(basePath = "") {
  if (!basePath) return "";
  return `/${trimSlashes(basePath)}`;
}

function stripBasePath(pathname = "/", basePath = "") {
  const base = normalizeBasePath(basePath);
  if (!base || pathname === base) return pathname === base ? "/" : pathname;
  if (!pathname.startsWith(`${base}/`)) return pathname;
  return pathname.slice(base.length) || "/";
}

function trimSlashes(value = "") {
  return String(value).replace(/^\/+|\/+$/g, "");
}

function safeDecode(value = "") {
  try {
    return decodeURIComponent(String(value).replace(/\+/g, " "));
  } catch (e) {
    return value;
  }
}

function defer(task) {
  if (typeof queueMicrotask === "function") queueMicrotask(task);
  else setTimeout(task, 0);
}
