# Sprint 10 — Track A: Advanced State Architecture

A Next.js (App Router) e-commerce application upgraded for Sprint 10 with a full
**Redux Toolkit** global state architecture, evolving on top of the Sprint 09
scaffold (Shopping Cart SPA).

## Sprint 10 Features

- Redux Toolkit Global Store
- Redux Shopping Cart
- Global Product Filters
- Search and Category Filtering
- Price Range Filtering
- useMemo Optimization
- useCallback Optimization
- React.memo Optimization
- Global Light/Dark Theme
- Redux State Persistence
- Redux DevTools Support

## Installation

```bash
npm install
npm run dev
```

Open http://localhost:3000, then open the **Redux DevTools** browser extension to watch
actions dispatch and mutate state live (`cart/addToCart`, `cart/incrementQty`,
`cart/removeFromCart`, `filters/setCategory`, `filters/setMaxPrice`,
`theme/toggleTheme`) — that's the QA demo.

## Production verification

```bash
npm run build
```

## Where each requirement lives

### Phase 1 — Global Store Initialization
- `store/store.js` — `configureStore` instantiates the global store (RTK), wrapped with
  `redux-persist`.
- `store/StoreProvider.jsx` — client component wrapping the app in `<Provider store={store}>`
  and `<PersistGate>`, mounted in `app/layout.jsx` so the whole tree has access.
- `store/slices/cartSlice.js` — the Shopping Cart, fully owned by Redux (no Context API,
  no component-level cart state). All mutations (`addToCart`, `removeFromCart`,
  `incrementQty`, `decrementQty`, `clearCart`) go through `dispatch()`, visible as discrete
  actions in DevTools. Includes reusable selectors (`selectCartItems`, `selectCartCount`,
  `selectCartTotal`) for item count and total price.

### Phase 2 — Complex Filtering & State Sync
- `components/FilterSidebar.jsx` — multifaceted filter UI: category radio group,
  price-range slider, text search.
- `store/slices/filterSlice.js` — filter state (`search`, `category`, `maxPrice`) lives
  in the global store, with `setSearch`, `setCategory`, `setMaxPrice`, `resetFilters`
  actions.
- `components/ProductGrid.jsx` — reads the same filter state via `useSelector`; any
  sidebar change re-renders the grid instantly with no props passed between sidebar and
  grid (no prop drilling).

### Phase 3 — Render Optimization & Theming
- `components/ProductGrid.jsx` — `useMemo` recomputes the filtered product list only
  when `category`/`maxPrice`/`search` actually change (not on unrelated store updates
  like cart or theme); `useCallback` gives the add-to-cart handler a stable reference.
- `components/ProductCard.jsx` — wrapped in `React.memo` so cards only re-render when
  their own `product`/`onAdd` props change, pairing with the stable references above.
- `store/slices/themeSlice.js` + `components/ThemeBridge.jsx` — dark/light mode is owned
  entirely by Redux; `ThemeBridge` reflects `theme.mode` onto `<html data-theme>`, and
  `app/globals.css` swaps CSS variables accordingly.

### Redux State Persistence
- `store/store.js` uses `redux-persist`, whitelisting `cart` and `theme` (filters are
  intentionally excluded so a fresh visit starts unfiltered). `StoreProvider.jsx` uses
  `PersistGate` with `loading={null}` so persisted state hydrates on the client without
  triggering SSR/hydration mismatches — no `localStorage` access happens during server
  rendering.

## Notes
- `data/products.js` is a static mock catalog — swap it for a real API/DB call whenever
  ready; nothing else needs to change since components already read through selectors.
