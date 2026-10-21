import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { readdirSync, existsSync } from 'node:fs';
import { toolCatalog } from '../scripts/tool-catalog.mjs';

test('catalog discovers all manifests with Japanese names in stable ID order', () => {
  const catalog = toolCatalog(fileURLToPath(new URL('..', import.meta.url)));
  assert.equal(catalog.version, 1);
  const ids = readdirSync(new URL('../tools/', import.meta.url)).filter(id => existsSync(new URL(`../tools/${id}/tool.json`, import.meta.url))).sort();
  assert.deepEqual(catalog.tools.map(tool => tool.id), ids);
  assert.deepEqual(catalog.tools.map(tool => tool.id), catalog.tools.map(tool => tool.id).sort());
  assert.equal(catalog.tools[0].name, 'AUTOlingua Desktop');
});

test('adding a manifest automatically registers a tool without an ID list', () => {
  assert.deepEqual(toolCatalog(fileURLToPath(new URL('./fixtures/catalog/', import.meta.url))), {
    version: 1, tools: [{ id: 'new-tool', name: '新規ツール' }],
  });
});

test('rejects malformed manifests, missing Japanese names, and invalid IDs', () => {
  for (const fixture of ['invalid-catalog', 'missing-name', 'invalid-id']) {
    assert.throws(() => toolCatalog(fileURLToPath(new URL(`./fixtures/${fixture}/`, import.meta.url))));
  }
});
