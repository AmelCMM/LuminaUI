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
  Input,
  ListView,
  SnackBar,
  Switch,
  Text,
  mount,
} = await import("../lumina-ui.js");

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

const blocked = AbsorbPointer({ style: { position: "static" } }, [Text("x")]);
assert(blocked.props.style.position === "relative", "AbsorbPointer position failed");
assert(blocked.children.length === 2, "AbsorbPointer overlay missing");

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

console.log("smoke ok");
