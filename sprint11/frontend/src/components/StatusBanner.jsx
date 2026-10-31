export function ErrorBanner({ message, onRetry }) {
  return (
    <div className="banner banner-error" role="alert">
      <div>
        <strong>Backend connection failed</strong>
        <p>{message}</p>
      </div>
      {onRetry && (
        <button className="btn btn-ghost" onClick={onRetry}>
          ↻ Retry
        </button>
      )}
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <ul className="post-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <li key={index} className="card skeleton-card">
          <div className="skeleton skeleton-media" />
          <div className="skeleton skeleton-line w-60" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line w-80" />
        </li>
      ))}
    </ul>
  );
}

export function EmptyState() {
  return (
    <div className="empty">
      <span className="empty-icon">🗂</span>
      <h3>No documents in the collection</h3>
      <p className="muted">Create the first post — it is written to MongoDB and returned by the API.</p>
    </div>
  );
}

export function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.type}`} role="status">
      <span>{toast.type === 'success' ? '✓' : '⚠'}</span>
      <p>{toast.message}</p>
      <button className="toast-close" onClick={onDismiss} aria-label="Dismiss notification">
        ×
      </button>
    </div>
  );
}
