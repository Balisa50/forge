/**
 * GitHub repo inspection tool for THE PROFESSOR.
 *
 * Given a public GitHub URL, fetches the repo metadata, README, file
 * listing, and recent commit history. Returns a structured summary the
 * AI Mentor can reason about - so it inspects EVIDENCE, not just
 * trusts the student's word.
 *
 * Uses the public GitHub API. If GITHUB_PAT is set in env, we use it for
 * the 5000 req/hour rate limit. Otherwise we use the 60 req/hour
 * unauthenticated limit (fine for low-volume early stage).
 */

export interface RepoInspection {
 url: string;
 owner: string;
 repo: string;
 exists: boolean;
 isEmpty: boolean;
 defaultBranch: string;
 description: string | null;
 stars: number;
 language: string | null;
 createdAt: string;
 updatedAt: string;
 pushedAt: string | null;
 readme: { exists: boolean; preview: string };
 fileTree: { path: string; size: number; type: "blob" | "tree" }[];
 /** Actual contents of the 2-3 most important source files, so The Professor
  * judges the real code, not just that a filename exists. */
 keyFiles: { path: string; size: number; preview: string }[];
 recentCommits: { sha: string; message: string; date: string; author: string }[];
 /** Red flags the AI should pay attention to. */
 warnings: string[];
}

function parseGithubUrl(url: string): { owner: string; repo: string } | null {
 const m = url.match(/github\.com\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+?)(?:\.git|\/|$)/);
 if (!m) return null;
 return { owner: m[1], repo: m[2] };
}

async function gh<T>(path: string): Promise<{ ok: boolean; status: number; data?: T }> {
 const headers: Record<string, string> = {
 Accept: "application/vnd.github+json",
 "X-GitHub-Api-Version": "2022-11-28",
 };
 if (process.env.GITHUB_PAT) headers.Authorization = `Bearer ${process.env.GITHUB_PAT}`;
 const res = await fetch(`https://api.github.com${path}`, { headers });
 if (!res.ok) return { ok: false, status: res.status };
 const data = (await res.json()) as T;
 return { ok: true, status: res.status, data };
}

export async function inspectGithubRepo(url: string): Promise<RepoInspection> {
 const parsed = parseGithubUrl(url);
 if (!parsed) {
 return {
 url, owner: "", repo: "", exists: false, isEmpty: false, defaultBranch: "",
 description: null, stars: 0, language: null, createdAt: "", updatedAt: "", pushedAt: null,
 readme: { exists: false, preview: "" }, fileTree: [], keyFiles: [], recentCommits: [],
 warnings: ["URL does not look like a GitHub repository (e.g. https://github.com/user/repo)"],
 };
 }
 const { owner, repo } = parsed;
 const warnings: string[] = [];

 // 1) Repo metadata
 const meta = await gh<{
 description: string | null;
 default_branch: string;
 stargazers_count: number;
 language: string | null;
 created_at: string;
 updated_at: string;
 pushed_at: string | null;
 size: number;
 private: boolean;
 }>(`/repos/${owner}/${repo}`);

 if (!meta.ok || !meta.data) {
 return {
 url, owner, repo, exists: false, isEmpty: false, defaultBranch: "",
 description: null, stars: 0, language: null, createdAt: "", updatedAt: "", pushedAt: null,
 readme: { exists: false, preview: "" }, fileTree: [], keyFiles: [], recentCommits: [],
 warnings: [`Repository not accessible (HTTP ${meta.status}). It may be private or non-existent.`],
 };
 }

 const isEmpty = meta.data.size === 0;
 if (isEmpty) warnings.push("Repository exists but is empty (size = 0).");

 // 2) README
 let readme: RepoInspection["readme"] = { exists: false, preview: "" };
 try {
 const readmeRes = await fetch(
 `https://api.github.com/repos/${owner}/${repo}/readme`,
 {
 headers: {
 Accept: "application/vnd.github.raw",
 ...(process.env.GITHUB_PAT ? { Authorization: `Bearer ${process.env.GITHUB_PAT}` } : {}),
 },
 },
 );
 if (readmeRes.ok) {
 const raw = await readmeRes.text();
 readme = { exists: true, preview: raw.slice(0, 2000) };
 if (raw.trim().length < 80) warnings.push("README is suspiciously short (under 80 characters).");
 } else {
 warnings.push("No README found at the root.");
 }
 } catch {
 warnings.push("Could not fetch README.");
 }

 // 3) File tree (recursive, so key source files in subfolders are visible)
 let fileTree: RepoInspection["fileTree"] = [];
 const keyFiles: RepoInspection["keyFiles"] = [];
 const tree = await gh<{ tree: Array<{ path: string; size?: number; type: string }> }>(
 `/repos/${owner}/${repo}/git/trees/${meta.data.default_branch}?recursive=1`,
 );
 if (tree.ok && tree.data) {
 const blobs = tree.data.tree.filter(
 (x): x is { path: string; size: number; type: "blob" } => x.type === "blob",
 );
 fileTree = tree.data.tree
 .filter((x): x is { path: string; size: number; type: "blob" | "tree" } =>
 x.type === "blob" || x.type === "tree",
 )
 .map((x) => ({ path: x.path, size: x.size ?? 0, type: x.type as "blob" | "tree" }))
 .slice(0, 60);
 if (fileTree.length === 0) warnings.push("Default branch has no files.");

 // Read the ACTUAL contents of the 3 most important source files. This is
 // what lets The Professor judge the real code, not just that a filename
 // exists, an empty train.py can no longer pass as real work.
 const SRC = /\.(py|ipynb|ts|tsx|js|jsx|mjs|r|jl|java|go|rs|c|cc|cpp|sql)$/i;
 const IGNORE = /(^|\/)(node_modules|\.next|dist|build|out|vendor|\.venv|env)\/|package-lock\.json|yarn\.lock|pnpm-lock\.yaml|\.min\./i;
 const ENTRY = /(^|\/)(main|app|train|model|models|index|server|api|run|pipeline|solution)\.\w+$/i;
 const candidates = blobs
 .filter((f) => SRC.test(f.path) && !IGNORE.test(f.path))
 .sort((a, b) => {
 const ea = ENTRY.test(a.path) ? 1 : 0;
 const eb = ENTRY.test(b.path) ? 1 : 0;
 if (ea !== eb) return eb - ea; // entry points first
 return (b.size ?? 0) - (a.size ?? 0); // then largest
 })
 .slice(0, 3);

 for (const f of candidates) {
 try {
 const res = await fetch(
 `https://api.github.com/repos/${owner}/${repo}/contents/${f.path.split("/").map(encodeURIComponent).join("/")}?ref=${meta.data.default_branch}`,
 {
 headers: {
 Accept: "application/vnd.github.raw",
 "X-GitHub-Api-Version": "2022-11-28",
 ...(process.env.GITHUB_PAT ? { Authorization: `Bearer ${process.env.GITHUB_PAT}` } : {}),
 },
 },
 );
 if (res.ok) {
 const raw = await res.text();
 keyFiles.push({ path: f.path, size: f.size ?? raw.length, preview: raw.slice(0, 1800) });
 if (raw.trim().length < 40) {
 warnings.push(`${f.path} exists but is nearly empty (under 40 characters of code) - check it is real work.`);
 }
 }
 } catch {
 /* skip an unreadable file */
 }
 }
 }

 // 4) Recent commits (last 10)
 const commits = await gh<Array<{
 sha: string;
 commit: { message: string; author: { name: string; date: string } };
 }>>(`/repos/${owner}/${repo}/commits?per_page=10`);
 const recentCommits = commits.ok && commits.data
 ? commits.data.map((c) => ({
 sha: c.sha.slice(0, 7),
 message: c.commit.message.split("\n")[0].slice(0, 200),
 date: c.commit.author.date,
 author: c.commit.author.name,
 }))
 : [];

 // 5) Red flag analysis
 if (recentCommits.length > 0) {
 // Were all commits made in a one-hour burst? (last-minute work)
 const timestamps = recentCommits.map((c) => new Date(c.date).getTime()).sort();
 const spread = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000 / 60; // minutes
 if (timestamps.length >= 5 && spread < 60) {
 warnings.push(`All ${timestamps.length} recent commits were made within ${Math.round(spread)} minutes - suggests last-minute work.`);
 }
 // Are all commit messages generic ("wip", "update", "fix")?
 const genericPatterns = /^(wip|update|fix|init|test|commit|stuff|asdf|.|wip\d*|update\d*)$/i;
 const genericCount = recentCommits.filter((c) => genericPatterns.test(c.message.trim())).length;
 if (genericCount >= recentCommits.length / 2) {
 warnings.push(`${genericCount} of ${recentCommits.length} recent commits have generic messages (wip, update, fix, etc).`);
 }
 } else {
 warnings.push("No commit history found.");
 }

 return {
 url,
 owner,
 repo,
 exists: true,
 isEmpty,
 defaultBranch: meta.data.default_branch,
 description: meta.data.description,
 stars: meta.data.stargazers_count,
 language: meta.data.language,
 createdAt: meta.data.created_at,
 updatedAt: meta.data.updated_at,
 pushedAt: meta.data.pushed_at,
 readme,
 fileTree,
 keyFiles,
 recentCommits,
 warnings,
 };
}

/** Format inspection for the AI Mentor's system prompt evidence section. */
export function formatInspectionForProfessor(inspection: RepoInspection): string {
 if (!inspection.exists) {
 return `GitHub: ${inspection.url}\nNOT ACCESSIBLE. ${inspection.warnings.join(" ")}`;
 }
 const lines = [
 `GitHub: ${inspection.url}`,
 `Description: ${inspection.description || "(none)"}`,
 `Primary language: ${inspection.language || "(unknown)"}`,
 `Last pushed: ${inspection.pushedAt}`,
 `File tree (top level, first 50):`,
 inspection.fileTree.map((f) => ` ${f.type === "tree" ? "📁" : "📄"} ${f.path} (${f.size} bytes)`).join("\n") || " (empty)",
 `Recent commits:`,
 inspection.recentCommits.map((c) => ` ${c.sha} ${c.date} - ${c.author}: "${c.message}"`).join("\n") || " (none)",
 `README (first 2000 chars):`,
 inspection.readme.exists ? inspection.readme.preview : "(no README)",
 `Key source files - ACTUAL CONTENTS (judge the real code, not the filename; verify the README's claims against this):`,
 inspection.keyFiles.length > 0
 ? inspection.keyFiles
 .map((f) => `----- ${f.path} (${f.size} bytes) -----\n${f.preview}`)
 .join("\n\n")
 : " (no source files could be read)",
 ];
 if (inspection.warnings.length > 0) {
 lines.push("", "RED FLAGS DETECTED:");
 lines.push(...inspection.warnings.map((w) => ` - ${w}`));
 }
 return lines.join("\n");
}
