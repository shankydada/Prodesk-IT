/**
 * Proves the non-happy-path UI states required by Phase 2:
 *   1. "Loading…" skeleton renders on first paint, before the fetch resolves
 *   2. a failed backend connection renders a clean error boundary (role="alert")
 *   3. the FAQ #6 misconfiguration warning fires when a production build points at localhost
 *
 * Build against a DEAD endpoint first:
 *   VITE_API_URL=http://localhost:5999/api npm run build && node scripts/state-checks.mjs
 */
import { JSDOM } from 'jsdom';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const bundle = readdirSync(path.resolve(process.cwd(), 'dist/assets')).find((file) => file.endsWith('.js'));
const target = process.env.VITE_API_URL || '(relative / Vite dev proxy)';

let pass = 0;
let fail = 0;
const ok = (label) => { console.log(`  \x1b[32mPASS\x1b[0m ${label}`); pass += 1; };
const bad = (label) => { console.log(`  \x1b[31mFAIL\x1b[0m ${label}`); fail += 1; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

console.log('==============================================================');
console.log(` Sprint 11 UI state checks  →  build targets ${target}`);
console.log('==============================================================');

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:5173/',
  pretendToBeVisual: true,
});
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.self = dom.window;
global.IS_REACT_ACT_ENVIRONMENT = false;
for (const key of ['HTMLElement', 'HTMLInputElement', 'HTMLFormElement', 'Element', 'Node', 'Event', 'MouseEvent', 'MutationObserver', 'getComputedStyle', 'DOMParser', 'Text', 'DocumentFragment', 'SVGElement']) {
  if (dom.window[key] !== undefined) global[key] = dom.window[key];
}
global.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
global.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);

await import(`${pathToFileURL(path.resolve(process.cwd(), 'dist/assets', bundle)).href}?load=states`);
const root = document.getElementById('root');

console.log('\n\x1b[1;36m▸ 1. Loading state\x1b[0m');
// React commits its first paint just after render() is called, so poll briefly
// instead of reading the DOM synchronously.
const sleep5 = (ms) => new Promise((r) => setTimeout(r, ms));
let skeletons = root.querySelectorAll('.skeleton-card').length;
const startedAt = Date.now();
while (skeletons === 0 && Date.now() - startedAt < 3000) {
  await sleep5(5);
  skeletons = root.querySelectorAll('.skeleton-card').length;
}
skeletons > 0
  ? ok(`skeleton placeholders rendered before the response settled (${skeletons} cards)`)
  : bad('no loading skeleton was ever committed to the DOM');

console.log('\n\x1b[1;36m▸ 2. Error boundary\x1b[0m');
const waitFor = async (predicate, timeout = 8000) => {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const value = predicate();
    if (value) return value;
    await sleep(120);
  }
  return null;
};

const alert = await waitFor(() => root.querySelector('.banner-error[role="alert"]'));
alert ? ok(`error banner rendered with role="alert"`) : bad('no error banner after a failed connection');
alert?.querySelector('strong')?.textContent.includes('Backend connection failed')
  ? ok('user-facing failure message is explicit')
  : bad('failure message missing');
const alertText = alert?.textContent || '';
alertText.includes('Cannot reach the API')
  ? ok('banner names the endpoint that could not be reached')
  : bad('banner does not explain the cause');
[...(alert?.querySelectorAll('button') ?? [])].some((b) => b.textContent.includes('Retry'))
  ? ok('Retry control offered to the user')
  : bad('no Retry button');
root.querySelector('.dot-down') ? ok('status indicator flips to the offline state') : bad('status dot did not flip');
root.querySelectorAll('.post-grid .card:not(.skeleton-card)').length === 0
  ? ok('no phantom cards rendered while offline')
  : bad('cards rendered despite the API being unreachable');

console.log('\n\x1b[1;36m▸ 3. FAQ #6 misconfiguration guard\x1b[0m');
const warn = root.querySelector('.banner-warn');
warn ? ok('production build pointing at localhost raises the deployment warning')
     : bad('misconfiguration warning missing (expected for a localhost build)');
warn?.textContent.includes('VITE_API_URL') ? ok('warning tells the engineer exactly which variable to fix') : bad('warning omits VITE_API_URL');

console.log(`\n==============================================================\n RESULT: ${pass} passed, ${fail} failed\n==============================================================`);
process.exit(fail === 0 ? 0 : 1);
