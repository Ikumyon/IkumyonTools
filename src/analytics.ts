type Tracker = {
  pageView(page: { page: 'home' } | { page: 'tool'; tool_id: string }): Promise<boolean>;
  download(id: string, platform: string, version?: string): Promise<boolean>;
};
const host = 'https://ikumyontools-analytics.ikumy-notify.workers.dev';
const exclusionKey = 'ikumyon-tools.analytics-disabled';
let excludedForPage = false;
function excluded(): boolean {
  try { return excludedForPage || localStorage.getItem(exclusionKey) === '1'; } catch { return excludedForPage; }
}
// Apply before either entry point can send the first page view.
try {
  const url = new URL(window.location.href);
  const preference = url.searchParams.get('analytics');
  if (preference === 'off' || preference === 'on') {
    excludedForPage = preference === 'off';
    try {
      if (excludedForPage) localStorage.setItem(exclusionKey, '1');
      else localStorage.removeItem(exclusionKey);
    } catch { /* Exclusion still applies to this page if storage is blocked. */ }
    url.searchParams.delete('analytics');
    history.replaceState(history.state, '', url);
  }
} catch { /* A restricted browser must not break the site. */ }
function showExclusion() {
  if (!excluded()) return;
  const notice = document.createElement('aside');
  notice.className = 'analytics-exclusion';
  notice.setAttribute('role', 'status');
  let saved = false;
  try { saved = localStorage.getItem(exclusionKey) === '1'; } catch { /* No persistent storage. */ }
  const text = document.createElement('span');
  text.textContent = saved ? 'このブラウザの計測を除外中 / Analytics excluded for this browser' : 'このページのみ計測を除外中（保存不可） / Excluded for this page only (storage unavailable)';
  const resume = document.createElement('a');
  const url = new URL(window.location.href);
  url.searchParams.set('analytics', 'on');
  resume.href = url.href;
  resume.textContent = '計測を再開 / Resume analytics';
  notice.append(text, resume);
  document.body.prepend(notice);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showExclusion);
else showExclusion();
let pending: Promise<Tracker | null> | undefined;
function tracker(): Promise<Tracker | null> {
  if (excluded()) return Promise.resolve(null);
  return pending ??= new Promise(resolve => {
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => resolve(null), 5000);
    script.src = `${host}/tracker.js`;
    script.async = true;
    script.onload = () => {
      clearTimeout(timeout);
      try {
        const api = (window as unknown as { IkumyonAnalytics: { createTracker(options: { endpoint: string }): Tracker } }).IkumyonAnalytics;
        resolve(api.createTracker({ endpoint: `${host}/v1/events` }));
      } catch { resolve(null); }
    };
    script.onerror = () => { clearTimeout(timeout); resolve(null); };
    document.head.appendChild(script);
  });
}
export function pageView(page: { page: 'home' } | { page: 'tool'; tool_id: string }): void {
  void tracker().then(api => !excluded() && api?.pageView(page)).catch(() => {});
}
document.addEventListener('click', event => {
  const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[data-analytics-tool][data-platform]') : null;
  if (!link || event.defaultPrevented || excluded()) return;
  void tracker().then(api => !excluded() && api?.download(link.dataset.analyticsTool!, link.dataset.platform!, link.dataset.version)).catch(() => {});
});
