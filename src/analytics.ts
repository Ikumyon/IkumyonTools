type Tracker = {
  pageView(page: { page: 'home' } | { page: 'tool'; tool_id: string }): Promise<boolean>;
  download(id: string, platform: string, version?: string): Promise<boolean>;
};
const host = 'https://ikumyontools-analytics.ikumy-notify.workers.dev';
let pending: Promise<Tracker | null> | undefined;
function tracker(): Promise<Tracker | null> {
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
  void tracker().then(api => api?.pageView(page)).catch(() => {});
}
document.addEventListener('click', event => {
  const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[data-analytics-tool][data-platform]') : null;
  if (!link || event.defaultPrevented) return;
  void tracker().then(api => api?.download(link.dataset.analyticsTool!, link.dataset.platform!, link.dataset.version)).catch(() => {});
});
