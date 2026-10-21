export interface ToolDownloads {
  windows?: string;
  linux?: string;
  chrome?: string;
  firefox?: string;
  mac?: string;
  [key: string]: string | undefined;
}

export interface ToolManifest {
  github: string;
  tags?: string[];
  /** Pin a published release, including prereleases; omitted uses the latest stable release. */
  releaseTag?: string;
  /** UI languages of the tool itself. Empty or omitted means unconfirmed. */
  supportedLanguages?: string[];
  icon?: string;
  images?: string[];
  detail?: string;
  downloads?: ToolDownloads;
}

export interface ToolText {
  name: string;
  description: string;
  tagLabels?: Record<string, string>;
}

export interface ToolItem {
  id: string;
  manifest: ToolManifest & ToolText;
  basePath: string;
}

export interface GitHubAsset {
  id: number;
  name: string;
  size: number;
  browser_download_url: string;
}

export interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  assets: GitHubAsset[];
}

export type PlatformKey = "windows" | "linux" | "chrome" | "firefox" | "mac";

export type UserOS = "windows" | "linux" | "mac" | "other";
export type UserBrowser = "firefox" | "chrome" | "safari" | "other";

export interface UserEnvironment {
  os: UserOS;
  browser: UserBrowser;
  osLabel: string;
  browserLabel: string;
  summaryLabel: string;
}

export interface GitHubRateLimitInfo {
  limit: number;
  remaining: number;
  resetTimestamp: number;
  minutesUntilReset: number;
}

export interface GitHubApiError {
  type: "rate_limit" | "not_found" | "http_error" | "network_error";
  status?: number;
  message: string;
  rateLimit?: GitHubRateLimitInfo;
}

export interface FetchReleaseResult {
  release: GitHubRelease | null;
  error?: GitHubApiError;
}

export interface DownloadOption {
  platform: PlatformKey;
  label: string;
  iconClass: string;
  filename: string;
  sizeText?: string;
  statusReason?: string;
  url: string;
  isRecommended?: boolean;
}

