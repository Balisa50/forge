/**
 * Live URL inspection tool for THE PROFESSOR.
 *
 * Fetches a student-submitted live URL (e.g. Streamlit app, deployed Render
 * API, dashboard). Verifies it loads, captures the title + first chunk of
 * body, checks for obvious 404/maintenance pages.
 */

export interface UrlInspection {
  url: string;
  reachable: boolean;
  status: number;
  contentType: string | null;
  title: string | null;
  /** First ~1000 chars of textual content for the AI to inspect. */
  preview: string;
  /** Latency in milliseconds to first byte. */
  latencyMs: number | null;
  warnings: string[];
}

export async function inspectLiveUrl(url: string): Promise<UrlInspection> {
  const warnings: string[] = [];

  // Sanity check the URL
  let parsed: URL;
  try {
    parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { url, reachable: false, status: 0, contentType: null, title: null, preview: "", latencyMs: null, warnings: ["URL must be http or https."] };
    }
  } catch {
    return { url, reachable: false, status: 0, contentType: null, title: null, preview: "", latencyMs: null, warnings: ["Not a valid URL."] };
  }

  // Block private/local addresses to prevent SSRF
  if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(parsed.hostname) || parsed.hostname.endsWith(".local")) {
    return { url, reachable: false, status: 0, contentType: null, title: null, preview: "", latencyMs: null, warnings: ["Private/local URLs cannot be inspected from the server."] };
  }

  const start = Date.now();
  let res: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000); // 10s timeout
    res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "FORGE-AI-Mentor/1.0" },
    });
    clearTimeout(timeout);
  } catch (e) {
    return {
      url,
      reachable: false,
      status: 0,
      contentType: null,
      title: null,
      preview: "",
      latencyMs: Date.now() - start,
      warnings: [`Fetch failed: ${(e as Error).message}`],
    };
  }
  const latencyMs = Date.now() - start;

  if (!res.ok) {
    warnings.push(`HTTP ${res.status} ${res.statusText} - the URL did not return a success status.`);
  }
  if (latencyMs > 5000) warnings.push(`Slow response: ${latencyMs}ms (acceptable but suggests cold start or poor performance).`);

  const contentType = res.headers.get("content-type");
  let body = "";
  try {
    // Read at most 100KB to keep token budget reasonable. Decode chunks
    // incrementally with TextDecoder - avoids Blob's strict ArrayBuffer typing.
    const reader = res.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder("utf-8");
      let total = 0;
      while (total < 100_000) {
        const { done, value } = await reader.read();
        if (done) break;
        body += decoder.decode(value, { stream: true });
        total += value.length;
      }
      body += decoder.decode(); // flush
    }
  } catch {
    // Body unreadable, that's fine - we still have the status code
  }

  // Extract title if HTML
  let title: string | null = null;
  if (contentType?.includes("text/html")) {
    const m = body.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (m) title = m[1].trim();
  }

  // Strip HTML for preview
  const preview = body.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 1000);

  // Detect obvious "not deployed" patterns
  if (/application error|build failed|404 not found|page not found|service unavailable|placeholder/i.test(preview.slice(0, 300))) {
    warnings.push("Response body suggests an error / maintenance / placeholder page.");
  }
  if (preview.length < 50 && res.ok) {
    warnings.push("Response body is suspiciously empty for a deployed app.");
  }

  return {
    url,
    reachable: res.ok,
    status: res.status,
    contentType,
    title,
    preview,
    latencyMs,
    warnings,
  };
}

/** Format URL inspection for the AI Mentor's evidence section. */
export function formatUrlInspectionForProfessor(insp: UrlInspection): string {
  if (!insp.reachable) {
    return `Live URL: ${insp.url}\nNOT REACHABLE (HTTP ${insp.status}). ${insp.warnings.join(" ")}`;
  }
  const lines = [
    `Live URL: ${insp.url}`,
    `Status: ${insp.status}, latency: ${insp.latencyMs}ms`,
    insp.title ? `Page title: ${insp.title}` : "No HTML title found.",
    `Content type: ${insp.contentType ?? "(unknown)"}`,
    `Body preview (first 1000 chars):`,
    insp.preview || "(empty)",
  ];
  if (insp.warnings.length > 0) {
    lines.push("", "RED FLAGS DETECTED:");
    lines.push(...insp.warnings.map((w) => `  - ${w}`));
  }
  return lines.join("\n");
}
