# LuminaUI

LuminaUI is a lightweight, Flutter-inspired UI library for building web
interfaces with plain JavaScript, HTML, and the browser DOM.

The core idea is simple: build your UI as a tree of JavaScript widget
functions. Each widget returns a small virtual node object, and LuminaUI turns
that tree into real DOM.

No JSX. No build step. No dependencies. Open `index.html` and it runs.

```js
Column({ gap: 12 }, [
  Text("Hello LuminaUI"),
  Button({ text: "Click Me", onClick: () => console.log("clicked") }),
])
```

## Why LuminaUI?

Traditional small web projects often spread one feature across HTML, CSS, and
JavaScript files. LuminaUI keeps the UI structure, behavior, and local styling
close together through a single composable model.

LuminaUI gives you:

- Widget-tree composition inspired by Flutter
- Vanilla JavaScript modules
- Real DOM output
- A tiny reactive state primitive
- Layout, forms, navigation, feedback, scrolling, display, and animation widgets
- No npm install, bundler, compiler, or framework runtime

LuminaUI is still experimental, but it is now large enough for developers to
build small apps and understand how the framework is intended to grow.

## Quick Start

Clone the project and open `index.html` in a browser.

```bash
git clone https://github.com/<your-username>/lumina-ui.git
cd LuminaUI
```

If your browser blocks ES module imports from local files, serve the folder:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

The demo app is mounted from `index.html`:

```html
<div id="root"></div>
<script type="module">
  import { App } from "./lumina-ui.js";
  import { mount } from "./lumina-ui/core/renderer.js";

  const root = document.getElementById("root");
  mount(App, root);
</script>
```

## Project Structure

```text
LuminaUI/
├── index.html
├── lumina-ui.js
├── README.md
└── lumina-ui/
    ├── app/
    │   └── App.js
    ├── core/
    │   ├── element.js
    │   ├── renderer.js
    │   └── state.js
    └── widgets/
        ├── animation.js
        ├── controls.js
        ├── display.js
        ├── feedback.js
        ├── forms.js
        ├── layout.js
        ├── navigation.js
        ├── scrolling.js
        ├── text.js
        └── utils.js
```

### Important files

- `lumina-ui.js`: public entry point that re-exports the framework API.
- `lumina-ui/app/App.js`: demo application showing how widgets are used.
- `lumina-ui/core/renderer.js`: `mount()` and DOM patching.
- `lumina-ui/core/state.js`: `createState`, `useEffect`, and `createStore`.
- `lumina-ui/core/element.js`: low-level DOM element creation.
- `lumina-ui/widgets/*`: widget modules grouped by purpose.

## Core Mental Model

Every UI piece is a function that returns one of these:

- a virtual node object: `{ tag, props, children, key }`
- a string or number
- an array of children
- `null`, `undefined`, or `false` to render nothing
- a real DOM `Node`, when needed

Most widgets are called in one of two styles.

Compact children-first style:

```js
Column([
  Text("First"),
  Text("Second"),
])
```

Configured `props, children` style:

```js
Column({ gap: 12, padding: 16 }, [
  Text("First"),
  Text("Second"),
])
```

Single-child prop style:

```js
Padding({
  padding: 16,
  child: Text("Inside padding"),
})
```

LuminaUI uses plain JavaScript objects for style:

```js
Container(
  {
    padding: 16,
    decoration: {
      color: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: 8,
    },
  },
  [Text("Card-like content")],
)
```

Numbers used for dimensions are generally converted to pixels by widget
helpers. Strings are passed through.

```js
SizedBox({ width: 120, height: "50vh" })
```

## Importing

You can import from the top-level entry point:

```js
import {
  mount,
  useState,
  Column,
  Text,
  Button,
} from "./lumina-ui.js";
```

Or import directly from modules:

```js
import { mount } from "./lumina-ui/core/renderer.js";
import { createState } from "./lumina-ui/core/state.js";
import { Column, Row } from "./lumina-ui/widgets/layout.js";
import { Button } from "./lumina-ui/widgets/controls.js";
import { Text } from "./lumina-ui/widgets/text.js";
```

## Rendering

Mount an app component with `mount(componentFn, container)`.

```js
import { mount, Column, Text } from "./lumina-ui.js";

function App() {
  return Column([
    Text("Mounted with LuminaUI"),
  ]);
}

mount(App, document.getElementById("root"));
```

`mount()` passes a `forceUpdate` function into your app:

```js
function App(forceUpdate) {
  // Use forceUpdate with createState subscriptions.
}
```

The returned update function can also unmount:

```js
const update = mount(App, root);
update.unmount();
```

## State

LuminaUI state is explicit. The top-level entry point exports this as
`useState`, and the core state module exports the same primitive as
`createState`.

```js
import { useState } from "./lumina-ui.js";

const [getValue, setValue, subscribe] = useState(initialValue);
```

The direct core import is also available:

```js
import { createState } from "./lumina-ui/core/state.js";

const [getValue, setValue, subscribe] = createState(initialValue);
```

- `getValue()` reads the current value.
- `setValue(next)` updates the value.
- `subscribe(fn)` runs `fn` whenever the value changes.

Basic counter:

```js
import { mount, useState, Column, Row, Text, Button } from "./lumina-ui.js";

const [count, setCount, subscribeCount] = useState(0);

function App(forceUpdate) {
  subscribeCount(forceUpdate);

  return Column({ gap: 12 }, [
    Text(`Count: ${count()}`),
    Row({ gap: 8 }, [
      Button({ text: "-", onClick: () => setCount((value) => value - 1) }),
      Button({ text: "+", onClick: () => setCount((value) => value + 1) }),
    ]),
  ]);
}

mount(App, document.getElementById("root"));
```

Recommended pattern for app-level state:

```js
const [getDarkMode, setDarkMode, subscribeDarkMode] = useState(false);
const subscribedUpdates = new WeakSet();

function bindState(forceUpdate) {
  if (typeof forceUpdate !== "function" || subscribedUpdates.has(forceUpdate)) {
    return;
  }

  subscribeDarkMode(forceUpdate);
  subscribedUpdates.add(forceUpdate);
}

export function App(forceUpdate) {
  bindState(forceUpdate);

  return Switch({
    value: getDarkMode(),
    onChange: setDarkMode,
  });
}
```

This avoids repeatedly adding the same update function as a subscriber on every
render.

## Store

For reducer-style state, use `createStore(reducer, initialState)`.

```js
const store = createStore(
  (state, action) => {
    if (action.type === "increment") return { count: state.count + 1 };
    return state;
  },
  { count: 0 },
);

store.subscribe(forceUpdate);
store.dispatch({ type: "increment" });
store.getState();
```

## Widget Reference

This section lists the current widget families and the most useful props. The
API is intentionally small and JavaScript-friendly.

### Layout Widgets

Import:

```js
import {
  Column,
  Row,
  Container,
  Center,
  Align,
  Padding,
  SizedBox,
  Flexible,
  Expanded,
  Spacer,
  Wrap,
  Stack,
  Positioned,
  Divider,
  Card,
} from "./lumina-ui.js";
```

#### `Column(props, children)`

Flex column layout.

Common props:

- `gap`
- `padding`
- `mainAxisAlignment`
- `crossAxisAlignment`
- `align`
- `style`

```js
Column({ gap: 10, padding: 16 }, [
  Text("Top"),
  Text("Bottom"),
])
```

#### `Row(props, children)`

Flex row layout.

```js
Row({ gap: 8, mainAxisAlignment: "spaceBetween" }, [
  Text("Left"),
  Button({ text: "Right" }),
])
```

#### `Container(props, children)`

General-purpose box.

Common props:

- `width`, `height`
- `minWidth`, `minHeight`, `maxWidth`, `maxHeight`
- `padding`, `margin`
- `color`
- `alignment`
- `decoration`
- `style`

```js
Container(
  {
    width: 320,
    padding: { vertical: 12, horizontal: 16 },
    decoration: {
      color: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
  },
  [Text("Container content")],
)
```

#### `Center(children)` and `Align(props, children)`

Use `Center` for centered content. Use `Align` for named alignments.

```js
Center([Text("Centered")])

Align({ alignment: "bottomRight" }, [
  Text("Bottom right"),
])
```

Supported alignment names include:

- `center`
- `topCenter`
- `bottomCenter`
- `centerLeft`
- `centerRight`
- `topLeft`
- `topRight`
- `bottomLeft`
- `bottomRight`

#### `Padding(props, children)`

```js
Padding({ padding: { vertical: 8, horizontal: 12 } }, [
  Text("Padded"),
])
```

Padding accepts:

- number: `16`
- string: `"1rem"`
- object: `{ all, vertical, horizontal, top, right, bottom, left }`

#### `SizedBox(props, children)`

Adds fixed width and/or height.

```js
SizedBox({ height: 16 })
SizedBox({ width: 200, child: Text("Fixed width") })
```

#### `Flexible`, `Expanded`, and `Spacer`

Use these inside `Row` or `Column`.

```js
Row([
  Expanded([Text("Takes available space")]),
  Spacer(),
  Button({ text: "Action" }),
])
```

#### `Wrap(props, children)`

Wrapping flex layout.

```js
Wrap({ gap: 8 }, [
  chip("Text"),
  chip("Container"),
  chip("Button"),
])
```

#### `Stack` and `Positioned`

Layer children relative to a container.

```js
Stack({ height: 160 }, [
  Container({ color: "#eef2ff", height: "100%" }),
  Positioned({
    right: 12,
    bottom: 12,
    child: Button({ text: "Floating" }),
  }),
])
```

#### `Divider`

```js
Divider()
Divider({ direction: "vertical", thickness: 1 })
```

#### `Card`

Card is a styled `Container` shortcut.

```js
Card({ elevation: 2, padding: 16 }, [
  Text("Card content"),
])
```

### Text Widgets

Import:

```js
import { Text, Heading, Caption } from "./lumina-ui.js";
```

#### `Text(content, props)`

Common props:

- `size`
- `weight`
- `align`
- `color`
- `lineHeight`
- `maxLines`
- `as`
- `style`

```js
Text("Hello", { size: 18, weight: 700, color: "#2563eb" })
Text("Paragraph", { as: "p", lineHeight: 1.7 })
```

#### `Heading(props, children)`

```js
Heading({ level: 2 }, "Section title")
```

#### `Caption(props, children)`

```js
Caption({ color: "#6b7280" }, "Small helper text")
```

### Controls

Import:

```js
import { Button, Input, TextField, Checkbox, Switch } from "./lumina-ui.js";
```

#### `Button(props)`

Props:

- `text`
- `onClick`
- `variant`: `primary`, `secondary`, `text`, `danger`
- `disabled`
- `type`
- `style`

```js
Button({
  text: "Save",
  variant: "primary",
  onClick: save,
})
```

#### `Input(props)` and `TextField(props)`

`Input` supports text inputs and checkbox input behavior. `TextField` is a
convenience wrapper for text input.

```js
Input({
  value: name(),
  placeholder: "Your name",
  onChange: setName,
})

Input({
  type: "checkbox",
  value: accepted(),
  onChange: setAccepted,
})
```

#### `Checkbox(props)`

```js
Checkbox({
  checked: done(),
  label: "Completed",
  onChange: setDone,
})
```

#### `Switch(props)`

```js
Switch({
  value: enabled(),
  onChange: setEnabled,
  ariaLabel: "Enable notifications",
})
```

### Display Widgets

Import:

```js
import {
  Icon,
  Image,
  CircleAvatar,
  Badge,
  Placeholder,
  ClipRRect,
} from "./lumina-ui.js";
```

#### `Icon(propsOrName, maybeProps)`

```js
Icon("home")
Icon({ name: "settings", size: 28, color: "#2563eb" })
```

Available built-in icon names are simple text symbols:

```text
add, remove, close, check, search, menu, home, settings, person, info,
warning, error, delete, edit, save, star, favorite, arrowBack, arrowForward,
play, pause
```

#### `Image(props)`

```js
Image({
  src: "/assets/photo.jpg",
  alt: "Product",
  height: 180,
  fit: "cover",
  radius: 8,
})
```

#### `CircleAvatar(props, children)`

```js
CircleAvatar({ initials: "LU", size: 48 })
CircleAvatar({ src: "/avatar.png", alt: "User", size: 48 })
```

#### `Badge(props, children)`

```js
Badge({ label: "3" }, [
  Icon("star"),
])
```

#### `Placeholder`

```js
Placeholder({ height: 120, label: "Image placeholder" })
```

#### `ClipRRect`

Clips children with rounded corners.

```js
ClipRRect({ radius: 12 }, [
  Image({ src: "/photo.jpg", alt: "Photo" }),
])
```

### Scrolling Widgets

Import:

```js
import { SingleChildScrollView, ListView, GridView } from "./lumina-ui.js";
```

#### `SingleChildScrollView(props, children)`

```js
SingleChildScrollView({
  maxHeight: 240,
  child: Column([
    Text("Scrollable content"),
  ]),
})
```

#### `ListView(props, children)`

Use direct children:

```js
ListView({ gap: 8 }, [
  Text("One"),
  Text("Two"),
])
```

Use builder-style data:

```js
ListView({
  items: todos(),
  gap: 8,
  itemBuilder: (todo) => Text(todo.title),
})
```

Optional props:

- `items`
- `itemBuilder`
- `separatorBuilder`
- `direction`
- `gap`
- `padding`
- `empty`

#### `GridView(props, children)`

```js
GridView({
  items: products,
  minColumnWidth: 160,
  gap: 12,
  itemBuilder: (product) => Card([Text(product.name)]),
})
```

Use `columns` for a fixed number of columns:

```js
GridView({ columns: 3, gap: 12 }, cards)
```

### Feedback Widgets

Import:

```js
import {
  Dialog,
  AlertDialog,
  ModalBarrier,
  SnackBar,
  Tooltip,
  LinearProgressIndicator,
  CircularProgressIndicator,
} from "./lumina-ui.js";
```

#### `Dialog(props, children)`

Return `null` by setting `open: false`.

```js
Dialog(
  {
    open: dialogOpen(),
    onDismiss: () => setDialogOpen(false),
  },
  [
    Padding({ padding: 20 }, [
      Column({ gap: 12 }, [
        Heading({ level: 2 }, "Dialog"),
        Text("Dialog content"),
        Button({ text: "Close", onClick: () => setDialogOpen(false) }),
      ]),
    ]),
  ],
)
```

#### `AlertDialog(props)`

```js
AlertDialog({
  open: confirmOpen(),
  title: "Delete item?",
  content: "This action cannot be undone.",
  actions: [
    Button({ text: "Cancel", variant: "text" }),
    Button({ text: "Delete", variant: "danger" }),
  ],
})
```

#### `SnackBar(props, children)`

```js
SnackBar({
  open: snackbarOpen(),
  message: "Saved successfully",
  action: Button({
    text: "Dismiss",
    variant: "text",
    onClick: () => setSnackbarOpen(false),
  }),
})
```

#### `Tooltip`

Uses the native browser `title` tooltip.

```js
Tooltip({ message: "More information" }, [
  Icon("info"),
])
```

#### Progress indicators

Determinate linear progress:

```js
LinearProgressIndicator({ value: 0.65 })
```

Indeterminate linear progress:

```js
LinearProgressIndicator()
```

Circular progress:

```js
CircularProgressIndicator({ size: 32 })
```

### Forms

Import:

```js
import {
  Form,
  FormField,
  Radio,
  RadioGroup,
  Slider,
  Dropdown,
  TextArea,
} from "./lumina-ui.js";
```

#### `Form(props, children)`

LuminaUI forms prevent default browser submit behavior by default and call your
`onSubmit` handler.

```js
Form(
  {
    gap: 12,
    onSubmit: () => console.log("submit"),
  },
  [
    FormField({ label: "Name" }, [
      TextField({ value: name(), onChange: setName }),
    ]),
    Button({ text: "Submit", type: "submit" }),
  ],
)
```

#### `FormField(props, children)`

Use it for label, helper text, required indicator, and error text.

```js
FormField(
  {
    label: "Notes",
    helperText: "Keep it short.",
    errorText: notes().length > 80 ? "Too long" : "",
  },
  [
    TextArea({ value: notes(), onChange: setNotes }),
  ],
)
```

#### `Radio` and `RadioGroup`

```js
RadioGroup({
  value: role(),
  onChange: setRole,
  direction: "horizontal",
  options: [
    { label: "Designer", value: "designer" },
    { label: "Engineer", value: "engineer" },
  ],
})
```

#### `Slider`

```js
Slider({
  value: volume(),
  min: 0,
  max: 100,
  onChange: setVolume,
})
```

#### `Dropdown`

```js
Dropdown({
  value: plan(),
  onChange: setPlan,
  placeholder: "Choose plan",
  options: [
    { label: "Starter", value: "starter" },
    { label: "Studio", value: "studio" },
  ],
})
```

#### `TextArea`

```js
TextArea({
  value: message(),
  onChange: setMessage,
  rows: 4,
  placeholder: "Write a message",
})
```

### Navigation

Import:

```js
import {
  Scaffold,
  AppBar,
  TabBar,
  TabBarView,
  BottomNavigationBar,
  NavigationRail,
  Drawer,
} from "./lumina-ui.js";
```

#### `Scaffold`

`Scaffold` composes common application regions.

```js
Scaffold({
  appBar: AppBar({ title: "Dashboard" }),
  body: Padding({ padding: 16 }, [
    Text("Main content"),
  ]),
  bottomNavigationBar: BottomNavigationBar({
    value: page(),
    onChange: setPage,
    items: [
      { label: "Home", value: "home", icon: Icon("home") },
      { label: "Profile", value: "profile", icon: Icon("person") },
    ],
  }),
})
```

#### `AppBar`

```js
AppBar({
  title: "LuminaUI",
  leading: Button({ text: "Menu" }),
  actions: [Icon("settings")],
})
```

#### `TabBar` and `TabBarView`

```js
const tabs = [
  { label: "Overview", value: "overview", child: Text("Overview content") },
  { label: "Details", value: "details", child: Text("Details content") },
];

Column([
  TabBar({ tabs, value: activeTab(), onChange: setActiveTab }),
  TabBarView({ tabs, value: activeTab() }),
])
```

#### `BottomNavigationBar`

```js
BottomNavigationBar({
  value: page(),
  onChange: setPage,
  items: [
    { label: "Home", value: "home", icon: Icon("home") },
    { label: "Build", value: "build", icon: Icon("settings") },
    { label: "Profile", value: "profile", icon: Icon("person") },
  ],
})
```

#### `Drawer`

```js
Drawer(
  { open: drawerOpen() },
  [
    Padding({ padding: 16 }, [
      Button({ text: "Close", onClick: () => setDrawerOpen(false) }),
    ]),
  ],
)
```

### Animation

Import:

```js
import {
  AnimatedContainer,
  AnimatedOpacity,
  AnimatedScale,
  AnimatedSlide,
  AnimatedSwitcher,
} from "./lumina-ui.js";
```

The animation widgets are transition wrappers. They do not run a custom
animation engine; they apply CSS transitions to DOM elements.

#### `AnimatedContainer`

```js
AnimatedContainer(
  {
    width: active() ? 160 : 80,
    height: 80,
    duration: 250,
    style: {
      backgroundColor: active() ? "#059669" : "#2563eb",
      borderRadius: active() ? "16px" : "50%",
    },
  },
  [],
)
```

#### `AnimatedOpacity`

```js
AnimatedOpacity({ opacity: visible() ? 1 : 0, duration: 180 }, [
  Text("Fade me"),
])
```

#### `AnimatedScale`

```js
AnimatedScale({ scale: selected() ? 1.1 : 1 }, [
  Card([Text("Scale")]),
])
```

#### `AnimatedSlide`

```js
AnimatedSlide({ offset: { x: 40, y: 0 }, duration: 220 }, [
  Text("Slide"),
])
```

#### `AnimatedSwitcher`

```js
AnimatedSwitcher({
  child: selected() ? Text("A") : Text("B"),
})
```

## Complete Example

This example combines state, layout, navigation, and feedback.

```js
import {
  mount,
  useState,
  Column,
  Padding,
  Text,
  Button,
  Scaffold,
  AppBar,
  BottomNavigationBar,
  SnackBar,
  Icon,
} from "./lumina-ui.js";

const [getPage, setPage, subscribePage] = useState("home");
const [getSnack, setSnack, subscribeSnack] = useState(false);
const updates = new WeakSet();

function bind(forceUpdate) {
  if (updates.has(forceUpdate)) return;
  subscribePage(forceUpdate);
  subscribeSnack(forceUpdate);
  updates.add(forceUpdate);
}

function App(forceUpdate) {
  bind(forceUpdate);

  return Column([
    Scaffold({
      appBar: AppBar({ title: "Example App" }),
      body: Padding({ padding: 16 }, [
        Column({ gap: 12 }, [
          Text(`Current page: ${getPage()}`),
          Button({
            text: "Show snackbar",
            onClick: () => setSnack(true),
          }),
        ]),
      ]),
      bottomNavigationBar: BottomNavigationBar({
        value: getPage(),
        onChange: setPage,
        items: [
          { label: "Home", value: "home", icon: Icon("home") },
          { label: "Build", value: "build", icon: Icon("settings") },
        ],
      }),
    }),
    SnackBar({
      open: getSnack(),
      message: "Hello from LuminaUI",
      action: Button({
        text: "Dismiss",
        variant: "text",
        onClick: () => setSnack(false),
      }),
    }),
  ]);
}

mount(App, document.getElementById("root"));
```

## Renderer Behavior

LuminaUI has a small renderer, not a full virtual DOM system.

What it currently does:

- Converts widget trees into real DOM nodes.
- Patches existing DOM on state updates.
- Updates props and event listeners.
- Handles keyed children in a basic way.
- Treats `null`, `undefined`, and `false` as empty widgets.
- Cleans up removed or empty props during patching.

What it does not do yet:

- Advanced diffing like React, Vue, or Flutter.
- Component-local hook state.
- Lifecycle methods tied directly to mounted widgets.
- Suspense, portals, async rendering, or hydration.

For now, keep state explicit and prefer small widget trees.

## Styling

LuminaUI uses inline style objects by default.

```js
Text("Styled", {
  style: {
    letterSpacing: "0",
    textTransform: "uppercase",
  },
})
```

You can still use CSS classes with `className`:

```js
Container({ className: "panel" }, [
  Text("Class-based styling works too"),
])
```

The low-level `createElement` utility supports:

- `style`
- `className`
- `dataset`
- event handlers like `onClick`, `onInput`, `onKeyDown`
- DOM props like `value`, `checked`, `disabled`, `selected`
- ARIA attributes

## Keys

Use `key` when rendering dynamic lists.

```js
Column(
  {},
  todos().map((todo) =>
    Row(
      { key: todo.id },
      [
        Text(todo.title),
        Button({ text: "Delete", onClick: () => removeTodo(todo.id) }),
      ],
    ),
  ),
)
```

The keyed reconciliation is intentionally simple. Stable keys help LuminaUI keep
DOM nodes aligned when arrays change.

## Current Demo

`lumina-ui/app/App.js` demonstrates:

- counters
- todo list
- theme toggle
- layout widgets
- display widgets
- scrolling widgets
- feedback widgets
- navigation widgets

Use it as a living playground for new widgets.

## Extending LuminaUI

To create a new widget:

1. Add a function in the appropriate file under `lumina-ui/widgets/`.
2. Return a virtual node object: `{ tag, props, children, key }`.
3. Use helpers from `widgets/utils.js` for child normalization and pixel values.
4. Export it from `lumina-ui.js`.
5. Add a small example in `app/App.js`.
6. Document it in this README.

Small widget example:

```js
import { cleanStyle, normalizeWidgetArgs, omitProps } from "./utils.js";

export function Panel(propsOrChildren = {}, maybeChildren = undefined) {
  const [props, children] = normalizeWidgetArgs(propsOrChildren, maybeChildren);

  return {
    tag: "section",
    props: {
      ...omitProps(props),
      style: cleanStyle({
        padding: "16px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        ...props.style,
      }),
    },
    children,
    key: props.key,
  };
}
```

## Current Limitations

LuminaUI is experimental. Important limitations:

- Rendering is simple and can still be improved.
- There is no component-local hook system yet.
- There is no global theme provider yet.
- Routing is not implemented yet.
- Accessibility coverage is partial and should be expanded widget by widget.
- Most widgets use inline styles rather than a design token system.
- Animation widgets use CSS transitions only.

## Roadmap

Completed:

- Layout widgets: `Column`, `Row`, `Container`, `Center`, `Align`, `Padding`,
  `SizedBox`, `Flexible`, `Expanded`, `Spacer`, `Wrap`, `Stack`, `Positioned`,
  `Divider`, `Card`
- Text widgets: `Text`, `Heading`, `Caption`
- Controls: `Button`, `Input`, `TextField`, `Checkbox`, `Switch`
- Display widgets: `Icon`, `Image`, `CircleAvatar`, `Badge`, `Placeholder`,
  `ClipRRect`
- Scrolling widgets: `SingleChildScrollView`, `ListView`, `GridView`
- Feedback widgets: `Dialog`, `AlertDialog`, `ModalBarrier`, `SnackBar`,
  `Tooltip`, `LinearProgressIndicator`, `CircularProgressIndicator`
- Form widgets: `Form`, `FormField`, `Radio`, `RadioGroup`, `Slider`,
  `Dropdown`, `TextArea`
- Navigation widgets: `Scaffold`, `AppBar`, `TabBar`, `TabBarView`,
  `BottomNavigationBar`, `NavigationRail`, `Drawer`
- Animation widgets: `AnimatedContainer`, `AnimatedOpacity`, `AnimatedScale`,
  `AnimatedSlide`, `AnimatedSwitcher`

Next:

- Smarter rendering and diffing
- Component isolation
- Lifecycle hooks
- Theme system
- Router
- Better keyboard accessibility
- More Material-style components

## License

MIT

## Vision

LuminaUI is an experiment in bringing Flutter's widget model to the web without
giving up vanilla JavaScript. The goal is a UI system that stays small enough to
read, simple enough to modify, and expressive enough to build real interfaces.
