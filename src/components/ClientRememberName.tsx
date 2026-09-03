"use client";

import { useEffect } from "react";

/**
 * Mounted on the dashboard layout for users who arrived via mentee-return.
 * If localStorage already contains a remembered personalId (set by the login
 * page on successful sign-in), this caches the user's display name alongside
 * it so the welcome-back card on the next visit can greet them by name.
 *
 * For email/password users localStorage holds no personalId, so this is a
 * no-op.
 */
export default function ClientRememberName({ name }: { name: string | null }) {
 useEffect(() => {
 if (!name) return;
 try {
 const hasPid = localStorage.getItem("forge_remembered_personal_id");
 if (hasPid) {
 localStorage.setItem("forge_remembered_name", name);
 }
 } catch {
 // localStorage blocked, silently ignore
 }
 }, [name]);
 return null;
}
