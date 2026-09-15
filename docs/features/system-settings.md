# System Settings & Admin Features

This document outlines the global configuration and administrative tools available in the application.

## 1. Theme Studio (`ThemeStudioPage.tsx`)
A highly visual interface for users to customize the application's aesthetics.
- **Dynamic Previews:** Users can preview different color palettes (e.g., Botanical Sage, Serene Rose, Midnight Lavender) before applying them.
- **Dark Mode Toggle:** Explicit control over light/dark modes, with some premium themes automatically enforcing specific dark mode rules.
- **Context Integration:** Selected themes dispatch an event to the `AppContext`, which dynamically injects CSS variables and HTML data attributes globally.

## 2. General Settings (`SettingsPage.tsx`)
The primary configuration hub for user preferences.
- **Localization Toggles:** Allows the user to switch the app's language instantly (English, Hindi, Tamil, Telugu, Kannada, Malayalam). Changes trigger a global re-render using the `translations.ts` dictionary.
- **Profile Management:** Edit maternal details (Name, Due Date) which re-calculates the current gestational week across the app.

## 3. Admin Tools (`AdminPage.tsx`)
A developer/diagnostic interface for managing application state.
- **Factory Reset:** Provides a nuclear "Reset All Data" option that wipes `localStorage` and restores the application to the initial `DEMO_DATA` state. Useful for QA testing and clearing corrupted state.

## 4. AI Assistant Interface (`AiAssistantPage.tsx`)
A placeholder/foundation for a conversational AI interface.
- Designed to integrate with a future LLM backend to answer maternal queries based on context data (like providing nutrition advice based on the user's specific trimester).
