import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync(new URL('../src/api/github.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

test('fetches a published prerelease by tag without sharing the stable-release cache', async () => {
  const exports = {};
  const requests = [];
  const cache = new Map();
  runInNewContext(source, {
    exports, console, Date, encodeURIComponent,
    sessionStorage: { getItem: key => cache.get(key) || null, setItem: (key, value) => cache.set(key, value), removeItem: key => cache.delete(key) },
    fetch: async url => {
      requests.push(url);
      return Response.json({ tag_name: url.endsWith('/latest') ? 'v1.0.0' : 'v0.99.0', assets: [] });
    },
  });
  assert.equal((await exports.fetchRelease('Ikumyon/LiveVoiceBridge', 'v0.99.0')).release.tag_name, 'v0.99.0');
  assert.equal((await exports.fetchRelease('Ikumyon/LiveVoiceBridge')).release.tag_name, 'v1.0.0');
  assert.equal((await exports.fetchRelease('Ikumyon/LiveVoiceBridge', 'v0.99.0')).release.tag_name, 'v0.99.0');
  assert.deepEqual(requests, [
    'https://api.github.com/repos/Ikumyon/LiveVoiceBridge/releases/tags/v0.99.0',
    'https://api.github.com/repos/Ikumyon/LiveVoiceBridge/releases/latest',
  ]);
});
