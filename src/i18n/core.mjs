import { isLocale, SOURCE_LOCALE } from "./languages.mjs";
export { isLocale, SUPPORTED_LOCALES } from "./languages.mjs";

/**
 * Only explicit supported URL/storage values override the browser preferences.
 * @param {string | null} requested
 * @param {string | null} saved
 * @param {readonly string[]} languages
 * @returns {import("./languages.mjs").Locale}
 */
export function resolveLocale(requested, saved, languages) {
  if (isLocale(requested)) return requested;
  if (isLocale(saved)) return saved;
  for (const language of languages) {
    const base = language.toLowerCase().split("-")[0];
    if (isLocale(base)) return base;
  }
  return SOURCE_LOCALE;
}

/** @param {string} template @param {Record<string, string | number>} [values] */
export function interpolate(template, values = {}) {
  return template.replace(/\{([a-zA-Z][\w]*)\}/g, (match, name) =>
    Object.hasOwn(values, name) ? String(values[name]) : match
  );
}

/** @param {string} text */
export function placeholders(text) {
  return [...new Set([...text.matchAll(/\{([a-zA-Z][\w]*)\}/g)].map((m) => m[1]))].sort();
}

/**
 * Markers must occupy their own line. Fenced code is left untouched.
 * @param {string} markdown
 * @returns {Map<string, string>}
 */
export function parseBlocks(markdown) {
  const blocks = new Map();
  let id = "";
  let lines = [];
  let fence = "";
  let fenceLength = 0;
  const commit = () => {
    const body = lines.join("\n").trim();
    if (!id) {
      if (body) throw new Error("Text before the first i18n block");
    } else {
      if (!body) throw new Error(`Empty i18n block: ${id}`);
      blocks.set(id, body);
    }
    lines = [];
  };
  for (const line of markdown.replace(/\r\n?/g, "\n").split("\n")) {
    const delimiter = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (delimiter) {
      const run = delimiter[1];
      if (!fence) { fence = run[0]; fenceLength = run.length; }
      else if (run[0] === fence && run.length >= fenceLength && !delimiter[2].trim()) fence = "";
      lines.push(line);
      continue;
    }
    const marker = !fence && line.match(/^<!-- i18n:([a-z][a-z0-9-]*) -->\s*$/);
    if (marker) {
      commit();
      id = marker[1];
      if (blocks.has(id)) throw new Error(`Duplicate i18n block: ${id}`);
    } else {
      if (!fence && /<!--\s*i18n:/.test(line)) throw new Error(`Invalid i18n marker: ${line}`);
      lines.push(line);
    }
  }
  commit();
  if (!blocks.size) throw new Error("No i18n blocks");
  return blocks;
}

/** @param {string} source @param {string} translation */
export function overlayMarkdown(source, translation) {
  const original = parseBlocks(source);
  const translated = parseBlocks(translation);
  if (original.size !== translated.size || [...original.keys()].some((id) => !translated.has(id))) {
    throw new Error("Translated block IDs do not match the source");
  }
  return [...original.keys()].map((id) => translated.get(id)).join("\n\n");
}
