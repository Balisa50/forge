"use client";

import {
  useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Search } from "lucide-react";

export interface ForgeSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ForgeSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: ForgeSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  /** Show a filter box. Defaults to true when there are more than 10 options. */
  searchable?: boolean;
  ariaLabel?: string;
  id?: string;
  /** Applied to the trigger button (defaults to the shared `forge-input` look).
   *  Pass "" to drop it and style the trigger entirely via `buttonStyle`. */
  className?: string;
  /** Inline styles merged onto the trigger button (after the layout defaults). */
  buttonStyle?: CSSProperties;
  /** Applied to the outer wrapper. */
  style?: CSSProperties;
}

/**
 * FORGE-styled dropdown — a full replacement for the native <select>, which on
 * mobile/desktop renders the OS's own (off-theme) picker. The listbox is rendered
 * in a portal with fixed positioning so it is never clipped by an `overflow:hidden`
 * ancestor, flips above the trigger when there isn't room below, supports full
 * keyboard control (↑/↓/Home/End/Enter/Esc + type-to-filter), and closes on
 * outside-click, scroll, or resize.
 */
export default function ForgeSelect({
  value, onChange, options, placeholder = "Select…", disabled = false,
  searchable, ariaLabel, id, className = "forge-input", buttonStyle, style,
}: ForgeSelectProps) {
  const autoId = useId();
  const listboxId = id ? `${id}-listbox` : `forge-select-${autoId}`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number; width: number; placement: "below" | "above"; maxH: number }>(
    { left: 0, top: 0, width: 0, placement: "below", maxH: 280 },
  );

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const showSearch = searchable ?? options.length > 10;
  const selected = options.find((o) => o.value === value) ?? null;

  useEffect(() => setMounted(true), []);

  const filtered = useMemo(() => {
    if (!showSearch || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, showSearch]);

  // Position the portal popover relative to the trigger, flipping up if needed.
  const reposition = () => {
    const t = triggerRef.current;
    if (!t) return;
    const r = t.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;
    const desired = 300;
    const placement: "below" | "above" = spaceBelow >= desired || spaceBelow >= spaceAbove ? "below" : "above";
    const maxH = Math.max(160, Math.min(desired, (placement === "below" ? spaceBelow : spaceAbove) - 12));
    setPos({
      left: r.left,
      top: placement === "below" ? r.bottom + 4 : r.top - 4,
      width: r.width,
      placement,
      maxH,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
    const onScroll = () => reposition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Outside-click + Escape close.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const tgt = e.target as Node;
      if (triggerRef.current?.contains(tgt) || popRef.current?.contains(tgt)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // When opening: reset filter, focus search, point the active row at the selection.
  useEffect(() => {
    if (open) {
      setQuery("");
      const i = filtered.findIndex((o) => o.value === value);
      setActiveIdx(i >= 0 ? i : 0);
      if (showSearch) requestAnimationFrame(() => searchRef.current?.focus());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the active row in view as it changes.
  useEffect(() => {
    if (!open) return;
    popRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIdx, open]);

  const choose = (opt: ForgeSelectOption) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) { e.preventDefault(); setOpen(true); }
      return;
    }
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); triggerRef.current?.focus(); return; }
    if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[activeIdx];
      if (opt) choose(opt);
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(filtered.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(0, i - 1)); }
    else if (e.key === "Home") { e.preventDefault(); setActiveIdx(0); }
    else if (e.key === "End") { e.preventDefault(); setActiveIdx(filtered.length - 1); }
  };

  return (
    <div style={{ position: "relative", ...style }}>
      <button
        type="button"
        ref={triggerRef}
        id={id}
        disabled={disabled}
        className={className}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem",
          width: "100%", textAlign: "left", cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1, appearance: "none",
          ...buttonStyle,
        }}
      >
        <span style={{
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          color: selected ? "var(--text-primary)" : "var(--text-dim)",
        }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          style={{ flexShrink: 0, color: "var(--text-dim)", transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {mounted && open && createPortal(
        <div
          ref={popRef}
          role="listbox"
          id={listboxId}
          aria-activedescendant={activeIdx >= 0 ? `${listboxId}-opt-${activeIdx}` : undefined}
          onKeyDown={onKeyDown}
          style={{
            position: "fixed",
            left: pos.left,
            width: pos.width,
            ...(pos.placement === "below" ? { top: pos.top } : { top: pos.top, transform: "translateY(-100%)" }),
            maxHeight: pos.maxH,
            display: "flex", flexDirection: "column",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          {showSearch && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.625rem", borderBottom: "1px solid var(--border)" }}>
              <Search size={14} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
                onKeyDown={onKeyDown}
                placeholder="Filter…"
                style={{
                  flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none",
                  color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: "0.875rem",
                }}
              />
            </div>
          )}
          <div style={{ overflowY: "auto", padding: "0.25rem" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "0.75rem", color: "var(--text-dim)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)" }}>
                No matches
              </div>
            ) : filtered.map((opt, i) => {
              const isSel = opt.value === value;
              const isActive = i === activeIdx;
              return (
                <div
                  key={opt.value || `opt-${i}`}
                  id={`${listboxId}-opt-${i}`}
                  data-idx={i}
                  role="option"
                  aria-selected={isSel}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => choose(opt)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem",
                    padding: "0.5rem 0.625rem", borderRadius: 7, cursor: opt.disabled ? "not-allowed" : "pointer",
                    background: isActive ? "rgba(0,200,255,0.10)" : "transparent",
                    color: opt.disabled ? "var(--text-dim)" : isSel ? "var(--blue)" : "var(--text-primary)",
                    fontFamily: "var(--font-body)", fontSize: "0.875rem", opacity: opt.disabled ? 0.5 : 1,
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt.label}</span>
                  {isSel && <Check size={15} style={{ flexShrink: 0, color: "var(--blue)" }} />}
                </div>
              );
            })}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
