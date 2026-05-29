import { createState } from "../../core/state.js";
import {
  categoriesFor,
  initialCatalog,
  loadCatalogData,
  normalizeProduct,
  slugify,
} from "./data.js";

function emptyDraft() {
  return {
    name: "",
    sku: "",
    category: "Audio",
    price: 99,
    cost: 40,
    stock: 10,
    rating: 4.5,
    badge: "New",
    color: "Graphite",
    vendor: "Lumina",
    tags: "featured, demo",
    featured: false,
    active: true,
    lowStockThreshold: 8,
    imageTitle: "Item",
    accent: "#2563eb",
    secondary: "#14b8a6",
    description: "",
  };
}

function parseDraftNumber(value, { integer = false, min = 0, max = Infinity } = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  let normalized = integer ? Math.round(parsed) : parsed;
  normalized = Math.max(min, Math.min(max, normalized));
  return normalized;
}

export const [getProducts, setProducts, subscribeProducts] = createState(
  initialCatalog.products,
);
export const [getOrders, setOrders, subscribeOrders] = createState(
  initialCatalog.orders,
);
export const [getCatalogStatus, setCatalogStatus, subscribeCatalogStatus] =
  createState("idle");
export const [getCatalogSource, setCatalogSource, subscribeCatalogSource] =
  createState("fallback");
export const [getInterface, setInterfaceState, subscribeInterface] =
  createState("customer");
export const [getPage, setPage, subscribePage] = createState("shop");
export const [getQuery, setQuery, subscribeQuery] = createState("");
export const [getCategory, setCategory, subscribeCategory] = createState("All");
export const [getSort, setSort, subscribeSort] = createState("featured");
export const [getMaxPrice, setMaxPrice, subscribeMaxPrice] = createState(250);
export const [getMinRating, setMinRating, subscribeMinRating] = createState(0);
export const [getInStockOnly, setInStockOnly, subscribeInStockOnly] =
  createState(false);
export const [getCartOpen, setCartOpen, subscribeCartOpen] = createState(false);
export const [getCheckoutOpen, setCheckoutOpen, subscribeCheckoutOpen] =
  createState(false);
export const [getSelectedProductId, setSelectedProductId, subscribeSelected] =
  createState(null);
export const [getCart, setCart, subscribeCart] = createState([]);
export const [getWishlist, setWishlist, subscribeWishlist] = createState([]);
export const [getCompareList, setCompareList, subscribeCompareList] =
  createState([]);
export const [getPromoCode, setPromoCode, subscribePromoCode] = createState("");
export const [getAppliedPromo, setAppliedPromo, subscribeAppliedPromo] =
  createState(null);
export const [getSnack, setSnack, subscribeSnack] = createState("");
export const [getShipping, setShipping, subscribeShipping] = createState("standard");
export const [getPayment, setPayment, subscribePayment] = createState("card");
export const [getCheckoutName, setCheckoutName, subscribeCheckoutName] =
  createState("");
export const [getCheckoutEmail, setCheckoutEmail, subscribeCheckoutEmail] =
  createState("");
export const [getCheckoutNotes, setCheckoutNotes, subscribeCheckoutNotes] =
  createState("");
export const [getAdminDraft, setAdminDraft, subscribeAdminDraft] =
  createState(emptyDraft());
export const [getAdminEditingId, setAdminEditingId, subscribeAdminEditing] =
  createState(null);
export const [getAdminProductPage, setAdminProductPage, subscribeAdminProductPage] =
  createState(1);
export const [getAdminOrderPage, setAdminOrderPage, subscribeAdminOrderPage] =
  createState(1);
export const [getCategoryInput, setCategoryInput, subscribeCategoryInput] =
  createState("");
export const [getCategoryOpen, setCategoryOpen, subscribeCategoryOpen] =
  createState(false);

export const subscriptions = [
  subscribeProducts,
  subscribeOrders,
  subscribeCatalogStatus,
  subscribeCatalogSource,
  subscribeInterface,
  subscribePage,
  subscribeQuery,
  subscribeCategory,
  subscribeSort,
  subscribeMaxPrice,
  subscribeMinRating,
  subscribeInStockOnly,
  subscribeCartOpen,
  subscribeCheckoutOpen,
  subscribeSelected,
  subscribeCart,
  subscribeWishlist,
  subscribeCompareList,
  subscribePromoCode,
  subscribeAppliedPromo,
  subscribeSnack,
  subscribeShipping,
  subscribePayment,
  subscribeCheckoutName,
  subscribeCheckoutEmail,
  subscribeCheckoutNotes,
  subscribeAdminDraft,
  subscribeAdminEditing,
  subscribeAdminProductPage,
  subscribeAdminOrderPage,
  subscribeCategoryInput,
  subscribeCategoryOpen,
];

let catalogPromise = null;

export function ensureCatalogLoaded() {
  if (catalogPromise) return catalogPromise;

  catalogPromise = loadCatalogData()
    .then((catalog) => {
      setProducts(catalog.products);
      setOrders(catalog.orders);
      setCatalogSource(catalog.source || "catalog.json");
      setCatalogStatus("ready");
      setMaxPrice(maxCatalogPrice(catalog.products));
      return catalog;
    })
    .catch((error) => {
      setCatalogSource("fallback");
      setCatalogStatus("ready");
      setSnack(`Using fallback catalog: ${error.message}`);
      return initialCatalog;
    });
  setCatalogStatus("loading");

  return catalogPromise;
}

export function setInterface(value) {
  setInterfaceState(value);
  setCartOpen(false);
  setCheckoutOpen(false);
  closeProduct();
}

export function getCategories() {
  return categoriesFor(getProducts().filter((product) => product.active));
}

export function getVendors() {
  return [
    "All",
    ...new Set(
      getProducts()
        .filter((product) => product.active)
        .map((product) => product.vendor)
        .filter(Boolean),
    ),
  ];
}

export function maxCatalogPrice(products = getProducts()) {
  return Math.max(50, ...products.map((product) => Number(product.price || 0)));
}

export function getFeaturedProduct() {
  const active = getProducts().filter((product) => product.active);
  return active.find((product) => product.featured) || active[0] || null;
}

export function selectedProduct() {
  const id = getSelectedProductId();
  return getProducts().find((product) => product.id === id) || null;
}

export function filteredProducts() {
  const query = getQuery().trim().toLowerCase();
  const category = getCategory();
  const maxPrice = Number(getMaxPrice());
  const minRating = Number(getMinRating());
  const inStockOnly = getInStockOnly();
  const sort = getSort();
  const products = getProducts();

  const filtered = products.filter((product) => {
    if (!product.active) return false;
    const matchesQuery =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.tags.join(" ").toLowerCase().includes(query);
    const matchesCategory = category === "All" || product.category === category;
    const matchesPrice = product.price <= maxPrice;
    const matchesRating = product.rating >= minRating;
    const matchesStock = !inStockOnly || product.stock > 0;
    return (
      matchesQuery &&
      matchesCategory &&
      matchesPrice &&
      matchesRating &&
      matchesStock
    );
  });

  return [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "newest") return b.id.localeCompare(a.id);
    return products.findIndex((item) => item.id === a.id) -
      products.findIndex((item) => item.id === b.id);
  });
}

export function cartQuantity() {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}

export function cartSubtotal() {
  return getCart().reduce((total, item) => {
    const product = getProducts().find((entry) => entry.id === item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

export function cartItemsDetailed() {
  return getCart()
    .map((item) => {
      const product = getProducts().find((entry) => entry.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter(Boolean);
}

export function cartStockIssues() {
  return cartItemsDetailed().filter((item) => item.quantity > item.product.stock);
}

export function activePromo() {
  const promo = getAppliedPromo();
  if (!promo) return null;
  if (promo.minimum && cartSubtotal() < promo.minimum) return null;
  return promo;
}

export function discountAmount() {
  const promo = activePromo();
  if (!promo) return 0;
  if (promo.type === "percent") return cartSubtotal() * promo.value;
  if (promo.type === "fixed") return Math.min(cartSubtotal(), promo.value);
  return 0;
}

export function shippingCost() {
  if (cartSubtotal() === 0) return 0;
  if (activePromo()?.type === "shipping") return 0;
  if (getShipping() === "express") return 18;
  return cartSubtotal() >= 180 ? 0 : 8;
}

export function orderTotal() {
  return Math.max(0, cartSubtotal() - discountAmount()) + shippingCost();
}

export function addToCart(productId, quantity = 1) {
  const product = getProducts().find((item) => item.id === productId);
  if (!product || !product.active || product.stock <= 0) return;

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

    return [...items, { productId, quantity: Math.min(product.stock, quantity) }];
  });
  if (quantity > product.stock) {
    setSnack(`Only ${product.stock} ${product.name} available`);
  } else {
    setSnack(`${product.name} added to cart`);
  }
}

export function updateCartQuantity(productId, quantity) {
  const product = getProducts().find((item) => item.id === productId);
  if (quantity <= 0 || !product) {
    removeFromCart(productId);
    return;
  }

  setCart((items) =>
    items.map((item) =>
      item.productId === productId
        ? { ...item, quantity: Math.min(product.stock, quantity) }
        : item,
    ),
  );
}

export function removeFromCart(productId) {
  const product = getProducts().find((item) => item.id === productId);
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
  setAppliedPromo(null);
  setPromoCode("");
}

export function placeOrder() {
  const cart = getCart();
  if (!cart.length) return;
  if (!getCheckoutName().trim()) {
    setSnack("Add a customer name before placing the order");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(getCheckoutEmail().trim())) {
    setSnack("Add a valid email before placing the order");
    return;
  }
  if (cartStockIssues().length) {
    setSnack("Adjust unavailable quantities before checkout");
    return;
  }

  const products = getProducts();
  const promo = activePromo();
  const items = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return {
      productId: item.productId,
      quantity: item.quantity,
      price: product ? product.price : 0,
    };
  });
  const id = `ORD-${1050 + getOrders().length}`;
  const order = {
    id,
    customer: {
      name: getCheckoutName() || "Guest customer",
      email: getCheckoutEmail() || "guest@example.com",
      notes: getCheckoutNotes(),
    },
    status: "processing",
    placedAt: new Date().toISOString().slice(0, 10),
    shipping: getShipping(),
    payment: getPayment(),
    items,
    subtotal: cartSubtotal(),
    discount: discountAmount(),
    promoCode: promo?.code || "",
    total: orderTotal(),
  };

  setOrders((orders) => [order, ...orders]);
  setProducts((entries) =>
    entries.map((product) => {
      const item = cart.find((entry) => entry.productId === product.id);
      return item
        ? { ...product, stock: Math.max(0, product.stock - item.quantity) }
        : product;
    }),
  );
  clearCart();
  setCheckoutName("");
  setCheckoutEmail("");
  setCheckoutNotes("");
  setAppliedPromo(null);
  setPromoCode("");
  setCheckoutOpen(false);
  setPage("shop");
  setSnack(`${id} placed successfully`);
}

export function toggleWishlist(productId) {
  const product = getProducts().find((item) => item.id === productId);
  if (!product) return;
  const alreadySaved = getWishlist().includes(productId);
  setWishlist((items) =>
    items.includes(productId)
      ? items.filter((id) => id !== productId)
      : [...items, productId],
  );
  setSnack(
    alreadySaved
      ? `${product.name} removed from wishlist`
      : `${product.name} saved to wishlist`,
  );
}

export function isWishlisted(productId) {
  return getWishlist().includes(productId);
}

export function wishlistProducts() {
  const ids = new Set(getWishlist());
  return getProducts().filter((product) => ids.has(product.id));
}

export function toggleCompare(productId) {
  const product = getProducts().find((item) => item.id === productId);
  if (!product) return;
  const selected = getCompareList();
  if (selected.includes(productId)) {
    setCompareList(selected.filter((id) => id !== productId));
    setSnack(`${product.name} removed from compare`);
    return;
  }
  if (selected.length >= 3) {
    setSnack("Compare up to 3 products");
    return;
  }
  setCompareList([...selected, productId]);
  setSnack(`${product.name} added to compare`);
}

export function isCompared(productId) {
  return getCompareList().includes(productId);
}

export function compareProducts() {
  const ids = new Set(getCompareList());
  return getProducts().filter((product) => ids.has(product.id));
}

export function clearCompare() {
  setCompareList([]);
}

export function applyPromoCode() {
  const code = getPromoCode().trim().toUpperCase();
  const promos = {
    FOCUS10: {
      code: "FOCUS10",
      label: "10% off focused setups",
      type: "percent",
      value: 0.1,
      minimum: 0,
    },
    FREESHIP: {
      code: "FREESHIP",
      label: "Free shipping",
      type: "shipping",
      value: 0,
      minimum: 0,
    },
    WORKSPACE25: {
      code: "WORKSPACE25",
      label: "$25 off orders over $220",
      type: "fixed",
      value: 25,
      minimum: 220,
    },
  };
  const promo = promos[code];
  if (!promo) {
    setAppliedPromo(null);
    setSnack("Promo code not recognized");
    return;
  }
  if (promo.minimum && cartSubtotal() < promo.minimum) {
    setSnack(`${promo.code} needs ${formatMoney(promo.minimum)} subtotal`);
    return;
  }
  setAppliedPromo(promo);
  setSnack(`${promo.label} applied`);
}

export function removePromoCode() {
  setAppliedPromo(null);
  setPromoCode("");
}

export function updateOrderStatus(orderId, status) {
  setOrders((orders) =>
    orders.map((order) =>
      order.id === orderId ? { ...order, status } : order,
    ),
  );
  setSnack(`${orderId} marked ${status}`);
}

export function adjustProductStock(productId, delta) {
  setProducts((entries) =>
    entries.map((product) =>
      product.id === productId
        ? { ...product, stock: Math.max(0, product.stock + delta) }
        : product,
    ),
  );
}

export function toggleProductActive(productId) {
  setProducts((entries) =>
    entries.map((product) =>
      product.id === productId ? { ...product, active: !product.active } : product,
    ),
  );
}

export function startCreateProduct() {
  setAdminEditingId(null);
  setAdminDraft(emptyDraft());
}

export function startEditProduct(productId) {
  const product = getProducts().find((item) => item.id === productId);
  if (!product) return;
  setAdminEditingId(productId);
  setAdminDraft({
    ...product,
    tags: product.tags.join(", "),
  });
}

export function setAdminDraftField(field, value) {
  setAdminDraft((draft) => ({ ...draft, [field]: value }));
}

export function saveAdminDraft() {
  const draft = getAdminDraft();
  const id = getAdminEditingId() || slugify(draft.name);
  if (!draft.name || !id) {
    setSnack("Product needs a name before saving");
    return;
  }

  const price = parseDraftNumber(draft.price, { min: 0 });
  const cost = parseDraftNumber(draft.cost, { min: 0 });
  const stock = parseDraftNumber(draft.stock, { integer: true, min: 0 });
  const rating = parseDraftNumber(draft.rating, { min: 0, max: 5 });
  const lowStockThreshold = parseDraftNumber(draft.lowStockThreshold, {
    integer: true,
    min: 0,
  });

  if (price === null || cost === null || stock === null || rating === null || lowStockThreshold === null) {
    setSnack("Numeric fields must contain valid numbers");
    return;
  }

  const product = normalizeProduct({
    ...draft,
    id,
    price,
    cost,
    stock,
    rating,
    lowStockThreshold,
    tags: String(draft.tags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  });

  setProducts((entries) => {
    const exists = entries.some((entry) => entry.id === product.id);
    return exists
      ? entries.map((entry) => (entry.id === product.id ? product : entry))
      : [product, ...entries];
  });
  setAdminEditingId(product.id);
  setAdminDraft({ ...product, tags: product.tags.join(", ") });
  setSnack(`${product.name} saved`);
}

export function deleteProduct(productId) {
  const product = getProducts().find((item) => item.id === productId);
  setProducts((entries) => entries.filter((entry) => entry.id !== productId));
  setCart((items) => items.filter((item) => item.productId !== productId));
  if (product) setSnack(`${product.name} removed from catalog`);
}

export function adminMetrics() {
  const products = getProducts();
  const orders = getOrders();
  const revenue = orders.reduce((total, order) => total + order.total, 0);
  const grossProfit = orders.reduce((total, order) => {
    return total + order.items.reduce((orderTotal, item) => {
      const product = products.find((entry) => entry.id === item.productId);
      const cost = product ? product.cost : 0;
      return orderTotal + (item.price - cost) * item.quantity;
    }, 0);
  }, 0);
  const inventoryValue = products.reduce(
    (total, product) => total + product.stock * product.cost,
    0,
  );

  return {
    revenue,
    inventoryValue,
    orders: orders.length,
    averageOrderValue: orders.length ? revenue / orders.length : 0,
    grossProfit,
    marginRate: revenue ? grossProfit / revenue : 0,
    activeProducts: products.filter((product) => product.active).length,
    lowStock: products.filter(
      (product) => product.active && product.stock <= product.lowStockThreshold,
    ).length,
    processing: orders.filter((order) => order.status === "processing").length,
  };
}

export function inventoryInsights() {
  return getProducts()
    .filter((product) => product.active)
    .map((product) => ({
      ...product,
      velocity: product.sales / Math.max(1, product.stock + product.sales),
      margin: product.price - product.cost,
      stockPressure:
        product.stock <= product.lowStockThreshold
          ? "critical"
          : product.stock <= product.lowStockThreshold * 2
            ? "watch"
            : "healthy",
    }))
    .sort((a, b) => {
      const rank = { critical: 0, watch: 1, healthy: 2 };
      return rank[a.stockPressure] - rank[b.stockPressure] || b.sales - a.sales;
    });
}

export function categoryPerformance() {
  const products = getProducts();
  return categoriesFor(products)
    .filter((category) => category !== "All")
    .map((category) => {
      const entries = products.filter((product) => product.category === category);
      const revenue = entries.reduce(
        (total, product) => total + product.price * product.sales,
        0,
      );
      const units = entries.reduce((total, product) => total + product.sales, 0);
      const margin = entries.reduce(
        (total, product) => total + (product.price - product.cost) * product.sales,
        0,
      );
      return { category, revenue, units, margin };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

export function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}
