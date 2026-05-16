/**
 * In-memory LRU for generated roadmap skeletons.
 *
 * Keyed by a sha256 of (title + type + learningStyle), so two users asking
 * for "learn rust" with the same learning style share a cache hit. We store
 * the PARSED JSON skeleton (not the DB-inserted roadmap), so the caller
 * still does its own prisma.roadmap.create with the right userId.
 *
 * TTL: 7 days. Max entries: 100. First-in-first-out eviction via Map order.
 */

import { createHash } from "crypto";

export interface CachedRoadmap {
  tracks: Array<{
    title: string;
    color: string;
    phases: Array<{
      title: string;
      tasks: Array<{
        title: string;
        detail: string;
        why?: string;
        milestone?: string;
        estimatedHours?: number;
        resources?: string[];
      }>;
    }>;
  }>;
}

interface CacheEntry {
  data: CachedRoadmap;
  expiresAt: number;
}

const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_ENTRIES = 100;

// Using a module-level Map: survives across requests in a single server
// process. Serverless cold starts lose it — that's fine, AI re-generates.
const cache = new Map<string, CacheEntry>();

export function cacheKey(
  title: string,
  type: "learn" | "project",
  learningStyle?: string | null,
): string {
  const normalised = `${title.trim().toLowerCase()}|${type}|${learningStyle ?? "default"}`;
  return createHash("sha256").update(normalised).digest("hex").slice(0, 32);
}

export function getCached(key: string): CachedRoadmap | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  // Touch — move to end for LRU-ish ordering.
  cache.delete(key);
  cache.set(key, entry);
  return entry.data;
}

export function setCached(key: string, data: CachedRoadmap): void {
  if (cache.size >= MAX_ENTRIES) {
    // Evict oldest (Map iteration order = insertion order).
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) cache.delete(firstKey);
  }
  cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
}

export function clearCache(): void {
  cache.clear();
}

export function cacheStats(): { size: number; maxEntries: number; ttlDays: number } {
  return { size: cache.size, maxEntries: MAX_ENTRIES, ttlDays: 7 };
}
