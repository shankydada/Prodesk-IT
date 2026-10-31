# Sprint 11 · Track B — Demo Video Script (3 min max)

Goal: prove **integration**, not individual modules. The grading moment is the hard refresh — the reviewer must
see data come back from the database, not from React state.

## Pre-flight (do this 5 minutes before recording)

```bash
# Terminal A
cd backend && npm run verify:mongo      # or npm start with MONGODB_URI set

# Terminal B
cd frontend && npm run dev

# Warm the deployed services so nothing sits on skeletons
curl -s https://<your-service>.onrender.com/api/health
```

- [ ] Browser zoom ~125 % so the terminal and the env strip are legible in the recording
- [ ] Two terminals visible (API + SPA) on one screen, browser in split view
- [ ] Clear the collection so the empty state is shown, or leave 3–4 seeded posts
- [ ] Close personal tabs/notifications

---

## 0:00 – 0:20 · Frame the system

**Say:** "Sprint 11, Track B. Two repositories: the React/Vite SPA from Sprint 08, and the Express/MongoDB API
from Sprint 10, now integrated. This is the live Render API and this is the Vercel frontend."

**Show:** `backend` terminal with the startup banner (listening, database `mongodb`, asset storage, allowed CORS
origins) → then the frontend UI with `API connected` and the env strip reading `endpoint https://…onrender.com/api`
and `source VITE_API_URL`.

## 0:20 – 0:50 · Phase 1 · CORS + hydration

**Say:** "The SPA hydrates with a `useEffect` GET to `/api/posts`. The `cors` middleware on Express authorises the
client origin — that's the Sprint 11 CORS block already resolved."

**Show:** In DevTools → Network, refresh: one `GET /api/posts` → `200`, request origin = Vercel domain,
`access-control-allow-origin` echoed back. Then:

```bash
curl -s -D - -o /dev/null -X OPTIONS -H 'Origin: https://evil.example.com' \
  -H 'Access-Control-Request-Method: POST' https://<service>.onrender.com/api/posts | grep -i access-control
```
→ nothing returned, while the terminal logs `[cors] BLOCKED …`. "Allow-list, not wildcard."

## 0:50 – 1:40 · Phase 2 · Create → hard refresh → delete (**the money shot**)

**Do, narrating:**
1. Fill the form (title, body, author) and submit.
2. Toast appears: *persisted — id 66f…* — point at it. "That id came back from MongoDB."
3. Show the Network tab: `POST /api/posts` → `201`.
4. **Hard refresh** (`Ctrl+Shift+R`). "Same data, but React state is gone — this is read back out of the database."
5. Point at the card → click **Delete** → card disappears instantly, toast confirms, `DELETE /api/posts/:id` → `200`.

**Say:** "Delete mutates the DOM immediately and rolls back if the server refuses, so the interface never lies
about persisted state."

## 1:40 – 2:10 · Phase 3 · Multipart upload

**Do:** Attach a thumbnail, submit, then open the new card's image in a new tab.
**Say:** "The client sends `FormData`; multer parses the buffer; the buffer streams to Cloudinary; MongoDB stores
only the returned URL string — no base64, no binary in the document."

**Prove it:**
```bash
curl -s https://<service>.onrender.com/api/posts | head -c 400
```
→ show `"imageUrl":"https://res.cloudinary.com/…"`, `"storageProvider":"cloudinary"`.

## 2:10 – 2:35 · Loading + error states

**Say:** "Async delays and failures are handled explicitly."
**Show:** Hard refresh with DevTools throttling set to *Slow 3G* → skeleton cards render.
Then stop the API (`Ctrl+C` in Terminal A) → the red banner *"Backend connection failed … Is the Express server
running?"* with a **Retry** button → restart the API → click Retry → list recovers. "Clean boundary, no white screen."

## 2:35 – 2:55 · Backend-level proof

```bash
cd backend && npm run smoke
```
**Say:** "The same pipeline verified at the API level — CRUD, multipart, validation, 404s and the CORS policy:
17 passed, 0 failed."

## 2:55 – 3:00 · Close

**Say:** "Repos, live URLs and both READMEs linked in the submission. Frontend on Vercel pointing at the live
Render URL — no localhost anywhere in the bundle."

---

## Submission payload (fill in and paste into the dashboard button — do not email)

```
Track: B — Fullstack System Integration

Frontend repo : https://github.com/<user>/sprint11-frontend
Backend repo  : https://github.com/<user>/sprint11-backend
Live frontend : https://<app>.vercel.app
Live backend  : https://<service>.onrender.com/api/health
Demo video    : https://<loom-or-drive-link>
Employee ID   : <only needed if you fall back to email>
```

## Recording tips

- 3 minutes is tight: rehearse once with a stopwatch, then record. Cut the Network-tab dives first if you overrun.
- Never edit out the hard refresh — it is the single most important 5 seconds of the video.
- If the Render instance is cold, start the recording *after* the first warm-up request so you are not narrating
  a spinner.
- Keep the terminal font large; graders screenshot the `17 passed, 0 failed` line.
