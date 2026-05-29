import {
  Align,
  AspectRatio,
  Card,
  Center,
  Column,
  ConstrainedBox,
  Container,
  Divider,
  Expanded,
  Padding,
  Positioned,
  Row,
  Spacer,
  Stack,
  Wrap,
} from "../../widgets/layout.js";
import { Button, Input, Switch } from "../../widgets/controls.js";
import { Badge, Icon, Image, Opacity, PhysicalModel } from "../../widgets/display.js";
import { SnackBar } from "../../widgets/feedback.js";
import {
  Dropdown,
  Form,
  FormField,
  RadioGroup,
  Slider,
  TextArea,
} from "../../widgets/forms.js";
import { Dismissible } from "../../widgets/interaction.js";
import { AppBar, Drawer, Scaffold } from "../../widgets/navigation.js";
import { GridView, ListView, SingleChildScrollView } from "../../widgets/scrolling.js";
import { Caption, Heading, RichText, Text } from "../../widgets/text.js";
import { ensureGlobalStyle } from "../../widgets/utils.js";
import { ComboBox } from "../../widgets/selection.js";
import { DataTable, Pagination } from "../../widgets/data.js";
import { Overlay } from "../../widgets/overlay.js";
import { sortOptions } from "./data.js";
import {
  activePromo,
  adminMetrics,
  addToCart,
  adjustProductStock,
  applyPromoCode,
  cartQuantity,
  cartStockIssues,
  cartSubtotal,
  categoryPerformance,
  closeProduct,
  clearCompare,
  compareProducts,
  discountAmount,
  filteredProducts,
  formatMoney,
  getAdminDraft,
  getAdminEditingId,
  getAppliedPromo,
  getCart,
  getCartOpen,
  getCatalogSource,
  getCatalogStatus,
  getCategories,
  getCategory,
  getCheckoutEmail,
  getCheckoutOpen,
  getCheckoutName,
  getCheckoutNotes,
  getCompareList,
  getFeaturedProduct,
  getInStockOnly,
  getInterface,
  getMaxPrice,
  getMinRating,
  getOrders,
  getPage,
  getPayment,
  getProducts,
  getPromoCode,
  getQuery,
  getShipping,
  getSnack,
  getSort,
  getWishlist,
  inventoryInsights,
  isCompared,
  isWishlisted,
  maxCatalogPrice,
  openProduct,
  orderTotal,
  placeOrder,
  removePromoCode,
  removeFromCart,
  saveAdminDraft,
  setAdminDraftField,
  selectedProduct,
  setInterface,
  setCartOpen,
  setCategory,
  setCheckoutEmail,
  setCheckoutName,
  setCheckoutNotes,
  setCheckoutOpen,
  setInStockOnly,
  setMaxPrice,
  setMinRating,
  setPage,
  setPayment,
  setPromoCode,
  setQuery,
  setShipping,
  setSnack,
  setSort,
  shippingCost,
  startCreateProduct,
  startEditProduct,
  toggleProductActive,
  toggleCompare,
  toggleWishlist,
  updateOrderStatus,
  updateCartQuantity,
  wishlistProducts,
  deleteProduct,
  getAdminProductPage,
  setAdminProductPage,
  getAdminOrderPage,
  setAdminOrderPage,
  getCategoryInput,
  setCategoryInput,
  getCategoryOpen,
  setCategoryOpen,
} from "./store.js";

export const theme = {
  background: "#f6f7fb",
  surface: "#ffffff",
  surfaceAlt: "#f9fafb",
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  primary: "#2563eb",
  primaryDark: "#1d4ed8",
  accent: "#059669",
  warning: "#d97706",
  danger: "#dc2626",
  // Only mobile breakpoint values
  mobile: {
    breakpoint: 768,
    spacing: {
      padding: "16px",
      gap: "12px",
    },
  },
};

// Add this CSS to your global styles or head
const responsiveCSS = `
@media (max-width: 768px) {
  .mobile-column { flex-direction: column !important; }
  .mobile-full-width { width: 100% !important; }
  .mobile-stack { flex-wrap: wrap !important; }
  .mobile-text-small { font-size: 14px !important; }
  .mobile-padding { padding: 16px !important; }
  .mobile-gap { gap: 12px !important; }
  .mobile-hidden { display: none !important; }
  .mobile-block { display: block !important; }
}
`;

function ensureStoreStyles() {
  ensureGlobalStyle("lumina-store-responsive", responsiveCSS);
}

export function StoreShell() {
  ensureStoreStyles();
  const admin = getInterface() === "admin";
  return Scaffold({
    appBar: StoreAppBar(),
    body: SingleChildScrollView({
      style: {
        minHeight: "calc(100vh - 66px)",
        backgroundColor: theme.background,
      },
      child: admin ? AdminInterface() : Column([
        HeroSection(),
        MainContent(),
      ]),
    }),
    drawer: admin ? null : CartDrawer(),
    style: {
      minHeight: "100vh",
      backgroundColor: theme.background,
      color: theme.text,
    },
  });
}

function StoreAppBar() {
  const admin = getInterface() === "admin";
  return AppBar({
    height: 66,
    leading: Row({ gap: 10, className: "mobile-gap" }, [
      Container(
        {
          width: 34,
          height: 34,
          alignment: "center",
          decoration: {
            color: theme.primary,
            borderRadius: 10,
          },
        },
        [Text("L", { color: "#ffffff", weight: 900, size: 18 })],
      ),
      Text("Lumina Store", { weight: 900, size: 18, color: theme.text, className: "mobile-text-small" }),
    ]),
    actions: [
      ...(admin
        ? [
            DataSourceChip(),
            Button({
              text: "Storefront",
              variant: "secondary",
              onClick: () => setInterface("customer"),
              style: { borderColor: theme.border, color: theme.text },
            }),
          ]
        : [
            NavButton("Shop", "shop"),
            NavButton("Deals", "deals"),
            NavButton("Wishlist", "wishlist"),
            NavButton("Checkout", "checkout"),
            Button({
              text: "Admin",
              variant: "secondary",
              onClick: () => setInterface("admin"),
              style: { borderColor: theme.border, color: theme.text },
            }),
            CartButton(),
          ]),
    ],
    style: {
      position: "sticky",
      top: 0,
      zIndex: 20,
      backgroundColor: "rgba(255,255,255,0.96)",
      backdropFilter: "blur(14px)",
      color: theme.text,
      borderBottomColor: theme.border,
      flexWrap: "wrap",
      rowGap: "8px",
      padding: "10px 16px",
    },
  });
}

function DataSourceChip() {
  const loading = getCatalogStatus() === "loading";
  return Container(
    {
      padding: { vertical: 6, horizontal: 10 },
      decoration: {
        color: loading ? "#fffbeb" : "#ecfdf5",
        border: `1px solid ${loading ? "#fde68a" : "#bbf7d0"}`,
        borderRadius: 999,
      },
    },
    [
      Caption(
        { color: loading ? theme.warning : theme.accent },
        loading ? "Loading JSON" : `JSON: ${getCatalogSource()}`,
      ),
    ],
  );
}

function CartButton() {
  const button = Button({
    text: "Cart",
    variant: "secondary",
    onClick: () => setCartOpen(true),
    style: {
      borderColor: theme.primary,
      color: theme.primary,
      backgroundColor: "#ffffff",
    },
  });

  if (!cartQuantity()) return button;
  return Badge({ label: String(cartQuantity()) }, [button]);
}

function NavButton(label, page) {
  const active = getPage() === page;
  return Button({
    text: label,
    variant: "text",
    onClick: () => {
      setPage(page);
      if (page === "checkout") setCheckoutOpen(true);
    },
    style: {
      color: active ? theme.primary : theme.muted,
      fontWeight: active ? 800 : 600,
      padding: "6px 8px",
    },
  });
}

function HeroSection() {
  return Container(
    {
      padding: { vertical: 28, horizontal: 20 },
      style: {
        borderBottom: `1px solid ${theme.border}`,
        backgroundColor: theme.surface,
      },
    },
    [
      ConstrainedBox(
        {
          maxWidth: 1180,
          style: { margin: "0 auto" },
        },
        [
          Row({ 
            gap: 24, 
            className: "mobile-column",
            style: { alignItems: "stretch" } 
          }, [
            Expanded([
              Column({ gap: 16, className: "mobile-gap" }, [
                Badge({ label: "Spring drop", color: theme.accent }, [
                  Container(
                    {
                      padding: { vertical: 6, horizontal: 12 },
                      decoration: {
                        color: "#ecfdf5",
                        borderRadius: 999,
                        border: "1px solid #bbf7d0",
                      },
                    },
                    [
                      Caption(
                        { color: theme.accent },
                        "Curated tech for calmer workdays",
                      ),
                    ],
                  ),
                ]),
                Heading(
                  {
                    level: 1,
                    style: {
                      color: theme.text,
                      fontSize: "46px",
                      lineHeight: 1.2,
                      maxWidth: "680px",
                    },
                    className: "mobile-text-small",
                  },
                  "Everyday gear, designed for focus.",
                ),
                RichText({
                  as: "p",
                  style: {
                    margin: 0,
                    maxWidth: "650px",
                    color: theme.muted,
                    fontSize: "16px",
                    lineHeight: 1.7,
                  },
                  spans: [
                    { text: "Shop audio, workspace, travel, and wearable essentials. " },
                    {
                      text: "Free standard shipping over $180.",
                      style: { color: theme.primary, fontWeight: 800 },
                    },
                  ],
                }),
                StorefrontPulse(),
                Row({ 
                  gap: 10, 
                  className: "mobile-stack mobile-gap",
                  style: { flexWrap: "wrap" } 
                }, [
                  Button({
                    text: "Shop products",
                    onClick: () => setPage("shop"),
                    style: {
                      backgroundColor: theme.primary,
                      color: "#ffffff",
                    },
                  }),
                  Button({
                    text: "View deals",
                    variant: "secondary",
                    onClick: () => {
                      setPage("deals");
                      setCategory("All");
                      setMaxPrice(150);
                    },
                    style: {
                      borderColor: theme.primary,
                      color: theme.primary,
                    },
                  }),
                ]),
              ]),
            ]),
            HeroVisual(),
          ]),
        ],
      ),
    ],
  );
}

function HeroVisual() {
  const featured = getFeaturedProduct();
  if (!featured) return EmptyProducts();

  return Container(
    {
      width: "100%",
      maxWidth: "420px",
      className: "mobile-full-width",
      decoration: {
        color: "#eff6ff",
        border: `1px solid ${theme.border}`,
        borderRadius: 18,
      },
      style: {
        overflow: "hidden",
      },
    },
    [
      Stack({ height: 300, style: { width: "100%" } }, [
        Image({
          src: featured.image,
          alt: featured.name,
          height: "100%",
          fit: "cover",
        }),
        Positioned({
          left: 16,
          bottom: 16,
          child: PhysicalModel(
            {
              elevation: 3,
              color: "rgba(255,255,255,0.92)",
              borderRadius: 12,
              style: { padding: "12px", backdropFilter: "blur(12px)" },
            },
            [
              Column({ gap: 4 }, [
                Text(featured.name, { weight: 900, color: theme.text }),
                Caption(
                  { color: theme.muted },
                  `${formatMoney(featured.price)} · ${featured.rating} rating`,
                ),
              ]),
            ],
          ),
        }),
      ]),
    ],
  );
}

function StorefrontPulse() {
  const activeProducts = getProducts().filter((product) => product.active);
  const averageRating =
    activeProducts.reduce((total, product) => total + product.rating, 0) /
    Math.max(1, activeProducts.length);

  return Wrap({ gap: 10, className: "mobile-gap" }, [
    PulsePill(`${activeProducts.length} live SKUs`, "Catalog"),
    PulsePill(`${averageRating.toFixed(1)} avg rating`, "Signal"),
    PulsePill(`${getWishlist().length} saved`, "Wishlist"),
    PulsePill(`${getCompareList().length}/3 comparing`, "Compare"),
  ]);
}

function PulsePill(value, label) {
  return Container(
    {
      padding: { vertical: 8, horizontal: 10 },
      decoration: {
        color: theme.surfaceAlt,
        border: `1px solid ${theme.border}`,
        borderRadius: 999,
      },
    },
    [
      Row({ gap: 8 }, [
        Text(value, { color: theme.text, weight: 900, size: 13 }),
        Caption({ color: theme.muted }, label),
      ]),
    ],
  );
}

function MainContent() {
  return Container(
    {
      padding: { vertical: 22, horizontal: 20 },
    },
    [
      ConstrainedBox(
        {
          maxWidth: 1180,
          style: { margin: "0 auto" },
        },
        [
          Row({ 
            gap: 18, 
            className: "mobile-column",
            style: { alignItems: "flex-start" } 
          }, [
            FilterPanel(),
            Expanded([
              Column({ gap: 16 }, [
                Toolbar(),
                CompareTray(),
                ProductGrid(),
              ]),
            ]),
          ]),
        ],
      ),
    ],
  );
}

function AdminInterface() {
  return Container(
    {
      padding: { vertical: 22, horizontal: 20 },
    },
    [
      ConstrainedBox(
        { maxWidth: 1180, style: { margin: "0 auto" } },
        [
          Column({ gap: 18 }, [
            AdminHeader(),
            AdminMetrics(),
            AdminIntelligence(),
            Row({ 
              gap: 18, 
              className: "mobile-column",
              style: { alignItems: "flex-start" } 
            }, [
              Expanded([
                Column({ gap: 18 }, [
                  ProductAdminPanel(),
                  AdminProductForm(),
                ]),
              ]),
              Container(
                { 
                  width: "100%",
                  maxWidth: "390px",
                  className: "mobile-full-width",
                },
                [OrderAdminPanel()],
              ),
            ]),
          ]),
        ],
      ),
    ],
  );
}

function AdminHeader() {
  return Card(
    { padding: 18, style: { borderColor: theme.border } },
    [
      Row({ 
        mainAxisAlignment: "spaceBetween", 
        gap: 12, 
        className: "mobile-column mobile-gap",
        style: { flexWrap: "wrap" } 
      }, [
        Column({ gap: 4 }, [
          Heading({ level: 1, style: { color: theme.text, fontSize: "30px" } }, "Commerce admin"),
          Caption(
            { color: theme.muted },
            "Manage JSON-loaded products, inventory, orders, and storefront visibility.",
          ),
        ]),
        Row({ 
          gap: 8, 
          className: "mobile-stack mobile-gap",
          style: { flexWrap: "wrap" } 
        }, [
          DataSourceChip(),
          Button({
            text: "New product",
            onClick: startCreateProduct,
            style: { backgroundColor: theme.primary, color: "#ffffff" },
          }),
        ]),
      ]),
    ],
  );
}

function AdminMetrics() {
  const metrics = adminMetrics();
  return GridView({
    minColumnWidth: 180,
    gap: 12,
    items: [
      ["Revenue", formatMoney(metrics.revenue), "Across all orders"],
      ["Gross profit", formatMoney(metrics.grossProfit), `${Math.round(metrics.marginRate * 100)}% blended margin`],
      ["AOV", formatMoney(metrics.averageOrderValue), "Average order value"],
      ["Orders", String(metrics.orders), `${metrics.processing} processing`],
      ["Active products", String(metrics.activeProducts), `${getProducts().length} total SKUs`],
      ["Low stock", String(metrics.lowStock), "Needs attention"],
      ["Inventory value", formatMoney(metrics.inventoryValue), "At product cost"],
    ],
    itemBuilder: ([label, value, detail]) => MetricCard(label, value, detail),
  });
}

function MetricCard(label, value, detail) {
  return Card(
    { padding: 16, style: { borderColor: theme.border } },
    [
      Column({ gap: 6 }, [
        Caption({ color: theme.muted }, label),
        Text(value, { color: theme.text, weight: 900, size: 24, lineHeight: 1.1 }),
        Caption({ color: theme.muted }, detail),
      ]),
    ],
  );
}

function AdminIntelligence() {
  return GridView({ minColumnWidth: 260, gap: 12 }, [
    InventoryRiskPanel(),
    FulfillmentPanel(),
    CategoryPerformancePanel(),
  ]);
}

function InventoryRiskPanel() {
  const insights = inventoryInsights();
  const urgent = insights.filter((product) => product.stockPressure !== "healthy");
  const items = urgent.length ? urgent.slice(0, 4) : insights.slice(0, 4);

  return Card(
    { padding: 16, style: { borderColor: theme.border } },
    [
      Column({ gap: 12 }, [
        PanelHeader("Inventory radar", `${urgent.length} SKUs need review`),
        ...items.map((product) =>
          InsightRow(
            product.name,
            `${product.stock} left · ${formatMoney(product.margin)} margin`,
            product.stockPressure === "critical" ? theme.danger : theme.warning,
          ),
        ),
      ]),
    ],
  );
}

function FulfillmentPanel() {
  const orders = getOrders();
  const statuses = ["processing", "packed", "shipped", "delivered", "cancelled"];
  return Card(
    { padding: 16, style: { borderColor: theme.border } },
    [
      Column({ gap: 12 }, [
        PanelHeader("Fulfillment flow", `${orders.length} active records`),
        ...statuses.map((status) =>
          InsightRow(
            statusLabel(status),
            `${orders.filter((order) => order.status === status).length} orders`,
            statusColor(status),
          ),
        ),
      ]),
    ],
  );
}

function CategoryPerformancePanel() {
  const categories = categoryPerformance().slice(0, 4);
  return Card(
    { padding: 16, style: { borderColor: theme.border } },
    [
      Column({ gap: 12 }, [
        PanelHeader("Category velocity", "Sales-weighted catalog view"),
        ...categories.map((entry) =>
          InsightRow(
            entry.category,
            `${formatMoney(entry.revenue)} · ${entry.units} units`,
            theme.primary,
          ),
        ),
      ]),
    ],
  );
}

function PanelHeader(title, detail) {
  return Column({ gap: 3 }, [
    Text(title, { color: theme.text, weight: 900, size: 16 }),
    Caption({ color: theme.muted }, detail),
  ]);
}

function InsightRow(label, detail, color) {
  return Row({ mainAxisAlignment: "spaceBetween", gap: 10 }, [
    Column({ gap: 2, style: { minWidth: 0 } }, [
      Text(label, { color: theme.text, weight: 800, maxLines: 1 }),
      Caption({ color: theme.muted }, detail),
    ]),
    Container(
      {
        width: 10,
        height: 10,
        decoration: {
          color,
          borderRadius: 999,
        },
      },
      [],
    ),
  ]);
}

function ProductAdminPanel() {
  const products = getProducts();
  const page = getAdminProductPage();
  const pageSize = 5;
  const totalPages = Math.ceil(products.length / pageSize);
  const pageProducts = products.slice((page - 1) * pageSize, page * pageSize);

  return Card(
    { padding: 0, style: { borderColor: theme.border, overflow: "hidden" } },
    [
      Padding({ padding: 16 }, [
        Row({ 
          mainAxisAlignment: "spaceBetween", 
          gap: 12, 
          className: "mobile-column mobile-gap",
          style: { flexWrap: "wrap" } 
        }, [
          Column({ gap: 3 }, [
            Text("Product operations", { color: theme.text, weight: 900, size: 18 }),
            Caption({ color: theme.muted }, "Adjust stock, publish status, and edit product data."),
          ]),
          Caption({ color: theme.muted }, `${products.length} products`),
        ]),
      ]),
      Divider({ color: theme.border, margin: 0 }),
      Column({ gap: 0 }, [
        DataTable({
          rows: pageProducts,
          rowKey: (row) => row.id,
          columns: [
            {
              key: "name",
              label: "Product",
              sortable: true,
              render: (product) =>
                Row({ gap: 10, style: { alignItems: "center" } }, [
                  Container(
                    { width: 40, height: 40, decoration: { borderRadius: 8 }, style: { overflow: "hidden", flexShrink: 0 } },
                    [Image({ src: product.image, alt: product.name, width: 40, height: 40 })],
                  ),
                  Column({ gap: 1 }, [
                    Text(product.name, { weight: 800, size: 13 }),
                    Caption({ color: theme.muted }, product.sku),
                  ]),
                ]),
            },
            { key: "category", label: "Category" },
            {
              key: "price",
              label: "Price",
              align: "right",
              sortable: true,
              render: (product) =>
                Text(formatMoney(product.price), { weight: 700, color: theme.primary }),
            },
            {
              key: "stock",
              label: "Stock",
              align: "right",
              render: (product) =>
                Row({ gap: 6, style: { alignItems: "center", justifyContent: "flex-end" } }, [
                  Button({
                    text: "-",
                    variant: "secondary",
                    onClick: () => adjustProductStock(product.id, -1),
                    style: { padding: "2px 7px", minHeight: "28px", borderColor: theme.border },
                  }),
                  Text(String(product.stock), {
                    weight: 900,
                    size: 13,
                    color: product.stock <= product.lowStockThreshold ? theme.warning : theme.text,
                    style: { minWidth: "24px", textAlign: "center" },
                  }),
                  Button({
                    text: "+",
                    variant: "secondary",
                    onClick: () => adjustProductStock(product.id, 1),
                    style: { padding: "2px 7px", minHeight: "28px", borderColor: theme.border },
                  }),
                ]),
            },
            {
              key: "status",
              label: "Status",
              render: (product) =>
                Row({ gap: 6, style: { alignItems: "center" } }, [
                  StatusPill(product.active ? "Live" : "Hidden", product.active ? theme.accent : theme.muted),
                ]),
            },
            {
              key: "actions",
              label: "",
              render: (product) =>
                Row({ gap: 6 }, [
                  Switch({
                    value: product.active,
                    ariaLabel: `${product.name} visibility`,
                    onChange: () => toggleProductActive(product.id),
                  }),
                  Button({
                    text: "Edit",
                    variant: "secondary",
                    onClick: () => startEditProduct(product.id),
                    style: { padding: "4px 9px", borderColor: theme.border, color: theme.text, fontSize: "12px" },
                  }),
                  Button({
                    text: "Del",
                    variant: "text",
                    onClick: () => deleteProduct(product.id),
                    style: { color: theme.danger, padding: "4px 6px", fontSize: "12px" },
                  }),
                ]),
            },
          ],
          dense: true,
          style: { border: "none", boxShadow: "none", borderRadius: 0 },
        }),
        Container(
          {
            padding: { vertical: 10, horizontal: 14 },
            style: { borderTop: `1px solid ${theme.border}` },
          },
          [
            Row({ mainAxisAlignment: "spaceBetween", style: { alignItems: "center" } }, [
              Caption({ color: theme.muted }, `Page ${page} of ${totalPages}`),
              Pagination({
                page,
                pageSize,
                totalItems: products.length,
                onPageChange: setAdminProductPage,
              }),
            ]),
          ],
        ),
      ]),
    ],
  );
}

function AdminProductForm() {
  const draft = getAdminDraft();
  const editing = getAdminEditingId();

  return Card(
    { padding: 16, style: { borderColor: theme.border } },
    [
      Form(
        {
          gap: 14,
          onSubmit: saveAdminDraft,
        },
        [
          Row({ 
            mainAxisAlignment: "spaceBetween", 
            gap: 12, 
            className: "mobile-column mobile-gap",
            style: { flexWrap: "wrap" } 
          }, [
            Column({ gap: 3 }, [
              Text(editing ? "Edit product" : "Create product", {
                color: theme.text,
                weight: 900,
                size: 18,
              }),
              Caption({ color: theme.muted }, editing || "New SKU"),
            ]),
            Button({
              text: "Reset",
              variant: "secondary",
              onClick: startCreateProduct,
              style: { borderColor: theme.border, color: theme.text },
            }),
          ]),
          Row({ 
            gap: 12, 
            className: "mobile-column",
            style: { flexWrap: "wrap" } 
          }, [
            Expanded([DraftField("Name", "name", draft.name)]),
            Expanded([DraftField("SKU", "sku", draft.sku)]),
          ]),
          Row({ 
            gap: 12, 
            className: "mobile-column",
            style: { flexWrap: "wrap" } 
          }, [
            Expanded([DraftField("Category", "category", draft.category)]),
            Expanded([DraftField("Vendor", "vendor", draft.vendor)]),
            Expanded([DraftField("Color", "color", draft.color)]),
          ]),
          Row({ 
            gap: 12, 
            className: "mobile-column",
            style: { flexWrap: "wrap" } 
          }, [
            Expanded([DraftField("Price", "price", draft.price, "number")]),
            Expanded([DraftField("Cost", "cost", draft.cost, "number")]),
            Expanded([DraftField("Stock", "stock", draft.stock, "number")]),
            Expanded([DraftField("Rating", "rating", draft.rating, "number")]),
          ]),
          Row({ 
            gap: 12, 
            className: "mobile-column",
            style: { flexWrap: "wrap" } 
          }, [
            Expanded([DraftField("Badge", "badge", draft.badge)]),
            Expanded([DraftField("Tags", "tags", draft.tags)]),
            Expanded([DraftField("Low stock", "lowStockThreshold", draft.lowStockThreshold, "number")]),
          ]),
          FormField({ label: "Description" }, [
            TextArea({
              value: draft.description,
              onChange: (value) => setAdminDraftField("description", value),
              rows: 3,
              style: { borderColor: theme.border },
            }),
          ]),
          Row({ 
            gap: 12, 
            className: "mobile-column",
            style: { flexWrap: "wrap", alignItems: "center" } 
          }, [
            DraftSwitch("Active on storefront", "active", draft.active),
            DraftSwitch("Featured product", "featured", draft.featured),
            Spacer(),
            Button({
              text: "Save product",
              type: "submit",
              style: { backgroundColor: theme.primary, color: "#ffffff" },
            }),
          ]),
        ],
      ),
    ],
  );
}

function DraftField(label, field, value, type = "text") {
  return FormField({ label }, [
    Input({
      type,
      value,
      onChange: (next) => setAdminDraftField(field, next),
      style: { width: "100%", borderColor: theme.border },
    }),
  ]);
}

function DraftSwitch(label, field, value) {
  return Row({ gap: 8, className: "mobile-gap" }, [
    Switch({
      value: !!value,
      ariaLabel: label,
      onChange: (next) => setAdminDraftField(field, next),
    }),
    Text(label, { color: theme.text, weight: 700 }),
  ]);
}

function OrderAdminPanel() {
  const orders = getOrders();
  const page = getAdminOrderPage();
  const pageSize = 5;
  const totalPages = Math.ceil(orders.length / pageSize);
  const pageOrders = orders.slice((page - 1) * pageSize, page * pageSize);

  return Card(
    { padding: 0, style: { borderColor: theme.border, overflow: "hidden" } },
    [
      Padding({ padding: 16 }, [
        Column({ gap: 3 }, [
          Text("Order queue", { color: theme.text, weight: 900, size: 18 }),
          Caption({ color: theme.muted }, "Update fulfillment status from the admin view."),
        ]),
      ]),
      Divider({ color: theme.border, margin: 0 }),
      Column({ gap: 0 }, [
        DataTable({
          rows: pageOrders,
          rowKey: (row) => row.id,
          columns: [
            { key: "id", label: "Order", sortable: true },
            {
              key: "customer",
              label: "Customer",
              render: (order) =>
                Column({ gap: 1 }, [
                  Text(order.customer.name, { weight: 700, size: 13 }),
                  Caption({ color: theme.muted }, order.customer.email),
                ]),
            },
            { key: "placedAt", label: "Date", sortable: true },
            {
              key: "items",
              label: "Items",
              render: (order) =>
                Caption({ color: theme.muted, maxLines: 1 }, orderItems(order)),
            },
            {
              key: "status",
              label: "Status",
              render: (order) => StatusPill(order.status, statusColor(order.status)),
            },
            {
              key: "total",
              label: "Total",
              align: "right",
              sortable: true,
              render: (order) =>
                Text(formatMoney(order.total), { weight: 900, color: theme.primary }),
            },
            {
              key: "actions",
              label: "",
              render: (order) =>
                Dropdown({
                  value: order.status,
                  onChange: (status) => updateOrderStatus(order.id, status),
                  options: [
                    { label: "Processing", value: "processing" },
                    { label: "Packed", value: "packed" },
                    { label: "Shipped", value: "shipped" },
                    { label: "Delivered", value: "delivered" },
                    { label: "Cancelled", value: "cancelled" },
                  ],
                  style: { borderColor: theme.border, minWidth: "120px" },
                }),
            },
          ],
          dense: true,
          style: { border: "none", boxShadow: "none", borderRadius: 0 },
        }),
        Container(
          {
            padding: { vertical: 10, horizontal: 14 },
            style: { borderTop: `1px solid ${theme.border}` },
          },
          [
            Row({ mainAxisAlignment: "spaceBetween", style: { alignItems: "center" } }, [
              Caption({ color: theme.muted }, `Page ${page} of ${totalPages}`),
              Pagination({
                page,
                pageSize,
                totalItems: orders.length,
                onPageChange: setAdminOrderPage,
              }),
            ]),
          ],
        ),
      ]),
    ],
  );
}

function orderItems(order) {
  return order.items
    .map((item) => {
      const product = getProducts().find((entry) => entry.id === item.productId);
      return `${item.quantity}x ${product ? product.name : item.productId}`;
    })
    .join(", ");
}

function StatusPill(label, color) {
  return Container(
    {
      padding: { vertical: 4, horizontal: 8 },
      decoration: {
        color: `${color}18`,
        border: `1px solid ${color}44`,
        borderRadius: 999,
      },
    },
    [Caption({ color }, label)],
  );
}

function statusColor(status) {
  if (status === "delivered" || status === "shipped") return theme.accent;
  if (status === "cancelled") return theme.danger;
  if (status === "packed") return theme.primary;
  return theme.warning;
}

function statusLabel(status) {
  return String(status || "")
    .replace(/-/g, " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function FilterPanel() {
  return Card(
    {
      padding: 16,
      style: {
        width: "100%",
        maxWidth: "280px",
        borderColor: theme.border,
      },
      className: "mobile-full-width",
    },
    [
      Column({ gap: 14 }, [
        Text("Filters", { weight: 900, size: 18, color: theme.text }),
        Input({
          value: getQuery(),
          onChange: setQuery,
          placeholder: "Search products",
          style: {
            width: "100%",
            borderColor: theme.border,
          },
        }),
        Column({ gap: 8 }, [
          Caption({ color: theme.muted }, "Category"),
          ComboBox({
            value: getCategory(),
            inputValue: getCategoryInput(),
            open: getCategoryOpen(),
            options: getCategories().map((cat) => ({ label: cat, value: cat })),
            onChange: (value) => {
              setCategory(value || "All");
              setCategoryInput("");
            },
            onInputChange: (value) => setCategoryInput(value),
            onOpenChange: (open) => setCategoryOpen(open),
            placeholder: "All categories",
            clearable: true,
            style: { borderColor: theme.border },
          }),
        ]),
        Column({ gap: 8 }, [
          Row({ mainAxisAlignment: "spaceBetween" }, [
            Caption({ color: theme.muted }, "Max price"),
            Caption({ color: theme.text }, formatMoney(Number(getMaxPrice()))),
          ]),
          Slider({
            value: getMaxPrice(),
            min: 50,
            max: maxCatalogPrice(),
            step: 10,
            onChange: setMaxPrice,
          }),
        ]),
        Column({ gap: 8 }, [
          Row({ mainAxisAlignment: "spaceBetween" }, [
            Caption({ color: theme.muted }, "Minimum rating"),
            Caption({ color: theme.text }, `${Number(getMinRating()).toFixed(1)}+`),
          ]),
          Slider({
            value: getMinRating(),
            min: 0,
            max: 5,
            step: 0.5,
            onChange: setMinRating,
          }),
        ]),
        Row({ mainAxisAlignment: "spaceBetween", gap: 12 }, [
          Column({ gap: 2 }, [
            Text("In-stock only", { color: theme.text, weight: 800 }),
            Caption({ color: theme.muted }, "Hide sold out SKUs"),
          ]),
          Switch({
            checked: getInStockOnly(),
            ariaLabel: "Filter in-stock products",
            onChange: setInStockOnly,
          }),
        ]),
        Dropdown({
          value: getSort(),
          onChange: setSort,
          options: sortOptions,
          style: { borderColor: theme.border },
        }),
        Divider({ color: theme.border }),
        Caption(
          { color: theme.muted },
          `${filteredProducts().length} matching products`,
        ),
      ]),
    ],
  );
}

function Toolbar() {
  const page = getPage();
  const title =
    page === "deals"
      ? "Current deals"
      : page === "wishlist"
        ? "Saved products"
        : "Product catalog";
  const detail =
    page === "wishlist"
      ? `${wishlistProducts().length} saved products ready for review.`
      : "Browse Lumina Store products built with LuminaUI widgets.";
  return Row({ 
    gap: 12, 
    mainAxisAlignment: "spaceBetween", 
    className: "mobile-column mobile-gap",
    style: { flexWrap: "wrap" } 
  }, [
    Column({ gap: 3 }, [
      Heading(
        { level: 2, style: { color: theme.text } },
        title,
      ),
      Caption(
        { color: theme.muted },
        detail,
      ),
    ]),
    Row({ 
      gap: 8, 
      className: "mobile-stack mobile-gap",
      style: { flexWrap: "wrap" } 
    }, [
      Button({
        text: "Clear filters",
        variant: "text",
          onClick: () => {
            setQuery("");
            setCategory("All");
            setMaxPrice(250);
            setMinRating(0);
            setInStockOnly(false);
            setSort("featured");
            setPage("shop");
          },
      }),
      Button({
        text: "Checkout",
        disabled: cartQuantity() === 0,
        onClick: () => setCheckoutOpen(true),
      }),
    ]),
  ]);
}

function CompareTray() {
  const products = compareProducts();
  if (!products.length) return null;

  return Card(
    { padding: 14, style: { borderColor: "#bfdbfe", backgroundColor: "#eff6ff" } },
    [
      Column({ gap: 12 }, [
        Row({
          mainAxisAlignment: "spaceBetween",
          gap: 10,
          className: "mobile-column",
          style: { alignItems: "center" }
        }, [
          Column({ gap: 2 }, [
            Text("Compare bench", { color: theme.text, weight: 900 }),
            Caption({ color: theme.muted }, `${products.length} of 3 products selected`),
          ]),
          Button({
            text: "Clear compare",
            variant: "text",
            onClick: clearCompare,
            style: { color: theme.primary },
          }),
        ]),
        GridView({
          items: products,
          minColumnWidth: 180,
          gap: 10,
          itemBuilder: (product) =>
            Container(
              {
                key: product.id,
                padding: 10,
                decoration: {
                  color: "#ffffff",
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8,
                },
              },
              [
                Column({ gap: 6 }, [
                  Text(product.name, { color: theme.text, weight: 900, maxLines: 1 }),
                  Caption({ color: theme.muted }, product.category),
                  SummaryRow("Price", formatMoney(product.price)),
                  SummaryRow("Rating", `${product.rating}`),
                  SummaryRow("Stock", `${product.stock}`),
                ]),
              ],
            ),
        }),
      ]),
    ],
  );
}

function ProductGrid() {
  const page = getPage();
  const items =
    page === "wishlist"
      ? wishlistProducts().filter((product) => product.active)
      : page === "deals"
        ? filteredProducts().filter((product) => product.price <= 150)
        : filteredProducts();

  if (!items.length) {
    return page === "wishlist" ? EmptyWishlist() : EmptyProducts();
  }

  return GridView({
    items,
    minColumnWidth: 230,
    gap: 16,
    itemBuilder: ProductCard,
  });
}

function EmptyProducts() {
  return Card(
    {
      style: {
        borderColor: theme.border,
        minHeight: "260px",
      },
    },
    [
      Center([
        Column({ gap: 10, style: { textAlign: "center" } }, [
          Icon({ name: "search", size: 34, color: theme.muted }),
          Text("No products found", { weight: 900, color: theme.text }),
          Caption({ color: theme.muted }, "Try a different search or price range."),
        ]),
      ]),
    ],
  );
}

function EmptyWishlist() {
  return Card(
    {
      style: {
        borderColor: theme.border,
        minHeight: "260px",
      },
    },
    [
      Center([
        Column({ gap: 10, style: { textAlign: "center" } }, [
          Icon({ name: "star", size: 34, color: theme.muted }),
          Text("No saved products yet", { weight: 900, color: theme.text }),
          Caption({ color: theme.muted }, "Save products from the catalog to compare later."),
          Button({
            text: "Browse catalog",
            onClick: () => setPage("shop"),
            style: { backgroundColor: theme.primary, color: "#ffffff" },
          }),
        ]),
      ]),
    ],
  );
}

function ProductCard(product) {
  const saved = isWishlisted(product.id);
  const compared = isCompared(product.id);
  const low = product.stock <= product.lowStockThreshold;

  return Card(
    {
      key: product.id,
      padding: 0,
      style: {
        borderColor: theme.border,
        overflow: "hidden",
      },
    },
    [
      Column([
        Stack([
          AspectRatio({ aspectRatio: "4 / 3" }, [
            Image({
              src: product.image,
              alt: product.name,
              height: "100%",
              fit: "cover",
            }),
          ]),
          Positioned({
            left: 12,
            top: 12,
            right: 12,
            child: ProductBadge(product.badge),
          }),
        ]),
        Padding({ padding: 14 }, [
          Column({ gap: 10 }, [
            Row({ 
              mainAxisAlignment: "spaceBetween", 
              gap: 10,
              className: "mobile-column",
            }, [
              Expanded([
                Text(product.name, {
                  weight: 900,
                  color: theme.text,
                  size: 16,
                  maxLines: 1,
                }),
              ]),
              Text(formatMoney(product.price), {
                weight: 900,
                color: theme.primary,
              }),
            ]),
            Caption(
              { color: low ? theme.warning : theme.muted },
              `${product.category} · ${product.color} · ${product.stock} in stock`,
            ),
            Row({ gap: 8, className: "mobile-stack", style: { flexWrap: "wrap" } }, [
              DetailPill("Rating", `${product.rating}`),
              DetailPill("Vendor", product.vendor),
              low ? StatusPill("Low stock", theme.warning) : StatusPill("Ready", theme.accent),
            ]),
            Text(product.description, {
              color: theme.muted,
              maxLines: 2,
              lineHeight: 1.45,
            }),
            Row({ 
              gap: 8, 
              className: "mobile-column mobile-gap",
              style: { flexWrap: "wrap" } 
            }, [
              Expanded([
                Button({
                  text: product.stock ? "Add to cart" : "Sold out",
                  disabled: product.stock <= 0,
                  onClick: () => addToCart(product.id),
                  style: {
                    width: "100%",
                    backgroundColor: theme.primary,
                    color: "#ffffff",
                  },
                }),
              ]),
              Button({
                text: "Details",
                variant: "secondary",
                onClick: () => openProduct(product.id),
                style: {
                  borderColor: theme.border,
                  color: theme.text,
                },
              }),
            ]),
            Row({ gap: 8, className: "mobile-column mobile-gap" }, [
              Expanded([
                Button({
                  text: saved ? "Saved" : "Save",
                  variant: saved ? "primary" : "secondary",
                  onClick: () => toggleWishlist(product.id),
                  style: {
                    width: "100%",
                    backgroundColor: saved ? theme.accent : "#ffffff",
                    borderColor: saved ? theme.accent : theme.border,
                    color: saved ? "#ffffff" : theme.text,
                  },
                }),
              ]),
              Expanded([
                Button({
                  text: compared ? "Comparing" : "Compare",
                  variant: compared ? "primary" : "secondary",
                  onClick: () => toggleCompare(product.id),
                  style: {
                    width: "100%",
                    backgroundColor: compared ? theme.primary : "#ffffff",
                    borderColor: compared ? theme.primary : theme.border,
                    color: compared ? "#ffffff" : theme.text,
                  },
                }),
              ]),
            ]),
          ]),
        ]),
      ]),
    ],
  );
}

function ProductBadge(label, color = theme.primary) {
  return {
    tag: "span",
    props: {
      style: {
        display: "inline-flex",
        alignItems: "center",
        maxWidth: "100%",
        width: "fit-content",
        minHeight: "28px",
        padding: "5px 10px",
        borderRadius: "999px",
        border: "2px solid rgba(255,255,255,0.86)",
        backgroundColor: color,
        boxShadow: "0 8px 18px rgba(15, 23, 42, 0.16)",
        overflow: "hidden",
      },
    },
    children: [
      {
        tag: "span",
        props: {
          style: {
            display: "block",
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: 900,
            lineHeight: 1,
          },
        },
        children: [label],
      },
    ],
  };
}

export function CartDrawer() {
  const cart = getCart();
  return Drawer(
    {
      open: getCartOpen(),
      width: 390,
      style: {
        left: "auto",
        right: 0,
        backgroundColor: theme.surface,
        color: theme.text,
        borderLeft: `1px solid ${theme.border}`,
      },
    },
    [
      Column({ style: { minHeight: "100%" } }, [
        Padding({ padding: 18 }, [
          Row({ 
            mainAxisAlignment: "spaceBetween", 
            gap: 12,
            className: "mobile-column",
          }, [
            Column({ gap: 4 }, [
              Heading({ level: 2, style: { color: theme.text } }, "Cart"),
              Caption({ color: theme.muted }, `${cartQuantity()} items`),
            ]),
            Button({
              text: "Close",
              variant: "text",
              onClick: () => setCartOpen(false),
            }),
          ]),
        ]),
        Divider({ color: theme.border, margin: 0 }),
        Expanded([
          cart.length
            ? SingleChildScrollView({
                style: { maxHeight: "calc(100vh - 240px)" },
                child: ListView({
                  items: cart,
                  gap: 0,
                  itemBuilder: CartItem,
                }),
              })
            : Center([
                Padding({ padding: 28 }, [
                  Column({ gap: 10, style: { textAlign: "center" } }, [
                    Icon({ name: "info", size: 32, color: theme.muted }),
                    Text("Your cart is empty", { weight: 900 }),
                    Caption(
                      { color: theme.muted },
                      "Add a product and it will appear here.",
                    ),
                  ]),
                ]),
              ]),
        ]),
        CartSummary(),
      ]),
    ],
  );
}

function CartItem(item) {
  const product = getProducts().find((entry) => entry.id === item.productId);
  if (!product) return null;
  const overStock = item.quantity > product.stock;

  return Dismissible(
    {
      key: product.id,
      onDismissed: () => removeFromCart(product.id),
    },
    [
      Padding({ padding: 14 }, [
        Row({ 
          gap: 12, 
          className: "mobile-column",
          style: { alignItems: "stretch" } 
        }, [
          Container(
            {
              width: 74,
              decoration: { borderRadius: 10 },
              style: { overflow: "hidden", flexShrink: 0 },
            },
            [
              Image({
                src: product.image,
                alt: product.name,
                width: 74,
                height: 74,
                fit: "cover",
              }),
            ],
          ),
          Expanded([
            Column({ gap: 7 }, [
              Row({ 
                mainAxisAlignment: "spaceBetween", 
                gap: 10,
                className: "mobile-column",
              }, [
                Text(product.name, { weight: 800, color: theme.text }),
                Text(formatMoney(product.price * item.quantity), {
                  weight: 900,
                  color: theme.primary,
                }),
              ]),
              Caption(
                { color: overStock ? theme.danger : theme.muted },
                overStock
                  ? `Only ${product.stock} available`
                  : `${product.color} · ${product.stock} available`,
              ),
              Row({ 
                gap: 8, 
                className: "mobile-stack mobile-gap",
                style: { flexWrap: "wrap", alignItems: "center" } 
              }, [
                Button({
                  text: "-",
                  variant: "secondary",
                  onClick: () =>
                    updateCartQuantity(product.id, item.quantity - 1),
                  style: { padding: "4px 9px" },
                }),
                Text(String(item.quantity), { weight: 800 }),
                Button({
                  text: "+",
                  variant: "secondary",
                  disabled: item.quantity >= product.stock,
                  onClick: () =>
                    updateCartQuantity(product.id, item.quantity + 1),
                  style: { padding: "4px 9px" },
                }),
                Spacer(),
                Button({
                  text: "Remove",
                  variant: "text",
                  onClick: () => removeFromCart(product.id),
                  style: { color: theme.danger, padding: "4px 6px" },
                }),
              ]),
            ]),
          ]),
        ]),
      ]),
      Divider({ color: theme.border, margin: 0 }),
    ],
  );
}

function CartSummary() {
  const subtotal = cartSubtotal();
  const promo = activePromo();
  const discount = discountAmount();
  const stockIssues = cartStockIssues();
  return Container(
    {
      padding: 18,
      style: {
        borderTop: `1px solid ${theme.border}`,
        backgroundColor: theme.surfaceAlt,
      },
    },
    [
      Column({ gap: 10 }, [
        stockIssues.length
          ? Container(
              {
                padding: 10,
                decoration: {
                  color: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                },
              },
              [
                Caption(
                  { color: theme.danger },
                  "Some cart quantities exceed available stock.",
                ),
              ],
            )
          : null,
        PromoBox(),
        SummaryRow("Subtotal", formatMoney(subtotal)),
        discount ? SummaryRow(promo?.code || "Discount", `-${formatMoney(discount)}`) : null,
        SummaryRow("Shipping", subtotal >= 180 ? "Free" : formatMoney(shippingCost())),
        Divider({ color: theme.border }),
        SummaryRow("Total", formatMoney(orderTotal()), true),
        Button({
          text: "Checkout",
          disabled: subtotal === 0 || stockIssues.length > 0,
          onClick: () => {
            setCartOpen(false);
            setCheckoutOpen(true);
            setPage("checkout");
          },
          style: {
            backgroundColor: theme.primary,
            color: "#ffffff",
          },
        }),
      ]),
    ],
  );
}

function PromoBox() {
  const promo = getAppliedPromo();
  return Container(
    {
      padding: 10,
      decoration: {
        color: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 8,
      },
    },
    [
      Column({ gap: 8 }, [
        Row({ mainAxisAlignment: "spaceBetween", gap: 8 }, [
          Text("Promo code", { color: theme.text, weight: 800 }),
          promo
            ? Button({
                text: "Remove",
                variant: "text",
                onClick: removePromoCode,
                style: { padding: "4px 6px", color: theme.danger },
              })
            : null,
        ]),
        Row({ gap: 8, className: "mobile-column" }, [
          Expanded([
            Input({
              value: getPromoCode(),
              onChange: setPromoCode,
              placeholder: "FOCUS10",
              style: { borderColor: theme.border },
            }),
          ]),
          Button({
            text: promo ? "Applied" : "Apply",
            disabled: !getPromoCode().trim(),
            onClick: applyPromoCode,
            style: {
              backgroundColor: promo ? theme.accent : theme.primary,
              color: "#ffffff",
            },
          }),
        ]),
        Caption(
          { color: theme.muted },
          promo ? promo.label : "Try FOCUS10, FREESHIP, or WORKSPACE25.",
        ),
      ]),
    ],
  );
}

function SummaryRow(label, value, strong = false) {
  return Row({ 
    mainAxisAlignment: "spaceBetween",
    className: "mobile-column",
  }, [
    Text(label, { color: strong ? theme.text : theme.muted, weight: strong ? 900 : 500 }),
    Text(value, { color: theme.text, weight: strong ? 900 : 700 }),
  ]);
}

export function ProductDialog() {
  const product = selectedProduct();

  return Overlay({ open: !!product, modal: true, onDismiss: closeProduct }, () => [
    Row({ 
      className: "mobile-column",
      style: { flexWrap: "wrap", alignItems: "stretch" } 
    }, [
      Container(
        {
          width: "100%",
          maxWidth: "420px",
          className: "mobile-full-width",
          style: { overflow: "hidden" },
        },
        [
          Image({
            src: product.image,
            alt: product.name,
            height: "100%",
            fit: "cover",
          }),
        ],
      ),
      Expanded([
        Padding({ padding: 22 }, [
          Column({ gap: 14 }, [
            Row({ 
              mainAxisAlignment: "spaceBetween", 
              gap: 12,
              className: "mobile-column",
            }, [
              Row({ 
                gap: 8, 
                className: "mobile-stack",
                style: { flexWrap: "wrap" } 
              }, [
                ProductBadge(product.badge, theme.accent),
                DetailPill("Category", product.category),
              ]),
              Button({
                text: "Close",
                variant: "text",
                onClick: closeProduct,
              }),
            ]),
            Heading({ level: 1, style: { color: theme.text } }, product.name),
            Text(product.description, {
              color: theme.muted,
              lineHeight: 1.7,
              as: "p",
            }),
            Row({ 
              gap: 14, 
              className: "mobile-stack mobile-gap",
              style: { flexWrap: "wrap" } 
            }, [
              DetailPill("Price", formatMoney(product.price)),
              DetailPill("Rating", `${product.rating} stars`),
              DetailPill("Stock", `${product.stock} available`),
            ]),
            Divider({ color: theme.border }),
            Row({ 
              gap: 10, 
              className: "mobile-column mobile-gap",
              style: { flexWrap: "wrap" } 
            }, [
              Button({
                text: product.stock ? "Add to cart" : "Sold out",
                disabled: product.stock <= 0,
                onClick: () => {
                  closeProduct();
                  addToCart(product.id);
                  setCartOpen(true);
                },
                style: {
                  backgroundColor: theme.primary,
                  color: "#ffffff",
                },
              }),
              Button({
                text: "Keep shopping",
                variant: "secondary",
                onClick: closeProduct,
              }),
            ]),
          ]),
        ]),
      ]),
    ]),
  ]);
}

function DetailPill(label, value) {
  return Container(
    {
      padding: { vertical: 8, horizontal: 10 },
      decoration: {
        color: theme.surfaceAlt,
        border: `1px solid ${theme.border}`,
        borderRadius: 8,
      },
    },
    [
      Column({ gap: 2 }, [
        Caption({ color: theme.muted }, label),
        Text(value, { color: theme.text, weight: 800 }),
      ]),
    ],
  );
}

export function CheckoutDialog() {
  return Overlay({
    open: getCheckoutOpen(),
    modal: true,
    onDismiss: () => setCheckoutOpen(false),
  }, () => {
    const discount = discountAmount();
    const promo = activePromo();
    const stockIssues = cartStockIssues();
    return [
      Padding({ padding: 22 }, [
      Column({ gap: 16 }, [
        Row({ 
          mainAxisAlignment: "spaceBetween", 
          gap: 12,
          className: "mobile-column",
        }, [
          Column({ gap: 4 }, [
            Heading({ level: 2, style: { color: theme.text } }, "Checkout"),
            Caption({ color: theme.muted }, "Complete your demo order."),
          ]),
          Button({
            text: "Close",
            variant: "text",
            onClick: () => setCheckoutOpen(false),
          }),
        ]),
        Form(
          {
            gap: 12,
            onSubmit: placeOrder,
          },
          [
            Row({ 
              gap: 12, 
              className: "mobile-column",
              style: { flexWrap: "wrap" } 
            }, [
              Expanded([
                FormField({ label: "Full name", required: true }, [
                  Input({
                    value: getCheckoutName(),
                    onChange: setCheckoutName,
                    placeholder: "Amina Banda",
                    style: { width: "100%", borderColor: theme.border },
                  }),
                ]),
              ]),
              Expanded([
                FormField({ label: "Email", required: true }, [
                  Input({
                    type: "email",
                    value: getCheckoutEmail(),
                    onChange: setCheckoutEmail,
                    placeholder: "amina@example.com",
                    style: { width: "100%", borderColor: theme.border },
                  }),
                ]),
              ]),
            ]),
            FormField({ label: "Delivery notes" }, [
              TextArea({
                value: getCheckoutNotes(),
                onChange: setCheckoutNotes,
                rows: 3,
                placeholder: "Apartment, gate code, preferred delivery time...",
                style: { borderColor: theme.border },
              }),
            ]),
            Row({ 
              gap: 12, 
              className: "mobile-column",
              style: { flexWrap: "wrap" } 
            }, [
              Expanded([
                FormField({ label: "Shipping" }, [
                  RadioGroup({
                    value: getShipping(),
                    onChange: setShipping,
                    options: [
                      { label: "Standard", value: "standard" },
                      { label: "Express", value: "express" },
                    ],
                  }),
                ]),
              ]),
              Expanded([
                FormField({ label: "Payment" }, [
                  RadioGroup({
                    value: getPayment(),
                    onChange: setPayment,
                    options: [
                      { label: "Card", value: "card" },
                      { label: "Mobile money", value: "mobile" },
                    ],
                  }),
                ]),
              ]),
            ]),
            PromoBox(),
            stockIssues.length
              ? Container(
                  {
                    padding: 12,
                    decoration: {
                      color: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 8,
                    },
                  },
                  [
                    Caption(
                      { color: theme.danger },
                      "Resolve stock issues in cart before placing the order.",
                    ),
                  ],
                )
              : null,
            Container(
              {
                padding: 14,
                decoration: {
                  color: theme.surfaceAlt,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 10,
                },
              },
              [
                Column({ gap: 8 }, [
                  SummaryRow("Subtotal", formatMoney(cartSubtotal())),
                  discount
                    ? SummaryRow(promo?.code || "Discount", `-${formatMoney(discount)}`)
                    : null,
                  SummaryRow("Shipping", formatMoney(shippingCost())),
                  SummaryRow("Total", formatMoney(orderTotal()), true),
                ]),
              ],
            ),
            Row({ 
              mainAxisAlignment: "end", 
              gap: 10, 
              className: "mobile-column",
              style: { flexWrap: "wrap" } 
            }, [
              Button({
                text: "Back to cart",
                variant: "secondary",
                onClick: () => {
                  setCheckoutOpen(false);
                  setCartOpen(true);
                },
              }),
              Button({
                text: "Place order",
                type: "submit",
                disabled: cartQuantity() === 0 || stockIssues.length > 0,
                style: {
                  backgroundColor: theme.primary,
                  color: "#ffffff",
                },
              }),
            ]),
          ],
        ),
      ]),
    ]),
    ];
  });
}

export function StoreSnackBar() {
  return SnackBar({
    open: !!getSnack(),
    message: getSnack(),
    action: Button({
      text: "Dismiss",
      variant: "text",
      onClick: () => setSnack(""),
      style: { color: "#ffffff", padding: "4px 6px" },
    }),
  });
}

export function Footer() {
  return Container(
    {
      padding: { vertical: 26, horizontal: 20 },
      style: {
        backgroundColor: theme.surface,
        borderTop: `1px solid ${theme.border}`,
        marginTop: "auto",
      },
    },
    [
      ConstrainedBox(
        { maxWidth: 1180, style: { margin: "0 auto" } },
        [
          Row({ 
            mainAxisAlignment: "spaceBetween", 
            gap: 12, 
            className: "mobile-column mobile-gap",
            style: { flexWrap: "wrap", textAlign: "center" } 
          }, [
            Text("Lumina Store", { weight: 900, color: theme.text }),
            Opacity({ opacity: 0.72 }, [
              Caption(
                { color: theme.muted },
                "Built entirely with LuminaUI widgets.",
              ),
            ]),
          ]),
        ],
      ),
    ],
  );
}
