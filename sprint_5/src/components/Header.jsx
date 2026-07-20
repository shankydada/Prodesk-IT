import '../styles/Header.css';

/**
 * Header component - premium dashboard header with a dark navy gradient.
 * Left side: logo + title + subtitle.
 * Right side: three glass "stat pill" cards (Total / Completed / Progress).
 *
 * NOTE: totalTasks/completedTasks/progressPercentage are pure display
 * values computed in App.jsx from existing boardData — no new state,
 * no business logic added here. This component remains presentational.
 */
function Header({ totalTasks, completedTasks, progressPercentage }) {
  return (
    <header className="app-header">
      <div className="app-header__content">
        <div className="app-header__brand">
          <div className="app-header__logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
              <rect x="3" y="3" width="7" height="18" rx="2" fill="#D4AF37" />
              <rect x="13" y="3" width="8" height="10" rx="2" fill="#FFFFFF" fillOpacity="0.85" />
              <rect x="13" y="15" width="8" height="6" rx="2" fill="#FFFFFF" fillOpacity="0.5" />
            </svg>
          </div>
          <div>
            <h1 className="app-header__title">Kanban Task Board</h1>
            <p className="app-header__subtitle">Organize your work efficiently</p>
          </div>
        </div>

        <div className="app-header__stats">
          <div className="header-stat">
            <span className="header-stat__number">{totalTasks}</span>
            <span className="header-stat__label">Total Tasks</span>
          </div>
          <div className="header-stat">
            <span className="header-stat__number">{completedTasks}</span>
            <span className="header-stat__label">Completed</span>
          </div>
          <div className="header-stat header-stat--gold">
            <span className="header-stat__number">{progressPercentage}%</span>
            <span className="header-stat__label">Progress</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
