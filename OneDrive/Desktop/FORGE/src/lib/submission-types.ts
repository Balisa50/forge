/**
 * Shared types and helpers for the student submission system.
 * Used by CheckinForm (client), checkins API route (server), and SubmissionViewer (client).
 */

export interface FileAttachment {
  filename: string;
  size: number;       // raw bytes
  mimeType: string;
  extension: string;  // lowercase, without the dot
  // New uploads store a Vercel Blob URL (file goes browser->blob directly,
  // bypassing the 4.5 MB serverless request limit). Legacy check-ins stored
  // the whole file inline as a base64 data URL. Exactly one is present.
  url?: string;       // https blob URL (preferred)
  dataUrl?: string;   // legacy "data:{mimeType};base64,{base64data}"
}

/** Where to point a link / <img> / download at — blob URL if present, else legacy data URL. */
export function fileHref(f: FileAttachment): string {
  return f.url ?? f.dataUrl ?? "";
}

// The evidenceData JSON blob stored in Checkin.evidenceData
export interface EvidenceData {
  // Legacy screenshot fields (preserved for backwards compat)
  filename?: string;
  size?: number;
  type?: string;
  dataUrl?: string;
  // File submission fields
  files?: FileAttachment[];
}

// Files now upload directly to Vercel Blob (browser -> blob), so the old
// ~4.5 MB serverless request-body ceiling no longer applies. These are the
// product limits we choose, enforced client-side, in the upload route's
// token, and at check-in time. Sized to allow short video/audio evidence
// (a few-minute phone clip) without letting storage run away.
// Maximum total size across all attached files (300 MB)
export const MAX_TOTAL_BYTES = 300 * 1024 * 1024;

// Maximum size per individual file (150 MB — covers a short explainer video)
export const MAX_FILE_BYTES = 150 * 1024 * 1024;

// File type categories and their accepted extensions
export const FILE_CATEGORIES = {
  code: [
    "py", "js", "ts", "jsx", "tsx",
    "go", "rs", "java", "cpp", "c", "h", "hpp",
    "cs", "php", "rb", "swift", "kt", "kts",
    "r", "sql", "sh", "bash", "zsh",
    "html", "css", "scss", "sass", "less",
    "lua", "scala", "clj", "ex", "exs",
    "hs", "ml", "mli", "dart", "vue", "svelte",
    "tf", "yaml", "yml", "toml", "json", "xml",
    "graphql", "gql", "proto", "dockerfile",
  ],
  document: [
    "pdf", "doc", "docx", "txt", "md", "mdx",
    "rtf", "csv", "xlsx", "xls", "ppt", "pptx",
    "odt", "ods", "odp",
  ],
  vscode: [
    "code-workspace",
    // Note: .vscode/ directory files like settings.json, launch.json, extensions.json
    // are accepted as individual JSON files
  ],
  notebook: ["ipynb"],
  config: [
    "env", "gitignore", "dockerignore", "editorconfig",
    "prettierrc", "eslintrc", "babelrc",
  ],
  // Video / audio evidence — a recorded walkthrough or spoken explanation.
  media: [
    "mp4", "mov", "webm", "m4v", "avi", "mkv", "ogv",
    "mp3", "m4a", "wav", "ogg", "aac",
  ],
} as const;

// All accepted extensions as a flat set (for fast lookup)
export const ALL_ACCEPTED_EXTENSIONS: Set<string> = new Set([
  ...FILE_CATEGORIES.code,
  ...FILE_CATEGORIES.document,
  ...FILE_CATEGORIES.vscode,
  ...FILE_CATEGORIES.notebook,
  ...FILE_CATEGORIES.config,
  ...FILE_CATEGORIES.media,
]);

// Human-readable accept string for <input type="file" accept="...">
// We use a broad set; the real validation happens client-side and server-side.
export const ACCEPTED_MIME_TYPES = [
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
  "text/csv",
  "text/rtf",
  // Code / text
  "text/x-python",
  "application/x-python-code",
  "text/javascript",
  "application/javascript",
  "text/typescript",
  "application/json",
  "application/xml",
  "text/xml",
  "text/html",
  "text/css",
  "text/x-sh",
  "text/x-r",
  "application/x-ipynb+json",
  // Video / audio evidence
  "video/*",
  "audio/*",
  // Catch-all text
  "text/*",
].join(",");

// Video / audio extensions, for picking the right inline player in the viewer.
export const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm", "m4v", "avi", "mkv", "ogv"]);
export const AUDIO_EXTENSIONS = new Set(["mp3", "m4a", "wav", "ogg", "aac"]);
export const isVideo = (ext: string): boolean => VIDEO_EXTENSIONS.has(ext);
export const isAudio = (ext: string): boolean => AUDIO_EXTENSIONS.has(ext);

export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  if (parts.length < 2) return "";
  return parts[parts.length - 1].toLowerCase();
}

export function isAcceptedExtension(ext: string): boolean {
  // Also accept dotfiles like .env, .gitignore (ext would be empty string from split)
  // and files whose full name is just the extension (e.g. "Dockerfile")
  return ALL_ACCEPTED_EXTENSIONS.has(ext) || ext === "";
}

export function getFileCategory(ext: string): keyof typeof FILE_CATEGORIES | "unknown" {
  for (const [cat, exts] of Object.entries(FILE_CATEGORIES)) {
    if ((exts as readonly string[]).includes(ext)) {
      return cat as keyof typeof FILE_CATEGORIES;
    }
  }
  return "unknown";
}

// Files whose content we'll try to render as text in the mentor viewer
export const TEXT_RENDERABLE_EXTENSIONS = new Set([
  ...FILE_CATEGORIES.code,
  ...FILE_CATEGORIES.notebook,
  ...FILE_CATEGORIES.config,
  "txt", "md", "mdx", "csv", "rtf",
]);

export function isTextRenderable(ext: string): boolean {
  return TEXT_RENDERABLE_EXTENSIONS.has(ext);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Language hint for syntax-like display (we don't bundle a full highlighter)
export function getLanguageLabel(ext: string): string {
  const map: Record<string, string> = {
    py: "Python", js: "JavaScript", ts: "TypeScript",
    jsx: "JSX", tsx: "TSX", go: "Go", rs: "Rust",
    java: "Java", cpp: "C++", c: "C", cs: "C#",
    php: "PHP", rb: "Ruby", swift: "Swift", kt: "Kotlin",
    r: "R", sql: "SQL", sh: "Shell", bash: "Bash",
    html: "HTML", css: "CSS", scss: "SCSS",
    json: "JSON", yaml: "YAML", yml: "YAML", toml: "TOML",
    xml: "XML", graphql: "GraphQL", gql: "GraphQL",
    tf: "Terraform", dockerfile: "Dockerfile",
    ipynb: "Jupyter Notebook", lua: "Lua",
    scala: "Scala", dart: "Dart", vue: "Vue",
    svelte: "Svelte", md: "Markdown", mdx: "MDX",
    csv: "CSV", txt: "Text",
  };
  return map[ext] ?? ext.toUpperCase();
}

// ─── Mentor-chosen submission requirements ──────────────────────────────────
// A mentor decides, per week (Task), what the mentee must hand in. The same
// config drives three places: the mentor's settings UI, the student form's
// rendered fields, and the server-side validation on submit. Keep all of that
// logic here so the three can never drift.

export type SubmissionConfigType =
  | "link_or_file"   // default — a project link OR a file (legacy behaviour)
  | "link_only"      // a project link only
  | "video_only"     // a video link only (Drive/YouTube/Loom/Vimeo)
  | "link_or_video"  // mentee chooses: link OR video
  | "link_and_video" // both a link AND a video required
  | "video_and_file"; // both a video AND a file required

export interface SubmissionConfig {
  type: SubmissionConfigType;
}

export const DEFAULT_SUBMISSION_CONFIG: SubmissionConfig = { type: "link_or_file" };

const SUBMISSION_CONFIG_TYPES: SubmissionConfigType[] = [
  "link_or_file", "link_only", "video_only", "link_or_video", "link_and_video", "video_and_file",
];

/** Mentor-facing option metadata for the settings UI (label + one-line help). */
export const SUBMISSION_CONFIG_OPTIONS: { type: SubmissionConfigType; label: string; help: string }[] = [
  { type: "link_or_file", label: "Link or file (default)", help: "Mentee submits a project link OR uploads a file." },
  { type: "link_only", label: "Link only", help: "Mentee must submit a URL (GitHub, deployed app, etc.)." },
  { type: "video_only", label: "Video only", help: "Mentee must submit a Google Drive / YouTube video link." },
  { type: "link_or_video", label: "Link or video", help: "Mentee chooses: submit a link OR a video." },
  { type: "link_and_video", label: "Link and video", help: "Mentee must submit BOTH a link and a video." },
  { type: "video_and_file", label: "Video and file", help: "Mentee must submit BOTH a video and a file." },
];

/** Coerce an unknown JSON value (DB column, request body) into a valid config.
 *  NULL / malformed / unknown type all fall back to the default so nothing breaks. */
export function normalizeSubmissionConfig(raw: unknown): SubmissionConfig {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const t = (raw as Record<string, unknown>).type;
    if (typeof t === "string" && (SUBMISSION_CONFIG_TYPES as string[]).includes(t)) {
      return { type: t as SubmissionConfigType };
    }
  }
  return { ...DEFAULT_SUBMISSION_CONFIG };
}

/** Which fields a config exposes and whether each is required. `mode: "any"`
 *  means the listed fields satisfy the requirement together (at least one). */
export interface FieldRequirements {
  link: "required" | "optional" | "hidden";
  video: "required" | "optional" | "hidden";
  file: "required" | "optional" | "hidden";
  mode: "all" | "any";
}

export function submissionRequirements(type: SubmissionConfigType): FieldRequirements {
  switch (type) {
    case "link_only":
      return { link: "required", video: "hidden", file: "hidden", mode: "all" };
    case "video_only":
      return { link: "hidden", video: "required", file: "hidden", mode: "all" };
    case "link_or_video":
      return { link: "optional", video: "optional", file: "hidden", mode: "any" };
    case "link_and_video":
      return { link: "required", video: "required", file: "hidden", mode: "all" };
    case "video_and_file":
      return { link: "hidden", video: "required", file: "required", mode: "all" };
    case "link_or_file":
    default:
      return { link: "optional", video: "hidden", file: "optional", mode: "any" };
  }
}

export interface SubmittedFields {
  hasLink: boolean;
  hasVideo: boolean;
  hasFile: boolean;
}

/** The ONE validation function. Returns an error string if the submission does
 *  not satisfy the config, or null if it's good. Used identically on client and
 *  server so the button-disable logic and the API guard can never disagree. */
export function validateSubmission(type: SubmissionConfigType, f: SubmittedFields): string | null {
  switch (type) {
    case "link_only":
      return f.hasLink ? null : "A project link is required for this week.";
    case "video_only":
      return f.hasVideo ? null : "A video link is required for this week.";
    case "link_or_video":
      return f.hasLink || f.hasVideo ? null : "Submit either a project link or a video link.";
    case "link_and_video":
      if (!f.hasLink) return "This week requires a project link.";
      if (!f.hasVideo) return "This week requires a video link.";
      return null;
    case "video_and_file":
      if (!f.hasVideo) return "This week requires a video link.";
      if (!f.hasFile) return "This week requires a file upload.";
      return null;
    case "link_or_file":
    default:
      return f.hasLink || f.hasFile
        ? null
        : "Add at least one piece of proof — a link or a file.";
  }
}

// ─── Video link helpers (thumbnail / embed for the mentor review UI) ──────────

/** Extract a YouTube video id from any common YouTube URL shape, else null. */
export function youTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (host.endsWith("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{6,})/);
      if (m) return m[1];
    }
  } catch { /* not a URL */ }
  return null;
}

/** Extract a Google Drive file id from a /file/d/<id>/ or ?id=<id> link, else null. */
export function googleDriveId(url: string): string | null {
  try {
    const u = new URL(url);
    if (!/drive\.google\.com|docs\.google\.com/.test(u.hostname)) return null;
    const m = u.pathname.match(/\/d\/([A-Za-z0-9_-]+)/);
    if (m) return m[1];
    return u.searchParams.get("id");
  } catch {
    return null;
  }
}

/** A still-thumbnail URL for a video link, or null when we can't derive one
 *  without an API (e.g. plain Drive links, Loom, Vimeo). */
export function videoThumbnail(url: string): string | null {
  const yt = youTubeId(url);
  if (yt) return `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`;
  return null;
}

/** An embeddable player URL for a video link, or null when not embeddable. */
export function videoEmbedUrl(url: string): string | null {
  const yt = youTubeId(url);
  if (yt) return `https://www.youtube.com/embed/${yt}`;
  const drive = googleDriveId(url);
  if (drive) return `https://drive.google.com/file/d/${drive}/preview`;
  return null;
}

/** Detect what a pasted proof URL is, so mentors know what they're opening
 *  without clicking — and so the submission form can badge it on entry. Pure
 *  string inspection; never blocks or rewrites the URL. Returns null for input
 *  that isn't a parseable URL. */
export function detectUrlType(url: string): { label: string; color: string; isVideo: boolean } | null {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
  const drive = /drive\.google\.com|docs\.google\.com/.test(host);
  const youtube = /youtube\.com|youtu\.be/.test(host);
  if (/github\.com|github\.io/.test(host)) return { label: "GitHub repo", color: "#a78bfa", isVideo: false };
  if (drive) return { label: "Google Drive link", color: "#34d399", isVideo: true };
  if (youtube) return { label: "YouTube video", color: "#f87171", isVideo: true };
  if (/colab\.research\.google\.com/.test(host)) return { label: "Colab notebook", color: "#fbbf24", isVideo: false };
  if (/codesandbox\.io|stackblitz\.com/.test(host)) return { label: "CodeSandbox", color: "#60a5fa", isVideo: false };
  if (/vercel\.app|netlify\.app|pages\.dev/.test(host)) return { label: "Deployed app", color: "#34d399", isVideo: false };
  if (/kaggle\.com/.test(host)) return { label: "Kaggle notebook", color: "#60a5fa", isVideo: false };
  if (/figma\.com/.test(host)) return { label: "Figma file", color: "#f472b6", isVideo: false };
  if (/loom\.com|vimeo\.com/.test(host)) return { label: "Video link", color: "#f87171", isVideo: true };
  return { label: host, color: "#94a3b8", isVideo: false };
}
