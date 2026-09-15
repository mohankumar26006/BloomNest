# ADR 0001: State Management and Persistence

## Context
BloomNest is a highly interactive, state-heavy React application. It manages over 10 distinct domains of maternal and fetal health data (e.g., vitals, medicine logs, contractions, mood, clinical appointments, baby names, etc.). The application needs a robust, scalable way to store this data locally, enabling an offline-first, client-side-only experience without relying on a remote backend database for its core functionality.

## Decision
We decided to use **React Context API** coupled with **LocalStorage Synchronization** as the primary state management architecture (`AppContext.tsx`). 

### Why Context API?
- **Global Availability:** Avoids severe prop-drilling across the 30+ pages. Components can easily access global state via the custom `useApp()` hook.
- **Dependency Reduction:** Eliminates the need for heavyweight external state libraries like Redux or Zustand, keeping the bundle size smaller and the mental model simpler for the current scope.
- **Consolidated Business Logic:** Acts as a centralized controller for all CRUD operations (`addVital`, `toggleMedicineTaken`, `updateUser`, etc.).

### Why LocalStorage?
- **Offline-First:** All maternal data stays on the user's device, ensuring maximum privacy and instant load times.
- **Sync Mechanism:** Two `useEffect` hooks operate as the persistence layer. One hook hydrates the initial state on mount, and the second hook listens to all state changes (dependencies array) and aggressively synchronizes them to `localStorage` under a single master key (`bloomnest_app_state_v1`).

## Consequences
### Positive
- Zero network latency for state updates.
- 100% data privacy since no medical data is transmitted to an external server.
- Easy to clear or reset state via the "Reset All Data" admin function.

### Negative / Risks
- **Storage Limits:** LocalStorage is typically capped around 5-10MB per domain. Over years of tracking, if users store heavy string data (like large journal entries), they might hit this limit.
- **Serialization Overhead:** `JSON.stringify` on every state change is computationally inexpensive for small objects but could cause micro-stutters if the state tree grows to tens of thousands of records.
- **Browser Wipes:** Users who clear their browser cache/history will lose all their data unless they use the export (CSV) functionality.

## Future Considerations
If the application needs to support cross-device synchronization in the future, we will need to introduce an abstraction layer that syncs the local state to a cloud provider (like Firebase or Supabase). For larger datasets, migrating from `LocalStorage` to `IndexedDB` via a wrapper (like `localforage`) would bypass the 5MB storage limit and avoid synchronous blocking operations.
