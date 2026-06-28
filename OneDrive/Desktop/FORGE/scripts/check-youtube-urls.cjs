/**
 * Validate every YouTube URL across both Data tracks. Uses YouTube's free
 * oEmbed endpoint - returns 200 if the video is still public, 401/404 if
 * removed/unlisted/private. Prints a list of dead URLs grouped by track + week
 * so we can patch them with verified-alive replacements.
 *
 * Run from repo root:  node scripts/check-youtube-urls.cjs
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "data", "roadmaps");

function extractVideoId(url) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|playlist\?list=)|youtu\.be\/)([\w-]+)/);
  return m ? m[1] : null;
}

async function checkUrl(url) {
  // playlist URLs are usually stable; skip them. We only validate single videos.
  if (url.includes("playlist?list=")) return { url, status: "playlist", ok: true };
  if (!url.includes("youtube.com/watch") && !url.includes("youtu.be/")) {
    return { url, status: "non-youtube", ok: true };
  }
  const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  try {
    const res = await fetch(oembed, { redirect: "follow" });
    if (res.status === 200) {
      const data = await res.json().catch(() => ({}));
      return { url, status: 200, ok: true, title: data.title, author: data.author_name };
    }
    return { url, status: res.status, ok: false };
  } catch (e) {
    return { url, status: "network-error", ok: false, error: String(e) };
  }
}

async function main() {
  const dead = [];
  const alive = [];
  const allFiles = fs.readdirSync(ROOT).filter((f) => f.endsWith(".json"));
  for (const file of allFiles) {
    const d = JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
    for (const w of d.weeks) {
      for (const r of w.resources || []) {
        if (!r.url) continue;
        const result = await checkUrl(r.url);
        const loc = `${file.replace(".json","")} W${w.number}`;
        if (result.ok) {
          alive.push({ loc, label: r.label, url: r.url, title: result.title });
          process.stdout.write(".");
        } else {
          dead.push({ loc, label: r.label, url: r.url, status: result.status });
          process.stdout.write("X");
        }
      }
    }
  }
  console.log("\n\n=== ALIVE ===", alive.length);
  console.log("=== DEAD ===", dead.length);
  for (const d of dead) console.log(` - ${d.loc} | ${d.label}\n     ${d.url}\n     status: ${d.status}`);
  fs.writeFileSync(path.join(__dirname, "youtube-check-results.json"), JSON.stringify({ alive, dead }, null, 2));
  console.log("\nResults written to scripts/youtube-check-results.json");
}

main();
