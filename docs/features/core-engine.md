# Core Engine Features

This document outlines the core navigational and infrastructural components of the BloomNest application.

## 1. Dashboard (`DashboardPage.tsx`)
The central hub of the application providing a high-level overview of the user's maternal journey.
- **Fetal Growth Summary:** Displays the current gestational age, estimated due date (EDD), and trimester progress using data from the `user` context.
- **Quick Action Grid:** Provides one-tap access to primary modules (Vitals, Kicks, Medicine, Scans).
- **Trimester Progress Bar:** A visual indicator mapping the 40-week journey to percentage completion.

## 2. Navigation Architecture
The app utilizes a responsive, multi-tier navigation strategy.
- **`Sidebar.tsx`:** The primary desktop navigation. Renders an interactive, scrollable list of modules categorized logically (Clinical, Wellness, Planning). Highlights the active route.
- **`Navbar.tsx`:** The top header component. Displays the application logo, context-aware action buttons (like a quick SOS trigger), and integrates theme/language switchers.
- **`MobileBottomNav.tsx`:** The primary mobile navigation. Replaces the sidebar on smaller screens (sm, md breakpoints) providing thumb-friendly access to the top 4 most used routes (Home, Wellness, Medical, Profile).

## 3. Floating SOS (`FloatingSOS.tsx`)
A globally available, highly visible emergency action component.
- **Accessibility:** Floats over all content, persisting across route changes.
- **Functionality:** When triggered, it presents instant access to saved Emergency Contacts (`emergencyContacts` context), direct dialing capabilities, and access to the Digital Medical ID card. Designed for high-stress, urgent situations.

## 4. Mobile Status Bar (`MobileStatusBar.tsx`)
A progressive web app (PWA) optimization component.
- Modifies the browser/device status bar color to match the currently selected custom UI theme, creating a native app-like immersion experience on mobile devices.
