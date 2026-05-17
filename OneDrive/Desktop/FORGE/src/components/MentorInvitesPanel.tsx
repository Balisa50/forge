"use client";

import { useEffect, useState, useCallback } from "react";
import { Copy, CheckCircle2, Plus, Trash2, Loader2, Link2, Share2 } from "lucide-react";
import { CURATED_ROADMAPS } from "@/lib/curated-roadmaps-client";

interface Invite {
  id: string;
  code: string;
  roadmapSlug: string | null;
  label: string | null;
  maxUses: number | null;
  usesCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function MentorInvitesPanel() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ roadmapSlug: string; label: string; maxUses: string; expiresInDays: string }>({
    roadmapSlug: "",
    label: "",
    maxUses: "",
    expiresInDays: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mentor/invites");
      if (res.ok) {
        const data = await res.json();
        setInvites(data.invites);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    setCreating(true);
    try {
      const body: Record<string, unknown> = {};
      if (draft.roadmapSlug) body.roadmapSlug = draft.roadmapSlug;
      if (draft.label.trim()) body.label = draft.label.trim();
      if (draft.maxUses) body.maxUses = parseInt(draft.maxUses, 10);
      if (draft.expiresInDays) body.expiresInDays = parseInt(draft.expiresInDays, 10);
      const res = await fetch("/api/mentor/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setDraft({ roadmapSlug: "", label: "", maxUses: "", expiresInDays: "" });
        await load();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to create code");
      }
    } finally {
      setCreating(false);
    }
  };

  const deactivate = async (id: string) => {
    if (!confirm("Deactivate this code? Existing mentees stay paired, but new redemptions are blocked.")) return;
    await fetch(`/api/mentor/invites?id=${id}`, { method: "DELETE" });
    await load();
  };

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <section className="forge-panel" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
      <div className="flex items-center justify-between mb-3" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem" }}>Invite codes</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "0.125rem" }}>
            Share the <strong style={{ color: "var(--accent)" }}>Share link</strong> — your mentee clicks it, picks a name, and is in the dashboard. No signup, no password.
          </p>
        </div>
      </div>

      {/* New invite form */}
      <div
        className="responsive-form-row"
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1.5fr 0.7fr 0.7fr auto",
          gap: "0.5rem",
          background: "var(--bg-card)",
          padding: "0.75rem",
          borderRadius: 8,
          marginBottom: "1.25rem",
        }}
      >
        <select
          value={draft.roadmapSlug}
          onChange={(e) => setDraft({ ...draft, roadmapSlug: e.target.value })}
          style={{ padding: "0.5rem 0.625rem", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.8125rem" }}
        >
          <option value="">Any path (mentee picks)</option>
          {CURATED_ROADMAPS.map((r) => (
            <option key={r.slug} value={r.slug}>{r.title}</option>
          ))}
        </select>
        <input
          value={draft.label}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          placeholder="Label (optional) — e.g. 'Cohort 3'"
          style={{ padding: "0.5rem 0.625rem", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.8125rem" }}
        />
        <input
          value={draft.maxUses}
          onChange={(e) => setDraft({ ...draft, maxUses: e.target.value.replace(/[^0-9]/g, "") })}
          placeholder="Max uses"
          style={{ padding: "0.5rem 0.625rem", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)" }}
        />
        <input
          value={draft.expiresInDays}
          onChange={(e) => setDraft({ ...draft, expiresInDays: e.target.value.replace(/[^0-9]/g, "") })}
          placeholder="Expires (days)"
          style={{ padding: "0.5rem 0.625rem", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)" }}
        />
        <button
          onClick={create}
          disabled={creating}
          className="forge-btn forge-btn-primary"
          style={{ padding: "0.5rem 0.875rem", fontSize: "0.8125rem", display: "inline-flex", gap: "0.375rem", alignItems: "center" }}
        >
          {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          Generate
        </button>
      </div>

      {/* Active invites */}
      {loading ? (
        <div style={{ color: "var(--text-dim)", fontSize: "0.875rem" }}>Loading codes…</div>
      ) : invites.length === 0 ? (
        <div style={{ padding: "1rem", textAlign: "center", color: "var(--text-dim)", fontSize: "0.875rem" }}>
          No codes yet. Generate one above to start pairing with mentees.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {invites.map((i) => {
            const path = i.roadmapSlug ? CURATED_ROADMAPS.find((r) => r.slug === i.roadmapSlug)?.title ?? i.roadmapSlug : "Any path";
            const expired = i.expiresAt ? new Date(i.expiresAt) < new Date() : false;
            const maxedOut = i.maxUses != null && i.usesCount >= i.maxUses;
            const dead = !i.isActive || expired || maxedOut;
            return (
              <li
                key={i.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 0.875rem",
                  background: dead ? "var(--bg-card)" : "rgba(245,158,11,0.05)",
                  border: dead ? "1px solid var(--border)" : "1px solid rgba(245,158,11,0.25)",
                  borderRadius: 8,
                  opacity: dead ? 0.55 : 1,
                  flexWrap: "wrap",
                  rowGap: "0.5rem",
                }}
              >
                <code style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", fontWeight: 600, letterSpacing: "0.08em", color: "var(--text-primary)" }}>{i.code}</code>
                <button
                  onClick={() => copy(i.code, `code-${i.id}`)}
                  className="forge-btn forge-btn-ghost"
                  style={{ padding: "0.3rem 0.625rem", fontSize: "0.6875rem", display: "inline-flex", gap: "0.25rem", alignItems: "center" }}
                >
                  {copied === `code-${i.id}` ? <><CheckCircle2 size={11} /> Copied</> : <><Copy size={11} /> Code</>}
                </button>
                <button
                  onClick={() => copy(`${baseUrl}/j/${i.code}`, `link-${i.id}`)}
                  className="forge-btn forge-btn-ghost"
                  style={{ padding: "0.3rem 0.625rem", fontSize: "0.6875rem", display: "inline-flex", gap: "0.25rem", alignItems: "center", color: "var(--accent)", borderColor: "rgba(245,158,11,0.3)" }}
                  title="Share a one-click join link instead — mentee skips signup entirely"
                >
                  {copied === `link-${i.id}` ? <><CheckCircle2 size={11} /> Copied</> : <><Share2 size={11} /> Share link</>}
                </button>
                <span style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
                  <Link2 size={10} style={{ display: "inline", marginRight: 4 }} />
                  {path}
                  {i.label && <span> · {i.label}</span>}
                  <span> · {i.usesCount}{i.maxUses != null ? `/${i.maxUses}` : ""} used</span>
                  {i.expiresAt && <span> · {expired ? "expired" : `expires ${new Date(i.expiresAt).toLocaleDateString()}`}</span>}
                  {!i.isActive && <span> · deactivated</span>}
                </span>
                {!dead && (
                  <button
                    onClick={() => deactivate(i.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: "0.25rem" }}
                    title="Deactivate"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
