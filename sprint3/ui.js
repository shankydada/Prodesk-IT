import {
  sanitize, formatDate, formatRelativeTime, normalizeUrl,
  totalStars, totalForks, pluralize, $,
} from './utils.js';
 
const dom = {
  get resultArea() { return $('#resultArea'); },
  get loadingState() { return $('#loadingState'); },
  get errorState() { return $('#errorState'); },
  get errorTitle() { return $('#errorTitle'); },
  get errorMessage() { return $('#errorMessage'); },
  get emptyState() { return $('#emptyState'); },
  get profileCard() { return $('#profileCard'); },
  get reposCard() { return $('#reposCard'); },
  get battleGrid() { return $('#battleGrid'); },
  get battleVerdict() { return $('#battleVerdict'); },
};
export function clearResultArea() {
  const area = dom.resultArea;
  if (!area) return;
  ['loadingState', 'errorState', 'emptyState', 'profileCard', 'reposCard',
   'battleGrid', 'battleVerdict'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  });
  area.innerHTML = '';
}

//  
// Loading state
//  
export function showLoading(message = 'Fetching profile data...') {
  const area = dom.resultArea;
  if (!area) return;
  clearResultArea();
  area.innerHTML = `
    <div id="loadingState" class="state-card" role="status" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p class="state-text">${sanitize(message)}</p>
    </div>
  `;
}

//  
// Empty / initial state
//  
export function showEmpty() {
  const area = dom.resultArea;
  if (!area) return;
  clearResultArea();
  area.innerHTML = `
    <div id="emptyState" class="state-card">
      <svg class="state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <h3 class="state-title">Start your investigation</h3>
      <p class="state-text">Enter a GitHub username above to explore their profile and repositories.</p>
    </div>
  `;
}

//  
// Error state
//  
/**
 * @param {'NOT_FOUND'|'RATE_LIMIT'|'NETWORK_ERROR'|'VALIDATION_ERROR'|'PARSE_ERROR'|'UNKNOWN'} kind
 * @param {string} [customMessage]
 */
export function showError(kind, customMessage) {
  const area = dom.resultArea;
  if (!area) return;
  clearResultArea();

  const presets = {
    VALIDATION_ERROR: {
      title: 'Invalid Input',
      message: 'Please enter a valid GitHub username.',
      icon: 'exclamation',
    },
    NOT_FOUND: {
      title: 'User Not Found',
      message: 'We couldn\'t find a GitHub account with that username. Check the spelling and try again.',
      icon: 'search-x',
    },
    RATE_LIMIT: {
      title: 'Rate Limit Exceeded',
      message: 'GitHub allows 60 unauthenticated requests per hour. Wait a moment or add a Personal Access Token.',
      icon: 'clock',
    },
    NETWORK_ERROR: {
      title: 'Connection Error',
      message: 'We couldn\'t reach GitHub. Check your internet connection and retry.',
      icon: 'wifi-off',
    },
    PARSE_ERROR: {
      title: 'Unexpected Response',
      message: 'The server response could not be parsed. Please try again.',
      icon: 'exclamation',
    },
    UNKNOWN: {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Please retry.',
      icon: 'exclamation',
    },
  };

  const preset = presets[kind] || presets.UNKNOWN;
  const message = customMessage || preset.message;

  area.innerHTML = `
    <div id="errorState" class="state-card state-error" role="alert" aria-live="assertive">
      <div class="state-icon state-icon-error" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <h3 id="errorTitle" class="state-title">${sanitize(preset.title)}</h3>
      <p id="errorMessage" class="state-text">${sanitize(message)}</p>
    </div>
  `;
}

/**
 * Show inline field validation error below an input.
 * @param {string} inputId
 * @param {string} message
 */
export function setFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(`${inputId}Error`);
  if (!input || !errorEl) return;
  if (message) {
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    errorEl.textContent = message;
    errorEl.hidden = false;
  } else {
    input.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
    errorEl.textContent = '';
    errorEl.hidden = true;
  }
}

//  
// Profile rendering (Phase 1 + Phase 2)
//  
export function renderProfile({ user, repos }) {
  const area = dom.resultArea;
  if (!area) return;
  clearResultArea();

  const stars = totalStars(repos);
  const forks = totalForks(repos);
  const blogHref = user.blog ? normalizeUrl(user.blog) : '';
  const avatar = user.avatar_url || '';

  area.innerHTML = `
    <article id="profileCard" class="profile-card fade-in" aria-labelledby="profileName">
      <div class="profile-header">
        ${avatar
          ? `<img class="profile-avatar" src="${sanitize(avatar)}" alt="Avatar of ${sanitize(user.login)}" loading="lazy" />`
          : `<div class="profile-avatar profile-avatar-fallback" aria-label="No avatar available">?</div>`}
        <div class="profile-identity">
          <h2 id="profileName" class="profile-name">${sanitize(user.name || user.login)}</h2>
          <a class="profile-handle" href="${sanitize(user.html_url || '#')}" target="_blank" rel="noopener noreferrer">
            @${sanitize(user.login)}
            <span class="sr-only">(opens in a new tab)</span>
          </a>
          ${user.bio
            ? `<p class="profile-bio">${sanitize(user.bio)}</p>`
            : `<p class="profile-bio profile-empty">No bio provided.</p>`}
          <div class="profile-meta">
            <span class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Joined <time datetime="${sanitize(user.created_at || '')}">${formatDate(user.created_at)}</time>
            </span>
            ${user.location ? `<span class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              ${sanitize(user.location)}
            </span>` : ''}
            ${blogHref ? `<a class="meta-item meta-link" href="${sanitize(blogHref)}" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
              ${sanitize(user.blog)}
              <span class="sr-only">(opens in a new tab)</span>
            </a>` : ''}
          </div>
        </div>
      </div>

      <div class="profile-stats" role="group" aria-label="Account statistics">
        <div class="stat">
          <span class="stat-value">${(user.public_repos ?? 0).toLocaleString()}</span>
          <span class="stat-label">Repositories</span>
        </div>
        <div class="stat">
          <span class="stat-value">${stars.toLocaleString()}</span>
          <span class="stat-label">Total Stars</span>
        </div>
        <div class="stat">
          <span class="stat-value">${(user.followers ?? 0).toLocaleString()}</span>
          <span class="stat-label">Followers</span>
        </div>
        <div class="stat">
          <span class="stat-value">${(user.following ?? 0).toLocaleString()}</span>
          <span class="stat-label">Following</span>
        </div>
      </div>
    </article>

    <section id="reposCard" class="repos-card fade-in" aria-labelledby="reposTitle">
      <header class="repos-header">
        <h3 id="reposTitle" class="repos-title">Latest Repositories</h3>
        <span class="repos-count">${pluralize(repos.length, 'repository')}</span>
      </header>
      ${renderRepoList(repos.slice(0, 5))}
    </section>
  `;
}

/**
 * Render the Top 5 latest repos list.
 * @param {Array<object>} repos
 * @returns {string}
 */
function renderRepoList(repos) {
  if (!repos || repos.length === 0) {
    return `<p class="repos-empty">No public repositories yet.</p>`;
  }
  return `
    <ul class="repo-list" role="list">
      ${repos.map((repo) => `
        <li class="repo-item">
          <div class="repo-main">
            <a class="repo-name" href="${sanitize(repo.html_url || '#')}" target="_blank" rel="noopener noreferrer">
              <svg class="repo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
              ${sanitize(repo.name)}
              <span class="sr-only">(opens in a new tab)</span>
            </a>
            ${repo.description
              ? `<p class="repo-desc">${sanitize(repo.description)}</p>`
              : ''}
            <div class="repo-meta">
              ${repo.language
                ? `<span class="repo-lang">
                    <span class="lang-dot" aria-hidden="true"></span>${sanitize(repo.language)}
                   </span>`
                : ''}
              <span class="repo-stat">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                ${(repo.stargazers_count ?? 0).toLocaleString()}
              </span>
              <span class="repo-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M8 7v4m0 0l-3-3m3 3l3-3M16 17v-4m0 0l3 3m-3-3l-3 3"/>
                </svg>
                ${(repo.forks_count ?? 0).toLocaleString()}
              </span>
              <span class="repo-updated">Updated ${formatRelativeTime(repo.updated_at)}</span>
            </div>
          </div>
        </li>
      `).join('')}
    </ul>
  `;
}

//  
// Battle Mode rendering (Phase 3)
//  
/**
 * @param {{ dataA, dataB }} payload
 */
export function renderBattle({ dataA, dataB }) {
  const area = dom.resultArea;
  if (!area) return;
  clearResultArea();

  const starsA = totalStars(dataA.repos);
  const starsB = totalStars(dataB.repos);
  const forksA = totalForks(dataA.repos);
  const forksB = totalForks(dataB.repos);

  let verdictA = 'tie', verdictB = 'tie';
  if (starsA > starsB)      { verdictA = 'winner'; verdictB = 'loser'; }
  else if (starsB > starsA) { verdictA = 'loser';  verdictB = 'winner'; }

  area.innerHTML = `
    <div id="battleGrid" class="battle-grid fade-in" role="region" aria-label="Battle comparison">
      ${renderBattleCard(dataA, starsA, forksA, verdictA, 'A')}
      ${renderBattleCard(dataB, starsB, forksB, verdictB, 'B')}
    </div>
    <div id="battleVerdict" class="battle-verdict fade-in" role="status" aria-live="polite">
      ${renderVerdict(dataA, dataB, starsA, starsB)}
    </div>
  `;
}

function renderBattleCard(data, stars, forks, verdict, side) {
  const { user, repos } = data;
  const avatar = user.avatar_url || '';
  const top5 = (repos || []).slice(0, 5);

  const verdictBadge = {
    winner: `<span class="verdict-badge verdict-winner" aria-label="Winner">
               <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                 <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
               </svg> Winner
             </span>`,
    loser:  `<span class="verdict-badge verdict-loser" aria-label="Runner-up">Runner-up</span>`,
    tie:    `<span class="verdict-badge verdict-tie" aria-label="Tie">Tie</span>`,
  }[verdict];

  return `
    <article class="battle-card battle-${verdict}" aria-labelledby="battle-${side}-name">
      <div class="battle-header">${verdictBadge}</div>
      <div class="battle-identity">
        ${avatar
          ? `<img class="battle-avatar" src="${sanitize(avatar)}" alt="${sanitize(user.login)}" loading="lazy" />`
          : `<div class="battle-avatar battle-avatar-fallback">?</div>`}
        <div class="battle-user">
          <h3 id="battle-${side}-name" class="battle-name">${sanitize(user.name || user.login)}</h3>
          <a class="battle-handle" href="${sanitize(user.html_url || '#')}" target="_blank" rel="noopener noreferrer">
            @${sanitize(user.login)}
          </a>
          ${user.bio ? `<p class="battle-bio">${sanitize(user.bio)}</p>` : ''}
        </div>
      </div>
      <div class="battle-stats">
        <div class="battle-stat">
          <span class="battle-stat-value">${(user.public_repos ?? 0).toLocaleString()}</span>
          <span class="battle-stat-label">Repos</span>
        </div>
        <div class="battle-stat battle-stat-highlight">
          <span class="battle-stat-value">${stars.toLocaleString()}</span>
          <span class="battle-stat-label">Stars</span>
        </div>
        <div class="battle-stat">
          <span class="battle-stat-value">${(user.followers ?? 0).toLocaleString()}</span>
          <span class="battle-stat-label">Followers</span>
        </div>
      </div>
      ${top5.length ? `
        <div class="battle-repos">
          <h4 class="battle-repos-title">Top Repositories</h4>
          <ul class="battle-repo-list" role="list">
            ${top5.map((r) => `
              <li class="battle-repo-item">
                <a class="battle-repo-link" href="${sanitize(r.html_url || '#')}" target="_blank" rel="noopener noreferrer">
                  ${sanitize(r.name)}
                </a>
                <span class="battle-repo-stars">★ ${(r.stargazers_count ?? 0).toLocaleString()}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : '<p class="repos-empty">No public repositories.</p>'}
    </article>
  `;
}

function renderVerdict(dataA, dataB, starsA, starsB) {
  if (starsA === starsB) {
    return `
      <div class="verdict-inner">
        <span class="verdict-emoji" aria-hidden="true">🤝</span>
        <h3 class="verdict-title">It's a Tie</h3>
        <p class="verdict-subtitle">Both developers have <strong>${starsA.toLocaleString()}</strong> total stars.</p>
      </div>
    `;
  }
  const winnerData = starsA > starsB ? dataA : dataB;
  const loserStars = Math.min(starsA, starsB);
  const winnerStars = Math.max(starsA, starsB);
  const total = winnerStars + loserStars || 1;
  const winPct = (winnerStars / total) * 100;
  const winnerName = sanitize(winnerData.user.name || winnerData.user.login);

  return `
    <div class="verdict-inner">
      <span class="verdict-emoji" aria-hidden="true">🏆</span>
      <h3 class="verdict-title verdict-title-win">${winnerName} wins!</h3>
      <p class="verdict-subtitle">
        <strong>${winnerStars.toLocaleString()}</strong> stars vs
        <strong>${loserStars.toLocaleString()}</strong> stars
      </p>
      <div class="verdict-bar" role="progressbar" aria-valuenow="${Math.round(winPct)}" aria-valuemin="0" aria-valuemax="100">
        <div class="verdict-bar-fill" style="width: ${winPct.toFixed(1)}%"></div>
      </div>
    </div>
  `;
}
