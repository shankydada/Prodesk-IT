/**
 * End-to-end pipeline proof - automates the Submission Guidelines demo:
 *
 *   1. mount React  (GET /api/posts via useEffect)
 *   2. submit the form as a user would  (POST multipart -> Express -> MongoDB)
 *   3. HARD REFRESH the app in a brand new document and prove the document is still there
 *   4. click Delete and prove it is gone from both the DOM and the database
 *
 * Requires: API running, and a build made with an ABSOLUTE VITE_API_URL
 *   VITE_API_URL=http://localhost:5000/api npm run build && node scripts/e2e-pipeline.mjs
 */
import { JSDOM } from 'jsdom';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const API = (process.env.VITE_API_URL || '').trim().replace(/\/$/, '');
if (!/^https?:\/\//.test(API)) {
  console.error('✖ Set VITE_API_URL to an absolute URL (e.g. http://localhost:5000/api) and rebuild before running this script.');
  process.exit(1);
}
const API_ORIGIN = API.replace(/\/api$/, '');

const assetDir = path.resolve(process.cwd(), 'dist/assets');
const bundle = readdirSync(assetDir).find((file) => file.endsWith('.js'));
if (!bundle) {
  console.error('✖ No bundle in dist/assets - run `npm run build` first.');
  process.exit(1);
}

let pass = 0;
let fail = 0;
const ok = (label) => { console.log(`  \x1b[32mPASS\x1b[0m ${label}`); pass += 1; };
const bad = (label) => { console.log(`  \x1b[31mFAIL\x1b[0m ${label}`); fail += 1; };
const step = (label) => console.log(`\n\x1b[1;36m▸ ${label}\x1b[0m`);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function until(predicate, { timeout = 8000, interval = 120, label = 'condition' } = {}) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const value = await predicate();
    if (value) return value;
    await sleep(interval);
  }
  console.error(`      timed out waiting for ${label}`);
  return null;
}

/** Boots the production bundle inside a fresh jsdom document (a "hard refresh"). */
async function openApp(cacheKey) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost:5173/',
    pretendToBeVisual: true,
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.self = dom.window;
  global.IS_REACT_ACT_ENVIRONMENT = false;
  for (const key of ['HTMLElement', 'HTMLInputElement', 'HTMLFormElement', 'Element', 'Node', 'Event', 'MouseEvent', 'KeyboardEvent', 'CustomEvent', 'MutationObserver', 'getComputedStyle', 'DOMParser', 'Text', 'DocumentFragment', 'SVGElement']) {
    if (dom.window[key] !== undefined) global[key] = dom.window[key];
  }
  global.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
  global.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);

  // A unique query string forces a NEW module instance per "page load".
  await import(`${pathToFileURL(path.join(assetDir, bundle)).href}?load=${cacheKey}`);
  await sleep(120);
  return { dom, root: dom.window.document.getElementById('root') };
}

/** React reads .value through its own tracker - this is the reliable way to type. */
function typeInto(dom, element, value) {
  const prototype = element.tagName === 'TEXTAREA' ? dom.window.HTMLTextAreaElement.prototype : dom.window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
  element.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
}

const cardTitles = (root) => [...root.querySelectorAll('.card h3')].map((node) => node.textContent);
const findCard = (root, title) => [...root.querySelectorAll('.card')].find((card) => card.querySelector('h3')?.textContent === title);

const run = async () => {
  const uniqueTitle = `E2E proof ${new Date().toISOString().slice(11, 19)}`;
  const uniqueBody = 'Created by scripts/e2e-pipeline.mjs through the React form.';

  console.log('==============================================================');
  console.log(` Sprint 11 E2E pipeline proof  →  ${API_ORIGIN}`);
  console.log('==============================================================');

  /* ---------------------------- 1. initial mount -------------------------- */
  step('1. Mount the SPA and hydrate from the API (useEffect GET)');
  let { dom, root } = await openApp('boot');
  const rendered = await until(() => root.querySelector('.card:not(.skeleton-card)'), { label: 'hydrated cards' });
  rendered ? ok(`list hydrated from MongoDB — ${cardTitles(root).length} cards rendered`) : bad('no cards rendered');
  const liveDot = root.querySelector('.dot.dot-live');
  liveDot ? ok('health probe reports the API as connected') : bad('API reported as unreachable');

  /* ------------------------- 2. create via the UI ------------------------- */
  step('2. Submit the form (POST multipart/form-data → Express → MongoDB)');
  const form = root.querySelector('form');
  const titleInput = form.querySelector('input[name="title"]');
  const bodyInput = form.querySelector('textarea[name="body"]');
  const authorInput = form.querySelector('input[name="author"]');

  typeInto(dom, titleInput, uniqueTitle);
  typeInto(dom, bodyInput, uniqueBody);
  typeInto(dom, authorInput, 'E2E Runner');
  titleInput.value === uniqueTitle ? ok('controlled inputs accept keyboard state updates') : bad('input state did not update');

  form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
  const newCard = await until(() => findCard(root, uniqueTitle), { label: 'new card in the DOM' });
  newCard ? ok(`card rendered immediately after POST — "${uniqueTitle}"`) : bad('new card never rendered');

  // Confirm the server actually stored it (not just an optimistic local insert).
  const serverListAfterCreate = await (await fetch(`${API}/posts`)).json();
  const stored = serverListAfterCreate.data.find((post) => post.title === uniqueTitle);
  stored ? ok(`document persisted server-side — id ${stored.id}`) : bad('document missing from GET /api/posts');
  titleInput.value === '' ? ok('form resets after a successful create') : bad('form did not reset');

  /* --------------------------- 3. hard refresh ---------------------------- */
  step('3. HARD REFRESH — new document, empty DOM, data must come back from the DB');
  dom.window.close();
  ({ dom, root } = await openApp('reload'));
  const survivedCard = await until(() => findCard(root, uniqueTitle), { label: 'document after refresh' });
  survivedCard
    ? ok('document survived the refresh — it was read back out of MongoDB')
    : bad('document disappeared after refresh (nothing persisted)');
  const bodyText = survivedCard?.querySelector('p')?.textContent;
  bodyText === uniqueBody ? ok('body text round-tripped byte-for-byte') : bad('body text mismatch');
  survivedCard?.querySelector('.pill')?.textContent === '@E2E Runner' ? ok('author field round-tripped') : bad('author mismatch');

  /* ----------------------------- 4. delete -------------------------------- */
  step('4. Click Delete → DELETE request → DOM + database updated');
  const before = cardTitles(root).length;
  survivedCard.querySelector('button').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  const removed = await until(() => !findCard(root, uniqueTitle), { label: 'card removal' });
  removed ? ok(`card removed from the DOM (${before} → ${cardTitles(root).length} cards)`) : bad('card still in the DOM');

  const response = await fetch(`${API}/posts/${stored.id}`);
  response.status === 404
    ? ok('database confirms deletion — GET /api/posts/:id now returns 404')
    : bad(`expected 404 after delete, received ${response.status}`);

  /* ------------------------------ summary -------------------------------- */
  console.log('\n==============================================================');
  console.log(` RESULT: ${pass} passed, ${fail} failed`);
  console.log('==============================================================');
  process.exit(fail === 0 ? 0 : 1);
};

run().catch((error) => {
  console.error('\n✖ E2E run crashed:', error);
  process.exit(1);
});
