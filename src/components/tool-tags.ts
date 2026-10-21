import { localizedUrl, t } from '../i18n';
import type { ToolManifest, ToolText } from '../types';

export function renderToolTags(manifest: ToolManifest & ToolText): string {
  if (!manifest.tags?.length) return '';
  const container = document.createElement('div');
  container.className = 'tool-tags';
  container.setAttribute('role', 'group');
  container.setAttribute('aria-label', t('tags.label'));
  for (const id of new Set(manifest.tags)) {
    const link = document.createElement('a');
    link.className = 'tool-tag';
    link.dataset.tag = id;
    link.href = localizedUrl(`./?tag=${encodeURIComponent(id)}`);
    link.textContent = `#${manifest.tagLabels?.[id] || id}`;
    container.append(link);
  }
  return container.outerHTML;
}
