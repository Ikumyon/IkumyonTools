/** Tags retain catalog order; their IDs never depend on the displayed language. */
export function collectTags(tools) {
  const labels = new Map();
  for (const { manifest } of tools) {
    for (const id of manifest.tags || []) {
      if (!labels.has(id)) labels.set(id, manifest.tagLabels?.[id] || id);
    }
  }
  return [...labels].map(([id, label]) => ({ id, label }));
}

export function matchesTags(manifest, tags) {
  return tags.every(id => (manifest.tags || []).includes(id));
}

/** @returns {string[]} */
export function selectedTags(url, tags) {
  const requested = new Set(url.searchParams.getAll('tag'));
  return tags.filter(tag => requested.has(tag.id)).map(tag => tag.id);
}

export function tagUrl(url, tags) {
  const next = new URL(url);
  next.searchParams.delete('tag');
  for (const id of new Set(tags)) next.searchParams.append('tag', id);
  return next;
}

export function resolveTagLabels(tags, translated = {}, source = {}) {
  return Object.fromEntries((tags || []).map(id => [id,
    typeof translated?.[id] === 'string' && translated[id].trim() ? translated[id]
      : typeof source?.[id] === 'string' && source[id].trim() ? source[id] : id,
  ]));
}
