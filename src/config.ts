import { t } from "./i18n";
import type { PlatformKey } from "./types";

export const TOOL_IDS: readonly string[] = [
  "autolingua2",
  "kancolle-notify",
  "kancolle-stream-overlay",
  "kco-relay",
  "kco-senka-reader",
  "kco-title-fetcher",
] as const;

export const DEFAULT_PLACEHOLDER_ICON = "assets/tool-placeholder.svg";

export interface PlatformMeta {
  label: string;
  iconClass: string;
}

export const PLATFORM_CONFIG: Record<PlatformKey, PlatformMeta> = {
  windows: { label: "Windows", iconClass: "fa-brands fa-windows" },
  linux: { label: "Linux", iconClass: "fa-brands fa-linux" },
  mac: { label: "macOS", iconClass: "fa-brands fa-apple" },
  chrome: { get label() { return t("platform.chrome"); }, iconClass: "fa-brands fa-chrome" },
  firefox: { get label() { return t("platform.firefox"); }, iconClass: "fa-brands fa-firefox-browser" },
};

