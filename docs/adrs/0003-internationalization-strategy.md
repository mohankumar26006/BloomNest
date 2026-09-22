# ADR 0003: Internationalization (i18n) Strategy

## Context
BloomNest targets a diverse demographic, particularly in regions like India where multiple languages are spoken. The application must support seamless toggling between multiple languages (English, Hindi, Tamil, Telugu, Kannada, Malayalam) without requiring page reloads or relying on heavy third-party internationalization libraries that could inflate the bundle size.

## Decision
We implemented a **Custom Lightweight Dictionary-Based Translation Engine** housed directly within the global state management.

### Implementation Details
1. **Translation Dictionary (`translations.ts`):** A centralized TypeScript file exporting a `TRANSLATIONS` object. This object maps language codes (e.g., `en`, `hi`, `ta`) to a dictionary of key-value string pairs.
2. **Context Binding (`AppContext.tsx`):** The `useApp` hook exposes a `t(key, vars)` function.
3. **Fallback Logic:** If a key is missing in the currently selected language, the engine automatically falls back to the English (`en`) dictionary. If it's missing in English, it returns the raw key string as a failsafe.
4. **Dynamic Interpolation:** The `t()` function supports dynamic variable injection via regex substitution. For example: `t("weekLabel", { week: 24 })` parses the string `"Week {week}"` and returns `"Week 24"`.

## Consequences
### Positive
- **Zero Dependencies:** Eliminates the need for libraries like `react-i18next` or `formatjs`, keeping the app incredibly lightweight.
- **Type Safety:** Living inside TypeScript means the dictionary can be easily linted and structured.
- **Instant Toggling:** Because translations are loaded into memory and accessed synchronously via React Context, switching languages triggers an instant re-render across the entire React component tree.

### Negative / Risks
- **Scalability:** As the application grows to thousands of strings, loading the entire `translations.ts` file upfront could impact initial parse/execution time on lower-end devices.
- **Pluralization/Formatting:** A custom engine lacks out-of-the-box support for complex grammatical pluralization rules or locale-specific date/currency formatting.
- **Developer Overhead:** Developers must manually update the `translations.ts` file for 6 languages every time a new UI string is introduced, which is error-prone without automated checks.

## Future Considerations
If the application needs to support Right-to-Left (RTL) languages (e.g., Arabic) or requires complex pluralization handling, we should consider migrating to a mature library like `react-i18next`. Furthermore, code-splitting the translation files (lazy loading `hi.json` only when Hindi is selected) will be necessary to optimize performance as the dictionary scales.
