import ja from "./locales/ja.json";
import { interpolate, resolveLocale } from "./core.mjs";
import { isLocale, LANGUAGES, SOURCE_LOCALE, SUPPORTED_LOCALES } from "./languages.mjs";

export type Locale = typeof SUPPORTED_LOCALES[number];
export type MessageKey = keyof typeof ja;
const catalogs = import.meta.glob<Record<MessageKey, string>>("./locales/*.json", {
  eager: true, import: "default",
});
const dictionaries = Object.fromEntries(SUPPORTED_LOCALES.map((code) => [
  code, catalogs[`./locales/${code}.json`],
])) as Record<Locale, Record<MessageKey, string>>;
const STORAGE_KEY = "ik_language";
let saved: string | null = null;
try { saved = localStorage.getItem(STORAGE_KEY); } catch { /* Storage can be disabled. */ }
export const locale: Locale = resolveLocale(
  new URLSearchParams(location.search).get("lang"), saved, navigator.languages || [navigator.language]
);

export function t(key: MessageKey, values: Record<string, string | number> = {}): string {
  return interpolate(dictionaries[locale]?.[key] || dictionaries[SOURCE_LOCALE][key], values);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat(LANGUAGES[locale].intlLocale).format(new Date(value));
}

export function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat(LANGUAGES[locale].intlLocale, {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).format(new Date(timestamp));
}

/** Preserve the current URL's tool, other query parameters and fragment. */
export function localizedUrl(href: string, language: Locale = locale): string {
  const url = new URL(href, location.href);
  url.searchParams.set("lang", language);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function setupLanguage(): void {
  document.documentElement.lang = locale;
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n as MessageKey);
  });
  document.querySelectorAll<HTMLElement>("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria as MessageKey));
  });
  const description = document.querySelector<HTMLMetaElement>("meta[name=description]");
  if (description?.dataset.i18nContent) description.content = t(description.dataset.i18nContent as MessageKey);
  document.querySelectorAll<HTMLAnchorElement>("a[data-local-link]").forEach((link) => {
    link.href = localizedUrl(link.href);
  });
  const select = document.querySelector<HTMLSelectElement>("#language-select");
  if (select) {
    select.replaceChildren(...SUPPORTED_LOCALES.map((code) => {
      const option = document.createElement("option");
      option.value = code;
      option.lang = code;
      option.textContent = LANGUAGES[code].nativeName;
      return option;
    }));
    select.value = locale;
    select.addEventListener("change", () => {
      const value = select.value;
      if (!isLocale(value)) return;
      try { localStorage.setItem(STORAGE_KEY, value); } catch { /* URL still works. */ }
      location.assign(localizedUrl(location.href, value));
    });
  }
}
