import { createHash } from "node:crypto";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { parseBlocks, placeholders, SUPPORTED_LOCALES } from "../src/i18n/core.mjs";
import { isLanguageTag, normalizeToolLanguages, SOURCE_LOCALE } from "../src/i18n/languages.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(resolve(root, path), "utf8").replace(/\r\n?/g, "\n");
const json = (path) => JSON.parse(read(path));
export const sourceHash = (text) => createHash("sha256").update(text.trim()).digest("hex");

export function checkToolLanguages(languages, label = "tool") {
  if (languages === undefined) return [];
  if (!Array.isArray(languages)) return [`${label}: supportedLanguages must be an array`];
  if (languages.some((code) => !isLanguageTag(code))) return [`${label}: invalid supportedLanguages tag`];
  if (normalizeToolLanguages(languages).length !== languages.length) return [`${label}: duplicate supportedLanguages tags`];
  return [];
}

/** Check exact key/placeholder parity and source review records. */
export function checkCatalog(source, translated, reviewed = {}, label = "catalog") {
  const errors = [];
  for (const [key, value] of Object.entries(source)) {
    const target = translated[key];
    if (typeof target !== "string" || !target.trim()) {
      errors.push(`${label}: missing translation: ${key}`);
      continue;
    }
    if (JSON.stringify(placeholders(value)) !== JSON.stringify(placeholders(target))) {
      errors.push(`${label}: placeholders differ: ${key}`);
    }
    if (reviewed[key] !== sourceHash(value)) errors.push(`${label}: source needs review: ${key}`);
  }
  for (const key of Object.keys(translated)) {
    if (!Object.hasOwn(source, key)) errors.push(`${label}: unknown translation: ${key}`);
  }
  for (const key of Object.keys(reviewed)) {
    if (!Object.hasOwn(source, key)) errors.push(`${label}: obsolete review record: ${key}`);
  }
  return errors;
}

function documentReferences(markdown) {
  const references = [];
  marked.walkTokens(marked.lexer(markdown), (token) => {
    if (token.type === "image" || token.type === "link") references.push(token.href);
    if (token.type === "code" && token.lang === "mermaid") {
      for (const match of token.text.matchAll(/^\s*click\s+\S+\s+"([^"]+)"/gm)) references.push(match[1]);
    }
  });
  return references;
}

function checkReferences(markdown, base, label) {
  const errors = [];
  for (const reference of documentReferences(markdown)) {
    if (/^(?:[a-z][\w+.-]*:|\/\/|#)/i.test(reference)) continue;
    const url = new URL(reference, `https://local.invalid/${base}/`);
    const path = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (!existsSync(path)) errors.push(`${label}: missing reference: ${reference}`);
    const tool = url.searchParams.get("tool");
    if (tool && !existsSync(resolve(root, "tools", tool, "tool.json"))) {
      errors.push(`${label}: unknown linked tool: ${tool}`);
    }
  }
  return errors;
}

function scopes() {
  return ["ui", ...readdirSync(resolve(root, "tools"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory()).map((entry) => entry.name)];
}

function loadScope(scope, language) {
  if (scope === "ui") return json(`src/i18n/locales/${language}.json`);
  const base = `tools/${scope}`;
  const manifest = json(`${base}/tool.json`);
  const detail = language === SOURCE_LOCALE ? manifest.detail : manifest.detail.replace(/\.md$/, `.${language}.md`);
  const blocks = parseBlocks(read(`${base}/${detail}`));
  return { ...json(`${base}/locales/${language}.json`),
    ...Object.fromEntries([...blocks].map(([id, body]) => [`detail.${id}`, body])) };
}

function metadataPath(scope) {
  return scope === "ui" ? "src/i18n/translation.meta.json" : `tools/${scope}/translation.meta.json`;
}

export function checkTranslations() {
  const errors = [];
  const ui = json("src/i18n/locales/ja.json");
  // Detect misspelled IDs in static markup and literal t() calls as well.
  const sourceFiles = ["index.html", "tool.html"];
  function visit(path) {
    for (const entry of readdirSync(resolve(root, path), { withFileTypes: true })) {
      const child = `${path}/${entry.name}`;
      if (entry.isDirectory()) visit(child);
      else if (/\.(?:ts|mjs)$/.test(entry.name)) sourceFiles.push(child);
    }
  }
  visit("src");
  for (const path of sourceFiles) {
    for (const match of read(path).matchAll(/(?:\bt\(|data-i18n(?:-aria|-content)?=)["']([^"']+)["']/g)) {
      if (!Object.hasOwn(ui, match[1])) errors.push(`${path}: unknown UI ID: ${match[1]}`);
    }
  }
  for (const scope of scopes()) {
    try {
      const source = loadScope(scope, SOURCE_LOCALE);
      const metadata = json(metadataPath(scope));
      for (const language of SUPPORTED_LOCALES.filter((value) => value !== SOURCE_LOCALE)) {
        const target = loadScope(scope, language);
        errors.push(...checkCatalog(source, target, metadata[language], `${scope}/${language}`));
        if (scope !== "ui") {
          for (const [key, body] of Object.entries(target).filter(([key]) => key.startsWith("detail."))) {
            const label = `${scope}/${language}/${key}`;
            errors.push(...checkReferences(body, `tools/${scope}`, label));
            const originalRefs = documentReferences(source[key]).sort();
            const targetRefs = documentReferences(body).sort();
            if (JSON.stringify(originalRefs) !== JSON.stringify(targetRefs)) errors.push(`${label}: link/image targets differ from source`);
          }
        }
      }
      if (scope !== "ui") {
        const base = `tools/${scope}`;
        const manifest = json(`${base}/tool.json`);
        errors.push(...checkToolLanguages(manifest.supportedLanguages, scope));
        for (const file of [manifest.detail, manifest.icon, ...(manifest.images || [])].filter(Boolean)) {
          if (!existsSync(resolve(root, base, file))) errors.push(`${scope}: missing asset: ${file}`);
        }
        for (const [key, body] of Object.entries(source).filter(([key]) => key.startsWith("detail."))) {
          errors.push(...checkReferences(body, base, `${scope}/ja/${key}`));
        }
      }
    } catch (error) {
      errors.push(`${scope}: ${error.message}`);
    }
  }
  return errors;
}

/** Print a reviewable patch; never change files as a side effect. */
function reviewPatch(scope) {
  if (!scopes().includes(scope)) throw new Error(`Unknown scope: ${scope}`);
  const path = metadataPath(scope);
  const hashes = Object.fromEntries(Object.entries(loadScope(scope, SOURCE_LOCALE)).map(([id, body]) => [id, sourceHash(body)]));
  const metadata = Object.fromEntries(SUPPORTED_LOCALES.filter((value) => value !== SOURCE_LOCALE).map((language) => [language, hashes]));
  const body = JSON.stringify(metadata, null, 2);
  let patch = `*** Begin Patch\n`;
  if (existsSync(resolve(root, path))) {
    patch += `*** Update File: ${path}\n@@\n${read(path).trimEnd().split("\n").map((line) => `-${line}`).join("\n")}\n`;
  } else patch += `*** Add File: ${path}\n`;
  return `${patch}${body.split("\n").map((line) => `+${line}`).join("\n")}\n*** End Patch`;
}

function template(scope) {
  if (!scopes().includes(scope)) throw new Error(`Unknown scope: ${scope}`);
  const source = loadScope(scope, SOURCE_LOCALE);
  const text = Object.fromEntries(Object.entries(source).filter(([id]) => !id.startsWith("detail.")));
  // This is deliberately a draft, printed only; translate before applying.
  console.log(JSON.stringify(text, null, 2));
  if (scope !== "ui") console.log("\n" + Object.entries(source).filter(([id]) => id.startsWith("detail."))
    .map(([id, body]) => `<!-- i18n:${id.slice(7)} -->\n${body}`).join("\n\n"));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv[2] === "--review-patch") console.log(reviewPatch(process.argv[3]));
    else if (process.argv[2] === "--template") template(process.argv[3]);
    else {
      const errors = checkTranslations();
      if (errors.length) {
        console.error(errors.join("\n"));
        process.exitCode = 1;
      } else console.log(`Translations OK: ${SUPPORTED_LOCALES.join(" / ")}, UI and all tool descriptions.`);
    }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
