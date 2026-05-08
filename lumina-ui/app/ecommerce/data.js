export function productImage(title, accent, secondary) {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 540">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${accent}"/>
      <stop offset="1" stop-color="${secondary}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="22" stdDeviation="20" flood-color="#0f172a" flood-opacity="0.24"/>
    </filter>
  </defs>
  <rect width="720" height="540" rx="36" fill="url(#bg)"/>
  <circle cx="575" cy="96" r="88" fill="#ffffff" opacity="0.18"/>
  <circle cx="126" cy="436" r="112" fill="#ffffff" opacity="0.12"/>
  <rect x="166" y="118" width="388" height="278" rx="34" fill="#ffffff" opacity="0.9" filter="url(#shadow)"/>
  <rect x="216" y="168" width="288" height="26" rx="13" fill="${accent}" opacity="0.9"/>
  <rect x="216" y="222" width="180" height="24" rx="12" fill="#0f172a" opacity="0.76"/>
  <rect x="216" y="278" width="240" height="22" rx="11" fill="#64748b" opacity="0.72"/>
  <path d="M230 352h260" stroke="${secondary}" stroke-width="26" stroke-linecap="round"/>
  <text x="360" y="456" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="32" font-weight="800" fill="#ffffff">${title}</text>
</svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const fallbackCatalog = {
  products: [
    {
      id: "pulse-headphones",
      sku: "AUD-PULSE-001",
      name: "Pulse Headphones",
      category: "Audio",
      price: 149,
      cost: 82,
      rating: 4.8,
      stock: 18,
      badge: "Best seller",
      color: "Graphite",
      vendor: "Lumina Audio",
      tags: ["wireless", "work", "noise control"],
      featured: true,
      active: true,
      lowStockThreshold: 8,
      sales: 246,
      views: 4300,
      imageTitle: "Pulse",
      accent: "#2563eb",
      secondary: "#14b8a6",
      description:
        "Wireless over-ear headphones with soft isolation, low-latency audio, and all-day battery.",
    },
    {
      id: "arc-speaker",
      sku: "AUD-ARC-002",
      name: "Arc Speaker",
      category: "Audio",
      price: 89,
      cost: 42,
      rating: 4.6,
      stock: 25,
      badge: "New",
      color: "Mist",
      vendor: "Lumina Audio",
      tags: ["speaker", "home", "portable"],
      featured: false,
      active: true,
      lowStockThreshold: 10,
      sales: 138,
      views: 2100,
      imageTitle: "Arc",
      accent: "#0f766e",
      secondary: "#22c55e",
      description:
        "Compact room speaker with warm bass, tactile controls, and stereo pairing.",
    },
    {
      id: "luma-watch",
      sku: "WRB-LUMA-003",
      name: "Luma Watch",
      category: "Wearables",
      price: 229,
      cost: 126,
      rating: 4.7,
      stock: 12,
      badge: "Limited",
      color: "Midnight",
      vendor: "Lumina Labs",
      tags: ["health", "watch", "fitness"],
      featured: true,
      active: true,
      lowStockThreshold: 6,
      sales: 96,
      views: 2900,
      imageTitle: "Luma",
      accent: "#7c3aed",
      secondary: "#f97316",
      description:
        "Slim smartwatch with health tracking, bright display, and quick-swap bands.",
    },
    {
      id: "stride-band",
      sku: "WRB-STRIDE-004",
      name: "Stride Band",
      category: "Wearables",
      price: 59,
      cost: 22,
      rating: 4.4,
      stock: 41,
      badge: "Value",
      color: "Sage",
      vendor: "Lumina Labs",
      tags: ["tracker", "sleep", "fitness"],
      featured: false,
      active: true,
      lowStockThreshold: 12,
      sales: 310,
      views: 2600,
      imageTitle: "Stride",
      accent: "#16a34a",
      secondary: "#0284c7",
      description:
        "Lightweight activity band with sleep tracking, water resistance, and seven-day charge.",
    },
    {
      id: "dock-pro",
      sku: "WRK-DOCK-005",
      name: "Dock Pro",
      category: "Workspace",
      price: 119,
      cost: 58,
      rating: 4.5,
      stock: 17,
      badge: "Desk pick",
      color: "Aluminum",
      vendor: "Deskline",
      tags: ["dock", "desk", "charging"],
      featured: true,
      active: true,
      lowStockThreshold: 8,
      sales: 168,
      views: 1900,
      imageTitle: "Dock",
      accent: "#475569",
      secondary: "#38bdf8",
      description:
        "Multi-port desk dock for displays, charging, peripherals, and clean cable routing.",
    },
    {
      id: "halo-lamp",
      sku: "WRK-HALO-006",
      name: "Halo Lamp",
      category: "Workspace",
      price: 74,
      cost: 31,
      rating: 4.3,
      stock: 30,
      badge: "Calm light",
      color: "Bone",
      vendor: "Deskline",
      tags: ["lamp", "focus", "lighting"],
      featured: false,
      active: true,
      lowStockThreshold: 9,
      sales: 121,
      views: 1750,
      imageTitle: "Halo",
      accent: "#d97706",
      secondary: "#facc15",
      description:
        "Adjustable LED desk lamp with glare control, ambient modes, and memory dimming.",
    },
    {
      id: "carry-sling",
      sku: "TRV-CARRY-007",
      name: "Carry Sling",
      category: "Travel",
      price: 68,
      cost: 29,
      rating: 4.6,
      stock: 22,
      badge: "Travel",
      color: "Forest",
      vendor: "Northline",
      tags: ["bag", "travel", "weatherproof"],
      featured: false,
      active: true,
      lowStockThreshold: 8,
      sales: 143,
      views: 1850,
      imageTitle: "Carry",
      accent: "#047857",
      secondary: "#0ea5e9",
      description:
        "Weather-resistant everyday sling with padded device pocket and quick-access storage.",
    },
    {
      id: "pack-lite",
      sku: "TRV-PACK-008",
      name: "Pack Lite",
      category: "Travel",
      price: 138,
      cost: 71,
      rating: 4.9,
      stock: 9,
      badge: "Top rated",
      color: "Slate",
      vendor: "Northline",
      tags: ["backpack", "carry-on", "commute"],
      featured: true,
      active: true,
      lowStockThreshold: 7,
      sales: 204,
      views: 3200,
      imageTitle: "Pack",
      accent: "#1e293b",
      secondary: "#818cf8",
      description:
        "Expandable travel backpack built for one-bag trips, daily commutes, and camera cubes.",
    },
  ],
  orders: [
    {
      id: "ORD-1048",
      customer: { name: "Amina Banda", email: "amina@example.com" },
      status: "processing",
      placedAt: "2026-05-06",
      shipping: "standard",
      payment: "card",
      items: [
        { productId: "pulse-headphones", quantity: 1, price: 149 },
        { productId: "carry-sling", quantity: 1, price: 68 },
      ],
      total: 217,
    },
    {
      id: "ORD-1049",
      customer: { name: "Noah Phiri", email: "noah@example.com" },
      status: "shipped",
      placedAt: "2026-05-07",
      shipping: "express",
      payment: "mobile",
      items: [{ productId: "dock-pro", quantity: 2, price: 119 }],
      total: 256,
    },
  ],
};

export const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
  { label: "Rating", value: "rating" },
  { label: "Newest", value: "newest" },
];

export function slugify(value) {
  return String(value || "product")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeProduct(product, index = 0) {
  const id = product.id || slugify(product.name) || `product-${index + 1}`;
  const accent = product.accent || "#2563eb";
  const secondary = product.secondary || "#14b8a6";
  const imageTitle = product.imageTitle || String(product.name || "Item").slice(0, 8);

  return {
    id,
    sku: product.sku || id.toUpperCase(),
    name: product.name || "Untitled product",
    category: product.category || "General",
    price: Number(product.price || 0),
    cost: Number(product.cost || 0),
    rating: Number(product.rating || 0),
    stock: Math.max(0, Number(product.stock || 0)),
    badge: product.badge || "New",
    color: product.color || "Default",
    vendor: product.vendor || "Lumina",
    tags: Array.isArray(product.tags) ? product.tags : [],
    featured: !!product.featured,
    active: product.active !== false,
    lowStockThreshold: Number(product.lowStockThreshold || 8),
    sales: Number(product.sales || 0),
    views: Number(product.views || 0),
    imageTitle,
    accent,
    secondary,
    image: product.image || productImage(imageTitle, accent, secondary),
    description: product.description || "No description provided.",
  };
}

export function normalizeCatalog(catalog = fallbackCatalog) {
  const products = (catalog.products || []).map(normalizeProduct);
  const orders = (catalog.orders || []).map((order, index) => ({
    id: order.id || `ORD-${1000 + index}`,
    customer: order.customer || { name: "Guest customer", email: "" },
    status: order.status || "processing",
    placedAt: order.placedAt || "",
    shipping: order.shipping || "standard",
    payment: order.payment || "card",
    items: order.items || [],
    total: Number(order.total || 0),
  }));

  return { products, orders };
}

export function categoriesFor(products) {
  return ["All", ...new Set(products.map((item) => item.category).filter(Boolean))];
}

export const initialCatalog = normalizeCatalog(fallbackCatalog);

export async function loadCatalogData() {
  if (typeof fetch !== "function") {
    return { ...initialCatalog, source: "fallback" };
  }

  const response = await fetch(new URL("./catalog.json", import.meta.url));
  if (!response.ok) {
    throw new Error(`Catalog request failed: ${response.status}`);
  }

  return {
    ...normalizeCatalog(await response.json()),
    source: "catalog.json",
  };
}
