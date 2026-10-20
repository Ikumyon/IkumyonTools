import { t } from "../i18n";
import type { PlatformKey, ToolDownloads, UserOS, UserBrowser, UserEnvironment } from "../types";

interface NavigatorUAData {
  platform?: string;
}

/**
 * ユーザーのOS（実行環境）を安全に判定します。
 */
export function detectUserOS(): UserOS {
  if (typeof navigator === "undefined") {
    return "windows";
  }

  const nav = navigator as Navigator & { userAgentData?: NavigatorUAData };
  const platformString = (nav.userAgentData?.platform || nav.platform || "").toLowerCase();
  const ua = (navigator.userAgent || "").toLowerCase();
  const env = `${platformString} ${ua}`;

  if (env.includes("mac") || env.includes("darwin") || env.includes("os x")) {
    return "mac";
  }
  if (env.includes("linux") && !env.includes("android") && !env.includes("cros")) {
    return "linux";
  }
  if (env.includes("win")) {
    return "windows";
  }
  return "other";
}

/**
 * ユーザーのブラウザを安全に判定します。
 */
export function detectUserBrowser(): UserBrowser {
  if (typeof navigator === "undefined") {
    return "other";
  }

  const ua = (navigator.userAgent || "").toLowerCase();

  // Firefoxの判定
  if (ua.includes("firefox") || ua.includes("fxios")) {
    return "firefox";
  }

  // ChromeおよびChromium系（Edge, Brave, Vivaldi等を含むChrome拡張利用可能ブラウザ）
  if (ua.includes("chrome") || ua.includes("crios") || ua.includes("edg/")) {
    return "chrome";
  }

  // Safari
  if (ua.includes("safari") && !ua.includes("chrome")) {
    return "safari";
  }

  return "other";
}

const OS_LABEL_MAP: Record<UserOS, string> = {
  windows: "Windows",
  linux: "Linux",
  mac: "macOS",
  other: t("environment.otherOS"),
};

const BROWSER_LABEL_MAP: Record<UserBrowser, string> = {
  firefox: "Firefox",
  chrome: "Chrome",
  safari: "Safari",
  other: t("environment.otherBrowser"),
};

/**
 * ユーザーの利用環境情報（OS・ブラウザおよび表示ラベル）を総合取得します。
 */
export function getUserEnvironment(): UserEnvironment {
  const os = detectUserOS();
  const browser = detectUserBrowser();
  const osLabel = OS_LABEL_MAP[os];
  const browserLabel = BROWSER_LABEL_MAP[browser];
  const summaryLabel = `${osLabel} / ${browserLabel}`;

  return {
    os,
    browser,
    osLabel,
    browserLabel,
    summaryLabel,
  };
}

/**
 * 一覧カード用のダウンロード対象プラットフォームを決定します。
 *
 * 判定ルール：
 * 1. ツールがブラウザ拡張ツール（firefox または chrome キーを持つ）の場合:
 *    - Firefox閲覧時: firefox版があればそれを採用。無ければ null（出さない）
 *    - Chrome系閲覧時: chrome版があればそれを採用。無ければ null（出さない）
 *    - その他のブラウザ: null（出さない）
 * 2. ツールがデスクトップアプリの場合:
 *    - ユーザーのOSに合致する版があればそれを採用。無ければ null（出さない）
 */
export function resolveMatchingPlatform(
  downloads: ToolDownloads | undefined,
  env: UserEnvironment
): { platform: PlatformKey; filename: string } | null {
  if (!downloads) return null;

  const hasExtension = Boolean(downloads.firefox || downloads.chrome);
  const hasDesktop = Boolean(downloads.windows || downloads.linux || downloads.mac);

  // 1. ブラウザ拡張ツールの判定
  if (hasExtension) {
    if (env.browser === "firefox" && downloads.firefox) {
      return { platform: "firefox", filename: downloads.firefox };
    }
    if (env.browser === "chrome" && downloads.chrome) {
      return { platform: "chrome", filename: downloads.chrome };
    }
    // 拡張機能専用ツールで該当ブラウザ版がない場合は非対応（出さない）
    if (!hasDesktop) {
      return null;
    }
  }

  // 2. デスクトップアプリの判定
  if (hasDesktop) {
    const osKey = env.os as PlatformKey;
    if (downloads[osKey]) {
      return { platform: osKey, filename: downloads[osKey]! };
    }
    // OSに合致するものがなければ非対応（出さない）
    return null;
  }

  return null;
}

export interface ToolCompatibilityResult {
  isCompatible: boolean;
  recommendedPlatform?: PlatformKey;
  badgeLabel: string;
  badgeType: "success" | "warning";
  tooltipMessage?: string;
}

/**
 * 詳細ページ用：ツールが現在のユーザー環境に対応しているかを判定します。
 */
export function checkToolCompatibility(
  downloads: ToolDownloads | undefined,
  env: UserEnvironment
): ToolCompatibilityResult {
  if (!downloads || Object.keys(downloads).length === 0) {
    return {
      isCompatible: false,
      badgeLabel: t("environment.current", { environment: env.summaryLabel }),
      badgeType: "warning",
      tooltipMessage: t("environment.noDownloads"),
    };
  }

  const match = resolveMatchingPlatform(downloads, env);
  if (match) {
    return {
      isCompatible: true,
      recommendedPlatform: match.platform,
      badgeLabel: t("environment.current", { environment: env.summaryLabel }),
      badgeType: "success",
    };
  }

  // 非対応の場合の原因別メッセージ生成
  const hasExtension = Boolean(downloads.firefox || downloads.chrome);
  const hasDesktop = Boolean(downloads.windows || downloads.linux || downloads.mac);

  let rawMessage = "";
  if (hasExtension && !hasDesktop) {
    // 拡張機能ツールで非対応
    if (env.browser === "firefox") {
      rawMessage = t("environment.browser", { browser: "Firefox" });
    } else {
      rawMessage = t("environment.browser", { browser: env.browserLabel });
    }
  } else {
    // デスクトップツールで非対応
    rawMessage = t("environment.os", { os: env.osLabel });
  }

  return {
    isCompatible: false,
    recommendedPlatform: Object.keys(downloads)[0] as PlatformKey,
    badgeLabel: t("environment.unsupported", { environment: env.summaryLabel }),
    badgeType: "warning",
    tooltipMessage: t("environment.alternatives", { reason: rawMessage }),
  };
}
