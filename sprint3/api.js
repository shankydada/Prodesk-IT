
import { sanitize } from './utils.js';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Typed error class for API errors.
 * Allows UI layer to render specific messages per error category.
 */
export class ApiError extends Error {
  /**
   * @param {'NOT_FOUND' | 'RATE_LIMIT' | 'NETWORK_ERROR' | 'PARSE_ERROR' | 'SERVER_ERROR' | 'UNKNOWN'} code
   * @param {string} [message]
   */
  constructor(code, message) {
    super(message || code);
    this.name = 'ApiError';
    this.code = code;
  }
}

/**
 * Generic JSON fetch wrapper with unified error handling.
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
async function fetchJSON(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (err) {
    // Network-level failure (offline, DNS, CORS).
    throw new ApiError('NETWORK_ERROR', err.message || 'Network request failed.');
  }

  if (response.status === 404) {
    throw new ApiError('NOT_FOUND', 'GitHub user not found.');
  }
  if (response.status === 403) {
    throw new ApiError('RATE_LIMIT', 'GitHub API rate limit exceeded. Try again in a few minutes.');
  }
  if (response.status >= 500) {
    throw new ApiError('SERVER_ERROR', `Server error (${response.status}).`);
  }
  if (!response.ok) {
    throw new ApiError('UNKNOWN', `Unexpected response (${response.status}).`);
  }

  try {
    return await response.json();
  } catch (err) {
    throw new ApiError('PARSE_ERROR', 'Could not parse API response as JSON.');
  }
}

/**
 * Fetch a GitHub user's profile.
 * Sprint requirement Phase 1: GET https://api.github.com/users/{username}
 * @param {string} username — already validated
 * @returns {Promise<object>}
 */
export async function fetchUser(username) {
  const safeName = encodeURIComponent(username.trim());
  return fetchJSON(`${GITHUB_API_BASE}/users/${safeName}`);
}

/**
 * Fetch a user's repositories, sorted by most recently updated.
 * Sprint requirement Phase 2: use repos_url / chained fetch.
 * @param {string} username
 * @param {number} [perPage=100]
 * @returns {Promise<Array<object>>}
 */
export async function fetchRepos(username, perPage = 100) {
  const safeName = encodeURIComponent(username.trim());
  const url = `${GITHUB_API_BASE}/users/${safeName}/repos?per_page=${perPage}&sort=updated&direction=desc`;
  return fetchJSON(url);
}

/**
 * Combined fetch for a single user's profile + repos.
 * Returns a normalized payload so UI layer stays simple.
 * @param {string} username
 * @returns {Promise<{ user: object, repos: Array<object> }>}
 */
export async function fetchUserWithRepos(username) {
  const user = await fetchUser(username);
  // Defensive: repos fetch should not block the profile render if it fails
  // due to an empty account, but GitHub always returns [] for zero repos.
  let repos = [];
  try {
    repos = await fetchRepos(username);
  } catch (err) {
    // If repos fail but user succeeded, surface user with empty repos.
    console.error('[api] repos fetch failed:', err);
  }
  return { user, repos };
}

/**
 * Sprint requirement Phase 3: Promise.all() for dual-user Battle Mode.
 * Runs two user+repo fetches in parallel.
 * If either user is not found, rejects with the first error encountered.
 * @param {string} usernameA
 * @param {string} usernameB
 * @returns {Promise<[BattleResult, BattleResult]>}
 */
export async function fetchBattlePair(usernameA, usernameB) {
  const results = await Promise.all([
    fetchUserWithRepos(usernameA),
    fetchUserWithRepos(usernameB),
  ]);
  return results;
}
