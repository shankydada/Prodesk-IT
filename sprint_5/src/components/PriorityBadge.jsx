import { PRIORITY_COLORS } from '../utils/constants';

/**
 * PriorityBadge - small colored pill showing a task's priority level.
 * Color is derived from the shared PRIORITY_COLORS map so it stays
 * consistent with the card's border color.
 */
function PriorityBadge({ priority }) {
  const color = PRIORITY_COLORS[priority] || '#94a3b8';

  return (
    <span
      className="priority-badge"
      style={{
        backgroundColor: `${color}22`, // translucent background
        color: color,
        border: `1px solid ${color}`,
      }}
    >
      {priority}
    </span>
  );
}

export default PriorityBadge;
