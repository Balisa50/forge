/**
 * Resolves every `youtube.com/results?search_query=...` URL in every roadmap
 * JSON to its actual top-video URL.
 *
 * Strategy: fetch YouTube's search results HTML, find the `ytInitialData`
 * blob embedded in a <script>, and pluck the first `videoRenderer` videoId.
 * No API key needed.
 *
 * Run:    npx tsx scripts/resolve-youtube-searches.ts
 *
 * Idempotent: skips URLs that have already been resolved. Re-runnable
 * after content updates.
 */
import fs from "node:fs";
import path from "node:path";

const ROADMAP_DIR = path.join(process.cwd(), "data", "roadmaps");
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

interface DayItem {
  kind?: string;
  url?: string;
  [k: string]: unknown;
}
interface Day { items?: DayItem[]; [k: string]: unknown }
interface Week { days?: Day[]; [k: string]: unknown }
interface Roadmap { weeks?: Week[]; [k: string]: unknown }

/** Extract the search query from a YouTube search URL. */
function searchQueryFromUrl(url: string): string | null {
  const m = url.match(/youtube\.com\/results\?search_query=([^&#]+)/);
  return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : null;
}

/** Fetch YouTube's search HTML and parse the first video ID from ytInitialData. */
async function resolveSearch(query: string): Promise<{ id: string; title: string } | null> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) {
      console.warn(`  ✗ fetch failed (${res.status}) for "${query}"`);
      return null;
    }
    const html = await res.text();

    // Strategy 1: regex over the raw HTML — fast, no JSON parse needed.
    // The first videoId in the HTML is reliably a real video (search has no
    // ads before videoId markers in the desktop layout).
    const m = html.match(/"videoId":"([\w-]{6,15})"/);
    if (!m) {
      console.warn(`  ✗ no videoId in response for "${query}"`);
      return null;
    }
    const id = m[1];

    // Try to also pull the title (for log clarity only)
    const titleMatch = html.match(new RegExp(`"videoId":"${id}"[^}]*?"title":\\{"runs":\\[\\{"text":"([^"]+)"`));
    const title = titleMatch ? titleMatch[1].slice(0, 60) : "";

    return { id, title };
  } catch (e) {
    console.warn(`  ✗ error for "${query}":`, e instanceof Error ? e.message : e);
    return null;
  }
}

/** Walk a roadmap looking for search URLs to resolve. Mutates in place. */
async function processRoadmap(file: string): Promise<{ resolved: number; failed: number; skipped: number }> {
  const fullPath = path.join(ROADMAP_DIR, file);
  const original = fs.readFileSync(fullPath, "utf8");
  const roadmap: Roadmap = JSON.parse(original);

  let resolved = 0;
  let failed = 0;
  const skipped = 0;

  for (const week of roadmap.weeks ?? []) {
    for (const day of week.days ?? []) {
      for (const item of day.items ?? []) {
        if (item.kind !== "video" || typeof item.url !== "string") continue;
        const query = searchQueryFromUrl(item.url);
        if (!query) continue;

        // Throttle: 350ms between requests so we don't get rate-limited
        await new Promise((r) => setTimeout(r, 350));

        const result = await resolveSearch(query);
        if (result) {
          item.url = `https://www.youtube.com/watch?v=${result.id}`;
          resolved++;
          console.log(`  ✓ ${query.slice(0, 50).padEnd(50)} → ${result.id}${result.title ? ` (${result.title})` : ""}`);
        } else {
          failed++;
        }
      }
    }
  }

  if (resolved > 0) {
    fs.writeFileSync(fullPath, JSON.stringify(roadmap, null, 2) + "\n");
  }

  return { resolved, failed, skipped };
}

async function main() {
  const files = fs.readdirSync(ROADMAP_DIR).filter((f) => f.endsWith(".json")).sort();
  let totalResolved = 0;
  let totalFailed = 0;

  for (const f of files) {
    console.log(`\n=== ${f} ===`);
    const { resolved, failed } = await processRoadmap(f);
    totalResolved += resolved;
    totalFailed += failed;
    if (resolved === 0 && failed === 0) console.log("  (nothing to resolve)");
  }

  console.log("\n────────────────");
  console.log(`Resolved: ${totalResolved}`);
  console.log(`Failed:   ${totalFailed}`);
  console.log("Run `git diff data/roadmaps/` to review changes before committing.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
