const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'just now'
    : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

export default function PostCard({ post, onDelete, isDeleting }) {
  return (
    <li className={`card ${isDeleting ? 'is-deleting' : ''}`}>
      {post.imageUrl ? (
        <img className="card-thumb" src={post.imageUrl} alt={`${post.title} thumbnail`} loading="lazy" />
      ) : (
        <div className="card-thumb card-thumb-placeholder" aria-hidden="true">
          {post.title.slice(0, 1).toUpperCase()}
        </div>
      )}

      <div className="card-body">
        <h3>{post.title}</h3>
        <p>{post.body}</p>
      </div>

      <div className="card-meta">
        <span className="pill">@{post.author}</span>
        <span className="muted small">{formatDate(post.createdAt)}</span>
        {post.storageProvider && post.storageProvider !== 'none' && (
          <span className="pill pill-ghost">{post.storageProvider}</span>
        )}
      </div>

      <button
        className="btn btn-danger"
        onClick={() => onDelete(post)}
        disabled={isDeleting}
        aria-busy={isDeleting}
      >
        {isDeleting ? 'Deleting…' : 'Delete'}
      </button>
    </li>
  );
}
