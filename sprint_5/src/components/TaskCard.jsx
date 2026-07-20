import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import PriorityBadge from './PriorityBadge';
import { PRIORITY_COLORS } from '../utils/constants';

/**
 * TaskCard - renders a single task with:
 * - Priority-colored left border
 * - Inline editing (Save/Cancel)
 * - Delete button
 * - Move left/right buttons (button-based column movement)
 * - Drag-and-drop support via @dnd-kit/core's useDraggable
 *
 * Only visual change from the original: emoji action icons were
 * swapped for inline SVGs. All state, handlers, and dnd-kit wiring
 * are unchanged.
 */
function TaskCard({
  task,
  columnId,
  canMoveLeft,
  canMoveRight,
  onDelete,
  onEdit,
  onMoveLeft,
  onMoveRight,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(task.text);

  // dnd-kit hook: makes this card draggable.
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { columnId },
    });

  const dragStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
      }
    : undefined;

  const borderColor = PRIORITY_COLORS[task.priority] || '#94a3b8';

  const handleSave = () => {
    if (!draftText.trim()) return;
    onEdit(columnId, task.id, draftText.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftText(task.text);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={{ borderLeftColor: borderColor, ...dragStyle }}
      className={`task-card fade-in-up ${isDragging ? 'task-card--dragging' : ''}`}
    >
      {isEditing ? (
        // --- Edit mode ---
        <div className="task-card__edit">
          <input
            type="text"
            className="task-card__edit-input"
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            autoFocus
          />
          <div className="task-card__edit-actions">
            <button className="task-card__btn task-card__btn--save" onClick={handleSave}>
              Save
            </button>
            <button className="task-card__btn task-card__btn--cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // --- Display mode ---
        <>
          {/* Drag handle area - only this part triggers dragging,
              so buttons below remain clickable */}
          <div className="task-card__drag-handle" {...listeners} {...attributes}>
            <p className="task-card__text">{task.text}</p>
            <PriorityBadge priority={task.priority} />
          </div>

          <div className="task-card__actions">
            <button
              className="task-card__icon-btn"
              onClick={() => onMoveLeft(columnId, task.id)}
              disabled={!canMoveLeft}
              title="Move left"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              className="task-card__icon-btn"
              onClick={() => setIsEditing(true)}
              title="Edit task"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                <path d="M12 20h9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              className="task-card__icon-btn task-card__icon-btn--delete"
              onClick={() => onDelete(columnId, task.id)}
              title="Delete task"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                <path d="M3 6h18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6h12z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              className="task-card__icon-btn"
              onClick={() => onMoveRight(columnId, task.id)}
              disabled={!canMoveRight}
              title="Move right"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default TaskCard;
