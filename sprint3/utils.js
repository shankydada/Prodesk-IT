/**
 * @param {string} str
 * @returns {string}
 */
export function sanitize(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * @param {string} iso
 * @returns {string}
 */
export function formatDate(iso) {
  if (!iso) return 'N/A';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'N/A';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * @param {string} iso
 * @returns {string}
 */
export function formatRelativeTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff) || diff < 0) return '';
  const seconds = Math.floor(diff / 1000);
  const units = [
    ['year',   31536000],
    ['month',  2592000],
    ['day',    86400],
    ['hour',   3600],
    ['minute', 60],
  ];
  for (const [label, value] of units) {
    const count = Math.floor(seconds / value);
    if (count >= 1) return `${count} ${label}${count === 1 ? '' : 's'} ago`;
  }
  return 'just now';
}

/**
 * @param {string} username
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, reason: 'Please enter a GitHub username.' };
  }
  const trimmed = username.trim();
  if (trimmed.length === 0) {
    return { valid: false, reason: 'Username cannot be empty.' };
  }
  if (trimmed.length > 39) {
    return { valid: false, reason: 'Username must be 39 characters or fewer.' };
  }
  // GitHub username regex
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(trimmed)) {
    return { valid: false, reason: 'Username may only contain letters, numbers, and single hyphens.' };
  }
  return { valid: true };
}

/**
 * Pluralize helper.
 * @param {number} n
 * @param {string} word
 * @returns {string}
 */
export function pluralize(n, word) {
  return `${n.toLocaleString()} ${word}${n === 1 ? '' : 's'}`;
}

/**
 * Normalize a URL: add https:// if missing.
 * @param {string} url
 * @returns {string}
 */
export function normalizeUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Safe shortcut for querySelector.
 * @param {string} selector
 * @param {Element|Document} [root=document]
 * @returns {Element|null}
 */
export function $(selector, root = document) {
  return root.querySelector(selector);
}

/**
 * @param {string} selector
 * @param {Element|Document} [root=document]
 * @returns {Element[]}
 */
export function $$(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/**
 * @param {Array<{stargazers_count?: number}>} repos
 * @returns {number}
 */
export function totalStars(repos) {
  if (!Array.isArray(repos)) return 0;
  return repos.reduce((acc, repo) => acc + (repo?.stargazers_count ?? 0), 0);
}

/**
 * @param {Array<{forks_count?: number}>} repos
 * @returns {number}
 */
export function totalForks(repos) {
  if (!Array.isArray(repos)) return 0;
  return repos.reduce((acc, repo) => acc + (repo?.forks_count ?? 0), 0);
}
