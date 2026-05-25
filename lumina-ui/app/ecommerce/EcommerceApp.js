import { Column } from "../../widgets/layout.js";
import { Footer, ProductDialog, StoreShell, StoreSnackBar, CheckoutDialog } from "./components.js";
import { ensureCatalogLoaded, subscriptions } from "./store.js";

const subscribedUpdates = new WeakSet();
const subscriptionDisposers = new WeakMap();

function bindState(forceUpdate) {
  if (typeof forceUpdate !== "function" || subscribedUpdates.has(forceUpdate)) {
    return;
  }

  const unsubscribers = subscriptions.map((subscribe) => subscribe(forceUpdate));
  subscriptionDisposers.set(forceUpdate, unsubscribers);

  if (typeof forceUpdate.onUnmount === "function") {
    forceUpdate.onUnmount(() => {
      const disposers = subscriptionDisposers.get(forceUpdate) || [];
      disposers.forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") unsubscribe();
      });
      subscriptionDisposers.delete(forceUpdate);
      subscribedUpdates.delete(forceUpdate);
    });
  }
  subscribedUpdates.add(forceUpdate);
}

export function EcommerceApp(forceUpdate) {
  bindState(forceUpdate);
  ensureCatalogLoaded();

  return Column([
    StoreShell(),
    Footer(),
    ProductDialog(),
    CheckoutDialog(),
    StoreSnackBar(),
  ]);
}
