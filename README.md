# LuminaUI

A lightweight, Flutter-inspired UI library for building web interfaces with vanilla JavaScript and HTML.

The idea is simple: instead of scattering HTML, CSS, and JS across files, you compose UI using pure JavaScript functions — the same way you'd build a widget tree in Flutter. No framework overhead, no build step, no dependencies.

---

## ✨ Why LuminaUI?

Most web projects start clean and end up messy. HTML in one place, styles bleeding in from three different files, JS wiring it all together with varying degrees of confidence. Layout patterns drift between components. Things stop making sense fast.

LuminaUI trades that for a single composable model:

- Predictable structure — everything is a function returning a DOM node
- One layout system — `Column`, `Row`, and friends, used consistently
- No toolchain — open `index.html` and it works
- Full DOM control — no virtual DOM layer hiding what's actually happening

---

## 🧱 Core Concepts

LuminaUI uses a widget-based composition model. You build UI by nesting JavaScript functions:

```js
Column([
  Text("Hello World"),
  Button({ text: "Click Me", onClick: handleClick })
])
```

Widgets also accept a Flutter-like `props, children` form when you need
configuration:

```js
Column({ gap: 12, mainAxisAlignment: "center" }, [
  Padding({ padding: 16 }, [
    Text("Hello World")
  ])
])
```

That's it. No JSX, no templates, no special syntax.

---

## 🚀 Example

```js
import { Column, Row } from "./widgets/layout.js";
import { Button } from "./widgets/controls.js";
import { Text } from "./widgets/text.js";
import { createState } from "./core/state.js";
import { mount } from "./core/renderer.js";

const [count, setCount, subscribe] = createState(0);

function App(update) {
  subscribe(update);

  return Column([
    Text("Count: " + count()),

    Row([
      Button({ text: "+", onClick: () => setCount(count() + 1) }),
      Button({ text: "-", onClick: () => setCount(count() - 1) })
    ])
  ]);
}

const root = document.getElementById("app");
mount(App, root);
```

---

## 📦 Project Structure

```
lumina-ui/
│
├── core/
│   ├── element.js      # DOM creation utilities
│   ├── renderer.js     # mount/update logic
│   └── state.js        # reactive state system
│
├── widgets/
│   ├── layout.js       # Column, Row, layout primitives
│   ├── controls.js     # Button, Input, etc.
│   ├── display.js      # Icon, Image, avatars, badges
│   ├── scrolling.js    # ScrollView, ListView, GridView
│   ├── feedback.js     # Dialogs, snackbars, progress
│   ├── text.js         # Text rendering
│   └── utils.js        # Shared widget helpers
│
├── app/
│   └── App.js          # application code
│
├── lumina-ui.js             # entry point
└── index.html
```

---

## 🧩 Available Widgets

**Layout:** `Column`, `Row`, `Container`, `Center`, `Align`, `Padding`,
`SizedBox`, `Flexible`, `Expanded`, `Spacer`, `Wrap`, `Stack`, `Positioned`,
`Divider`, `Card`

**Text:** `Text`, `Heading`, `Caption`

**Controls:** `Button`, `Input`, `TextField`, `Checkbox`, `Switch`

**Display:** `Icon`, `Image`, `CircleAvatar`, `Badge`, `Placeholder`,
`ClipRRect`

**Scrolling:** `SingleChildScrollView`, `ListView`, `GridView`

**Feedback:** `Dialog`, `AlertDialog`, `ModalBarrier`, `SnackBar`, `Tooltip`,
`LinearProgressIndicator`, `CircularProgressIndicator`

The API supports both compact children-first calls like `Column([Text("Hi")])`
and configured calls like `Column({ gap: 8 }, [Text("Hi")])`.

---

## ⚙️ How It Works

Three primitives power everything:

- **Element factory** — creates DOM nodes
- **Renderer** — mounts and re-renders the UI
- **State system** — triggers updates when state changes

No virtual DOM. No compilation. No external packages.

---

## 🛠️ Getting Started

```bash
git clone https://github.com/<your-username>/lumina-ui.git
cd lumina-ui
```

Open `index.html` in a browser. That's the whole setup.

---

## 📌 Design Goals

Small API surface. Predictable behavior. Something that feels like a framework but doesn't require one.

---

## ⚠️ Current Limitations

LuminaUI is experimental. Right now it does a full re-render on every state update — no diffing. Component-level state isolation, advanced layout primitives, and lifecycle hooks don't exist yet.

These are the next things to fix.

---

## 🧭 Roadmap

- [x] `Padding`, `Expanded`, `Center` widgets
- [x] First layout bricks: `Align`, `SizedBox`, `Flexible`, `Spacer`, `Wrap`,
      `Stack`, `Positioned`, `Divider`, `Card`
- [x] Display widgets: `Icon`, `Image`, `CircleAvatar`, `Badge`,
      `Placeholder`, `ClipRRect`
- [x] Scrolling widgets: `ListView`, `GridView`, `SingleChildScrollView`
- [x] Feedback widgets: dialog, snackbar, tooltip, progress indicators
- [ ] Form widgets: `Radio`, `Slider`, `Dropdown`, `Form`
- [ ] Navigation widgets: tabs, drawer, route shell
- [ ] Animation widgets: animated container, opacity, cross-fade
- [ ] Smarter rendering (diffing)
- [ ] Component isolation
- [ ] Theming system
- [ ] Basic routing

---

## 🤝 Contributing

Issues and pull requests are welcome. If you have an idea or hit a bug, open an issue.

---

## 📄 License

MIT

---

## 💡 Vision

LuminaUI is an experiment in bringing Flutter's widget model to the web without giving up vanilla JavaScript. Whether that ends up being useful beyond personal projects remains to be seen — but the goal is a UI system you can actually read and reason about.
