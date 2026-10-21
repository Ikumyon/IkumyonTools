import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
const source = ts.transpileModule(readFileSync(new URL('../src/i18n/tools.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function setup(locale, fetch) {
  const exports = {};
  runInNewContext(source, { exports, encodeURIComponent, fetch, require: path => path === './index' ? { locale } : path === './languages.mjs' ? { SOURCE_LOCALE: 'ja' } : {} });
  return exports;
}
test('loads newly added tool text without a compiled tool registry and revalidates caches', async () => {
  const api = setup('ja', async (path, options) => {
    assert.equal(path, 'tools/new-tool/locales/ja.json');
    assert.equal(options.cache, 'no-cache');
    return Response.json({ name: '新しいツール', description: '説明' });
  });
  const result = await api.localizeTool({ github: 'owner/new-tool' }, 'new-tool');
  assert.equal(result.name, '新しいツール'); assert.equal(result.github, 'owner/new-tool');
});
test('falls back to Japanese when translated text fails and rejects missing source text', async () => {
  const api = setup('en', async path => path.endsWith('/en.json') ? new Response(null, { status: 404 }) : Response.json({ name: '日本語', description: '説明' }));
  assert.equal((await api.localizeTool({}, 'new-tool')).name, '日本語');
  const missing = setup('ja', async () => new Response(null, { status: 404 }));
  await assert.rejects(missing.localizeTool({}, 'missing'), /Unable to load/);
  const invalid = setup('ja', async () => Response.json({ description: 'name missing' }));
  await assert.rejects(invalid.localizeTool({}, 'invalid'), /Invalid tool text/);
});
