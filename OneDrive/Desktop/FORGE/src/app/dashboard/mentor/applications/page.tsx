import { redirect } from "next/navigation";

/**
 * Applications merged into the "Add mentees" page — one place to grow the
 * roster. Kept as a redirect so old bookmarks and links don't 404.
 */
export default function ApplicationsRedirect() {
 redirect("/dashboard/mentor/invite");
}
