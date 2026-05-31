/**
 * THE FORGE — Project URL Verification
 *
 * Rules:
 *  - GitHub public repo    → must exist, non-empty, pushed within 30 days
 *  - GitHub commit/PR URL  → specific object must exist
 *  - Any other https URL   → must be reachable (HTTP 200–399)
 *  - Private repos         → rejected (can't verify without auth)
 *  - Dead / fake URLs      → rejected
 *
 * On GitHub API rate-limit or timeout: gives benefit of doubt (verified = true)
 * so a brief outage doesn't block users.
 */

export interface VerifyResult {
  verified: boolean;
  error?: string;
  details?: string;
}

export async function verifyProjectUrl(url: string): Promise<VerifyResult> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { verified: false, error: "Invalid URL format." };
  }

  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "github.com") {
    return verifyGitHub(parsed);
  }

  return verifyReachable(url);
}

// ── GitHub verification ───────────────────────────────────────────────────────

async function verifyGitHub(url: URL): Promise<VerifyResult> {
  const parts = url.pathname.replace(/^\//, "").split("/").filter(Boolean);
  if (parts.length < 2) {
    return { verified: false, error: "Not a valid GitHub repo URL. Use github.com/username/repo-name" };
  }

  const owner = parts[0];
  const repo  = parts[1].replace(/\.git$/, "");

  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "TheForge-Verifier",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  // Specific commit URL: github.com/user/repo/commit/<sha>
  if (parts[2] === "commit" && parts[3]) {
    return verifyGitHubCommit(owner, repo, parts[3], headers);
  }

  // PR URL: github.com/user/repo/pull/<number>
  if (parts[2] === "pull" && parts[3]) {
    return verifyGitHubPR(owner, repo, parts[3], headers);
  }

  // Repo URL (with optional branch/blob/tree)
  return verifyGitHubRepo(owner, repo, headers);
}

async function verifyGitHubRepo(owner: string, repo: string, headers: HeadersInit): Promise<VerifyResult> {
  try {
    const res = await fetchWithTimeout(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    if (!res) return { verified: true, details: "GitHub API timed out — assumed valid" };

    if (res.status === 404) {
      return {
        verified: false,
        error: "GitHub repo not found or is private. Your repo must be public — or submit your deployed live URL instead.",
      };
    }
    if (res.status === 403 || res.status === 429) {
      return { verified: true, details: "GitHub rate limited — assumed valid" };
    }
    if (!res.ok) {
      return { verified: false, error: `GitHub returned ${res.status}. Try your deployed live URL.` };
    }

    const data = await res.json();

    // Repo must have content
    if (data.size === 0) {
      // Double-check by fetching commits (size=0 can be misleading for fresh repos)
      const commitsRes = await fetchWithTimeout(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
        { headers }
      );
      if (commitsRes) {
        const commits = commitsRes.ok ? await commitsRes.json() : [];
        if (Array.isArray(commits) && commits.length === 0) {
          return { verified: false, error: "Your GitHub repo has no commits yet. Push your code first, then check in." };
        }
      }
    }

    // Must have been pushed within 30 days
    const pushedAt     = new Date(data.pushed_at);
    const daysSincePush = (Date.now() - pushedAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSincePush > 30) {
      return {
        verified: false,
        error: `This repo hasn't had any activity in ${Math.round(daysSincePush)} days. Submit a URL for work you've done recently.`,
      };
    }

    return {
      verified: true,
      details: `Verified: ${data.full_name} — last pushed ${Math.round(daysSincePush) === 0 ? "today" : `${Math.round(daysSincePush)}d ago`}`,
    };
  } catch {
    return { verified: true, details: "GitHub API unreachable — assumed valid" };
  }
}

async function verifyGitHubCommit(owner: string, repo: string, sha: string, headers: HeadersInit): Promise<VerifyResult> {
  try {
    const res = await fetchWithTimeout(
      `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`,
      { headers }
    );
    if (!res) return { verified: true, details: "GitHub API timed out — assumed valid" };
    if (!res.ok) return { verified: false, error: "GitHub commit not found. Make sure the repo is public." };
    const data = await res.json();
    const msg = data.commit?.message?.split("\n")[0] ?? "";
    return { verified: true, details: `Verified commit: ${sha.slice(0, 7)}${msg ? ` — "${msg}"` : ""}` };
  } catch {
    return { verified: true, details: "GitHub API unreachable — assumed valid" };
  }
}

async function verifyGitHubPR(owner: string, repo: string, number: string, headers: HeadersInit): Promise<VerifyResult> {
  try {
    const res = await fetchWithTimeout(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${number}`,
      { headers }
    );
    if (!res) return { verified: true, details: "GitHub API timed out — assumed valid" };
    if (!res.ok) return { verified: false, error: "GitHub PR not found. Make sure the repo is public." };
    const data = await res.json();
    return { verified: true, details: `Verified PR #${number}: "${data.title}"` };
  } catch {
    return { verified: true, details: "GitHub API unreachable — assumed valid" };
  }
}

// ── Generic URL reachability ─────────────────────────────────────────────────

// Cloud file-storage share links (OneDrive, Google Drive, Dropbox, etc.) render
// in a browser viewer and return 401/403 to any server-side fetch, so they can
// never pass the reachability check. When we see one fail that way, point the
// student at the file uploader (Option B) instead of the generic error.
// Note: genuinely public links from these hosts (e.g. Google Sheets "Publish to
// web", a Dropbox "?dl=1" direct link) return 200 and pass before reaching here,
// so this only fires on the actually-restricted ones.
const FILE_SHARE_HOSTS = [
  "1drv.ms", "onedrive.live.com", "sharepoint.com",
  "drive.google.com", "docs.google.com",
  "dropbox.com", "db.tt",
  "box.com", "icloud.com", "mega.nz", "mediafire.com", "we.tl", "wetransfer.com",
];

function isFileShareHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return FILE_SHARE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

async function verifyReachable(url: string): Promise<VerifyResult> {
  // Try HEAD first
  const headRes = await fetchWithTimeout(url, { method: "HEAD", redirect: "follow" });

  if (!headRes) {
    return { verified: false, error: "URL didn't respond in 10 seconds. Make sure your project is deployed and publicly accessible." };
  }

  if (headRes.status >= 200 && headRes.status < 400) {
    return { verified: true, details: `URL reachable (${headRes.status})` };
  }

  // Some servers reject HEAD — try GET
  if (headRes.status === 405) {
    const getRes = await fetchWithTimeout(url, { method: "GET", redirect: "follow" });
    if (getRes && getRes.status >= 200 && getRes.status < 400) {
      return { verified: true, details: `URL reachable (${getRes.status})` };
    }
  }

  const status = headRes.status;
  if (status === 401 || status === 403) {
    if (isFileShareHost(url)) {
      return {
        verified: false,
        error: "That's a OneDrive / Google Drive / Dropbox share link — those load in a browser and can't be verified automatically. Scroll down to \"Option B\" and upload the file itself (.xlsx, .csv, .pdf, screenshot, etc.) instead.",
      };
    }
    return { verified: false, error: "Your project URL requires a login or is access-restricted. Submit a public URL." };
  }
  if (status === 404) {
    return { verified: false, error: "URL returned 404 — page not found. Double-check the link." };
  }
  return { verified: false, error: `URL returned ${status}. Make sure your project is deployed and the URL is public.` };
}

// ── Helper ───────────────────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, options: RequestInit = {}, ms = 10_000): Promise<Response | null> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    if ((e as Error).name === "AbortError") return null;
    return null;
  }
}
