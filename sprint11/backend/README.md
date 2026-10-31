# Sprint 11 · Backend — Express + MongoDB REST API

Track B backend for the fullstack integration sprint. Node 18+, ESM, layered as
`routes → controllers → repository → model` so the persistence layer can be swapped without touching HTTP code.

**Deployed on Render.** Frontend lives in the companion `sprint11-frontend` repo (Vercel).

## Quickstart

```bash
npm install
cp .env.example .env      # add MONGODB_URI for real persistence
npm run dev               # http://localhost:5000
```

Two ways to run it:

| Command | Database | Use it for |
|---|---|---|
| `npm start` / `npm run dev` | `MONGODB_URI` if set, else in-memory fallback | everyday development |
| `npm run verify:mongo` | throwaway `mongodb-memory-server` | exercising the real Mongoose path with zero setup |

```bash
npm run smoke             # 17-assertion end-to-end pipeline + CORS audit
npm run verify:mongo      # boot with an ephemeral MongoDB instance, then `npm run smoke` in another shell
```

## Environment variables

| Variable | Default | Notes |
|---|---|---|
| `PORT` | `5000` | Render injects this automatically |
| `MONGODB_URI` | *(empty)* | Empty ⇒ in-memory mode (dev only, resets on restart) |
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Comma-separated, no trailing slash |
| `PUBLIC_BASE_URL` | `http://localhost:<PORT>` | Used to build absolute URLs for locally-stored uploads |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | *(empty)* | Absent ⇒ uploads fall back to local disk |
| `CLOUDINARY_FOLDER` | `sprint11/posts` | CDN folder for this project's assets |
| `MAX_UPLOAD_BYTES` | `5242880` | 5 MB cap enforced by multer |
| `NODE_ENV` | `development` | `production` hides stack traces and refuses to boot with a broken DB |

`*.vercel.app`, `*.onrender.com`, `*.netlify.app` and any `localhost:<port>` are always accepted, so preview
deployments work without reconfiguring CORS.

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | db mode, asset provider, document count, uptime |
| `GET` | `/api/posts?limit=50` | newest-first list (`limit` capped at 100) |
| `GET` | `/api/posts/:id` | single document, `404` when unknown |
| `POST` | `/api/posts` | `application/json` **or** `multipart/form-data` (`title`, `body`, `author`, `image`) |
| `DELETE` | `/api/posts/:id` | deletes the document **and** its CDN asset |

```bash
curl -X POST localhost:5000/api/posts -H 'Content-Type: application/json' \
  -d '{"title":"Hello","body":"From curl","author":"Resident"}'

curl -X POST localhost:5000/api/posts \
  -F "title=With image" -F "body=FormData path" \
  -F "image=@scripts/sample-thumb.png;type=image/png"
```

## Layout

```
src/
├── app.js                    express app: cors, json, static uploads, routes, error handler
├── server.js                 bootstrap + graceful shutdown
├── config/                   env parsing, MongoDB connection, Cloudinary client
├── models/Post.js            Mongoose schema — stores the asset URL string, never binary
├── repositories/             data access; Mongo when connected, in-memory otherwise
├── controllers/              HTTP layer: validation, status codes, response envelope
├── middleware/upload.js      multer memoryStorage + MIME allow-list + size cap
├── middleware/errorHandler.js normalises Multer/Mongoose errors, logs stack traces
├── routes/                   /api/posts router
└── utils/                    ApiError, asyncHandler, assetStorage (Cloudinary ⇄ disk)
```

## Design notes

- **CORS is an allow-list, not `origin: true`.** Blocked origins are logged server-side in the same wording the
  browser console uses (`Access to fetch has been blocked by CORS policy`), so the message can be dictated
  verbatim during support calls.
- **Multer uses `memoryStorage`.** The buffer never touches the server's disk before being streamed to the CDN;
  the disk path exists only as a credential-less dev fallback.
- **Deleting a post destroys the remote asset** (`cloudinary.uploader.destroy`), so uploads cannot orphan.
- **A configured-but-unreachable database crashes the process in production** rather than silently accepting
  writes into a store that will evaporate.

## Deploying to Render

`render.yaml` is included — Render → **New + → Blueprint** → pick the repo → fill in the `sync: false`
secrets (`MONGODB_URI`, `ALLOWED_ORIGINS`, `PUBLIC_BASE_URL`, `CLOUDINARY_*`). Health check path is
`/api/health`. For Atlas, allow `0.0.0.0/0` in Network Access (free-tier Render egress IPs are not static).
