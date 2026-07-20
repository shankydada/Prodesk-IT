# UI/UX Redesign — Changelog

This document lists exactly what changed in the v2 premium redesign, and
confirms that **no business logic, state management, or feature behavior
was touched**. Every existing handler, prop, and hook keeps its original
signature and implementation.

## ✅ What did NOT change (verified)

- `useLocalStorage` hook — untouched, byte-for-byte.
- All CRUD handlers in `App.jsx`: `handleAddTask`, `handleDeleteTask`,
  `handleEditTask`, `moveTaskToColumn`, `handleMoveLeft`, `handleMoveRight`.
- Drag-and-drop wiring: `DndContext`, `DragOverlay`, `handleDragStart`,
  `handleDragEnd`, `useDraggable`, `useDroppable` — untouched.
- `taskHelpers.js` — untouched (ID generation, search filtering, column
  navigation, task counting).
- `COLUMNS`, `PRIORITIES`, `STORAGE_KEY` in `constants.js` — untouched.
- Search functionality (`filterBoardBySearch`) — untouched.
- Inline editing state/flow in `TaskCard.jsx` — untouched.
- LocalStorage persistence — untouched.

## 🎨 What changed (presentation only)

| File | Change |
|---|---|
| `src/index.css` | Added design-token CSS variables (colors, radii, shadows, motion), Inter font import, shared keyframe animations. Previously just resets. |
| `src/utils/constants.js` | `PRIORITY_COLORS` hex values updated to spec (High=red, Medium=orange, Low=green). Added new `COLUMN_THEME` map (accent color + icon per column) — purely cosmetic, does not affect `COLUMNS` order/ids. |
| `src/components/Header.jsx` | Added logo SVG, subtitle, and 3 right-side glass stat pills (Total / Completed / Progress). Added 2 new **display-only** props: `completedTasks`, `progressPercentage`. |
| `src/styles/Header.css` | Rewritten: dark navy gradient, gold sheen accent, glassmorphism stat pills. |
| `src/components/StatsGrid.jsx` | **New component.** Renders 4 dashboard widget cards (Total/Pending/In Progress/Completed) from props computed in `App.jsx`. |
| `src/styles/StatsGrid.css` | **New file.** Glass cards, hover lift, accent-tinted icons. |
| `src/components/ProgressWidget.jsx` | **New component.** Displays the overall progress bar from a `percentage` prop. |
| `src/styles/ProgressWidget.css` | **New file.** Gold gradient fill, smooth width transition. |
| `src/components/SearchBar.jsx` | Emoji search icon replaced with inline SVG. Same props/handlers. |
| `src/styles/App.css` | Search bar restyled as a pill with gold focus ring; board grid spacing refined. |
| `src/components/Column.jsx` | Reads `COLUMN_THEME` for an accent color/icon per column (based on the *existing* `column.id`). Empty state upgraded from a plain `<p>` to an icon + title + subtitle block. No prop/handler changes. |
| `src/styles/Column.css` | Rewritten: glassmorphism column, colored top accent strip, badge styling, refined empty state. |
| `src/components/TaskCard.jsx` | Emoji action icons (◀ ✎ 🗑 ▶) replaced with inline SVGs. Same state, same handlers, same drag wiring. |
| `src/styles/TaskCard.css` | Rewritten: white cards, soft/lift shadows, hover scale, refined action buttons. |
| `src/App.jsx` | Added 4 derived **display-only** constants (`pendingTasks`, `inProgressTasks`, `completedTasks`, `progressPercentage`) computed from the *existing* `boardData` state — no new state variables. Renders `<StatsGrid>` and `<ProgressWidget>` above the search bar. Imports 2 new stylesheets. |

## 🧩 New files added

- `src/components/StatsGrid.jsx`
- `src/components/ProgressWidget.jsx`
- `src/styles/StatsGrid.css`
- `src/styles/ProgressWidget.css`

## 🖌 Design tokens used

```css
--color-bg: #F8FAFC;
--color-navy: #0F172A;
--color-slate: #1E293B;
--color-gold: #D4AF37;
--color-card: #FFFFFF;
--color-border: #E2E8F0;
```

Column accents: To Do = `#3B82F6` (blue), In Progress = `#F97316` (orange),
Done = `#22C55E` (green).
Priority colors: High = `#EF4444` (red), Medium = `#F97316` (orange),
Low = `#22C55E` (green).
