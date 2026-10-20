import { locale, t } from "../i18n";
import { languageName, orderToolLanguages } from "../i18n/languages.mjs";

function createLanguageList(codes: string[]): HTMLSpanElement {
  const list = document.createElement("span");
  const parts = new Intl.ListFormat(locale, { style: "short", type: "conjunction" }).formatToParts(codes);
  for (const part of parts) {
    if (part.type === "element") {
      const name = document.createElement("bdi");
      name.lang = part.value;
      name.textContent = languageName(part.value);
      list.appendChild(name);
    } else list.appendChild(document.createTextNode(part.value));
  }
  return list;
}

/** Shared by the list card and the detail sidebar. */
export function renderToolLanguages(languages: string[] | undefined): string {
  const field = document.createElement("dl");
  field.className = "tool-languages";
  field.title = t("common.toolLanguagesNote");
  const label = document.createElement("dt");
  label.textContent = t("common.toolLanguages");
  const value = document.createElement("dd");
  const codes = orderToolLanguages(languages, locale);
  if (codes.length) {
    const list = createLanguageList(codes);
    const count = document.createElement("span");
    count.className = "tool-language-count";
    count.textContent = t(codes.length === 1 ? "common.languageCountOne" : "common.languageCount", { count: codes.length });
    if (codes.length > 4 || (list.textContent?.length || 0) > 80) {
      const details = document.createElement("details");
      details.className = "tool-language-details";
      const summary = document.createElement("summary");
      summary.appendChild(count);
      const preview = createLanguageList(codes.slice(0, 3));
      preview.className = "tool-language-preview";
      preview.appendChild(document.createTextNode("…"));
      summary.appendChild(preview);
      list.className = "tool-language-list";
      details.append(summary, list);
      value.appendChild(details);
    } else {
      value.append(count, document.createTextNode(" · "), list);
    }
  } else value.textContent = t("common.languagesUnknown");
  field.append(label, value);
  return field.outerHTML;
}
