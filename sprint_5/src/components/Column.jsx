import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { COLUMN_THEME } from '../utils/constants';

/**
 * Column - represents a single board column (To Do / In Progress / Done).
 * Acts as a drop target (useDroppable) for drag-and-drop,
 * and renders the list of TaskCards plus the add-task form.
 *
 * Only change from the original: pulls a presentational theme (accent
 * color + icon) from COLUMN_THEME based on the existing column.id, and
 * renders a richer empty state. Props, handlers, and dnd-kit wiring
 * are all unchanged.
 */
function Column({
  column,
  tasks,
  canMoveLeft,
  canMoveRight,
  onAddTask,
  onDeleteTask,
  onEditTask,
  onMoveLeft,
  onMoveRight,
}) {
  // dnd-kit hook: makes this column a valid drop target.
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const theme = COLUMN_THEME[column.id] || { accent: '#94A3B8', icon: '📌' };

  return (
    <div
      className={`column column--${column.id}`}
      style={{ '--column-accent': theme.accent }}
    >
      <div className="column__header">
        <div className="column__header-left">
          <span className="column__icon" aria-hidden="true">{theme.icon}</span>
          <h2 className="column__title">{column.title}</h2>
        </div>
        <span className="column__count">{tasks.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`column__body ${isOver ? 'column__body--over' : ''}`}
      >
        {tasks.length === 0 ? (
          <div className="column__empty">
            <span className="column__empty-icon" aria-hidden="true">📋</span>
            <p className="column__empty-title">No tasks yet</p>
            <p className="column__empty-subtitle">Create your first task below.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columnId={column.id}
              canMoveLeft={canMoveLeft}
              canMoveRight={canMoveRight}
              onDelete={onDeleteTask}
              onEdit={onEditTask}
              onMoveLeft={onMoveLeft}
              onMoveRight={onMoveRight}
            />
          ))
        )}
      </div>

      <TaskForm columnId={column.id} onAddTask={onAddTask} />
    </div>
  );
}

export default Column;
