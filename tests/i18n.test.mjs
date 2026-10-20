import test from "node:test";
import assert from "node:assert/strict";
import { resolveLocale, interpolate, parseBlocks, overlayMarkdown } from "../src/i18n/core.mjs";
import { checkCatalog, checkToolLanguages, sourceHash } from "../scripts/check-translations.mjs";
import { LANGUAGES, SUPPORTED_LOCALES, isLocale, languageName, normalizeToolLanguages } from "../src/i18n/languages.mjs";

test("site languages come from one registry and exclude inherited object properties", () => {
  assert.deepEqual(SUPPORTED_LOCALES, Object.keys(LANGUAGES));
  for (const language of SUPPORTED_LOCALES) {
    assert.equal(isLocale(language), true);
    assert.ok(LANGUAGES[language].nativeName);
    assert.doesNotThrow(() => new Intl.DateTimeFormat(LANGUAGES[language].intlLocale));
  }
  assert.equal(isLocale("constructor"), false);
  assert.equal(isLocale("__proto__"), false);
  assert.equal(isLocale(null), false);
});

test("tool languages are validated and named in their own language", () => {
  assert.deepEqual(checkToolLanguages(["ja", "en", "fr", "zh-Hant"]), []);
  assert.equal(isLocale("fr"), false);
  assert.deepEqual(checkToolLanguages(undefined), []);
  assert.deepEqual(checkToolLanguages([]), []);
  assert.match(checkToolLanguages("en").join(), /array/);
  assert.match(checkToolLanguages(["en", "EN"]).join(), /duplicate/);
  assert.match(checkToolLanguages(["<script>"]).join(), /invalid/);
  assert.match(checkToolLanguages([42]).join(), /invalid/);
  assert.deepEqual(normalizeToolLanguages(["en", "EN", "ja", "<script>"]), ["en", "ja"]);
  assert.deepEqual(normalizeToolLanguages(undefined), []);
  assert.equal(languageName("ja"), "日本語");
  assert.equal(languageName("en"), "English");
  assert.equal(languageName("en-US"), "English");
  assert.equal(languageName("ja-JP"), "日本語");
  assert.equal(languageName("zh-CN"), "简体中文");
  assert.equal(languageName("zh-TW"), "繁體中文");
  assert.equal(languageName("fr"), "français");
});

test("language precedence, regional preferences, and unsupported values", () => {
  assert.equal(resolveLocale("en", "ja", ["ja-JP"]), "en");
  assert.equal(resolveLocale(null, "en", ["ja-JP"]), "en");
  assert.equal(resolveLocale("xx", "xx", ["fr", "en-GB", "ja"]), "en");
  assert.equal(resolveLocale(null, null, ["ja-JP", "en-US"]), "ja");
  assert.equal(resolveLocale(null, null, ["fr-FR"]), "ja");
});

test("interpolation allows sentence reordering and preserves literal values", () => {
  assert.equal(interpolate("{minutes} minutes, until {time}", { time: "3:00 PM", minutes: 2 }), "2 minutes, until 3:00 PM");
  assert.equal(interpolate("{value}", { value: "$&{other}" }), "$&{other}");
  assert.equal(interpolate("{missing}"), "{missing}");
});

test("overlay follows source order and is independent of translated block order", () => {
  const source = "<!-- i18n:intro -->\n原文\n<!-- i18n:setup -->\n導入";
  const target = "<!-- i18n:setup -->\nSetup\n<!-- i18n:intro -->\nIntroduction";
  assert.equal(overlayMarkdown(source, target), "Introduction\n\nSetup");
  assert.throws(() => overlayMarkdown(source, "<!-- i18n:intro -->\nOnly intro"), /IDs/);
});

test("reject invalid document structure without interpreting code as markers", () => {
  assert.throws(() => parseBlocks("No markers"), /before/);
  assert.throws(() => parseBlocks("<!-- i18n:a -->\nA\n<!-- i18n:a -->\nB"), /Duplicate/);
  assert.throws(() => parseBlocks("<!-- i18n:a -->"), /Empty/);
  assert.throws(() => parseBlocks("<!-- i18n:a -->\nA\n<!-- i18n:Wrong -->"), /Invalid/);
  const text = "<!-- i18n:example -->\r\n~~~~md\r\n<!-- i18n:sample -->\r\n~~~~\r\n";
  assert.equal(parseBlocks(text).size, 1);
  assert.match(parseBlocks(text).get("example"), /i18n:sample/);
});

test("translation check rejects missing IDs, bad variables and stale source reviews", () => {
  const source = { reset: "解除 {time}", heading: "見出し" };
  const reviewed = Object.fromEntries(Object.entries(source).map(([id, body]) => [id, sourceHash(body)]));
  assert.deepEqual(checkCatalog(source, { reset: "Resets {time}", heading: "Heading" }, reviewed), []);
  assert.match(checkCatalog(source, { reset: "Resets {hour}", extra: "Extra" }, reviewed).join("\n"), /placeholders differ/);
  assert.match(checkCatalog(source, { reset: "Resets {time}" }, reviewed).join("\n"), /missing translation: heading/);
  assert.match(checkCatalog(source, { reset: "Resets {time}", heading: "Heading", extra: "Extra" }, reviewed).join("\n"), /unknown translation: extra/);
  assert.match(checkCatalog({ ...source, heading: "新しい見出し" }, { reset: "Resets {time}", heading: "Heading" }, reviewed).join("\n"), /source needs review: heading/);
  assert.equal(sourceHash("text\n"), sourceHash("text"));
});
