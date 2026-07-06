import { validateUsername } from './utils.js';
import { ApiError, fetchUserWithRepos, fetchBattlePair } from './api.js';
import {
  showEmpty, showLoading, showError, setFieldError,
  renderProfile, renderBattle,
} from './ui.js';

//   
// State
//  
const state = {
  mode: 'single', // 'single' | 'battle'
  isFetching: false,
};

//  
// DOM references
//  
const singleInput   = document.getElementById('singleInput');
const singleBtn     = document.getElementById('singleSearchBtn');
const battleInput1  = document.getElementById('battleInput1');
const battleInput2  = document.getElementById('battleInput2');
const battleBtn     = document.getElementById('battleSearchBtn');
const modeToggle    = document.getElementById('modeToggle');
const modeLabel     = document.getElementById('modeLabel');
const singleSearch  = document.getElementById('singleSearch');
const battleSearch  = document.getElementById('battleSearch');

//  
// Mode toggle
//  
function updateMode(mode) {
  state.mode = mode;
  const isBattle = mode === 'battle';
  modeToggle.classList.toggle('is-active', isBattle);
  modeToggle.setAttribute('aria-pressed', String(isBattle));
  modeLabel.textContent = isBattle ? 'Battle' : 'Single';
  singleSearch.hidden = isBattle;
  battleSearch.hidden = !isBattle;
  // Clear any previous results when switching modes.
  showEmpty();
}

modeToggle.addEventListener('click', () => {
  updateMode(state.mode === 'single' ? 'battle' : 'single');
});
modeToggle.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    updateMode(state.mode === 'single' ? 'battle' : 'single');
  }
});

//  
// Validation helpers
//  
function validateField(inputEl) {
  const result = validateUsername(inputEl.value);
  setFieldError(inputEl.id, result.valid ? '' : result.reason);
  return result;
}

function clearFieldError(inputEl) {
  setFieldError(inputEl.id, '');
}

// Clear inline error as soon as user edits the field.
[singleInput, battleInput1, battleInput2].forEach((input) => {
  if (!input) return;
  input.addEventListener('input', () => clearFieldError(input));
});

//  
// Error normalization — turns ApiError code into ui.js error kind.
//  
function errorKindFrom(err) {
  if (err instanceof ApiError) return err.code;
  return 'UNKNOWN';
}

//  
// Core actions
//  

/**
 * Handle single-user search (Phase 1 + 2).
 */
async function handleSingleSearch() {
  if (state.isFetching) return;

  const validation = validateField(singleInput);
  if (!validation.valid) {
    showError('VALIDATION_ERROR', validation.reason);
    singleInput.focus();
    return;
  }

  const username = singleInput.value.trim();
  state.isFetching = true;
  showLoading('Fetching profile data...');

  try {
    const payload = await fetchUserWithRepos(username);
    renderProfile(payload);
  } catch (err) {
    console.error('[script] single search error:', err);
    showError(errorKindFrom(err), err.message);
  } finally {
    state.isFetching = false;
  }
}

/**
 * Handle battle search (Phase 3). Uses Promise.all() under the hood.
 */
async function handleBattleSearch() {
  if (state.isFetching) return;

  const v1 = validateField(battleInput1);
  const v2 = validateField(battleInput2);

  if (!v1.valid || !v2.valid) {
    if (!v1.valid) battleInput1.focus();
    else battleInput2.focus();
    showError('VALIDATION_ERROR', 'Please enter two valid usernames.');
    return;
  }

  const u1 = battleInput1.value.trim();
  const u2 = battleInput2.value.trim();

  if (u1.toLowerCase() === u2.toLowerCase()) {
    setFieldError(battleInput2.id, 'Enter a different username for comparison.');
    showError('VALIDATION_ERROR', 'The two usernames must be different.');
    battleInput2.focus();
    return;
  }

  state.isFetching = true;
  showLoading('Fetching battle data...');

  try {
    const [dataA, dataB] = await fetchBattlePair(u1, u2);
    renderBattle({ dataA, dataB });
  } catch (err) {
    console.error('[script] battle search error:', err);
    showError(errorKindFrom(err), err.message);
  } finally {
    state.isFetching = false;
  }
}

//  
// Event bindings
//  
singleBtn.addEventListener('click', handleSingleSearch);
battleBtn.addEventListener('click', handleBattleSearch);

singleInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); handleSingleSearch(); }
});
battleInput1.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); battleInput2.focus(); }
});
battleInput2.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); handleBattleSearch(); }
});

//  
// Bootstrap — Sprint rule #8: do NOT auto-search on load.
//  
document.addEventListener('DOMContentLoaded', () => {
  updateMode('single');
  showEmpty();
});
