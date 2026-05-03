export function Text(value) {
  const el = document.createElement("span");
  el.textContent = value;
  return el;
}