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
  SizedBox,
  Spacer,
  Stack,
  Wrap,
} from "../../widgets/layout.js";
import { Button, Input } from "../../widgets/controls.js";
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
import { categories, products, sortOptions } from "./data.js";
import {
  addToCart,
  cartQuantity,
  cartSubtotal,
  clearCart,
  closeProduct,
  filteredProducts,
  formatMoney,
  getCart,
  getCartOpen,
  getCategory,
  getCheckoutOpen,
  getMaxPrice,
  getPage,
  getPayment,
  getQuery,
  getShipping,
  getSnack,
  getSort,
  openProduct,
  orderTotal,
  removeFromCart,
  selectedProduct,
  setCartOpen,
  setCategory,
  setCheckoutOpen,
  setMaxPrice,
  setPage,
  setPayment,
  setQuery,
  setShipping,
  setSnack,
  setSort,
  shippingCost,
  updateCartQuantity,
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
};

export function StoreShell() {
  return Scaffold({
    appBar: StoreAppBar(),
    body: SingleChildScrollView({
      style: {
        minHeight: "calc(100vh - 66px)",
        backgroundColor: theme.background,
      },
      child: Column([
        HeroSection(),
        MainContent(),
      ]),
    }),
    drawer: CartDrawer(),
    style: {
      minHeight: "100vh",
      backgroundColor: theme.background,
      color: theme.text,
    },
  });
}

function StoreAppBar() {
  return AppBar({
    height: 66,
    leading: Row({ gap: 10 }, [
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
      Text("Lumina Store", { weight: 900, size: 18, color: theme.text }),
    ]),
    actions: [
      NavButton("Shop", "shop"),
      NavButton("Deals", "deals"),
      NavButton("Checkout", "checkout"),
      CartButton(),
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
          Row({ gap: 24, style: { alignItems: "stretch", flexWrap: "wrap" } }, [
            Expanded([
              Column({ gap: 16 }, [
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
                      lineHeight: 1.02,
                      maxWidth: "680px",
                    },
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
                Row({ gap: 10, style: { flexWrap: "wrap" } }, [
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
  const featured = products[0];
  return Container(
    {
      width: "min(100%, 420px)",
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
      Stack({ height: 300 }, [
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
          Row({ gap: 18, style: { alignItems: "flex-start", flexWrap: "wrap" } }, [
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

function FilterPanel() {
  return Card(
    {
      padding: 16,
      style: {
        width: "min(100%, 280px)",
        borderColor: theme.border,
      },
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
            { gap: 8 },
            categories.map((category) =>
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
            max: 250,
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
  return Row({ gap: 12, mainAxisAlignment: "spaceBetween", style: { flexWrap: "wrap" } }, [
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
    Row({ gap: 8 }, [
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
            left: 10,
            top: 10,
            child: Badge({ label: product.badge, color: theme.primary }, [
              SizedBox({ width: 1, height: 1 }),
            ]),
          }),
        ]),
        Padding({ padding: 14 }, [
          Column({ gap: 10 }, [
            Row({ mainAxisAlignment: "spaceBetween", gap: 10 }, [
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
              `${product.category} · ${product.color} · ${product.rating} stars`,
            ),
            Text(product.description, {
              color: theme.muted,
              maxLines: 2,
              lineHeight: 1.45,
            }),
            Row({ gap: 8 }, [
              Expanded([
                Button({
                  text: "Add to cart",
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
          Row({ mainAxisAlignment: "spaceBetween", gap: 12 }, [
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
  const product = products.find((entry) => entry.id === item.productId);
  if (!product) return null;

  return Dismissible(
    {
      key: product.id,
      onDismissed: () => removeFromCart(product.id),
    },
    [
      Padding({ padding: 14 }, [
        Row({ gap: 12, style: { alignItems: "stretch" } }, [
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
              Row({ mainAxisAlignment: "spaceBetween", gap: 10 }, [
                Text(product.name, { weight: 800, color: theme.text }),
                Text(formatMoney(product.price * item.quantity), {
                  weight: 900,
                  color: theme.primary,
                }),
              ]),
              Caption({ color: theme.muted }, product.color),
              Row({ gap: 8 }, [
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
  return Row({ mainAxisAlignment: "spaceBetween" }, [
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
      Row({ style: { flexWrap: "wrap", alignItems: "stretch" } }, [
        Container(
          {
            width: "min(100%, 420px)",
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
              Row({ mainAxisAlignment: "spaceBetween", gap: 12 }, [
                Badge({ label: product.badge, color: theme.accent }, [
                  Text(product.category, {
                    color: theme.accent,
                    weight: 800,
                  }),
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
              Row({ gap: 14, style: { flexWrap: "wrap" } }, [
                DetailPill("Price", formatMoney(product.price)),
                DetailPill("Rating", `${product.rating} stars`),
                DetailPill("Stock", `${product.stock} available`),
              ]),
              Divider({ color: theme.border }),
              Row({ gap: 10 }, [
                Button({
                  text: "Add to cart",
                  onClick: () => {
                    addToCart(product.id);
                    closeProduct();
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
          Row({ mainAxisAlignment: "spaceBetween", gap: 12 }, [
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
              onSubmit: () => {
                clearCart();
                setCheckoutOpen(false);
                setSnack("Order placed. Demo checkout complete.");
                setPage("shop");
              },
            },
            [
              Row({ gap: 12, style: { flexWrap: "wrap" } }, [
                Expanded([
                  FormField({ label: "Full name", required: true }, [
                    Input({
                      placeholder: "Amina Banda",
                      style: { width: "100%", borderColor: theme.border },
                    }),
                  ]),
                ]),
                Expanded([
                  FormField({ label: "Email", required: true }, [
                    Input({
                      type: "email",
                      placeholder: "amina@example.com",
                      style: { width: "100%", borderColor: theme.border },
                    }),
                  ]),
                ]),
              ]),
              FormField({ label: "Delivery notes" }, [
                TextArea({
                  rows: 3,
                  placeholder: "Apartment, gate code, preferred delivery time...",
                  style: { borderColor: theme.border },
                }),
              ]),
              Row({ gap: 12, style: { flexWrap: "wrap" } }, [
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
              Row({ mainAxisAlignment: "end", gap: 10 }, [
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
      },
    },
    [
      ConstrainedBox(
        { maxWidth: 1180, style: { margin: "0 auto" } },
        [
          Row({ mainAxisAlignment: "spaceBetween", gap: 12, style: { flexWrap: "wrap" } }, [
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
