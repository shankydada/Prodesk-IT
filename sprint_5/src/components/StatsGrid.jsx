import '../styles/StatsGrid.css';

// Static config for the four widget cards. Kept local to this component
// since it's purely presentational (icon/label/accent), not shared state.
const STATS_CONFIG = [
  { key: 'total', label: 'Total Tasks', icon: '📊', accent: 'navy' },
  { key: 'pending', label: 'Pending Tasks', icon: '🕒', accent: 'blue' },
  { key: 'inProgress', label: 'In Progress', icon: '⚡', accent: 'orange' },
  { key: 'completed', label: 'Completed', icon: '✅', accent: 'green' },
];

/**
 * StatsGrid - dashboard statistics section shown below the header.
 * Receives four already-computed counts as props (derived in App.jsx
 * from existing boardData) and only handles their display.
 */
function StatsGrid({ total, pending, inProgress, completed }) {
  const values = { total, pending, inProgress, completed };

  return (
    <section className="stats-grid">
      {STATS_CONFIG.map((stat, index) => (
        <div
          key={stat.key}
          className={`stat-card stat-card--${stat.accent} fade-in-up`}
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <div className="stat-card__icon">{stat.icon}</div>
          <div className="stat-card__info">
            <span className="stat-card__number">{values[stat.key]}</span>
            <span className="stat-card__label">{stat.label}</span>
          </div>
        </div>
      ))}
    </section>
  );
}

export default StatsGrid;
