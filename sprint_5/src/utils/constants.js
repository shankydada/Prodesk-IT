// Centralized constants used across the app.
// Keeping these in one place avoids typos and duplication (DRY principle).

// Defines the columns, their internal IDs, and display titles.
// The order of this array determines column order on the board
// and is used to calculate "move left / move right" targets.
export const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'inprogress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

// Allowed priority levels for a task
export const PRIORITIES = ['High', 'Medium', 'Low'];

// Color mapping used for priority borders/badges
export const PRIORITY_COLORS = {
  High: '#EF4444',   // red
  Medium: '#F97316', // orange
  Low: '#22C55E',    // green
};

// Purely presentational per-column theming (accent color + icon).
// Does not affect column order, ids, or any business logic —
// it is only consumed by Column.jsx for styling/icons.
export const COLUMN_THEME = {
  todo: { accent: '#3B82F6', icon: '📝' },        // blue
  inprogress: { accent: '#F97316', icon: '🚧' },  // orange
  done: { accent: '#22C55E', icon: '✅' },        // green
};

// Key used to persist board data in localStorage
export const STORAGE_KEY = 'kanban-board-data-v1';
