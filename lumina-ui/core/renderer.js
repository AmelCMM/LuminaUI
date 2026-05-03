export function mount(appFn, container) {
  function render() {
    // clear previous UI
    container.innerHTML = "";

    // build and attach new UI
    const ui = appFn();
    container.appendChild(ui);
  }

  // initial render
  render();

  // return render in case you want manual updates later
  return render;
}