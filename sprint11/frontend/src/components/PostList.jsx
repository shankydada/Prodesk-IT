import PostCard from './PostCard.jsx';
import { EmptyState, ErrorBanner, SkeletonList } from './StatusBanner.jsx';

export default function PostList({ posts, status, error, deletingId, onRetry, onDelete }) {
  if (status === 'loading') return <SkeletonList count={3} />;
  if (status === 'error') return <ErrorBanner message={error} onRetry={onRetry} />;
  if (!posts.length) return <EmptyState />;

  return (
    <ul className="post-grid">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onDelete={onDelete} isDeleting={deletingId === post.id} />
      ))}
    </ul>
  );
}
