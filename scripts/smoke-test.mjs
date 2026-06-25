class BaseNode {
  constructor() {
    this.childNodes = [];
    this.parentNode = null;
  }

  appendChild(node) {
    if (node.nodeType === 11) {
      [...node.childNodes].forEach((child) => this.appendChild(child));
      node.childNodes = [];
      return node;
    }

    if (node.parentNode) node.parentNode.removeChild(node);
    this.childNodes.push(node);
    node.parentNode = this;
    return node;
  }

  insertBefore(node, reference) {
    if (node.nodeType === 11) {
      [...node.childNodes].forEach((child) =>
        this.insertBefore(child, reference),
      );
      node.childNodes = [];
      return node;
    }

    if (node.parentNode) node.parentNode.removeChild(node);
    const index = reference ? this.childNodes.indexOf(reference) : -1;
    if (index < 0) this.childNodes.push(node);
    else this.childNodes.splice(index, 0, node);
    node.parentNode = this;
    return node;
  }

  replaceChild(next, old) {
    const index = this.childNodes.indexOf(old);
    if (index < 0) throw new Error("Cannot replace missing child");

    if (next.nodeType === 11) {
      this.childNodes.splice(index, 1);
      old.parentNode = null;
      [...next.childNodes]
        .reverse()
        .forEach((child) =>
          this.insertBefore(child, this.childNodes[index] || null),
        );
      next.childNodes = [];
      return old;
    }

    if (next.parentNode) next.parentNode.removeChild(next);
    this.childNodes[index] = next;
    old.parentNode = null;
    next.parentNode = this;
    return old;
  }

  removeChild(node) {
    const index = this.childNodes.indexOf(node);
    if (index >= 0) this.childNodes.splice(index, 1);
    node.parentNode = null;
    return node;
  }

  get lastChild() {
    return this.childNodes[this.childNodes.length - 1] || null;
  }

  get textContent() {
    return this.childNodes.map((child) => child.textContent).join("");
  }

  set textContent(value) {
    this.childNodes = [new TextNode(value)];
  }
}

class ElementNode extends BaseNode {
  constructor(tag) {
    super();
    this.tagName = tag;
    this.nodeType = 1;
    this.style = { cssText: "" };
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.className = "";
    this.classList = {
      add: (...classes) => {
        this.className = classes.filter(Boolean).join(" ");
      },
    };
  }

  set innerHTML(value) {
    this.childNodes = [];
    this._innerHTML = String(value);
  }

  get innerHTML() {
    return this._innerHTML || "";
  }

  setAttribute(key, value) {
    this.attributes[key] = String(value);
  }

  removeAttribute(key) {
    delete this.attributes[key];
  }

  addEventListener(key, fn) {
    this.listeners[key] = fn;
  }

  removeEventListener(key, fn) {
    if (this.listeners[key] === fn) delete this.listeners[key];
  }

  click() {
    this.listeners.click?.({
      type: "click",
      target: this,
      defaultPrevented: false,
      stopPropagation() {},
      preventDefault() {
        this.defaultPrevented = true;
      },
    });
  }
}

class TextNode extends BaseNode {
  constructor(text) {
    super();
    this.nodeType = 3;
    this._text = String(text);
  }

  get textContent() {
    return this._text;
  }

  set textContent(value) {
    this._text = String(value);
  }
}

class FragmentNode extends BaseNode {
  constructor() {
    super();
    this.nodeType = 11;
  }
}

globalThis.Node = BaseNode;
globalThis.document = {
  createElement: (tag) => new ElementNode(tag),
  createTextNode: (text) => new TextNode(text),
  createDocumentFragment: () => new FragmentNode(),
  head: { appendChild() {} },
  getElementById: () => null,
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const {
  AbsorbPointer,
  Button,
  Column,
  ComboBox,
  createRouter,
  createTheme,
  DataTable,
  DevTools,
  errorBus,
  filterOptions,
  Input,
  ListView,
  Menu,
  Overlay,
  Pagination,
  Router,
  SnackBar,
  Switch,
  Text,
  ThemeProvider,
  mount,
} = await import("../lumina-ui.js");
const store = await import("../lumina-ui/app/ecommerce/store.js");

let items = [{ id: "a" }, { id: "b" }];
let clicks = 0;
function stableClick() {
  clicks += 1;
}

function App() {
  return Column([
    Button({ text: "Stable", onClick: stableClick }),
    [[Text("Nested")]],
    ListView({
      items,
      itemBuilder: (item) => ({ tag: "article", children: [item.id] }),
    }),
  ]);
}

const root = new ElementNode("root");
const update = mount(App, root);
root.childNodes[0].childNodes[0].click();
items = [{ id: "b" }, { id: "c" }];
update();
root.childNodes[0].childNodes[0].click();
assert(clicks === 2, "stable event handler was lost after patch");
assert(root.textContent === "StableNestedbc", "keyed list patch failed");

let checked = false;
const inputRoot = new ElementNode("root");
const inputUpdate = mount(
  () => Input({ type: "checkbox", value: checked }),
  inputRoot,
);
inputRoot.childNodes[0].checked = true;
inputUpdate();
assert(inputRoot.childNodes[0].checked === false, "controlled checkbox failed");

let switched = false;
const disabledSwitch = Switch({
  value: true,
  disabled: true,
  onChange: () => {
    switched = true;
  },
});
disabledSwitch.props.onClick({});
assert(disabledSwitch.props.type === "button", "switch type should be button");
assert(switched === false, "disabled switch should not change");

let switchChecked = false;
const checkedSwitchRoot = new ElementNode("root");
const checkedSwitchUpdate = mount(
  () =>
    Switch({
      checked: switchChecked,
      onChange: (next) => {
        switchChecked = next;
        checkedSwitchUpdate();
      },
    }),
  checkedSwitchRoot,
);
checkedSwitchRoot.childNodes[0].click();
assert(
  checkedSwitchRoot.childNodes[0].attributes["aria-checked"] === "true",
  "checked prop alias on Switch failed",
);

store.toggleWishlist("pulse-headphones");
assert(store.isWishlisted("pulse-headphones"), "wishlist toggle failed");
store.toggleWishlist("pulse-headphones");
assert(!store.isWishlisted("pulse-headphones"), "wishlist removal failed");

store.toggleCompare("pulse-headphones");
store.toggleCompare("arc-speaker");
assert(store.compareProducts().length === 2, "compare selection failed");
store.clearCompare();
assert(store.compareProducts().length === 0, "compare clear failed");

const themedRoot = new ElementNode("root");
const brandTheme = createTheme({ colors: { primary: "#0f766e" } });
mount(
  () =>
    ThemeProvider({ theme: brandTheme }, [
      Button({ text: "Themed" }),
    ]),
  themedRoot,
);
assert(
  themedRoot.childNodes[0].style["--lumina-color-primary"] === "#0f766e",
  "ThemeProvider did not apply CSS theme variables",
);

const router = createRouter({
  initialPath: "/",
  routes: [
    { path: "/", child: Text("Route home") },
    {
      path: "/products/:id",
      component: ({ params }) => Text(`Product ${params.id}`),
    },
  ],
});
const routerRoot = new ElementNode("root");
mount(() => Router({ router }), routerRoot);
assert(routerRoot.textContent === "Route home", "router initial route failed");
router.navigate("/products/42");
assert(routerRoot.textContent === "Product 42", "router navigation failed");

const overlayRoot = new ElementNode("root");
mount(
  () =>
    Overlay({ open: true, modal: true }, [
      Text("Overlay content"),
    ]),
  overlayRoot,
);
assert(
  overlayRoot.textContent === "Overlay content",
  "overlay content failed to render",
);

let menuValue = "";
const menuRoot = new ElementNode("root");
mount(
  () =>
    Menu({
      items: [{ label: "Edit", value: "edit" }],
      onSelect: (value) => {
        menuValue = value;
      },
    }),
  menuRoot,
);
menuRoot.childNodes[0].childNodes[0].click();
assert(menuValue === "edit", "menu item selection failed");

const tableRoot = new ElementNode("root");
mount(
  () =>
    DataTable({
      rows: [
        { id: "b", name: "Beta" },
        { id: "a", name: "Alpha" },
      ],
      sortBy: "name",
      columns: [{ key: "name", label: "Name", sortable: true }],
    }),
  tableRoot,
);
assert(
  tableRoot.textContent.includes("Alpha") &&
    tableRoot.textContent.indexOf("Alpha") < tableRoot.textContent.indexOf("Beta"),
  "DataTable sorting failed",
);

let page = 1;
const paginationRoot = new ElementNode("root");
mount(
  () =>
    Pagination({
      page,
      pageSize: 10,
      totalItems: 30,
      onPageChange: (nextPage) => {
        page = nextPage;
      },
    }),
  paginationRoot,
);
paginationRoot.childNodes[0].childNodes[2].click();
assert(page === 2, "pagination page change failed");

let comboValue = "";
const comboRoot = new ElementNode("root");
mount(
  () =>
    ComboBox({
      open: true,
      value: comboValue,
      options: [
        { label: "Alpha", value: "alpha" },
        { label: "Beta", value: "beta" },
      ],
      onChange: (value) => {
        comboValue = value;
      },
    }),
  comboRoot,
);
comboRoot.childNodes[0].childNodes[2].childNodes[1].click();
assert(comboValue === "beta", "ComboBox option selection failed");
assert(
  filterOptions(["Alpha", "Beta"], "alp").length === 1,
  "Autocomplete option filtering failed",
);

store.addToCart("pulse-headphones", 1);
store.setPromoCode("FOCUS10");
store.applyPromoCode();
assert(store.discountAmount() > 0, "promo discount failed");
store.clearCart();

const blocked = AbsorbPointer({ style: { position: "static" } }, [Text("x")]);
assert(blocked.props.style.position === "relative", "AbsorbPointer position failed");
assert(blocked.children.length === 2, "AbsorbPointer overlay missing");

let rootArray = ["a", "b"];
const fragmentRoot = new ElementNode("root");
const fragmentUpdate = mount(() => rootArray, fragmentRoot);
rootArray = ["c", "d"];
fragmentUpdate();
assert(fragmentRoot.textContent === "cd", "root fragment update failed");

let nestedClicks = 0;
let missingForceUpdate = 0;
function Child(forceUpdate) {
  return Button({
    text: "Child",
    onClick: () => {
      if (typeof forceUpdate !== "function") missingForceUpdate += 1;
      else nestedClicks += 1;
    },
  });
}
const nestedRoot = new ElementNode("root");
const nestedUpdate = mount(() => Column([Child]), nestedRoot);
nestedUpdate();
nestedRoot.childNodes[0].childNodes[0].click();
assert(missingForceUpdate === 0, "nested function widget lost forceUpdate");
assert(nestedClicks === 1, "nested function widget click failed");

let snackOpen = true;
const stackRoot = new ElementNode("root");
const stackUpdate = mount(
  () =>
    snackOpen
      ? SnackBar({
          message: "Saved",
          action: Button({
            text: "Dismiss",
            onClick: () => {
              snackOpen = false;
              stackUpdate();
            },
          }),
        })
      : null,
  stackRoot,
);
stackRoot.childNodes[0].childNodes[1].click();
assert(stackRoot.textContent === "", "snackbar dismiss failed");

let listItems = ["a", "b", "c", "d"];
const listRoot = new ElementNode("root");
const listUpdate = mount(
  () => ({
    tag: "ul",
    children: listItems.map((t) => ({ tag: "li", children: [t] })),
  }),
  listRoot,
);
listItems = ["a"];
listUpdate();
assert(
  listRoot.childNodes[0].childNodes.length === 1 &&
    listRoot.textContent === "a",
  "non-keyed list did not remove stale nodes when it shrank",
);
listItems = ["x", "y", "z"];
listUpdate();
assert(
  listRoot.textContent === "xyz",
  "non-keyed list failed to grow back after shrinking",
);

let mixToggle = 0;
const mixRoot = new ElementNode("root");
const mixUpdate = mount(
  () => ({
    tag: "div",
    children: [
      { tag: "span", children: [`unkeyed-${mixToggle}`] },
      { tag: "span", key: "k1", children: ["keyed"] },
    ],
  }),
  mixRoot,
);
const unkeyedBefore = mixRoot.childNodes[0].childNodes[0];
mixToggle = 1;
mixUpdate();
assert(
  mixRoot.childNodes[0].childNodes[0] === unkeyedBefore &&
    mixRoot.textContent === "unkeyed-1keyed",
  "unkeyed sibling of a keyed child was recreated instead of patched",
);

const notifyRouter = createRouter({ initialPath: "/" });
let routerNotifies = 0;
notifyRouter.subscribe(() => {
  routerNotifies += 1;
});
notifyRouter.navigate("/");
assert(routerNotifies === 0, "router notified subscribers on unchanged path");
notifyRouter.navigate("/elsewhere");
assert(routerNotifies === 1, "router failed to notify on a real path change");

errorBus.clear();
errorBus.capture(new Error("devtools boom"), { source: "event" });
let devOpen = false;
const devRoot = new ElementNode("root");
mount(
  () => DevTools({ open: devOpen, onOpenChange: (v) => { devOpen = v; } }),
  devRoot,
);
assert(
  devRoot.childNodes[0].childNodes[1].textContent === "1",
  "devtools badge did not show the captured error count",
);
assert(
  !devRoot.textContent.includes("caught"),
  "devtools panel should start closed",
);
devRoot.childNodes[0].click();
assert(devOpen === true, "devtools button did not toggle open state");
assert(
  devRoot.textContent.includes("1 caught"),
  "devtools panel did not open after clicking the button",
);
errorBus.capture(new Error("second boom"), { source: "state" });
await Promise.resolve();
await Promise.resolve();
assert(
  devRoot.childNodes[0].childNodes[1].textContent === "2",
  "devtools did not live-update when a new error was captured",
);
errorBus.clear();
await Promise.resolve();
await Promise.resolve();
assert(
  devRoot.childNodes[0].childNodes[1].textContent === "0",
  "devtools did not refresh after errorBus.clear()",
);

console.log("smoke ok");
