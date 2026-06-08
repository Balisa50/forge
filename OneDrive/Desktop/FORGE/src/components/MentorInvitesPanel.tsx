"use client";

import { useEffect, useState, useCallback } from "react";
import { Copy, CheckCircle2, Plus, Trash2, Loader2, Share2, KeyRound } from "lucide-react";
import { CURATED_ROADMAPS } from "@/lib/curated-roadmaps-client";
import Dialog, { type DialogConfig } from "@/components/Dialog";
import ForgeSelect from "@/components/ForgeSelect";

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
  expectedName: string | null;
  personalIdIssued: string | null;
  consumedByUserId: string | null;
}

export default function MentorInvitesPanel() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    expectedName: "",
    roadmapSlug: "",
    label: "",
    expiresInDays: "30",
  });
  const [dialog, setDialog] = useState<DialogConfig | null>(null);

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
    if (!draft.expectedName.trim()) {
      setDialog({ kind: "alert", title: "Name required", message: "Enter your mentee's full name — it locks the invite to them so nobody else can claim the code." });
      return;
    }
    setCreating(true);
    try {
      const body: Record<string, unknown> = {
        expectedName: draft.expectedName.trim(),
      };
      if (draft.roadmapSlug) body.roadmapSlug = draft.roadmapSlug;
      if (draft.label.trim()) body.label = draft.label.trim();
      if (draft.expiresInDays) body.expiresInDays = parseInt(draft.expiresInDays, 10);
      const res = await fetch("/api/mentor/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setDraft({ expectedName: "", roadmapSlug: "", label: "", expiresInDays: "30" });
        await load();
      } else {
        const data = await res.json().catch(() => ({}));
        setDialog({ kind: "alert", title: "Couldn't create code", message: data.error || "Failed to create code" });
      }
    } finally {
      setCreating(false);
    }
  };

  const deactivate = (id: string) => {
    setDialog({
      kind: "confirm",
      title: "Deactivate this code?",
      message: "Existing mentees stay paired with you, but this link will stop working for new joins. You can always generate another one.",
      confirmText: "Deactivate",
      danger: true,
      onConfirm: async () => {
        await fetch(`/api/mentor/invites?id=${id}`, { method: "DELETE" });
        await load();
      },
    });
  };

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch { /* */ }
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <section className="forge-panel" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem" }}>Invite a mentee</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "0.25rem", lineHeight: 1.55 }}>
          Enter your mentee&apos;s <strong style={{ color: "var(--accent)" }}>full name</strong> + their path. You&apos;ll get TWO codes:<br/>
          <span style={{ color: "var(--accent)" }}>① Join link</span> (single-use, locked to that name) and <span style={{ color: "var(--accent)" }}>② Personal ID</span> (their permanent return code). Send both privately.
        </p>
      </div>

      {/* New invite form */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1.5fr 1fr 0.7fr auto",
          gap: "0.5rem",
          background: "var(--bg-card)",
          padding: "0.875rem",
          borderRadius: 8,
          marginBottom: "1.25rem",
        }}
        className="responsive-form-row"
      >
        <input
          value={draft.expectedName}
          onChange={(e) => setDraft({ ...draft, expectedName: e.target.value })}
          placeholder="Mentee's full name (required)"
          style={{ padding: "0.5rem 0.625rem", background: "var(--bg-panel)", border: "1px solid var(--accent)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 600 }}
        />
        <ForgeSelect
          value={draft.roadmapSlug}
          onChange={(v) => setDraft({ ...draft, roadmapSlug: v })}
          ariaLabel="Path"
          className=""
          buttonStyle={{ padding: "0.5rem 0.625rem", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.8125rem" }}
          options={[
            { value: "", label: "Path (mentee picks)" },
            ...CURATED_ROADMAPS.map((r) => ({ value: r.slug, label: r.title })),
          ]}
        />
        <input
          value={draft.label}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          placeholder="Note (optional)"
          style={{ padding: "0.5rem 0.625rem", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.8125rem" }}
        />
        <input
          value={draft.expiresInDays}
          onChange={(e) => setDraft({ ...draft, expiresInDays: e.target.value.replace(/[^0-9]/g, "") })}
          placeholder="Expires (days)"
          style={{ padding: "0.5rem 0.625rem", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)" }}
        />
        <button
          onClick={create}
          disabled={creating || !draft.expectedName.trim()}
          className="forge-btn forge-btn-primary"
          style={{ padding: "0.5rem 0.875rem", fontSize: "0.8125rem", display: "inline-flex", gap: "0.375rem", alignItems: "center" }}
        >
          {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          Generate codes
        </button>
      </div>

      {/* Active invites */}
      {loading ? (
        <div style={{ color: "var(--text-dim)", fontSize: "0.875rem" }}>Loading…</div>
      ) : invites.length === 0 ? (
        <div style={{ padding: "1rem", textAlign: "center", color: "var(--text-dim)", fontSize: "0.875rem" }}>
          No codes yet. Generate one above to invite your first mentee.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {invites.map((i) => {
            const path = i.roadmapSlug ? CURATED_ROADMAPS.find((r) => r.slug === i.roadmapSlug)?.title ?? i.roadmapSlug : "Any path";
            const expired = i.expiresAt ? new Date(i.expiresAt) < new Date() : false;
            const consumed = !!i.consumedByUserId;
            const dead = !i.isActive || expired || consumed;
            return (
              <li
                key={i.id}
                style={{
                  display: "flex", flexDirection: "column", gap: "0.625rem",
                  padding: "0.875rem 1rem",
                  background: dead ? "var(--bg-card)" : "rgba(245,158,11,0.05)",
                  border: dead ? "1px solid var(--border)" : "1px solid rgba(245,158,11,0.25)",
                  borderRadius: 8,
                  opacity: dead ? 0.65 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem", fontWeight: 600 }}>
                      {i.expectedName || "(legacy code — no name lock)"}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", marginTop: "0.125rem" }}>
                      {path}
                      {i.label && <> · {i.label}</>}
                      {i.expiresAt && <> · {expired ? "expired" : `expires ${new Date(i.expiresAt).toLocaleDateString()}`}</>}
                      {consumed && <> · ✓ joined</>}
                      {!i.isActive && !consumed && <> · deactivated</>}
                    </div>
                  </div>
                  {!dead && (
                    <button
                      onClick={() => deactivate(i.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: "0.25rem" }}
                      title="Deactivate"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {!dead && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    {/* Code 1: Join link */}
                    <div style={{ padding: "0.625rem 0.75rem", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 6 }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.1em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                        ① Join link (one-time)
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexWrap: "wrap" }}>
                        <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--text-primary)" }}>
                          {baseUrl.replace(/^https?:\/\//, "")}/j/{i.code}
                        </code>
                        <button
                          onClick={() => copy(`${baseUrl}/j/${i.code}`, `link-${i.id}`)}
                          className="forge-btn forge-btn-ghost"
                          style={{ padding: "0.25rem 0.5rem", fontSize: "0.6875rem", display: "inline-flex", gap: "0.25rem", alignItems: "center" }}
                        >
                          {copied === `link-${i.id}` ? <><CheckCircle2 size={11} /> Copied</> : <><Share2 size={11} /> Copy</>}
                        </button>
                      </div>
                    </div>

                    {/* Code 2: Personal ID */}
                    <div style={{ padding: "0.625rem 0.75rem", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 6 }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", letterSpacing: "0.1em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                        ② Personal ID (permanent)
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexWrap: "wrap" }}>
                        <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", fontWeight: 600, color: "var(--accent)" }}>
                          {i.personalIdIssued ?? "—"}
                        </code>
                        {i.personalIdIssued && (
                          <button
                            onClick={() => copy(i.personalIdIssued!, `pid-${i.id}`)}
                            className="forge-btn forge-btn-ghost"
                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.6875rem", display: "inline-flex", gap: "0.25rem", alignItems: "center" }}
                          >
                            {copied === `pid-${i.id}` ? <><CheckCircle2 size={11} /> Copied</> : <><KeyRound size={11} /> Copy</>}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <Dialog config={dialog} onClose={() => setDialog(null)} />
    </section>
  );
}
