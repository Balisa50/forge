/**
 * Some resources in the LaTeX-parsed roadmaps lost their URLs during
 * extraction (the LaTeX source mixed `\href` links with plain-text
 * bullets that just mention a domain or a YouTube search). This
 * normaliser recovers a clickable URL from such labels so the renderer
 * never shows a dead-end resource.
 */

export interface NormalisedResource {
  label: string;
  url: string;
  note: string;
}

const URL_RE = /\b((?:https?:\/\/)?(?:www\.)?[a-z0-9][a-z0-9-]*(?:\.[a-z0-9][a-z0-9-]*)+(?:\/[^\s)]*)?)/i;
const YT_SEARCH_RE = /\(search:\s*['"]([^'")]+)['"]\)/i;

export function normaliseResource(r: { label: string; url?: string; note?: string }): NormalisedResource {
  // 1. Explicit URL on the resource wins.
  if (r.url) return { label: r.label, url: r.url, note: r.note ?? "" };

  const label = r.label || "";

  // 2. YouTube search hint like (search: 'something specific')
  const ytMatch = label.match(YT_SEARCH_RE);
  if (ytMatch) {
    const q = encodeURIComponent(ytMatch[1]);
    return {
      label: label.replace(YT_SEARCH_RE, "").trim(),
      url: `https://www.youtube.com/results?search_query=${q}`,
      note: r.note ?? "YouTube",
    };
  }

  // 3. YouTube label without explicit URL but with a creator/topic
  if (/^YouTube:/i.test(label)) {
    const q = encodeURIComponent(label.replace(/^YouTube:\s*/i, "").trim());
    return {
      label: label.replace(/^YouTube:\s*/i, "").trim(),
      url: `https://www.youtube.com/results?search_query=${q}`,
      note: r.note ?? "YouTube",
    };
  }

  // 4. Domain embedded in the label, e.g. "kaggle.com/x", "support.microsoft.com/y"
  const urlMatch = label.match(URL_RE);
  if (urlMatch) {
    const raw = urlMatch[1];
    const url = raw.startsWith("http") ? raw : `https://${raw}`;
    return { label, url, note: r.note ?? "" };
  }

  // 5. Truly link-less reference (a book, a dataset by name). Render as plain.
  return { label, url: "", note: r.note ?? "" };
}
