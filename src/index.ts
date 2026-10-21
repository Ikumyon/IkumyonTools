import { t, localizedUrl, setupLanguage, locale } from "./i18n";
import { localizeTool } from "./i18n/tools";
import { renderToolLanguages } from "./components/tool-languages";
import { renderToolTags } from './components/tool-tags';
import { collectTags, matchesTags, selectedTags, tagUrl } from './utils/tags.mjs';
import { DEFAULT_PLACEHOLDER_ICON, PLATFORM_CONFIG } from "./config";
import { pageView } from './analytics';
import { fetchRelease } from "./api/github";
import { getUserEnvironment, resolveMatchingPlatform } from "./utils/platform";
import type { ToolManifest, ToolItem, PlatformKey, UserEnvironment } from "./types";

async function loadTools(): Promise<ToolItem[]> {
  const response = await fetch('tools-catalog.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error('Unable to load tool catalog');
  const catalog = await response.json() as { tools: { id: string }[] };
  const results = await Promise.all(
    catalog.tools.map(async ({ id }) => {
      try {
        const basePath = `tools/${id}`;
        const response = await fetch(`${basePath}/tool.json`, { cache: 'no-cache' });
        if (!response.ok) {
          throw new Error(`Failed to load ${id}`);
        }
        const manifest = await localizeTool(await response.json(), id);
        return { id, manifest, basePath };
      } catch (err) {
        console.warn(`ツール情報ロード失敗: ${id}`, err);
        return null;
      }
    })
  );

  return results.filter((item): item is ToolItem => item !== null);
}

/**
 * ツールマニフェストとユーザー利用環境から最適な初期ダウンロードURLを算出します。
 * 非対応の場合は null を返し、ダウンロードボタンを出さないようにします。
 */
function resolveInitialDownload(
  manifest: ToolManifest,
  env: UserEnvironment
): { url: string; filename: string; platform: PlatformKey } | null {
  const match = resolveMatchingPlatform(manifest.downloads, env);
  if (!match) return null;

  if (match.filename.startsWith("branch:")) {
    const branch = match.filename.replace("branch:", "");
    return {
      url: `https://github.com/${manifest.github}/archive/refs/heads/${branch}.zip`,
      filename: `${branch}.zip`,
      platform: match.platform,
    };
  }

  return {
    url: manifest.releaseTag
      ? `https://github.com/${manifest.github}/releases/download/${encodeURIComponent(manifest.releaseTag)}/${match.filename}`
      : `https://github.com/${manifest.github}/releases/latest/download/${match.filename}`,
    filename: match.filename,
    platform: match.platform,
  };
}

function createToolCard(tool: ToolItem, env: UserEnvironment): HTMLElement {
  const { id, manifest, basePath } = tool;
  const card = document.createElement("article");
  card.className = "tool-card";

  const iconSrc = manifest.icon ? `${basePath}/${manifest.icon}` : DEFAULT_PLACEHOLDER_ICON;
  const detailUrl = localizedUrl(`tool.html?tool=${encodeURIComponent(id)}`);
  const initialDownload = resolveInitialDownload(manifest, env);

  // 対応プラットフォームのアイコン生成
  const downloads = manifest.downloads || {};
  const platformsHtml = Object.keys(downloads)
    .filter((key): key is PlatformKey => key in PLATFORM_CONFIG)
    .map((key) => {
      const config = PLATFORM_CONFIG[key];
      return `<span class="platform-icon" title="${escapeHtml(config.label)}" aria-label="${escapeHtml(config.label)}"><i class="${config.iconClass}"></i></span>`;
    })
    .join("");

  // 非対応の場合はダウンロードボタンを出さない
  const downloadBtnHtml = initialDownload
    ? `<a class="button primary" data-download-btn="${id}" data-analytics-tool="${id}" data-platform="${initialDownload.platform}" href="${initialDownload.url}" download="${escapeHtml(initialDownload.filename)}">
         <i class="fa-solid fa-download"></i> ${t("common.download")}
       </a>`
    : "";

  card.innerHTML = `
    <a href="${detailUrl}" tabindex="-1" aria-hidden="true">
      <img class="tool-card-icon" src="${iconSrc}" alt="" loading="lazy" onerror="this.src='${DEFAULT_PLACEHOLDER_ICON}'">
    </a>
    <div class="tool-card-body">
      <a class="tool-card-summary-link" href="${detailUrl}">
        <div class="tool-card-top">
          <h2 class="tool-card-title">${escapeHtml(manifest.name)}</h2>
          <div class="tool-card-platforms" aria-label="${t("common.platforms")}">
            ${platformsHtml}
          </div>
        </div>
        <p class="tool-card-description">${escapeHtml(manifest.description)}</p>
      </a>
      ${renderToolTags(manifest)}
      ${renderToolLanguages(manifest.supportedLanguages)}
      <div class="tool-card-actions">
        ${downloadBtnHtml}
        <a class="button secondary" href="${detailUrl}">
          <i class="fa-solid fa-arrow-right"></i> ${t("common.details")}
        </a>
      </div>
    </div>
  `;

  return card;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function updateReleasesAndDownloads(tools: ToolItem[]): Promise<void> {
  await Promise.all(
    tools.map(async (tool) => {
      const btn = document.querySelector<HTMLAnchorElement>(`[data-download-btn="${tool.id}"]`);
      if (!btn) return;

      const targetPlatform = btn.getAttribute("data-platform");
      if (!targetPlatform) return;

      const result = await fetchRelease(tool.manifest.github, tool.manifest.releaseTag);
      const release = result.release;
      if (!release) return;

      const targetFilename = tool.manifest.downloads?.[targetPlatform];
      if (targetFilename && !targetFilename.startsWith("branch:")) {
        const asset = release.assets.find((a) => a.name === targetFilename);
        if (asset) {
          btn.href = asset.browser_download_url;
          btn.setAttribute("download", asset.name);
          btn.dataset.version = release.tag_name;
        }
      }
    })
  );
}

async function init(): Promise<void> {
  pageView({ page: 'home' });
  setupLanguage();
  const statusEl = document.getElementById("status");
  const gridEl = document.getElementById("tool-grid");

  if (!gridEl) return;

  try {
    const env = getUserEnvironment();
    const tools = await loadTools();
    if (tools.length === 0) {
      if (statusEl) {
        statusEl.className = "status error";
        statusEl.textContent = t("home.empty");
      }
      return;
    }

    const tags = collectTags(tools);
    const filter = document.createElement('section');
    filter.className = 'tag-filter';
    filter.setAttribute('aria-label', t('tags.filter'));
    const heading = document.createElement('h2');
    heading.textContent = t('tags.filter');
    const description = document.createElement('p');
    description.id = 'tag-filter-help';
    description.className = 'tag-filter-help';
    description.textContent = t('tags.help');
    const controls = document.createElement('div');
    controls.className = 'tag-chips';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', t('tags.filter'));
    controls.setAttribute('aria-describedby', description.id);
    const buttons = new Map<string, HTMLButtonElement>();
    for (const tag of tags) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tag-chip';
      button.textContent = `#${tag.label}`;
      button.addEventListener('click', () => {
        const current = selectedTags(new URL(location.href), tags);
        select(current.includes(tag.id) ? current.filter(id => id !== tag.id) : [...current, tag.id]);
      });
      controls.append(button);
      buttons.set(tag.id, button);
    }
    const selectedRow = document.createElement('div');
    selectedRow.className = 'tag-selection';
    const selectedLabel = document.createElement('span');
    selectedLabel.textContent = t('tags.selected');
    const removals = document.createElement('div');
    removals.className = 'tag-chips';
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'tag-clear';
    clear.textContent = t('tags.clear');
    clear.addEventListener('click', () => {
      select([]);
      buttons.values().next().value?.focus();
    });
    selectedRow.append(selectedLabel, removals, clear);
    const count = document.createElement('p');
    count.className = 'tag-result-count';
    count.setAttribute('role', 'status');
    count.setAttribute('aria-live', 'polite');
    count.setAttribute('aria-atomic', 'true');
    const empty = document.createElement('p');
    empty.className = 'tag-empty';
    empty.textContent = t('tags.empty');
    empty.hidden = true;
    const sortButton = document.createElement('button');
    sortButton.type = 'button';
    sortButton.className = 'tool-sort';
    const sortIcon = document.createElement('i');
    sortIcon.setAttribute('aria-hidden', 'true');
    sortButton.append(sortIcon);
    sortButton.addEventListener('click', () => {
      const url = new URL(location.href);
      if (url.searchParams.get('sort') !== 'desc') url.searchParams.set('sort', 'desc');
      else url.searchParams.delete('sort');
      if (url.href !== location.href) history.pushState(null, '', url);
      refresh();
    });
    const toolbar = document.createElement('div');
    toolbar.className = 'tool-toolbar';
    toolbar.append(count, sortButton);
    const collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });
    filter.append(heading, description, controls, selectedRow, toolbar);
    gridEl.before(filter);
    gridEl.after(empty);
    const fragment = document.createDocumentFragment();
    const cards = new Map<string, HTMLElement>();
    for (const tool of tools) {
      const card = createToolCard(tool, env);
      cards.set(tool.id, card);
      fragment.appendChild(card);
    }

    gridEl.appendChild(fragment);
    function refresh(): void {
      const url = new URL(location.href);
      const selected = selectedTags(url, tags);
      const normalized = tagUrl(url, selected);
      const descending = url.searchParams.get('sort') === 'desc';
      sortIcon.className = `fa-solid ${descending ? 'fa-arrow-down-z-a' : 'fa-arrow-down-a-z'}`;
      sortButton.title = `${t(descending ? 'sort.desc' : 'sort.asc')} → ${t(descending ? 'sort.asc' : 'sort.desc')}`;
      sortButton.setAttribute('aria-label', sortButton.title);
      if (!descending) normalized.searchParams.delete('sort');
      if (normalized.href !== url.href) history.replaceState(history.state, '', normalized);
      const ordered = [...tools].sort((a, b) => {
        const result = collator.compare(a.manifest.name, b.manifest.name);
        return (descending ? -result : result) || a.id.localeCompare(b.id);
      });
      for (const tool of ordered) gridEl!.append(cards.get(tool.id)!);
      let visible = 0;
      for (const tool of tools) {
        const matches = matchesTags(tool.manifest, selected);
        cards.get(tool.id)!.hidden = !matches;
        if (matches) visible++;
      }
      for (const tag of tags) {
        const active = selected.includes(tag.id);
        const button = buttons.get(tag.id)!;
        button.setAttribute('aria-pressed', String(active));
        button.textContent = `${active ? '✓ ' : ''}#${tag.label}`;
        button.setAttribute('aria-label', `#${tag.label}`);
      }
      removals.replaceChildren();
      for (const tag of tags.filter(tag => selected.includes(tag.id))) {
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'tag-chip tag-remove';
        remove.textContent = `#${tag.label} ×`;
        remove.setAttribute('aria-label', t('tags.remove', { tag: tag.label }));
        remove.addEventListener('click', () => {
          select(selected.filter(id => id !== tag.id));
          buttons.get(tag.id)!.focus();
        });
        removals.append(remove);
      }
      selectedRow.hidden = selected.length === 0;
      count.textContent = t(visible === 1 ? 'tags.countOne' : 'tags.count', { count: visible });
      empty.hidden = visible !== 0;
    }
    function select(selected: string[]): void {
      const url = new URL(location.href);
      const next = tagUrl(url, selectedTags(tagUrl(url, selected), tags));
      if (next.href !== location.href) history.pushState(null, '', next);
      refresh();
    }
    gridEl.addEventListener('click', event => {
      if (!(event instanceof MouseEvent) || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[data-tag]') : null;
      if (!target) return;
      event.preventDefault();
      const selected = selectedTags(new URL(location.href), tags);
      if (target.dataset.tag && !selected.includes(target.dataset.tag)) select([...selected, target.dataset.tag]);
    });
    window.addEventListener('popstate', refresh);
    refresh();
    if (statusEl) {
      statusEl.remove();
    }

    // 非同期でバージョン情報と最新ダウンロードURLを更新
    updateReleasesAndDownloads(tools);
  } catch (error) {
    console.error("ツール一覧の初期化に失敗しました:", error);
    if (statusEl) {
      statusEl.className = "status error";
      statusEl.textContent = t("home.error");
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

