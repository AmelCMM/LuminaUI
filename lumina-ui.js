import { App } from "./LuminaUI/lumina-ui/app/App.js";

const root = document.getElementById("app");

if (!root) {
  throw new Error("LuminaUI: Root element #app not found");
}

mount(App, root);