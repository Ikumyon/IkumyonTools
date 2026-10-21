import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync(new URL('../src/analytics.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function setup(failure = false) {
  const calls = []; let handler; let scripts = 0;
  class Element {
    dataset = { analyticsTool: 'new-tool', platform: 'windows', version: 'v1' };
    closest() { return this; }
  }
  const api = {
    pageView: async page => { calls.push(['view', page]); },
    download: async (...args) => { calls.push(['download', ...args]); },
  };
  const exports = {};
  runInNewContext(source, {
    exports, Element, clearTimeout,
    window: { setTimeout, IkumyonAnalytics: { createTracker: () => api } },
    document: {
      createElement: () => ({}),
      head: { appendChild: script => { scripts++; failure ? script.onerror() : script.onload(); } },
      addEventListener: (_name, callback) => { handler = callback; },
    },
  });
  return { exports, calls, click: () => handler({ target: new Element(), defaultPrevented: false }), scripts: () => scripts };
}
const flush = () => new Promise(resolve => setImmediate(resolve));
test('shares one tracker and handles dynamically generated download buttons', async () => {
  const state = setup();
  state.exports.pageView({ page: 'home' });
  state.click(); await flush();
  assert.equal(state.scripts(), 1);
  assert.equal(state.calls[0][0], 'view');
  assert.deepEqual(state.calls[1], ['download', 'new-tool', 'windows', 'v1']);
});
test('blocked tracking script does not throw or block host clicks', async () => {
  const state = setup(true);
  state.exports.pageView({ page: 'home' }); state.click(); await flush();
  assert.equal(state.calls.length, 0);
});
