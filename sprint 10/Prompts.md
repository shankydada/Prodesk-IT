# AI Assistance Log

AI assistance (Claude) was used for concept explanation, architecture guidance, and
debugging while building the Sprint 10 Redux Toolkit upgrade. No code was pasted in
without being reviewed and understood first.

| Date       | Prompt / Question                                                                   | Purpose                        |
| ---------- | ------------------------------------------------------------------------------------- | -------------------------------- |
| 2026-08-31 | Explain how Redux Toolkit manages global state in a Next.js App Router application, and how the Provider should be wired up. | Concept understanding |
| 2026-08-31 | How can I migrate Shopping Cart state from Context API / useReducer to a Redux Toolkit slice, including add/remove/increment/decrement/clear actions? | Architecture and refactoring |
| 2026-08-31 | What's the right way to structure a filters slice (search, category, maxPrice) so a sidebar and a product grid stay in sync through the store instead of props? | Filtering architecture |
| 2026-08-31 | Explain when useMemo, useCallback, and React.memo actually reduce re-renders versus just adding overhead, and how to combine them correctly for a filtered product list. | Performance optimization |
| 2026-08-31 | Explain how redux-persist works with Redux Toolkit in a Next.js App Router app, and how to avoid SSR/hydration errors when persisting to localStorage. | State persistence |
| 2026-08-31 | Help debug wiring the Redux Provider + PersistGate into the Next.js App Router layout without breaking client component boundaries. | Debugging |
| 2026-08-31 | How should theme (dark/light) be modeled in Redux so it updates `document.documentElement` globally instead of being local component state? | Theme management |
| 2026-08-31 | Review the ProductGrid/ProductCard split for whether React.memo is actually meaningful here given the useMemo'd filtered list and useCallback'd handler. | Code review / optimization check |
