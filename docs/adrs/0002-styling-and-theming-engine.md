# ADR 0002: Styling and Theming Engine

## Context
BloomNest requires a highly aesthetic, fluid, and customizable user interface that caters to maternal preferences. The user experience demands multiple dynamic color themes (e.g., Soft Pastel, Serene Rose, Midnight Lavender) and a responsive design that works seamlessly across mobile, tablet, and desktop viewports.

## Decision
We decided to use **Tailwind CSS** paired with a **Custom CSS Variable Theme Engine**.

### Tailwind CSS
- Provides rapid utility-first styling without leaving the JSX context.
- Guarantees a constrained design system (spacing, typography, colors).
- Handles responsive breakpoints (sm, md, lg) and dark mode via the `dark:` variant modifier intuitively.

### Custom Theme Engine
Instead of hardcoding Tailwind colors, we implemented a dynamic theme engine (`index.css` and `ThemeStudioPage.tsx`):
1. **CSS Variables (`index.css`):** We defined root CSS variables for core semantic colors (`--rose-50`, `--rose-500`, `--emerald-500`, etc.) under different `data-theme` attribute selectors (e.g., `[data-theme="serene-rose"]`).
2. **Context Provider:** The `AppContext` maintains the `currentTheme` and `isDarkMode` state.
3. **DOM Injection:** A `useEffect` in `AppContext` injects the `data-theme` attribute and `dark` class directly into the `document.documentElement` (`<html>` tag).
4. **Tailwind Config (Implied):** By mapping Tailwind's color palette to these CSS variables, every component using standard Tailwind classes (like `bg-rose-500`) automatically respects the active theme.

## Consequences
### Positive
- **Instant Theme Switching:** Themes change instantly without page reloads.
- **Maintainable Aesthetics:** Components don't need to know *which* theme is active; they simply use semantic utility classes (like `text-rose-600`), and the CSS variable layer handles the exact hex code injection.
- **Dark Mode Support:** Deeply integrated dark mode that works in tandem with custom themes (e.g., Midnight Lavender forces dark mode, Soft Pastel forces light mode).

### Negative / Risks
- **Complex Initial Setup:** Requires careful mapping of CSS variables to ensure contrast ratios remain accessible across all themes.
- **Overriding Tailwind Defaults:** Overriding core Tailwind colors (like `rose`, `emerald`, `purple`) globally can lead to unexpected results if standard hex values are expected elsewhere.

## Future Considerations
As the app scales, we may want to introduce a full design system package (like Radix UI or shadcn/ui) to standardize complex interactive components (Selects, Modals, Dialogs) while preserving our custom Tailwind theme engine.
