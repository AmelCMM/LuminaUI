import { createState } from "../../core/state.js";
import { products } from "./data.js";

export const [getPage, setPage, subscribePage] = createState("shop");
export const [getQuery, setQuery, subscribeQuery] = createState("");
export const [getCategory, setCategory, subscribeCategory] = createState("All");
export const [getSort, setSort, subscribeSort] = createState("featured");
export const [getMaxPrice, setMaxPrice, subscribeMaxPrice] = createState(250);
export const [getCartOpen, setCartOpen, subscribeCartOpen] = createState(false);
export const [getCheckoutOpen, setCheckoutOpen, subscribeCheckoutOpen] =
  createState(false);
export const [getSelectedProductId, setSelectedProductId, subscribeSelected] =
  createState(null);
export const [getCart, setCart, subscribeCart] = createState([]);
export const [getSnack, setSnack, subscribeSnack] = createState("");
export const [getShipping, setShipping, subscribeShipping] = createState("standard");
export const [getPayment, setPayment, subscribePayment] = createState("card");

export const subscriptions = [
  subscribePage,
  subscribeQuery,
  subscribeCategory,
  subscribeSort,
  subscribeMaxPrice,
  subscribeCartOpen,
  subscribeCheckoutOpen,
  subscribeSelected,
  subscribeCart,
  subscribeSnack,
  subscribeShipping,
  subscribePayment,
];

export function selectedProduct() {
  const id = getSelectedProductId();
  return products.find((product) => product.id === id) || null;
}

export function filteredProducts() {
  const query = getQuery().trim().toLowerCase();
  const category = getCategory();
  const maxPrice = Number(getMaxPrice());
  const sort = getSort();

  const filtered = products.filter((product) => {
    const matchesQuery =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query);
    const matchesCategory = category === "All" || product.category === category;
    return matchesQuery && matchesCategory && product.price <= maxPrice;
  });

  return [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    return products.findIndex((item) => item.id === a.id) -
      products.findIndex((item) => item.id === b.id);
  });
}

export function cartQuantity() {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}

export function cartSubtotal() {
  return getCart().reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

export function shippingCost() {
  if (cartSubtotal() === 0) return 0;
  if (getShipping() === "express") return 18;
  return cartSubtotal() >= 180 ? 0 : 8;
}

export function orderTotal() {
  return cartSubtotal() + shippingCost();
}

export function addToCart(productId, quantity = 1) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  setCart((items) => {
    const existing = items.find((item) => item.productId === productId);
    if (existing) {
      return items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: Math.min(product.stock, item.quantity + quantity),
            }
          : item,
      );
    }

    return [...items, { productId, quantity }];
  });
  setSnack(`${product.name} added to cart`);
}

export function updateCartQuantity(productId, quantity) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  setCart((items) =>
    items.map((item) =>
      item.productId === productId ? { ...item, quantity } : item,
    ),
  );
}

export function removeFromCart(productId) {
  const product = products.find((item) => item.id === productId);
  setCart((items) => items.filter((item) => item.productId !== productId));
  if (product) setSnack(`${product.name} removed`);
}

export function openProduct(productId) {
  setSelectedProductId(productId);
}

export function closeProduct() {
  setSelectedProductId(null);
}

export function clearCart() {
  setCart([]);
}

export function formatMoney(value) {
  return `$${value.toFixed(2)}`;
}
