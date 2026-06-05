"use client";

import { useState, useEffect } from "react";
import { Plus, ExternalLink, Trash2, FileText, Link as LinkIcon } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  fileUrl: string | null;
  fileType: string | null;
  cohortId: string | null;
  sortOrder: number;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", url: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/org/resources")
      .then((r) => r.json())
      .then((d) => { setResources(d.resources ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!form.title) { setMsg("Title required."); return; }
    const res = await fetch("/api/org/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setResources([...resources, data.resource]);
      setShowAdd(false);
      setForm({ title: "", description: "", url: "" });
      setMsg("");
    } else {
      setMsg(data.error);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/org/resources", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceId: id }),
    });
    setResources(resources.filter((r) => r.id !== id));
  };

  if (loading) return <div style={{ color: "var(--text-dim)", padding: "2rem" }}>Loading resources...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem" }}>Resources</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Upload learning materials, documentation, and links for your students.
          </p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="forge-btn forge-btn-primary" style={{ gap: "0.375rem" }}>
          <Plus size={14} /> Add Resource
        </button>
      </div>

      {showAdd && (
        <div className="forge-panel" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label-mono" style={{ display: "block", marginBottom: "0.375rem" }}>Title</label>
              <input type="text" className="forge-input" placeholder="e.g. React Official Docs" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label-mono" style={{ display: "block", marginBottom: "0.375rem" }}>URL</label>
              <input type="url" className="forge-input" placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="label-mono" style={{ display: "block", marginBottom: "0.375rem" }}>Description</label>
              <input type="text" className="forge-input" placeholder="Brief description of this resource" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleAdd} className="forge-btn forge-btn-primary">Add Resource</button>
            <button onClick={() => setShowAdd(false)} className="forge-btn forge-btn-ghost">Cancel</button>
          </div>
          {msg && <div style={{ marginTop: "0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--red)" }}>{msg}</div>}
        </div>
      )}

      {resources.length === 0 ? (
        <div className="forge-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <p style={{ color: "var(--text-dim)", fontSize: "0.9375rem" }}>No resources yet. Add documentation, video links, or reading materials for your students.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {resources.map((r) => (
            <div key={r.id} className="forge-panel" style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
              <div className="flex items-center gap-3" style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "8px",
                  background: r.url ? "rgba(59,130,246,0.1)" : "rgba(245,158,11,0.1)",
                  border: r.url ? "1px solid rgba(59,130,246,0.2)" : "1px solid rgba(245,158,11,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {r.url ? <LinkIcon size={16} color="var(--blue)" /> : <FileText size={16} color="var(--accent)" />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.9375rem" }}>{r.title}</div>
                  {r.description && <div style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "0.125rem" }}>{r.description}</div>}
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--blue)", display: "inline-flex", alignItems: "center", gap: "0.25rem", marginTop: "0.25rem", textDecoration: "none" }}>
                      <ExternalLink size={10} /> {r.url.length > 60 ? r.url.slice(0, 60) + "..." : r.url}
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(r.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: "0.5rem", transition: "color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
