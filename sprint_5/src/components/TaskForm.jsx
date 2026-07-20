import { useState } from 'react';
import { PRIORITIES } from '../utils/constants';

/**
 * TaskForm - form for adding a new task to a specific column.
 * Manages its own local input state; only calls back to the parent
 * (Column -> App) once the user submits a valid task.
 */
function TaskForm({ columnId, onAddTask }) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('Medium');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Guard against empty/whitespace-only tasks
    if (!text.trim()) return;

    onAddTask(columnId, text, priority);

    // Reset the form after successful submission
    setText('');
    setPriority('Medium');
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="task-form__input"
        placeholder="Enter a new task..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="task-form__row">
        <select
          className="task-form__select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p} Priority
            </option>
          ))}
        </select>
        <button type="submit" className="task-form__button">
          + Add
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
