import { Column, Row, Container, Center } from "../widgets/layout.js";
import { Button, Input, Switch } from "../widgets/controls.js";
import { Text, Heading } from "../widgets/text.js";
import { createState } from "../core/state.js";
import { mount } from "../core/renderer.js";

// Simple state management wrapper for components
function Counter(initialCount = 0, label = "Count", forceUpdate) {
  const [getCount, setCount] = createState(initialCount, forceUpdate);

  return Column(
    {
      gap: 10,
      padding: 20,
      style: {
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#fff",
      },
    },
    [
      Heading({ level: 3 }, `${label}: ${getCount()}`),
      Row({ gap: 10 }, [
        Button({
          text: "+",
          onClick: () => setCount((c) => c + 1),
          variant: "primary",
        }),
        Button({
          text: "-",
          onClick: () => setCount((c) => c - 1),
          variant: "secondary",
        }),
        Button({
          text: "Reset",
          onClick: () => setCount(initialCount),
          variant: "text",
        }),
      ]),
    ],
  );
}

function TodoApp(forceUpdate) {
  const [getTodos, setTodos] = createState([], forceUpdate);
  const [getInput, setInput] = createState("", forceUpdate);

  const addTodo = () => {
    const inputValue = getInput();
    if (inputValue.trim()) {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Date.now();
      setTodos((prev) => [...prev, { id, text: inputValue, completed: false }]);
      setInput("");
    }
  };

  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const todos = getTodos();
  const inputValue = getInput();

  return Column(
    {
      gap: 15,
      padding: 20,
      style: {
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#fff",
      },
    },
    [
      Heading({ level: 2 }, "📝 Todo App"),
      Row({ gap: 10 }, [
        Input({
          value: inputValue,
          onChange: (val) => setInput(val),
          placeholder: "Add a new todo...",
          style: { flex: 1 },
        }),
        Button({ text: "Add", onClick: addTodo, variant: "primary" }),
      ]),
      Column(
        { gap: 8 },
        todos.length === 0
          ? [
              Text("No todos yet! Add one above!", {
                color: "#999",
                align: "center",
              }),
            ]
          : todos.map((todo) =>
              Row(
                {
                  key: todo.id,
                  gap: 10,
                  justifyContent: "space-between",
                  style: {
                    alignItems: "center",
                    padding: "8px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "4px",
                  },
                },
                [
                  Row({ gap: 10, style: { alignItems: "center", flex: 1 } }, [
                    // Use Checkbox widget via Input (type checkbox)
                    Input({
                      type: "checkbox",
                      value: todo.completed,
                      onChange: () => toggleTodo(todo.id),
                      style: { width: "auto" },
                    }),
                    Text(todo.text, {
                      style: {
                        textDecoration: todo.completed
                          ? "line-through"
                          : "none",
                        color: todo.completed ? "#999" : "#000",
                        flex: 1,
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
            ),
      ),
      Text(
        `Total: ${todos.length} items | Completed: ${todos.filter((t) => t.completed).length}`,
        { color: "#666", size: 12 },
      ),
    ],
  );
}

function ThemedApp(forceUpdate) {
  const [getDarkMode, setDarkMode] = createState(false, forceUpdate);

  const isDark = getDarkMode();
  const theme = isDark
    ? {
        background: "#1a1a1a",
        surface: "#2d2d2d",
        text: "#ffffff",
        primary: "#bb86fc",
        border: "#444",
      }
    : {
        background: "#f5f5f5",
        surface: "#ffffff",
        text: "#000000",
        primary: "#6200ee",
        border: "#ddd",
      };

  // Apply theme via CSS variables on documentElement for safety
  document.documentElement.style.setProperty("--background", theme.background);
  document.documentElement.style.setProperty("--text", theme.text);
  document.documentElement.style.setProperty("--surface", theme.surface);

  return Column(
    {
      gap: 20,
      padding: 20,
      style: {
        minHeight: "100vh",
        background: "var(--background)",
        color: "var(--text)",
      },
    },
    [
      Row(
        {
          justifyContent: "space-between",
          alignItems: "center",
          style: {
            padding: "10px 0",
            borderBottom: `1px solid ${theme.border}`,
          },
        },
        [
          Heading(
            {
              level: 1,
              style: {
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              },
            },
            "✨ LuminaUI Demo",
          ),
          Row({ gap: 10, alignItems: "center" }, [
            Text("Dark Mode", { color: theme.text }),
            Switch({ value: isDark, onChange: (val) => setDarkMode(val) }),
          ]),
        ],
      ),
      Row({ gap: 20, style: { flexWrap: "wrap" } }, [
        Counter(0, "Counter 1", forceUpdate),
        Counter(10, "Counter 2", forceUpdate),
        TodoApp(forceUpdate),
      ]),
      Text("Built with Flutter-style syntax + React-like state", {
        color: theme.text === "#ffffff" ? "#888" : "#999",
        size: 12,
        align: "center",
        style: {
          marginTop: "20px",
          padding: "20px",
          borderTop: `1px solid ${theme.border}`,
        },
      }),
    ],
  );
}

export function App(forceUpdate) {
  return Center({}, [
    Container(
      {
        width: 1200,
        style: {
          maxWidth: "95vw",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          backgroundColor: "var(--surface, white)",
          margin: "20px",
          overflow: "hidden",
        },
      },
      [ThemedApp(forceUpdate)],
    ),
  ]);
}
