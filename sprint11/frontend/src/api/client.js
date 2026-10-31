/**
 * Sprint 11 - Phase 1: API hydration.
 *
 * FAQ #6 guard: `VITE_API_URL` must point at the live Render URL in production.
 * Locally it is left blank, so requests stay relative (`/api`) and Vite proxies
 * them to the Express server (no CORS round-trip during development).
 */
const RAW_BASE = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');

export const API_BASE = RAW_BASE || '/api';
export const API_ORIGIN = RAW_BASE ? RAW_BASE.replace(/\/api$/, '') : window.location.origin;
export const API_SOURCE = RAW_BASE ? 'VITE_API_URL' : 'Vite dev proxy (/api)';

/** True when a production bundle was built without setting VITE_API_URL. */
export const isMisconfiguredForProduction = () =>
  !import.meta.env.DEV && (!RAW_BASE || /localhost|127\.0\.0\.1/.test(RAW_BASE));

export class ApiError extends Error {
  constructor(message, status = 0, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const isFormData = body instanceof FormData;
  const headers = isFormData
    ? undefined // the browser must set the multipart boundary itself
    : body
      ? { 'Content-Type': 'application/json' } // FAQ #7: explicit JSON header
      : undefined;

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (networkError) {
    if (networkError.name === 'AbortError') throw networkError;
    throw new ApiError(
      `Cannot reach the API at ${API_BASE}. Is the Express server running, and does ALLOWED_ORIGINS include ${window.location.origin}?`,
      0,
    );
  }

  const raw = await response.text();
  let payload = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = { message: raw.slice(0, 200) };
  }

  if (!response.ok) {
    const details = Array.isArray(payload?.details) ? ` (${payload.details.join('; ')})` : '';
    throw new ApiError(`${payload?.message || `HTTP ${response.status}`}${details}`, response.status);
  }

  return payload;
}

export const postsApi = {
  list: () => request('/posts'),
  get: (id) => request(`/posts/${id}`),
  health: () => request('/health'),
  create: ({ title, body, author, imageFile }) => {
    const formData = new FormData(); // Phase 3: multipart, not JSON, not base64
    formData.append('title', title);
    formData.append('body', body);
    formData.append('author', author || 'Anonymous');
    if (imageFile) formData.append('image', imageFile);
    return request('/posts', { method: 'POST', body: formData });
  },
  remove: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
};
