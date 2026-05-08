import {
  Align,
  Card,
  Center,
  Column,
  Container,
  Divider,
  Expanded,
  Padding,
  Positioned,
  Row,
  SizedBox,
  Spacer,
  Stack,
  Wrap,
} from "../widgets/layout.js";
import { Button, Input, Switch } from "../widgets/controls.js";
import { Caption, Heading, Text } from "../widgets/text.js";
import { createState } from "../core/state.js";

const [getDarkMode, setDarkMode, subscribeDarkMode] = createState(false);
const [getCounterOne, setCounterOne, subscribeCounterOne] = createState(0);
const [getCounterTwo, setCounterTwo, subscribeCounterTwo] = createState(10);
const [getTodos, setTodos, subscribeTodos] = createState([]);
const [getInput, setInput, subscribeInput] = createState("");

const subscribedUpdates = new WeakSet();

function bindState(forceUpdate) {
  if (typeof forceUpdate !== "function" || subscribedUpdates.has(forceUpdate)) {
    return;
  }

  [
    subscribeDarkMode,
    subscribeCounterOne,
    subscribeCounterTwo,
    subscribeTodos,
    subscribeInput,
  ].forEach((subscribe) => subscribe(forceUpdate));

  subscribedUpdates.add(forceUpdate);
}

function Counter({ label, getValue, setValue, initialValue, theme }) {
  return Card(
    {
      elevation: 1,
      style: {
        backgroundColor: theme.surface,
        borderColor: theme.border,
        width: "min(100%, 280px)",
      },
    },
    [
      Column({ gap: 12 }, [
        Row({ mainAxisAlignment: "spaceBetween" }, [
          Heading({ level: 3, style: { color: theme.text } }, label),
          Text(getValue(), {
            size: 28,
            weight: 700,
            color: theme.primary,
            as: "strong",
          }),
        ]),
        Row({ gap: 8 }, [
          Button({
            text: "-",
            onClick: () => setValue((value) => value - 1),
            variant: "secondary",
            "aria-label": `Decrease ${label}`,
          }),
          Button({
            text: "+",
            onClick: () => setValue((value) => value + 1),
            variant: "primary",
            "aria-label": `Increase ${label}`,
          }),
          Spacer(),
          Button({
            text: "Reset",
            onClick: () => setValue(initialValue),
            variant: "text",
          }),
        ]),
      ]),
    ],
  );
}

function TodoApp(theme) {
  const todos = getTodos();
  const inputValue = getInput();

  const addTodo = () => {
    if (!inputValue.trim()) return;

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now());

    setTodos((items) => [
      ...items,
      { id, text: inputValue.trim(), completed: false },
    ]);
    setInput("");
  };

  const toggleTodo = (id) => {
    setTodos((items) =>
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  };

  const deleteTodo = (id) => {
    setTodos((items) => items.filter((item) => item.id !== id));
  };

  return Card(
    {
      elevation: 1,
      style: {
        backgroundColor: theme.surface,
        borderColor: theme.border,
        width: "min(100%, 560px)",
      },
    },
    [
      Column({ gap: 14 }, [
        Heading({ level: 2, style: { color: theme.text } }, "Todo App"),
        Row({ gap: 10, style: { alignItems: "stretch" } }, [
          Expanded([
            Input({
              value: inputValue,
              onChange: setInput,
              placeholder: "Add a new todo",
              onKeyDown: (event) => {
                if (event.key === "Enter") addTodo();
              },
              style: {
                width: "100%",
                height: "100%",
                backgroundColor: theme.input,
                color: theme.text,
                borderColor: theme.border,
              },
            }),
          ]),
          Button({ text: "Add", onClick: addTodo }),
        ]),
        Column(
          { gap: 8 },
          todos.length
            ? todos.map((todo) =>
                Row(
                  {
                    key: todo.id,
                    gap: 10,
                    mainAxisAlignment: "spaceBetween",
                    style: {
                      padding: "10px",
                      borderRadius: "6px",
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.subtle,
                    },
                  },
                  [
                    Row({ gap: 10, style: { flex: 1, minWidth: 0 } }, [
                      Input({
                        type: "checkbox",
                        value: todo.completed,
                        onChange: () => toggleTodo(todo.id),
                        "aria-label": `Toggle ${todo.text}`,
                        style: { width: "auto" },
                      }),
                      Text(todo.text, {
                        color: todo.completed ? theme.muted : theme.text,
                        style: {
                          flex: 1,
                          minWidth: 0,
                          textDecoration: todo.completed
                            ? "line-through"
                            : "none",
                        },
                      }),
                    ]),
                    Button({
                      text: "Delete",
                      onClick: () => deleteTodo(todo.id),
                      variant: "text",
                      style: { padding: "4px 8px" },
                    }),
                  ],
                ),
              )
            : [
                Align({ alignment: "center" }, [
                  Caption(
                    { color: theme.muted },
                    "No todos yet. Add one above.",
                  ),
                ]),
              ],
        ),
        Divider({ color: theme.border }),
        Caption(
          { color: theme.muted },
          `Total: ${todos.length} | Completed: ${
            todos.filter((todo) => todo.completed).length
          }`,
        ),
      ]),
    ],
  );
}

function WidgetGallery(theme) {
  return Card(
    {
      elevation: 1,
      style: {
        backgroundColor: theme.surface,
        borderColor: theme.border,
        width: "min(100%, 560px)",
      },
    },
    [
      Column({ gap: 14 }, [
        Heading(
          { level: 2, style: { color: theme.text } },
          "First Layout Bricks",
        ),
        Wrap({ gap: 8 }, [
          chip("Text", theme),
          chip("Container", theme),
          chip("Padding", theme),
          chip("Align", theme),
          chip("SizedBox", theme),
          chip("Row", theme),
          chip("Column", theme),
          chip("Stack", theme),
        ]),
        Row({ gap: 12, style: { alignItems: "stretch" } }, [
          Expanded([
            Container(
              {
                height: 132,
                padding: 12,
                decoration: {
                  color: theme.subtle,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8,
                },
              },
              [
                Column({ gap: 8 }, [
                  Text("Column", { weight: 700, color: theme.text }),
                  SizedBox({ height: 10 }),
                  Container({ height: 18, color: theme.primary }),
                  Container({ height: 18, color: theme.accent }),
                  Container({ height: 18, color: theme.warning }),
                ]),
              ],
            ),
          ]),
          Expanded([
            Stack(
              {
                height: 132,
                clip: false,
                style: {
                  borderRadius: "8px",
                  backgroundColor: theme.subtle,
                  border: `1px solid ${theme.border}`,
                },
              },
              [
                Positioned({
                  top: 18,
                  left: 18,
                  child: dot(56, theme.primary),
                }),
                Positioned({
                  top: 44,
                  left: 62,
                  child: dot(50, theme.accent),
                }),
                Positioned({
                  right: 16,
                  bottom: 16,
                  child: Text("Stack", {
                    weight: 700,
                    color: theme.text,
                  }),
                }),
              ],
            ),
          ]),
        ]),
        Padding({ padding: { vertical: 4 } }, [
          Caption(
            { color: theme.muted },
            "These are intentionally small. We will keep adding widgets from simple layout primitives toward advanced scrolling, navigation, forms, and painting.",
          ),
        ]),
      ]),
    ],
  );
}

function chip(label, theme) {
  return Container(
    {
      padding: { vertical: 6, horizontal: 10 },
      decoration: {
        color: theme.chip,
        border: `1px solid ${theme.border}`,
        borderRadius: 999,
      },
    },
    [Caption({ color: theme.text }, label)],
  );
}

function dot(size, color) {
  return Container({
    width: size,
    height: size,
    decoration: {
      color,
      borderRadius: size / 2,
      boxShadow: "0 10px 24px rgba(15, 23, 42, 0.18)",
    },
  });
}

function themeFor(isDark) {
  return isDark
    ? {
        background: "#111827",
        surface: "#1f2937",
        subtle: "#273449",
        input: "#111827",
        text: "#f9fafb",
        muted: "#9ca3af",
        primary: "#60a5fa",
        accent: "#34d399",
        warning: "#fbbf24",
        chip: "#182235",
        border: "#374151",
      }
    : {
        background: "#f3f4f6",
        surface: "#ffffff",
        subtle: "#f8fafc",
        input: "#ffffff",
        text: "#111827",
        muted: "#6b7280",
        primary: "#2563eb",
        accent: "#059669",
        warning: "#d97706",
        chip: "#eef2ff",
        border: "#e5e7eb",
      };
}

export function App(forceUpdate) {
  bindState(forceUpdate);

  const isDark = getDarkMode();
  const theme = themeFor(isDark);

  document.documentElement.style.setProperty("--background", theme.background);
  document.documentElement.style.setProperty("--text", theme.text);

  return Center([
    Container(
      {
        width: 1180,
        minHeight: "100vh",
        padding: { vertical: 24, horizontal: 20 },
        style: {
          maxWidth: "100vw",
          backgroundColor: theme.background,
          color: theme.text,
        },
      },
      [
        Column({ gap: 20 }, [
          Row({ gap: 16, mainAxisAlignment: "spaceBetween" }, [
            Column({ gap: 4 }, [
              Heading(
                { level: 1, style: { color: theme.text } },
                "LuminaUI",
              ),
              Caption(
                { color: theme.muted },
                "Flutter-style widgets, built with vanilla JavaScript.",
              ),
            ]),
            Row({ gap: 10 }, [
              Text("Dark Mode", { color: theme.text }),
              Switch({
                value: isDark,
                onChange: setDarkMode,
                ariaLabel: "Toggle dark mode",
              }),
            ]),
          ]),
          Wrap({ gap: 16 }, [
            Counter({
              label: "Counter One",
              getValue: getCounterOne,
              setValue: setCounterOne,
              initialValue: 0,
              theme,
            }),
            Counter({
              label: "Counter Two",
              getValue: getCounterTwo,
              setValue: setCounterTwo,
              initialValue: 10,
              theme,
            }),
            TodoApp(theme),
            WidgetGallery(theme),
          ]),
        ]),
      ],
    ),
  ]);
}
