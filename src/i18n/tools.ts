import { locale, type Locale } from "./index";
import { overlayMarkdown, parseBlocks } from "./core.mjs";
import { SOURCE_LOCALE } from "./languages.mjs";
import type { ToolManifest, ToolText } from "../types";

// Fetch per-tool text at runtime so newly published tools do not depend on
// the list of locale files embedded in an older JavaScript bundle.
export async function localizeTool(manifest: ToolManifest, id: string): Promise<ToolManifest & ToolText> {
  const load = async (language: string): Promise<ToolText> => {
    const path = `tools/${encodeURIComponent(id)}/locales/${language}.json`;
    const response = await fetch(path, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Unable to load ${path}: ${response.status}`);
    const text = await response.json();
    if (typeof text?.name !== 'string' || !text.name.trim() || typeof text.description !== 'string') throw new Error(`Invalid tool text: ${id}/${language}`);
    return { name: text.name, description: text.description };
  };
  let text: ToolText;
  try { text = await load(locale); }
  catch (error) {
    if (locale === SOURCE_LOCALE) throw error;
    text = await load(SOURCE_LOCALE);
  }
  return { ...manifest, ...text };
}

async function fetchText(path: string): Promise<string> {
  const response = await fetch(path, { cache: 'no-cache' });
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
