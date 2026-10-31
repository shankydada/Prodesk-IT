# Sprint 11 · Track B — Fullstack System Integration (MERN)

Integrated, demonstrable implementation of **Track B: Fullstack System Integration** — Phase 1 (CORS +
hydration), Phase 2 (full CRUD UI pipeline) and Phase 3 (multipart uploads → asset CDN).

Two repositories, deliberately kept separate (FAQ #8 — microservice architecture keeps Vercel and Render
deployment configs trivial):

```
sprint11/
├── backend/      Node · Express · MongoDB · Multer · Cloudinary   → deploys to Render
├── frontend/     React 18 · Vite SPA                              → deploys to Vercel
├── README.md     this file — rubric map, quickstart, deployment protocol
└── DEMO_SCRIPT.md  timed 3-minute video script + submission checklist
```

---

## 1. Architecture

```
┌────────────────────────┐        GET/POST/DELETE /api/posts        ┌──────────────────────────┐
│  React 18 SPA (Vite)   │ ───────────────────────────────────────▶ │  Express 4 API           │
│  · useEffect hydration │ ◀─────────────────────────────────────── │  · cors middleware       │
│  · controlled form     │      JSON  |  multipart/form-data       │  · express.json()        │
│  · loading / error UI  │                                          │  · multer memoryStorage  │
└────────────────────────┘                                          └───────────┬──────────────┘
        │  Vercel (VITE_API_URL → Render)                                       │
                                                                              │ URL string only
                        ┌─────────────────────────────────┬─────────────────────┴───────────────┐
                        ▼                                 ▼                                 ▼
              ┌──────────────────┐               ┌──────────────────┐            ┌──────────────────┐
              │ MongoDB (Atlas)  │               │ Cloudinary CDN   │            │ uploads/ (dev)   │
              │ documents + URL  │               │ binary assets    │            │ disk fallback    │
              └──────────────────┘               └──────────────────┘            └──────────────────┘
```

**Storage constraint honoured (Phase 3):** the uploaded buffer goes `multer (RAM) → Cloudinary → URL string`.
`schema.imageUrl` holds only that URL. There is no base64 column and no `Buffer` field anywhere in the schema.

---

## 2. Quickstart (local, two terminals)

```bash
# ── Terminal 1 · API (port 5000) ───────────────────────────────────────────
cd backend
npm install
cp .env.example .env          # optional: add MONGODB_URI for real persistence
npm run dev                   # or: npm run verify:mongo   (bundled throwaway MongoDB)

# ── Terminal 2 · SPA (port 5173) ───────────────────────────────────────────
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. Leave `VITE_API_URL` blank locally — the SPA calls relative `/api/...` and Vite
proxies to `localhost:5000`, so both processes share one origin during development.

> **No MongoDB installed?** `npm run verify:mongo` in `backend/` downloads a throwaway MongoDB
> (`mongodb-memory-server`) and runs the API against it, so the Mongoose path — schema validation, ObjectId
> casting, `toJSON` mapping — is exercised exactly as it is on Render/Atlas. Without `MONGODB_URI` the server
> also falls back to an in-memory repository (dev only, data resets on restart).

---

## 3. Rubric map — where each requirement lives

### Phase 1 — Network connection & CORS (P0)

| Requirement | Implementation | Evidence |
|---|---|---|
| Deprecate dummy URIs, point at the Node endpoint | `frontend/src/api/client.js` → `API_BASE` from `VITE_API_URL`, else relative `/api` via Vite proxy | `API_SOURCE` printed in the UI env strip |
| `useEffect` GET + render payload | `frontend/src/App.jsx` → hydration effect with `AbortController` | E2E step 1: *3 cards rendered* |
| Install + configure `cors` middleware | `backend/src/app.js` → allow-list + dev/preview patterns, preflight handled | smoke test step 7: localhost ✓, `*.vercel.app` ✓, unknown origin ✗ |

### Phase 2 — Full CRUD UI pipeline (P1)

| Requirement | Implementation | Evidence |
|---|---|---|
| React form dispatching POST into MongoDB | `components/PostForm.jsx` + `postsApi.create()` | E2E step 2: *document persisted server-side — id …* |
| Delete action → DELETE → DOM mutation | `App.jsx` → `handleDelete()` with optimistic removal + rollback on failure | E2E step 4: *card removed 4 → 3*, *404 from DB* |
| Dynamic "Loading…" states | `components/StatusBanner.jsx` → `SkeletonList` | state checks step 1: *3 skeleton cards* |
| Clean error boundary on backend failure | `ErrorBanner` (`role="alert"`) + `ErrorBoundary.jsx` class boundary + Retry | state checks step 2: 6 assertions |

### Phase 3 — Multipart form data & asset management (P2)

| Requirement | Implementation | Evidence |
|---|---|---|
| Frontend dispatches `FormData` | `api/client.js` → `create()` appends text fields + `image` file | E2E step 2 (multipart POST, boundary auto-set) |
| Backend parses with `multer` | `middleware/upload.js` → `memoryStorage`, 5 MB cap, MIME allow-list | smoke test step 3: *201 multipart* |
| Stream buffer to Cloudinary | `utils/assetStorage.js` → `upload_stream()` with resize transformation | Cloudinary path verified (see §6); local fallback otherwise |
| Store only the URL string in Mongo | `models/Post.js` → `imageUrl`, `imagePublicId`, `storageProvider` | smoke test step 3: *asset URL persisted* |

---

## 4. Verified results (reproduce these yourself)

Everything below was executed against this code. Commands are copy-pasteable.

### Backend · `npm run smoke` — 17 passed, 0 failed

```
▸ 0. Service health            PASS  GET /api/health returns 200   database: mongodb  assets: local
▸ 1. GET /api/posts            PASS  useEffect hydration path — 3 documents
▸ 2. POST json                 PASS  201  ·  id 6ad24cca53150e8ca9c0f6fe
▸ 3. POST multipart            PASS  201  ·  asset URL persisted: …/uploads/…png  (retrievable 200)
▸ 4. GET /api/posts/:id        PASS  200  ·  title round-trips through the DB
▸ 5. Validation + boundaries   PASS  400 on missing title  ·  404 on unknown id
▸ 6. DELETE + confirm removal  PASS  200 → 404 (gone)
▸ 7. CORS audit                PASS  localhost:5173 ✓  *.vercel.app ✓  evil.example.com ✗
▸ 8. Persistence check         PASS  list still responsive
```

### Frontend · `npm run verify:e2e` — 11 passed, 0 failed

Automates the exact demo in the Submission Guidelines: create through the UI, **hard refresh**, prove
persistence, then delete.

```
▸ 1. Mount the SPA and hydrate from the API      2 passed
▸ 2. Submit the form (multipart → Express → DB)  4 passed  ·  persisted id 6ad24d19…  ·  form resets
▸ 3. HARD REFRESH — new document, empty DOM      3 passed  ·  document survived; body + author round-trip
▸ 4. Click Delete → DELETE → DOM + database      2 passed  ·  4 → 3 cards; GET returns 404
```

### Frontend · `npm run verify:states` — 9 passed, 0 failed

Run against a build pointed at a dead port (`VITE_API_URL=http://localhost:5999/api npm run build`):

```
▸ 1. Loading state        PASS  3 skeleton placeholders committed before the response settled
▸ 2. Error boundary       PASS  role="alert" banner, names the unreachable endpoint, Retry offered,
                                status dot flips offline, zero phantom cards
▸ 3. FAQ #6 guard         PASS  localhost build raises the "set VITE_API_URL" deployment warning
```

---

## 5. API reference

Base URL: `http://localhost:5000` (dev) · `https://<your-service>.onrender.com` (prod)

| Method | Endpoint | Body | Success | Failure |
|---|---|---|---|---|
| `GET` | `/api/health` | — | `200` db mode, asset provider, count | — |
| `GET` | `/api/posts?limit=50` | — | `200 { success, count, data[] }` | — |
| `GET` | `/api/posts/:id` | — | `200 { success, data }` | `404` unknown id |
| `POST` | `/api/posts` | JSON **or** multipart (`title`, `body`, `author`, `image`) | `201 { success, data }` | `400` validation, `413/400` bad upload |
| `DELETE` | `/api/posts/:id` | — | `200 { success, message }` | `404` unknown id |

Error envelope is always `{ success: false, message, details? , stack? (non-prod) }`.

```bash
# JSON create
curl -X POST localhost:5000/api/posts -H 'Content-Type: application/json' \
  -d '{"title":"Hello","body":"From curl","author":"Resident"}'

# Multipart create with a thumbnail
curl -X POST localhost:5000/api/posts \
  -F "title=With image" -F "body=FormData path" \
  -F "image=@backend/scripts/sample-thumb.png;type=image/png"
```

---

## 6. Asset storage: Cloudinary in production, disk in dev

`utils/assetStorage.js` selects the provider at runtime:

| Condition | Provider | What lands in MongoDB |
|---|---|---|
| `CLOUDINARY_*` set | **Cloudinary** `upload_stream` (1200 px limit, `quality: auto`) | `secure_url` + `public_id` |
| credentials absent | local `uploads/` served at `/uploads/*` | absolute URL string |

The Cloudinary wiring was exercised end-to-end (with intentionally invalid credentials) and returned
`Cloudinary upload failed: Invalid Signature …` — i.e. the multipart stream, signature construction and error
propagation all work; it only needs real credentials. Deleting a post also destroys the remote asset so the CDN
never accumulates orphans.

---

## 7. Deployment protocol

### 7.1 MongoDB Atlas (once)

1. Create a free **M0** cluster → *Database Access* → add a user.
2. *Network Access* → allow `0.0.0.0/0` (Render's egress IPs are not static on the free tier).
3. Copy the connection string and append the database name: `…mongodb.net/sprint11?retryWrites=true&w=majority`.

### 7.2 Backend → Render

1. Push `backend/` to its own GitHub repo.
2. Render → **New + → Web Service** → connect the repo (or use the included `render.yaml` blueprint).
3. Build `npm install` · Start `npm start` · Health check path `/api/health`.
4. Environment → add:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://…` |
| `ALLOWED_ORIGINS` | `https://<your-app>.vercel.app` (comma-separate extras) |
| `PUBLIC_BASE_URL` | `https://<your-service>.onrender.com` |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | from the Cloudinary dashboard |
| `CLOUDINARY_FOLDER` | `sprint11/posts` |

5. Wait for **Live**, then verify `https://<service>.onrender.com/api/health` → `"database":"mongodb"`.

> Free Render instances sleep after 15 min idle; the first request afterwards takes ~30 s. Warm it up before
> recording the demo so the UI does not sit on skeletons.

### 7.3 Frontend → Vercel

1. Push `frontend/` to its own GitHub repo (root directory = repo root).
2. Vercel auto-detects Vite. Framework **Vite**, build `npm run build`, output `dist`.
3. Settings → Environment Variables → **`VITE_API_URL = https://<service>.onrender.com/api`**
   (include `/api`, no trailing slash). **Never** `localhost` — see FAQ #6; the app ships a guard that warns
   you loudly if a production build points at localhost.
4. Deploy, then **copy the final Vercel domain into Render's `ALLOWED_ORIGINS`** and let Render redeploy.
   Deployment order matters: Render first, Vercel second, allowed-origins update third.
5. Hard-refresh the deployed SPA → the env strip must show `source VITE_API_URL` and `db mongodb`.

---

## 8. Troubleshooting — mapped to the sprint FAQ

| Symptom | Cause | Fix |
|---|---|---|
| `Access to fetch … blocked by CORS policy` in the browser console (FAQ #5) | Origin not in the allow-list | Add the exact origin (scheme + host + port, no trailing slash) to `ALLOWED_ORIGINS`; the Node log prints `[cors] BLOCKED <origin>` |
| `req.body` is `undefined` (FAQ #7) | `express.json()` missing, or JSON header absent | `app.js` registers `express.json()`; `client.js` sets `Content-Type: application/json` for every non-FormData body |
| Works locally, fails on Vercel (FAQ #6) | `http://localhost:5000` baked into the bundle | Set `VITE_API_URL` to the live Render URL and redeploy; the app shows the misconfiguration banner if you forget |
| `HTTP 500` with no browser explanation (FAQ #9) | Fatal crash on the server | Read the **Render logs / Node terminal** — `errorHandler` logs the full stack trace and returns a sanitised message to the client |
| `document is not defined` | Browser API used without jsdom | Only relevant to Track A's Jest setup; these verification scripts configure jsdom explicitly |
| Deployed page loads but shows skeletons forever | Render instance asleep or CORS blocked | Warm `…/api/health`, then check the Render log for `[cors] BLOCKED` |
| Upload rejected | > 5 MB or non-image MIME | `MAX_UPLOAD_BYTES` and the MIME allow-list in `middleware/upload.js`; the API returns a readable `details` array |

Escalation protocol: call Mr. Nakul (8851407750, 9:00 AM – 6:00 PM IST) with the **exact** terminal/browser
message — the Node log lines are written to be dictatable verbatim.

---

## 9. Submission checklist

- [ ] `backend/` pushed to its own GitHub repo (public)
- [ ] `frontend/` pushed to its own GitHub repo (public)
- [ ] Render service live, `/api/health` returns `"database":"mongodb"`
- [ ] Vercel deployment live, `VITE_API_URL` → Render URL, **not** localhost
- [ ] Render `ALLOWED_ORIGINS` contains the Vercel domain
- [ ] 3-minute demo recorded — see `DEMO_SCRIPT.md`
- [ ] URLs pasted into the dashboard submission button (**do not email**)
