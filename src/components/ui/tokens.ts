/**
 * BloomNest Design Tokens
 * Master Theme Configuration & Palette Tokens
 */

export const BloomTokens = {
  colors: {
    // Brand Warm Rose (Primary)
    rose: {
      50: "#fff0f5",
      100: "#fce8ee",
      200: "#f5cad6",
      300: "#ea99b1",
      400: "#e26989",
      500: "#b84a6b",
      600: "#8f2d48",
      700: "#6d1f35",
      800: "#4d1423",
      900: "#2d0b13",
      950: "#1a050a",
    },
    // Serene Sage (Wellness & Growth)
    sage: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e",
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
    },
    // Midnight Lavender (Calm & AI Intelligence)
    lavender: {
      50: "#f8f0fc",
      100: "#f0d5fa",
      200: "#e0abf5",
      300: "#ca75eb",
      400: "#b044db",
      500: "#9425c2",
      600: "#791a9e",
      700: "#611380",
      800: "#4a0d63",
      900: "#340947",
    },
    // Sunset Coral (Energy & Kicks)
    coral: {
      50: "#fff5f5",
      100: "#ffe3e3",
      200: "#ffc9c9",
      300: "#ffa2a2",
      400: "#ff6b6b",
      500: "#ee5253",
      600: "#c82333",
      700: "#9e1624",
      800: "#750d18",
    },
    // Background Creams & Dark Surfaces
    cream: {
      bgLight: "#fff7f9",
      cardLight: "#ffffff",
      borderLight: "#f5cad6",
      bgDark: "#120e18",
      cardDark: "#1a1523",
      borderDark: "#2d1b2e",
    },
  },
  typography: {
    fontSerif: "font-serif",
    fontSans: "font-sans",
  },
  shadows: {
    soft: "shadow-md shadow-rose-100/60 dark:shadow-none",
    elevated: "shadow-xl shadow-rose-200/50 dark:shadow-none",
    glass: "shadow-2xl shadow-pink-200/40 dark:shadow-none",
  },
  radii: {
    card: "rounded-[32px]",
    cardSm: "rounded-2xl",
    pill: "rounded-full",
    button: "rounded-2xl",
  },
  touchTarget: {
    minHeight: "min-h-[44px]",
    minWidth: "min-w-[44px]",
  },
};
