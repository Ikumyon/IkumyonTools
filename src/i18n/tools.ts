import { locale, type Locale } from "./index";
import { overlayMarkdown, parseBlocks } from "./core.mjs";
import { SOURCE_LOCALE } from "./languages.mjs";
import type { ToolManifest, ToolText } from "../types";

// Vite includes these small text catalogs in both development and production.
const catalogs = import.meta.glob<ToolText>("../../tools/*/locales/*.json", {
  eager: true, import: "default",
});

export function localizeTool(manifest: ToolManifest, id: string): ToolManifest & ToolText {
  const text = catalogs[`../../tools/${id}/locales/${locale}.json`]
    || catalogs[`../../tools/${id}/locales/${SOURCE_LOCALE}.json`];
  if (!text) throw new Error(`Missing tool text: ${id}`);
  return { ...manifest, ...text };
}

async function fetchText(path: string): Promise<string> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Unable to load ${path}: ${response.status}`);
  return response.text();
}

export async function loadToolDetail(basePath: string, detail: string): Promise<{
  markdown: string; language: Locale; fallback: boolean;
}> {
  const source = await fetchText(`${basePath}/${detail}`);
  if (locale !== SOURCE_LOCALE) {
    try {
      const translated = await fetchText(`${basePath}/${detail.replace(/\.md$/, `.${locale}.md`)}`);
      return { markdown: overlayMarkdown(source, translated), language: locale, fallback: false };
    } catch (error) {
      console.warn(`Unable to overlay ${locale} tool description`, error);
    }
  }
  return { markdown: [...parseBlocks(source).values()].join("\n\n"), language: SOURCE_LOCALE, fallback: locale !== SOURCE_LOCALE };
}
