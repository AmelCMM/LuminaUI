function productImage(title, accent, secondary) {
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

export const products = [
  {
    id: "pulse-headphones",
    name: "Pulse Headphones",
    category: "Audio",
    price: 149,
    rating: 4.8,
    stock: 18,
    badge: "Best seller",
    color: "Graphite",
    image: productImage("Pulse", "#2563eb", "#14b8a6"),
    description:
      "Wireless over-ear headphones with soft isolation, low-latency audio, and all-day battery.",
  },
  {
    id: "arc-speaker",
    name: "Arc Speaker",
    category: "Audio",
    price: 89,
    rating: 4.6,
    stock: 25,
    badge: "New",
    color: "Mist",
    image: productImage("Arc", "#0f766e", "#22c55e"),
    description:
      "Compact room speaker with warm bass, tactile controls, and stereo pairing.",
  },
  {
    id: "luma-watch",
    name: "Luma Watch",
    category: "Wearables",
    price: 229,
    rating: 4.7,
    stock: 12,
    badge: "Limited",
    color: "Midnight",
    image: productImage("Luma", "#7c3aed", "#f97316"),
    description:
      "Slim smartwatch with health tracking, bright display, and quick-swap bands.",
  },
  {
    id: "stride-band",
    name: "Stride Band",
    category: "Wearables",
    price: 59,
    rating: 4.4,
    stock: 41,
    badge: "Value",
    color: "Sage",
    image: productImage("Stride", "#16a34a", "#0284c7"),
    description:
      "Lightweight activity band with sleep tracking, water resistance, and seven-day charge.",
  },
  {
    id: "dock-pro",
    name: "Dock Pro",
    category: "Workspace",
    price: 119,
    rating: 4.5,
    stock: 17,
    badge: "Desk pick",
    color: "Aluminum",
    image: productImage("Dock", "#475569", "#38bdf8"),
    description:
      "Multi-port desk dock for displays, charging, peripherals, and clean cable routing.",
  },
  {
    id: "halo-lamp",
    name: "Halo Lamp",
    category: "Workspace",
    price: 74,
    rating: 4.3,
    stock: 30,
    badge: "Calm light",
    color: "Bone",
    image: productImage("Halo", "#d97706", "#facc15"),
    description:
      "Adjustable LED desk lamp with glare control, ambient modes, and memory dimming.",
  },
  {
    id: "carry-sling",
    name: "Carry Sling",
    category: "Travel",
    price: 68,
    rating: 4.6,
    stock: 22,
    badge: "Travel",
    color: "Forest",
    image: productImage("Carry", "#047857", "#0ea5e9"),
    description:
      "Weather-resistant everyday sling with padded device pocket and quick-access storage.",
  },
  {
    id: "pack-lite",
    name: "Pack Lite",
    category: "Travel",
    price: 138,
    rating: 4.9,
    stock: 9,
    badge: "Top rated",
    color: "Slate",
    image: productImage("Pack", "#1e293b", "#818cf8"),
    description:
      "Expandable travel backpack built for one-bag trips, daily commutes, and camera cubes.",
  },
];

export const categories = ["All", ...new Set(products.map((item) => item.category))];

export const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
  { label: "Rating", value: "rating" },
];
