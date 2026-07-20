import '../styles/ProgressWidget.css';

/**
 * ProgressWidget - shows overall completion as a labeled progress bar.
 * `percentage` is a pre-computed display value: (doneTasks / totalTasks) * 100,
 * calculated in App.jsx from existing boardData. No logic lives here.
 */
function ProgressWidget({ percentage }) {
  return (
    <section className="progress-widget fade-in-up">
      <div className="progress-widget__header">
        <h3 className="progress-widget__title">Overall Progress</h3>
        <span className="progress-widget__percentage">{percentage}%</span>
      </div>
      <div className="progress-widget__track">
        <div
          className="progress-widget__fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </section>
  );
}

export default ProgressWidget;
