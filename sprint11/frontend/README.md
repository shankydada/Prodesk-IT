# Sprint 11 · Frontend — React 18 + Vite SPA

Track B frontend for the fullstack integration sprint. Consumes the companion `sprint11-backend` Express API:
CRUD over MongoDB, explicit loading/error states, and multipart image uploads.

**Deployed on Vercel.**

## Quickstart

```bash
npm install
npm run dev            # http://localhost:5173
```

Local development needs no configuration: `VITE_API_URL` is left blank, requests go to the relative `/api`
path, and Vite proxies them to `http://localhost:5000` (see `vite.config.js`). Start the backend first.

```bash
npm run build          # production bundle in dist/
npm run preview        # serve the built bundle
```

## Environment variables

| Variable | Where | Value |
|---|---|---|
| `VITE_API_URL` | Vercel → Settings → Environment Variables | `https://<service>.onrender.com/api` |
| `VITE_PROXY_TARGET` | local dev only (optional) | overrides the proxy target, default `http://localhost:5000` |

Rules that matter:

- Include the `/api` suffix, no trailing slash.
- **Never ship `localhost`** — localhost does not exist on Vercel. If a production build points at localhost the
  app renders a red banner telling you exactly which variable to fix.
- Vite inlines env vars at build time, so **redeploy after changing it**; a refresh is not enough.

## Structure

```
src/
├── main.jsx                   root render, StrictMode, ErrorBoundary
├── App.jsx                    status machine, hydration effect, create/delete orchestration, toasts
├── api/client.js              fetch wrapper: API base resolution, error normalisation, multipart builder
├── components/
│   ├── PostForm.jsx           controlled form + file picker + client-side validation + preview
│   ├── PostList.jsx           loading / error / empty / data switching
│   ├── PostCard.jsx           single document with delete action
│   ├── StatusBanner.jsx       ErrorBanner, SkeletonList, EmptyState, Toast
│   └── ErrorBoundary.jsx      render-crash boundary with a recoverable panel
└── index.css                  dark theme, skeleton shimmer, card grid, banners
```

## How the pieces satisfy the brief

- **Hydration** — one `useEffect` keyed on a `reloadToken`, with `AbortController` cleanup so StrictMode's
  double-mount and unmount cannot produce a stale-state race.
- **Loading** — skeleton cards while `status === 'loading'`; submit buttons switch to `Uploading…` / `Busy` and
  disable themselves so a double-submit cannot create duplicates.
- **Errors** — a failed `fetch` is turned into a human sentence that names the endpoint and the likely cause,
  rendered in a `role="alert"` banner with a Retry button. A thrown component is caught by the class boundary.
- **Delete** — optimistic: the card leaves the DOM immediately, and a rejected request restores the previous
  list so the UI never claims something was deleted when it was not.
- **Uploads** — `FormData` only. The header for multipart is deliberately left unset so the browser writes its
  own boundary; every other request sends an explicit `Content-Type: application/json`.

## Verification scripts

| Command | What it proves |
|---|---|
| `npm run verify:render` | the production bundle mounts in jsdom and renders documents fetched from the live API |
| `npm run verify:e2e` | the full demo, automated: hydrate → type → submit → **hard refresh** → still there → delete → 404 |
| `npm run verify:states` | loading skeletons, the error boundary and the FAQ #6 misconfiguration guard |

The last two need an absolute API URL baked into the bundle:

```bash
VITE_API_URL=http://localhost:5000/api npm run build && npm run verify:e2e

# error/loading states are checked against a dead endpoint on purpose
VITE_API_URL=http://localhost:5999/api npm run build && npm run verify:states
```

## Deploying to Vercel

1. Push this repo, then Vercel → **Add New → Project** → import it (framework auto-detected: Vite).
2. Add `VITE_API_URL` = your live Render URL **with `/api`**, for Production *and* Preview.
3. Deploy, then put the resulting Vercel domain into the backend's `ALLOWED_ORIGINS` and let Render redeploy.
4. Verify on the live site: the env strip at the top must read `source VITE_API_URL` and `db mongodb`.

`vercel.json` pins the framework, output directory and SPA rewrite for the single-page route.
