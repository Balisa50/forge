"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Silently triggers a server-component re-render on a fixed interval.
 * Use on dashboards where stats should stay live without manual reload.
 * Default cadence: 30 seconds — matches the NotificationBell poller, so
 * the user perceives both updates together.
 */
export default function AutoRefresh({ intervalMs = 30_000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
