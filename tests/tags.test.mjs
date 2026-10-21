import test from 'node:test';
import assert from 'node:assert/strict';
import { collectTags, matchesTags, selectedTags, tagUrl, resolveTagLabels } from '../src/utils/tags.mjs';
import { readFileSync, readdirSync } from 'node:fs';
import { checkTags } from '../scripts/check-translations.mjs';

test('tags are generated in catalog order, deduplicated, and accept new categories', () => {
  const tools = [
    { manifest: { tags: ['ai'], tagLabels: { ai: 'AI' } } },
    { manifest: { tags: ['kancolle', 'ai'], tagLabels: { kancolle: '艦これ', ai: 'AI' } } },
    { manifest: {} },
    { manifest: { tags: ['new'] } },
  ];
  assert.deepEqual(collectTags(tools), [{ id: 'ai', label: 'AI' }, { id: 'kancolle', label: '艦これ' }, { id: 'new', label: 'new' }]);
  assert.ok(matchesTags(tools[2].manifest, []));
  assert.ok(!matchesTags(tools[2].manifest, ['ai']));
  assert.ok(matchesTags(tools[1].manifest, ['ai', 'kancolle']));
  assert.ok(!matchesTags(tools[0].manifest, ['ai', 'kancolle']));
});

test('translated labels fall back per tag to Japanese then ID', () => {
  assert.deepEqual(resolveTagLabels(['a', 'b', 'c'], { a: 'English', b: '' }, { a: '日本語', b: '原文' }), { a: 'English', b: '原文', c: 'c' });
});

test('tag URLs preserve language and history state can be restored from the URL', () => {
  const original = new URL('https://example.com/IkumyonTools/?lang=en#tools');
  const tags = [{ id: 'kancolle' }, { id: 'streaming' }];
  const next = tagUrl(original, ['kancolle', 'streaming']);
  assert.deepEqual(selectedTags(next, tags), ['kancolle', 'streaming']);
  assert.equal(next.searchParams.get('lang'), 'en');
  assert.equal(next.hash, '#tools');
  assert.deepEqual(selectedTags(original, tags), []);
  assert.deepEqual(selectedTags(tagUrl(original, ['unknown']), tags), []);
  assert.equal(tagUrl(next, []).href, original.href);
  assert.deepEqual(selectedTags(new URL('https://example.com/?tag=streaming&tag=unknown&tag=kancolle&tag=streaming'), tags), ['kancolle', 'streaming']);
  assert.deepEqual(selectedTags(new URL('https://example.com/?tag=kancolle'), tags), ['kancolle']);
  assert.deepEqual(tagUrl(original, ['kancolle', 'kancolle']).searchParams.getAll('tag'), ['kancolle']);
});

test('actual tool catalog supports AND filters and empty selections', () => {
  const root = new URL('../tools/', import.meta.url);
  const manifests = readdirSync(root, { withFileTypes: true }).filter(entry => entry.isDirectory())
    .map(entry => JSON.parse(readFileSync(new URL(`${entry.name}/tool.json`, root), 'utf8')));
  const count = tags => manifests.filter(manifest => matchesTags(manifest, tags)).length;
  assert.equal(count([]), manifests.length);
  assert.equal(count(['kancolle']), 5);
  assert.equal(count(['streaming']), 4);
  assert.equal(count(['kancolle', 'streaming']), 3);
  assert.equal(count(['kancolle', 'translation']), 0);
});

test('translation checks reject absent labels, inconsistent labels, duplicate and invalid IDs', () => {
  const registry = new Map();
  assert.deepEqual(checkTags(undefined, undefined), []);
  assert.deepEqual(checkTags(['ai'], { ai: 'AI' }, registry), []);
  assert.match(checkTags(['ai'], { ai: 'Other' }, registry).join(), /inconsistent/);
  assert.match(checkTags(['ai'], {}).join(), /missing/);
  assert.match(checkTags(['ai', 'ai'], { ai: 'AI' }).join(), /duplicate/);
  assert.match(checkTags(['#艦これ'], {}).join(), /invalid/);
});
