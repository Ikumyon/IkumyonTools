import { t, formatDate, formatTime, setupLanguage } from "./i18n";
import { localizeTool, loadToolDetail } from "./i18n/tools";
import { pageView } from './analytics';
import { renderToolLanguages } from "./components/tool-languages";
import { DEFAULT_PLACEHOLDER_ICON, PLATFORM_CONFIG } from "./config";
import { fetchLatestRelease } from "./api/github";
import { formatBytes } from "./utils/format";
import { getUserEnvironment, checkToolCompatibility } from "./utils/platform";
import { renderMarkdown, setupRenderedMarkdownEffects } from "./utils/markdown";
import type {
  ToolManifest,
  ToolText,
  FetchReleaseResult,
  DownloadOption,
  PlatformKey,
} from "./types";
import type { ToolCompatibilityResult } from "./utils/platform";

function getToolIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("tool");
}

function buildDownloadOptions(
  manifest: ToolManifest & ToolText,
  releaseResult: FetchReleaseResult,
  compat: ToolCompatibilityResult
): DownloadOption[] {
  const options: DownloadOption[] = [];
  const downloads = manifest.downloads || {};
  const { release, error } = releaseResult;

  for (const [key, value] of Object.entries(downloads)) {
    if (!value) continue;
    const platformKey = key as PlatformKey;
    const config = PLATFORM_CONFIG[platformKey] || {
      label: key.toUpperCase(),
      iconClass: "fa-solid fa-box",
    };

    let url = "";
    let filename = "";
    let sizeText = "";
    let statusReason = "";

    if (value.startsWith("branch:")) {
      // 拡張機能などのブランチZIP
      const branch = value.replace("branch:", "");
      url = `https://github.com/${manifest.github}/archive/refs/heads/${branch}.zip`;
      filename = `${branch}.zip`;
      statusReason = t("release.branch");
    } else {
      // 通常のGitHub Releasesアセット
      filename = value;
      url = `https://github.com/${manifest.github}/releases/latest/download/${filename}`;

      if (release) {
        const asset = release.assets.find((a) => a.name === filename);
        if (asset) {
          url = asset.browser_download_url;
          sizeText = formatBytes(asset.size);
        } else {
          statusReason = t("release.noAsset");
        }
      } else if (error) {
        if (error.type === "rate_limit") {
          const resetTime = formatTime(error.rateLimit?.resetTimestamp || Date.now());
          statusReason = t("release.limitedSize", { time: resetTime });
        } else if (error.type === "not_found") {
          statusReason = t("release.noRelease");
        } else {
          statusReason = t("release.sizeError");
        }
      }
    }

    const isRecommended = compat.isCompatible && platformKey === compat.recommendedPlatform;

    options.push({
      platform: platformKey,
      label: config.label,
      iconClass: config.iconClass,
      filename,
      sizeText,
      statusReason,
      url,
      isRecommended,
    });
  }

  // おすすめ（ユーザー環境に合致するもの）があれば先頭に並べ替え
  options.sort((a, b) => {
    if (a.isRecommended && !b.isRecommended) return -1;
    if (!a.isRecommended && b.isRecommended) return 1;
    return 0;
  });

  return options;
}

function renderSidebar(
  manifest: ToolManifest & ToolText,
  basePath: string,
  downloadOptions: DownloadOption[],
  releaseResult: FetchReleaseResult,
  compat: ToolCompatibilityResult
): HTMLElement {
  const sidebar = document.createElement("aside");
  sidebar.className = "detail-sidebar";

  const { release, error } = releaseResult;
  const iconSrc = manifest.icon ? `${basePath}/${manifest.icon}` : DEFAULT_PLACEHOLDER_ICON;
  
  const versionText = release?.tag_name || t("release.latest");
  
  const releaseDateText = release?.published_at
    ? formatDate(release.published_at)
    : null;

  const hasMultiplePlatforms = downloadOptions.length > 1;

  const tabsHtml = downloadOptions.length > 0
    ? `
      <div class="platform-tabs" role="${hasMultiplePlatforms ? 'tablist' : 'group'}" aria-label="${t("common.platforms")}">
        ${downloadOptions
          .map(
            (opt, idx) => `
          ${hasMultiplePlatforms ? `<button class="platform-tab ${idx === 0 ? "active" : ""}"
                  type="button"
                  role="tab"
                  aria-selected="${idx === 0}"
                  data-platform-tab="${opt.platform}">` : '<span class="platform-tab platform-label active">'}
            <i class="${opt.iconClass}"></i> ${escapeHtml(opt.label)}
          ${hasMultiplePlatforms ? '</button>' : '</span>'}
        `
          )
          .join("")}
      </div>
    `
    : "";

  const downloadPanelsHtml =
    downloadOptions.length > 0
      ? downloadOptions
          .map((opt, idx) => {
            const isRateLimit = error?.type === "rate_limit";
            const sizeHtml = opt.sizeText
              ? `<span class="tooltip-size"><i class="fa-solid fa-hard-drive"></i> ${escapeHtml(opt.sizeText)}</span>`
              : opt.statusReason
                ? `<span class="tooltip-size ${isRateLimit ? "warning" : "muted"}"><i class="fa-solid ${isRateLimit ? "fa-triangle-exclamation" : "fa-circle-info"}"></i> ${escapeHtml(opt.statusReason)}</span>`
                : "";

            const tooltipContent = `
              <span class="tooltip-filename"><i class="fa-regular fa-file"></i> ${escapeHtml(opt.filename)}</span>
              ${sizeHtml}
            `;

            return `
              <div class="download-panel" data-platform-panel="${opt.platform}" ${idx > 0 ? "hidden" : ""}>
                <a class="button primary download-action-btn"
                   style="width: 100%; justify-content: center; min-height: 46px; font-size: 0.95rem;"
                   href="${opt.url}" download="${escapeHtml(opt.filename)}">
                  <i class="fa-solid fa-download"></i> ${t("common.download")}
                  <div class="download-tooltip">
                    ${tooltipContent}
                  </div>
                </a>
              </div>
            `;
          })
          .join("")
      : `<p class="muted">${t("detail.noDownloads")}</p>`;

  // 非対応環境時のみ表示するツールチップ付きバッジ（場所は見出し直下）
  const envBadgeHtml = !compat.isCompatible
    ? `
      <div class="env-badge-container">
        <span class="env-badge warning has-custom-tooltip" tabindex="0" role="note">
          <i class="fa-solid fa-triangle-exclamation"></i>
          ${escapeHtml(compat.badgeLabel)}
          <span class="custom-tooltip">
            ${escapeHtml(compat.tooltipMessage || t("environment.noDownloads"))}
          </span>
        </span>
      </div>
    `
    : "";

  // バージョン欄のHTML（レート制限時は「最新版 ⚠️」全体がホバー対象）
  const versionHtml = error?.type === "rate_limit" && error.rateLimit
    ? `
      <div class="meta-row">
        <span class="meta-label">${t("detail.version")}</span>
        <span class="meta-value version-value-with-tooltip has-custom-tooltip" tabindex="0" role="note" aria-label="${t("release.rateLimit")}">
          ${t("release.latest")} <i class="fa-solid fa-triangle-exclamation"></i>
          <span class="custom-tooltip">
            <strong>${t("release.rateLimit")}</strong><br>
            ${t("release.rateLimitDescription")}<br>
            ${escapeHtml(t("release.reset", { time: formatTime(error.rateLimit.resetTimestamp), minutes: error.rateLimit.minutesUntilReset }))}
          </span>
        </span>
      </div>
    `
    : versionText
      ? `
      <div class="meta-row">
        <span class="meta-label">${t("detail.version")}</span>
        <span class="meta-value">${escapeHtml(versionText)}</span>
      </div>
    `
      : "";

  sidebar.innerHTML = `
    <div class="sidebar-card">
      <div class="sidebar-header-part">
        <img class="sidebar-icon" src="${iconSrc}" alt="" onerror="this.src='${DEFAULT_PLACEHOLDER_ICON}'">
        <div>
          <h1 class="sidebar-title">${escapeHtml(manifest.name)}</h1>
        </div>
      </div>

      <div class="sidebar-download-part">
        <h2>${t("detail.downloads")}</h2>
        ${envBadgeHtml}
        ${tabsHtml}
        ${downloadPanelsHtml}
      </div>

      <div class="sidebar-meta-part">
        ${renderToolLanguages(manifest.supportedLanguages)}
        ${versionHtml}
        ${
          releaseDateText
            ? `
          <div class="meta-row">
            <span class="meta-label">${t("detail.updated")}</span>
            <span class="meta-value">${escapeHtml(releaseDateText)}</span>
          </div>
        `
            : ""
        }
        <div class="meta-row meta-row-link">
          <a class="sidebar-github-link" href="https://github.com/${manifest.github}" target="_blank" rel="noreferrer">
            <i class="fa-brands fa-github"></i> ${t("detail.source")}
          </a>
        </div>
      </div>
    </div>
  `;

  // タブ切り替えのクリックイベント設定
  if (hasMultiplePlatforms) {
    const tabs = sidebar.querySelectorAll<HTMLButtonElement>("[data-platform-tab]");
    const panels = sidebar.querySelectorAll<HTMLElement>("[data-platform-panel]");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetPlatform = tab.getAttribute("data-platform-tab");

        tabs.forEach((t) => {
          const isActive = t === tab;
          t.classList.toggle("active", isActive);
          t.setAttribute("aria-selected", String(isActive));
        });

        panels.forEach((p) => {
          const isTarget = p.getAttribute("data-platform-panel") === targetPlatform;
          p.hidden = !isTarget;
        });
      });
    });
  }

  return sidebar;
}

function renderGallery(images: string[], basePath: string): HTMLElement {
  const gallery = document.createElement("section");
  gallery.className = "detail-gallery";

  const resolvedImages = images.map((img) => `${basePath}/${img}`);

  gallery.innerHTML = `
    <div class="gallery-carousel">
      <div class="gallery-main-wrapper">
        <img class="gallery-bg-blur" src="${resolvedImages[0]}" alt="" aria-hidden="true">
        <div class="gallery-main-viewport">
          <div class="gallery-main-track" id="gallery-track">
            ${resolvedImages
              .map(
                (src) => `
              <div class="gallery-main-slide">
                <img class="gallery-main-img" src="${src}" alt="${t("gallery.screenshot")}" loading="lazy">
              </div>
            `
              )
              .join("")}
          </div>
        </div>
        ${
          resolvedImages.length > 1
            ? `
          <button class="gallery-nav prev" type="button" aria-label="${t("gallery.previous")}">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <button class="gallery-nav next" type="button" aria-label="${t("gallery.next")}">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        `
            : ""
        }
      </div>

      ${
        resolvedImages.length > 1
          ? `
        <div class="gallery-thumbs">
          ${resolvedImages
            .map(
              (src, idx) => `
            <button class="gallery-thumb ${idx === 0 ? "active" : ""}" type="button" data-index="${idx}" aria-label="${t("gallery.show", { number: idx + 1 })}">
              <img src="${src}" alt="" loading="lazy">
            </button>
          `
            )
            .join("")}
        </div>
      `
          : ""
      }
    </div>
  `;

    // カルーセル機能のバインド
  if (resolvedImages.length > 1) {
    let currentIndex = 0;
    const track = gallery.querySelector<HTMLElement>("#gallery-track");
    const bgBlur = gallery.querySelector<HTMLImageElement>(".gallery-bg-blur");
    const prevBtn = gallery.querySelector<HTMLButtonElement>(".gallery-nav.prev");
    const nextBtn = gallery.querySelector<HTMLButtonElement>(".gallery-nav.next");
    const thumbs = gallery.querySelectorAll<HTMLButtonElement>(".gallery-thumb");

    const updateSlide = (newIndex: number) => {
      currentIndex = (newIndex + resolvedImages.length) % resolvedImages.length;
      if (track) {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
      }
      if (bgBlur) {
        bgBlur.src = resolvedImages[currentIndex] || "";
      }
      thumbs.forEach((thumb, idx) => {
        thumb.classList.toggle("active", idx === currentIndex);
      });
    };

    // 自動スライド（オートプレイ）
    const INTERVAL_MS = 4500;
    let autoPlayTimer: number | null = null;
    let isHovered = false;

    const stopAutoPlay = () => {
      if (autoPlayTimer !== null) {
        window.clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    };

    const startAutoPlay = () => {
      stopAutoPlay();
      if (isHovered || document.hidden) return;
      autoPlayTimer = window.setInterval(() => {
        updateSlide(currentIndex + 1);
      }, INTERVAL_MS);
    };

    gallery.addEventListener("mouseenter", () => {
      isHovered = true;
      stopAutoPlay();
    });

    gallery.addEventListener("mouseleave", () => {
      isHovered = false;
      startAutoPlay();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAutoPlay();
      } else {
        startAutoPlay();
      }
    });

    prevBtn?.addEventListener("click", () => {
      updateSlide(currentIndex - 1);
      startAutoPlay();
    });
    nextBtn?.addEventListener("click", () => {
      updateSlide(currentIndex + 1);
      startAutoPlay();
    });
    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        const idx = Number(thumb.getAttribute("data-index"));
        updateSlide(idx);
        startAutoPlay();
      });
    });

    startAutoPlay();
  }

  return gallery;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function initDetail(): Promise<void> {
  setupLanguage();
  const statusEl = document.getElementById("detail-status");
  const detailArticle = document.getElementById("tool-detail");

  if (!detailArticle) return;

  const toolId = getToolIdFromUrl();
  if (!toolId) {
    if (statusEl) {
      statusEl.className = "status error";
      statusEl.textContent = t("detail.missing");
    }
    return;
  }

  const basePath = `tools/${encodeURIComponent(toolId)}`;

  try {
    const catalogResponse = await fetch('tools-catalog.json', { cache: 'no-cache' });
    if (!catalogResponse.ok) throw new Error('Unable to load tool catalog');
    const catalog = await catalogResponse.json() as { tools: { id: string }[] };
    if (!catalog.tools.some(tool => tool.id === toolId)) throw new Error('Unknown tool');
    const manifestRes = await fetch(`${basePath}/tool.json`, { cache: 'no-cache' });
    if (!manifestRes.ok) {
      throw new Error(`ツール情報 (tool.json) の取得に失敗しました: ${toolId}`);
    }
    const manifest = await localizeTool(await manifestRes.json(), toolId);
    pageView({ page: 'tool', tool_id: toolId });

    document.title = `${manifest.name} | Ikumyon Tools`;

    // Release情報とMarkdownを並行取得
    const [releaseResult, detail] = await Promise.all([
      fetchLatestRelease(manifest.github),
      manifest.detail
        ? loadToolDetail(basePath, manifest.detail)
        : Promise.resolve(null),
    ]);

    const env = getUserEnvironment();
    const compat = checkToolCompatibility(manifest.downloads, env);
    const downloadOptions = buildDownloadOptions(manifest, releaseResult, compat);

    // 2分割レイアウトコンテナの作成
    const layout = document.createElement("div");
    layout.className = "detail-layout";

    // 左カラム（メインコンテンツ）
    const mainCol = document.createElement("div");
    mainCol.className = "detail-main";

    // ギャラリー（画像がある場合）
    if (manifest.images && manifest.images.length > 0) {
      mainCol.appendChild(renderGallery(manifest.images, basePath));
    }

    // Markdownコンテンツ
    const contentEl = document.createElement("div");
    contentEl.className = "detail-content";

    if (detail) {
      contentEl.lang = detail.language;
      if (detail.fallback) {
        const notice = document.createElement("p");
        notice.className = "translation-notice";
        notice.setAttribute("role", "status");
        notice.textContent = t("detail.fallback");
        mainCol.appendChild(notice);
      }
      contentEl.innerHTML = await renderMarkdown(detail.markdown, basePath);
      await setupRenderedMarkdownEffects(contentEl);
    } else {
      contentEl.innerHTML = `<p class="detail-empty">${t("detail.empty")}</p>`;
    }

    mainCol.appendChild(contentEl);

    // 右カラム（サイドバーカード）
    const sidebarCol = renderSidebar(manifest, basePath, downloadOptions, releaseResult, compat);
    sidebarCol.querySelectorAll<HTMLAnchorElement>('a.download-action-btn').forEach(link => {
      link.dataset.analyticsTool = toolId;
      const panel = link.closest<HTMLElement>('[data-platform-panel]');
      link.dataset.platform = panel?.dataset.platformPanel || '';
      if (releaseResult.release && !manifest.downloads?.[link.dataset.platform]?.startsWith('branch:')) {
        link.dataset.version = releaseResult.release.tag_name;
      }
    });

    layout.appendChild(mainCol);
    layout.appendChild(sidebarCol);

    detailArticle.innerHTML = "";
    detailArticle.appendChild(layout);
    detailArticle.hidden = false;

    if (statusEl) {
      statusEl.remove();
    }
  } catch (err) {
    console.error("詳細画面の読み込みに失敗しました:", err);
    if (statusEl) {
      statusEl.className = "status error";
      statusEl.textContent = t("detail.error");
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDetail);
} else {
  initDetail();
}
