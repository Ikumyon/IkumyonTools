import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

export function toolCatalog(root) {
  const tools = readdirSync(resolve(root, 'tools'), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .filter(entry => readdirSync(resolve(root, 'tools', entry.name)).includes('tool.json'))
    .map(({ name: id }) => {
      if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(id)) throw new Error(`Invalid tool ID: ${id}`);
      const manifest = JSON.parse(readFileSync(resolve(root, 'tools', id, 'tool.json'), 'utf8'));
      if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) throw new Error(`Invalid manifest: ${id}`);
      const text = JSON.parse(readFileSync(resolve(root, 'tools', id, 'locales/ja.json'), 'utf8'));
      if (typeof text?.name !== 'string' || !text.name.trim()) throw new Error(`Missing Japanese name: ${id}`);
      return { id, name: text.name.trim() };
    }).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  return { version: 1, tools };
}
