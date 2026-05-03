export function Column(children = []) {
  const el = document.createElement("div");

  el.style.display = "flex";
  el.style.flexDirection = "column";
  el.style.gap = "10px";

  children.forEach(child => {
    el.append(child);
  });
  
  return el;
}