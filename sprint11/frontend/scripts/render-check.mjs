/**
 * Headless render check.
 *
 * Loads the PRODUCTION bundle inside jsdom, lets it fetch from the live Express API
 * and prints the resulting DOM. Proves the whole chain:
 *   bundle -> fetch -> Express -> MongoDB -> React render
 *
 * Usage: VITE_API_URL=http://localhost:5000/api npm run build && node scripts/render-check.mjs
 */
import { JSDOM } from 'jsdom';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const distDir = path.resolve(process.cwd(), 'dist');
const assetDir = path.join(distDir, 'assets');
const bundle = readdirSync(assetDir).find((file) => file.endsWith('.js'));
if (!bundle) {
  console.error('No JS bundle found in dist/assets - run `npm run build` first.');
  process.exit(1);
}

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:5173/',
  pretendToBeVisual: true,
});

// Expose everything jsdom implements as a global, the way a browser would.
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.self = dom.window;
global.IS_REACT_ACT_ENVIRONMENT = false;

for (const key of [
  'HTMLElement', 'HTMLInputElement', 'HTMLFormElement', 'Element', 'Node', 'Event', 'MouseEvent',
  'KeyboardEvent', 'CustomEvent', 'MutationObserver', 'getComputedStyle',
  'DOMParser', 'Text', 'DocumentFragment', 'SVGElement',
  // NOTE: FormData/Blob/File stay bound to Node's native implementation so that
  // fetch() can actually serialise the multipart body.
]) {
  if (dom.window[key] !== undefined) global[key] = dom.window[key];
}

global.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
global.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);

const testId = (element, id) => element.querySelector(`[data-testid="${id}"]`);
global.window.fetch = global.fetch;

console.log(`Loading bundle ${bundle} …`);
await import(pathToFileURL(path.join(assetDir, bundle)).href);

const waitFor = async (predicate, { timeout = 8000, interval = 150 } = {}) => {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const value = predicate();
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  return null;
};

const root = document.getElementById('root');
const card = await waitFor(() => root.querySelector('.card:not(.skeleton-card)'));

if (!card) {
  console.error('\n✖ No post cards rendered. Root markup was:\n', root.innerHTML.slice(0, 600));
  process.exit(1);
}

const titles = [...root.querySelectorAll('.card h3')].map((node) => node.textContent);
const thumbs = root.querySelectorAll('img.card-thumb').length;
const header = root.querySelector('h1')?.textContent;
const endpoint = [...root.querySelectorAll('.pill')].map((n) => n.textContent).join(' | ');

console.log('\n✔ React bundle mounted and rendered server data\n');
console.log('  header    :', header);
console.log('  status    :', root.querySelector('.dot')?.className.replace('dot ', ''));
console.log('  cards     :', titles.length);
titles.forEach((title) => console.log('              •', title));
console.log('  thumbnails:', thumbs, '(asset URLs resolved from the DB document)');
console.log('  env strip :', endpoint);
console.log('  form      :', root.querySelector('form') ? 'PostForm present (' + root.querySelectorAll('form input, form textarea').length + ' fields)' : 'MISSING');
console.log('\nFirst card markup:\n' + card.outerHTML.slice(0, 320) + '…');
process.exit(0);
