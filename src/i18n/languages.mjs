import { NATIVE_LANGUAGE_NAMES } from "./language-names.mjs";

/** Site languages: add a language here after its translations are ready. */
export const LANGUAGES = Object.freeze({
  ja: { nativeName: NATIVE_LANGUAGE_NAMES["ja-JP"], intlLocale: "ja-JP" },
  en: { nativeName: NATIVE_LANGUAGE_NAMES["en-US"], intlLocale: "en-US" },
});

/** @typedef {keyof typeof LANGUAGES} Locale */
export const SOURCE_LOCALE = /** @type {const} */ ("ja");
export const SUPPORTED_LOCALES = /** @type {Locale[]} */ (Object.keys(LANGUAGES));

/** @param {unknown} value @returns {value is Locale} */
export function isLocale(value) {
  return typeof value === "string" && Object.hasOwn(LANGUAGES, value);
}

/** Tool languages are independent of the site's translation languages. @param {unknown} value */
export function isLanguageTag(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try { return Intl.getCanonicalLocales(value).length === 1; } catch { return false; }
}

/** @param {unknown} languages @returns {string[]} */
export function normalizeToolLanguages(languages) {
  if (!Array.isArray(languages)) return [];
  return [...new Set(languages.filter(isLanguageTag).map((tag) => Intl.getCanonicalLocales(tag)[0]))];
}

/** Prefer the page language, including regional variants; preserve all other ordering.
 * @param {unknown} languages @param {Locale} displayLocale @returns {string[]}
 */
export function orderToolLanguages(languages, displayLocale) {
  const codes = normalizeToolLanguages(languages);
  const preferred = displayLocale.split("-")[0];
  const matches = (code) => code.split("-")[0] === preferred;
  return [...codes.filter(matches), ...codes.filter((code) => !matches(code))];
}

/** Language names always use their own language, independent of the page locale. @param {string} code */
export function languageName(code) {
  if (!isLanguageTag(code)) return code;
  const canonical = Intl.getCanonicalLocales(code)[0] || code;
  const names = /** @type {Readonly<Record<string, string>>} */ (NATIVE_LANGUAGE_NAMES);
  if (Object.hasOwn(names, canonical)) return names[canonical] || canonical;
  if (isLocale(canonical)) return LANGUAGES[canonical].nativeName;
  try {
    return new Intl.DisplayNames([canonical], { type: "language" }).of(canonical) || canonical;
  } catch { return code; }
}
