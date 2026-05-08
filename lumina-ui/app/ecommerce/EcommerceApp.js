import { Column } from "../../widgets/layout.js";
import { Footer, ProductDialog, StoreShell, StoreSnackBar, CheckoutDialog } from "./components.js";
import { subscriptions } from "./store.js";

const subscribedUpdates = new WeakSet();

function bindState(forceUpdate) {
  if (typeof forceUpdate !== "function" || subscribedUpdates.has(forceUpdate)) {
    return;
  }

  subscriptions.forEach((subscribe) => subscribe(forceUpdate));
  subscribedUpdates.add(forceUpdate);
}

export function EcommerceApp(forceUpdate) {
  bindState(forceUpdate);

  return Column([
    StoreShell(),
    Footer(),
    ProductDialog(),
    CheckoutDialog(),
    StoreSnackBar(),
  ]);
}
