import { COLUMNS } from './constants';

/**
 * Generates a reasonably unique ID for a new task.
 * Uses crypto.randomUUID when available, falls back to a timestamp+random string.
 */
export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

/**
 * Creates a new task object with the required shape.
 * @param {string} text - the task's display text
 * @param {string} priority - "High" | "Medium" | "Low"
 */
export const createTask = (text, priority) => ({
  id: generateId(),
  text: text.trim(),
  priority,
});

/**
 * Returns the column id immediately to the left of the given column,
 * or null if it's already the first column.
 */
export const getPrevColumnId = (columnId) => {
  const index = COLUMNS.findIndex((col) => col.id === columnId);
  if (index <= 0) return null;
  return COLUMNS[index - 1].id;
};

/**
 * Returns the column id immediately to the right of the given column,
 * or null if it's already the last column.
 */
export const getNextColumnId = (columnId) => {
  const index = COLUMNS.findIndex((col) => col.id === columnId);
  if (index === -1 || index === COLUMNS.length - 1) return null;
  return COLUMNS[index + 1].id;
};

/**
 * Filters an entire board object (keyed by column id -> array of tasks)
 * down to only tasks whose text matches the search term (case-insensitive).
 * Returns a NEW object; does not mutate the original board.
 * Used purely for rendering/filtering, not for persistence.
 */
export const filterBoardBySearch = (board, searchTerm) => {
  const trimmedTerm = searchTerm.trim().toLowerCase();

  if (!trimmedTerm) {
    return board;
  }

  const filteredBoard = {};
  Object.keys(board).forEach((columnId) => {
    filteredBoard[columnId] = board[columnId].filter((task) =>
      task.text.toLowerCase().includes(trimmedTerm)
    );
  });

  return filteredBoard;
};

/**
 * Counts total tasks across all columns of a board object.
 */
export const countAllTasks = (board) =>
  Object.values(board).reduce((total, tasks) => total + tasks.length, 0);
