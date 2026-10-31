import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE, API_ORIGIN, API_SOURCE, isMisconfiguredForProduction, postsApi } from './api/client.js';
import PostForm from './components/PostForm.jsx';
import PostList from './components/PostList.jsx';
import { Toast } from './components/StatusBanner.jsx';

const STATUS = { IDLE: 'idle', LOADING: 'loading', READY: 'ready', ERROR: 'error' };

export default function App() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState(STATUS.LOADING);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [health, setHealth] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  const abortRef = useRef(null);

  /* ---------------------- Phase 1: useEffect GET hydration ---------------- */
  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let cancelled = false;

    const load = async () => {
      setStatus(STATUS.LOADING);
      setError('');
      try {
        const [listResponse, healthResponse] = await Promise.all([
          postsApi.list(),
          postsApi.health().catch(() => null),
        ]);
        if (cancelled) return;
        setPosts(listResponse.data ?? []);
        setHealth(healthResponse);
        setStatus(STATUS.READY);
      } catch (requestError) {
        if (cancelled || requestError.name === 'AbortError') return;
        setError(requestError.message);
        setStatus(STATUS.ERROR);
      }
    };

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [reloadToken]);

  /* --------------------------- toast auto-dismiss -------------------------- */
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = useCallback((type, message) => setToast({ type, message, id: Date.now() }), []);

  /* --------------------------- Phase 2: POST flow -------------------------- */
  const handleCreate = useCallback(
    async (payload) => {
      setIsSubmitting(true);
      try {
        const response = await postsApi.create(payload);
        setPosts((previous) => [response.data, ...previous]); // optimistic insert of the server document
        setStatus(STATUS.READY);
        notify('success', `“${response.data.title}” persisted — id ${response.data.id}`);
        return response.data;
      } catch (requestError) {
        notify('error', requestError.message);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [notify],
  );

  /* -------------------------- Phase 2: DELETE flow ------------------------- */
  const handleDelete = useCallback(
    async (post) => {
      setDeletingId(post.id);
      const snapshot = posts;
      setPosts((previous) => previous.filter((item) => item.id !== post.id)); // mutate DOM immediately

      try {
        await postsApi.remove(post.id);
        notify('success', `“${post.title}” deleted from MongoDB`);
      } catch (requestError) {
        setPosts(snapshot); // rollback so the UI never lies about persisted state
        notify('error', `Delete failed: ${requestError.message}`);
      } finally {
        setDeletingId(null);
      }
    },
    [notify, posts],
  );

  const isOnline = status === STATUS.READY && Boolean(health);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">◆</span>
          <div>
            <h1>Sprint 11 · Fullstack Pipeline</h1>
            <p className="muted small">React (Vite) → Express → MongoDB → Cloudinary</p>
          </div>
        </div>

        <div className="topbar-status">
          <span className={`dot ${isOnline ? 'dot-live' : status === STATUS.ERROR ? 'dot-down' : ''}`} />
          <span className="small">{status === STATUS.LOADING ? 'Connecting…' : isOnline ? 'API connected' : 'API unreachable'}</span>
          <button className="btn btn-ghost" onClick={() => setReloadToken((token) => token + 1)}>
            ↻ Refresh
          </button>
        </div>
      </header>

      <section className="env-strip">
        <span className="pill pill-ghost">endpoint {API_BASE}</span>
        <span className="pill pill-ghost">source {API_SOURCE}</span>
        {health && <span className="pill pill-ghost">db {health.database}</span>}
        {health && <span className="pill pill-ghost">assets {health.assetStorage}</span>}
        <span className="pill pill-ghost">{posts.length} document{posts.length === 1 ? '' : 's'}</span>
      </section>

      {isMisconfiguredForProduction() && (
        <div className="banner banner-warn" role="alert">
          <div>
            <strong>Deployment misconfiguration (FAQ #6)</strong>
            <p>
              This production build is calling <code>{API_BASE}</code>. Localhost does not exist on Vercel —
              set <code>VITE_API_URL</code> to your live Render URL and redeploy.
            </p>
          </div>
        </div>
      )}

      <main className="layout">
        <PostForm onSubmit={handleCreate} isSubmitting={isSubmitting} />

        <section className="panel">
          <header className="panel-head">
            <h2>Collection</h2>
            <p className="muted small">
              GET <code>{API_ORIGIN}/api/posts</code> on mount — hard refresh to confirm persistence
            </p>
          </header>
          <PostList
            posts={posts}
            status={status}
            error={error}
            deletingId={deletingId}
            onRetry={() => setReloadToken((token) => token + 1)}
            onDelete={handleDelete}
          />
        </section>
      </main>

      <footer className="footer muted small">
        Track B · Phase 1 CORS + hydration · Phase 2 CRUD + loading/error states · Phase 3 multer → Cloudinary (URL string only in Mongo)
      </footer>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
