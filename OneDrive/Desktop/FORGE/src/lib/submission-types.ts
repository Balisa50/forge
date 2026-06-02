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
