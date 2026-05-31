"use client";

/**
 * Browser-local mastery + spaced-repetition store for the actuary paths.
 *
 * No account, no network — everything lives in localStorage so a classmate can
 * open a shared link and start instantly. Progress is per-device by design.
 *
 * A concept moves: not-started → in-progress (opened) → mastered (passed the
 * timed quiz at/above the passing bar). Once mastered, an SM-2-lite scheduler
 * sets a `dueAt`: the concept resurfaces for review on an expanding interval
 * (1d → 3d → 7d → 16d → 35d → 75d). A failed review collapses the interval back
 * to the start — the concept literally can't escape until it sticks.
 */

import { useCallback, useEffect, useState } from "react";

export type ConceptStatus = "not-started" | "in-progress" | "mastered";

export interface ConceptProgress {
  status: ConceptStatus;
  /** Best quiz score as a fraction 0–1. */
  best: number;
  attempts: number;
  /** SM-2-lite review box, 0 = brand new. */
  box: number;
  /** Epoch ms when this concept is next due for review (mastered only). */
  dueAt: number | null;
  masteredAt: number | null;
  lastSeen: number | null;
}

export type PathProgress = Record<string, ConceptProgress>;

const PREFIX = "forge.exam.";
// Review intervals in days, indexed by box. Last value repeats for higher boxes.
const INTERVALS = [1, 3, 7, 16, 35, 75];
const DAY = 86_400_000;

function key(slug: string): string {
  return PREFIX + slug;
}

function emptyConcept(): ConceptProgress {
  return { status: "not-started", best: 0, attempts: 0, box: 0, dueAt: null, masteredAt: null, lastSeen: null };
}

export function readProgress(slug: string): PathProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key(slug));
    return raw ? (JSON.parse(raw) as PathProgress) : {};
  } catch {
    return {};
  }
}

function writeProgress(slug: string, data: PathProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(slug), JSON.stringify(data));
    // Notify every mounted hook on this page (storage event only fires cross-tab).
    window.dispatchEvent(new CustomEvent("forge-exam-progress", { detail: { slug } }));
  } catch {
    /* quota / private mode — fail silently, progress just won't persist */
  }
}

export function getConcept(p: PathProgress, conceptId: string): ConceptProgress {
  return p[conceptId] ?? emptyConcept();
}

/** Mark a concept opened (not-started → in-progress; never downgrades). */
export function markOpened(slug: string, conceptId: string): void {
  const data = readProgress(slug);
  const c = { ...getConcept(data, conceptId) };
  c.lastSeen = Date.now();
  if (c.status === "not-started") c.status = "in-progress";
  data[conceptId] = c;
  writeProgress(slug, data);
}

/**
 * Record a mastery-quiz attempt. `score` is fraction correct 0–1; `passed`
 * is score >= passing bar. On pass we advance the spaced-repetition box and set
 * the next due date; on a failed REVIEW (already mastered) we collapse the box.
 */
export function recordAttempt(slug: string, conceptId: string, score: number, passed: boolean): ConceptProgress {
  const data = readProgress(slug);
  const c = { ...getConcept(data, conceptId) };
  const now = Date.now();
  c.attempts += 1;
  c.best = Math.max(c.best, score);
  c.lastSeen = now;

  if (passed) {
    if (c.status !== "mastered") {
      c.status = "mastered";
      c.masteredAt = now;
      c.box = 1;
    } else {
      // A successful review pushes the interval out.
      c.box = Math.min(c.box + 1, INTERVALS.length);
    }
    const days = INTERVALS[Math.min(c.box - 1, INTERVALS.length - 1)];
    c.dueAt = now + days * DAY;
  } else {
    if (c.status === "mastered") {
      // Failed a review — it slips back into the rotation immediately.
      c.box = 0;
      c.dueAt = now + DAY;
    } else if (c.status === "not-started") {
      c.status = "in-progress";
    }
  }
  data[conceptId] = c;
  writeProgress(slug, data);
  return c;
}

export function resetPath(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(slug));
    window.dispatchEvent(new CustomEvent("forge-exam-progress", { detail: { slug } }));
  } catch {
    /* ignore */
  }
}

/** Concept ids whose review is due now (mastered + dueAt in the past). */
export function dueForReview(p: PathProgress): string[] {
  const now = Date.now();
  return Object.entries(p)
    .filter(([, v]) => v.status === "mastered" && v.dueAt != null && v.dueAt <= now)
    .map(([id]) => id);
}

export interface PathStats {
  mastered: number;
  inProgress: number;
  dueCount: number;
}

export function summarize(p: PathProgress): PathStats {
  let mastered = 0;
  let inProgress = 0;
  for (const v of Object.values(p)) {
    if (v.status === "mastered") mastered++;
    else if (v.status === "in-progress") inProgress++;
  }
  return { mastered, inProgress, dueCount: dueForReview(p).length };
}

/**
 * React hook: live view of a path's progress that re-reads on any local change
 * (same-tab CustomEvent) or cross-tab storage event. Starts empty on the server
 * and first client paint to avoid hydration mismatch, then hydrates in an effect.
 */
export function useExamProgress(slug: string): {
  progress: PathProgress;
  ready: boolean;
  refresh: () => void;
} {
  const [progress, setProgress] = useState<PathProgress>({});
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setProgress(readProgress(slug));
    setReady(true);
  }, [slug]);

  useEffect(() => {
    refresh();
    function onLocal(e: Event) {
      const detail = (e as CustomEvent).detail as { slug?: string } | undefined;
      if (!detail || detail.slug === slug) refresh();
    }
    function onStorage(e: StorageEvent) {
      if (e.key === key(slug)) refresh();
    }
    window.addEventListener("forge-exam-progress", onLocal);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("forge-exam-progress", onLocal);
      window.removeEventListener("storage", onStorage);
    };
  }, [slug, refresh]);

  return { progress, ready, refresh };
}
