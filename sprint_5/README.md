# 📋 Kanban Task Board

> **v2 — Premium Redesign:** the UI was redesigned into an enterprise-grade
> SaaS dashboard (Notion/Linear/ClickUp-inspired) with a navy/gold theme,
> glassmorphism, dashboard stat widgets, and an overall-progress bar.
> **No business logic, state, or features were changed** — see
> `REDESIGN_NOTES.md` for the exact list of file-by-file changes.


A production-quality, Trello-style Kanban board built with **React 18 + Vite**.
Tasks are organized into three columns — **To Do**, **In Progress**, and **Done** —
and everything persists automatically in the browser via `localStorage`.

## ✨ Features

### Phase 1
- Add / delete tasks
- Move tasks between columns with ◀ / ▶ buttons
- Responsive, modern UI with card shadows and hover effects
- Clean 3-column board layout

### Phase 2
- **Inline editing** — click ✎ to edit a task in place, with Save/Cancel
- **Priority system** — High (red), Medium (yellow), Low (green) border + badge
- **LocalStorage persistence** — board state survives page refresh automatically
- **Real-time search** — filter tasks across all columns as you type

### Phase 3 (Bonus)
- **Drag-and-drop** using `@dnd-kit/core` — drag any card between any of the
  three columns, with a live drop-target highlight and a floating drag preview

## 🧱 Tech Stack

- React 18 (functional components + hooks only)
- Vite
- Plain CSS (no UI framework)
- `@dnd-kit/core` for drag-and-drop
- No Redux / Context API / backend — state lives in `App.jsx` and is lifted
  down via props, persisted with a custom `useLocalStorage` hook

## 📂 Project Structure

```
kanban-board/
├── src/
│   ├── components/     # Presentational, reusable UI components
│   ├── hooks/           # useLocalStorage custom hook
│   ├── utils/            # constants.js and taskHelpers.js (business logic)
│   ├── styles/           # Component-scoped CSS files
│   ├── App.jsx           # Holds all state; top-level orchestration
│   └── main.jsx          # React entry point
```

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev

# 3. Open the app
# Visit http://localhost:5173
```

## 📦 Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

## ☁️ Deploying to Vercel

1. Push this project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **New Project**.
3. Import your GitHub repo.
4. Vercel auto-detects Vite — confirm these settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **Deploy**. Your Kanban board will be live at a `*.vercel.app` URL.

Alternatively, via CLI:

```bash
npm install -g vercel
vercel login
vercel --prod
```

## 🗂 Data Model

Each task is stored as:

```js
{
  id: "uuid-string",
  text: "Task Name",
  priority: "High" | "Medium" | "Low"
}
```

The board itself is stored as:

```js
{
  todo: [ ...tasks ],
  inprogress: [ ...tasks ],
  done: [ ...tasks ]
}
```

## 🧠 Architecture Notes

- All board state lives in `App.jsx` (single source of truth).
- Data flows down via **props only** — no Context API, no Redux.
- Business logic (ID generation, filtering, column navigation) is separated
  into `utils/taskHelpers.js` and `utils/constants.js`.
- Persistence is handled by the generic `useLocalStorage` hook, decoupled
  from any Kanban-specific logic.

## 📄 License

MIT — free to use and modify.
