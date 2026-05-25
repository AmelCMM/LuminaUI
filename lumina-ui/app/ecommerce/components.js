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
import { Dialog, SnackBar } from "../../widgets/feedback.js";
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
import { sortOptions } from "./data.js";
import {
  adminMetrics,
  addToCart,
  adjustProductStock,
  cartQuantity,
  cartSubtotal,
  closeProduct,
  filteredProducts,
  formatMoney,
  getAdminDraft,
  getAdminEditingId,
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
  getFeaturedProduct,
  getInterface,
  getMaxPrice,
  getOrders,
  getPage,
  getPayment,
  getProducts,
  getQuery,
  getShipping,
  getSnack,
  getSort,
  maxCatalogPrice,
  openProduct,
  orderTotal,
  placeOrder,
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
  setMaxPrice,
  setPage,
  setPayment,
  setQuery,
  setShipping,
  setSnack,
  setSort,
  shippingCost,
  startCreateProduct,
  startEditProduct,
  toggleProductActive,
  updateOrderStatus,
  updateCartQuantity,
  deleteProduct,
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

function ProductAdminPanel() {
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
          Caption({ color: theme.muted }, `${getProducts().length} products`),
        ]),
      ]),
      Divider({ color: theme.border, margin: 0 }),
      ListView({
        key: "admin-product-list",
        items: getProducts(),
        itemBuilder: ProductAdminRow,
      }),
    ],
  );
}

function ProductAdminRow(product) {
  const low = product.stock <= product.lowStockThreshold;
  return Container(
    { key: product.id },
    [
      Padding({ padding: 14 }, [
        Row({ 
          gap: 12, 
          className: "mobile-column mobile-gap",
          style: { alignItems: "center" } 
        }, [
          Container(
            {
              width: 58,
              height: 58,
              decoration: { borderRadius: 10 },
              style: { overflow: "hidden", flexShrink: 0 },
            },
            [Image({ src: product.image, alt: product.name, width: 58, height: 58 })],
          ),
          Expanded([
            Column({ gap: 5 }, [
              Row({ 
                gap: 8, 
                className: "mobile-stack",
                style: { flexWrap: "wrap", alignItems: "center" } 
              }, [
                Text(product.name, { color: theme.text, weight: 900 }),
                StatusPill(product.active ? "Live" : "Hidden", product.active ? theme.accent : theme.muted),
                low ? StatusPill("Low stock", theme.warning) : null,
              ]),
              Caption(
                { color: theme.muted },
                `${product.sku} · ${product.category} · ${formatMoney(product.price)} · ${product.vendor}`,
              ),
            ]),
          ]),
          Row({ 
            gap: 6, 
            className: "mobile-stack mobile-gap",
            style: { alignItems: "center", flexWrap: "wrap" } 
          }, [
            Button({
              text: "-",
              variant: "secondary",
              onClick: () => adjustProductStock(product.id, -1),
              style: { padding: "4px 9px", borderColor: theme.border },
            }),
            Text(String(product.stock), {
              color: low ? theme.warning : theme.text,
              weight: 900,
              style: { minWidth: "26px", textAlign: "center" },
            }),
            Button({
              text: "+",
              variant: "secondary",
              onClick: () => adjustProductStock(product.id, 1),
              style: { padding: "4px 9px", borderColor: theme.border },
            }),
          ]),
          Switch({
            value: product.active,
            ariaLabel: `${product.name} visibility`,
            onChange: () => toggleProductActive(product.id),
          }),
          Button({
            text: "Edit",
            variant: "secondary",
            onClick: () => startEditProduct(product.id),
            style: { borderColor: theme.border, color: theme.text },
          }),
          Button({
            text: "Delete",
            variant: "text",
            onClick: () => deleteProduct(product.id),
            style: { color: theme.danger },
          }),
        ]),
      ]),
      Divider({ color: theme.border, margin: 0 }),
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
      ListView({
        key: "admin-order-list",
        items: getOrders(),
        itemBuilder: OrderAdminCard,
      }),
    ],
  );
}

function OrderAdminCard(order) {
  return Container(
    { key: order.id },
    [
      Padding({ padding: 14 }, [
        Column({ gap: 10 }, [
          Row({ 
            mainAxisAlignment: "spaceBetween", 
            gap: 10,
            className: "mobile-column mobile-gap",
          }, [
            Column({ gap: 2 }, [
              Text(order.id, { color: theme.text, weight: 900 }),
              Caption({ color: theme.muted }, `${order.customer.name} · ${order.placedAt}`),
            ]),
            StatusPill(order.status, statusColor(order.status)),
          ]),
          Caption({ color: theme.muted }, orderItems(order)),
          Row({ 
            mainAxisAlignment: "spaceBetween", 
            gap: 10, 
            className: "mobile-column mobile-gap",
            style: { alignItems: "center" } 
          }, [
            Text(formatMoney(order.total), { color: theme.primary, weight: 900 }),
            Dropdown({
              value: order.status,
              onChange: (status) => updateOrderStatus(order.id, status),
              className: "mobile-full-width",
              options: [
                { label: "Processing", value: "processing" },
                { label: "Packed", value: "packed" },
                { label: "Shipped", value: "shipped" },
                { label: "Delivered", value: "delivered" },
                { label: "Cancelled", value: "cancelled" },
              ],
              style: { width: 150, borderColor: theme.border },
            }),
          ]),
        ]),
      ]),
      Divider({ color: theme.border, margin: 0 }),
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
          Wrap(
            { gap: 8, className: "mobile-gap" },
            getCategories().map((category) =>
              Button({
                key: category,
                text: category,
                variant: getCategory() === category ? "primary" : "secondary",
                onClick: () => setCategory(category),
                style: {
                  padding: "6px 10px",
                  borderColor: theme.border,
                  backgroundColor:
                    getCategory() === category ? theme.primary : "#ffffff",
                  color: getCategory() === category ? "#ffffff" : theme.text,
                },
              }),
            ),
          ),
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
  return Row({ 
    gap: 12, 
    mainAxisAlignment: "spaceBetween", 
    className: "mobile-column mobile-gap",
    style: { flexWrap: "wrap" } 
  }, [
    Column({ gap: 3 }, [
      Heading(
        { level: 2, style: { color: theme.text } },
        page === "deals" ? "Current deals" : "Product catalog",
      ),
      Caption(
        { color: theme.muted },
        "Browse Lumina Store products built with LuminaUI widgets.",
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

function ProductGrid() {
  const items =
    getPage() === "deals"
      ? filteredProducts().filter((product) => product.price <= 150)
      : filteredProducts();

  if (!items.length) {
    return EmptyProducts();
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

function ProductCard(product) {
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
              { color: theme.muted },
              `${product.category} · ${product.color} · ${product.stock} in stock`,
            ),
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
              Caption({ color: theme.muted }, product.color),
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
        SummaryRow("Subtotal", formatMoney(subtotal)),
        SummaryRow("Shipping", subtotal >= 180 ? "Free" : formatMoney(shippingCost())),
        Divider({ color: theme.border }),
        SummaryRow("Total", formatMoney(orderTotal()), true),
        Button({
          text: "Checkout",
          disabled: subtotal === 0,
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
  if (!product) return null;

  return Dialog(
    {
      open: true,
      onDismiss: closeProduct,
      width: "min(920px, calc(100vw - 32px))",
      style: {
        backgroundColor: theme.surface,
      },
    },
    [
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
    ],
  );
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
  return Dialog(
    {
      open: getCheckoutOpen(),
      onDismiss: () => setCheckoutOpen(false),
      width: "min(760px, calc(100vw - 32px))",
      style: {
        backgroundColor: theme.surface,
      },
    },
    [
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
                  disabled: cartQuantity() === 0,
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
    ],
  );
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
