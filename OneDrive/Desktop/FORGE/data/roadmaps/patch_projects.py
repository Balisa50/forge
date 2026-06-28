#!/usr/bin/env python3
"""Mission 1: replace mediocre projects in full-stack-web.json.

W5  Todo App  -> Split (group expense tracker, client-side React)
W6  Blog      -> Atlas (programmatic-SEO resource directory, App Router + MDX + SSG)
W16 collaborative todo -> collaborative Kanban board (real-time, Yjs + Postgres)

All three teach the exact same skills the week targets; only the project changes
from bootcamp-tier to a portfolio piece with real user/business value.
"""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
FP = HERE / "full-stack-web.json"
DASH = "—"  # em dash

d = json.load(open(FP, encoding="utf-8"))


def day(wn, dn):
    return [x for x in d["weeks"][wn - 1]["days"] if x["number"] == dn][0]


def set_item(wn, dn, idx, key, val):
    day(wn, dn)["items"][idx][key] = val


def set_week(wn, key, val):
    d["weeks"][wn - 1][key] = val


# ───────────────────────── WEEK 5: Split ─────────────────────────
W5_PROJECT = (
    f"Split {DASH} a group expense tracker. Friends share costs on a trip; Split records who paid "
    "for what, splits each expense across the group, and computes the minimal set of settle-up "
    "payments (who owes whom). Categories, per-expense split rules, drag-to-reorder, dark mode, "
    "keyboard shortcuts (j/k navigation, x to settle), localStorage persistence. No backend yet "
    f"{DASH} pure React. Make it good enough you'd actually use it on your next trip."
)
set_week(5, "project", W5_PROJECT)

set_item(5, 1, 0, "body",
    f'Read this week\'s intro above, then look at the project: "Split {DASH} a group expense tracker."\n\n'
    "In two or three sentences, write down: (1) what you'll be able to DO by Friday that you can't do "
    "today, and (2) which of the five tasks below scares you most. That task is where the real learning "
    f"is {DASH} start there if you stall.")

set_item(5, 3, 4, "body",
    "Add useMemo to your filtered expense list. Compare React DevTools profiler before and after. "
    "Is the perf actually better or are you just adding indirection?")

set_item(5, 7, 0, "body",
    f"Build Split {DASH} a group expense tracker. Friends share costs; Split splits each expense across "
    "the group and computes the minimal settle-up payments (who owes whom). Categories, per-expense "
    "split rules, drag-to-reorder, dark mode, keyboard shortcuts (j/k navigation, x to settle), "
    "localStorage persistence. No backend yet. Make it good enough you'd actually use it on your next trip.\n\n"
    "Ship checklist:\n"
    f'  - It runs from a clean clone / fresh open {DASH} no "works on my machine" steps missing.\n'
    "  - Commit it to your repo with a short README saying what it does and how to run it.\n"
    "  - Tag or note this as your Week 5 deliverable so you can look back on it.")

set_item(5, 7, 1, "body",
    "Your expense list has a deleteExpense function that removes an expense by id. You pass this function "
    "as a prop to each ExpenseItem component: <ExpenseItem onDelete={deleteExpense}>. In the ExpenseItem "
    "component, you call props.onDelete(expense.id) when the delete button is clicked. Why pass the "
    f"function as a prop rather than defining it inside ExpenseItem? ExpenseItem does not own the expenses "
    f"array {DASH} the parent component does. Only the owner of the state should modify it. ExpenseItem is a "
    "presentational component: it displays data and signals intent (the user wants to delete this expense), "
    "but the actual deletion happens in the parent, which has access to the expenses array and its setter "
    "function. This is the one-directional data flow principle: data flows down (expenses passed to "
    "ExpenseItem as props), events bubble up (onDelete callback called by ExpenseItem, handled by parent).")

# ───────────────────────── WEEK 6: Atlas ─────────────────────────
W6_PROJECT = (
    f"Atlas {DASH} a programmatic-SEO resource directory. Pick a niche (e.g. \"open-source tools for "
    "indie hackers\" or \"scholarships for West African students\") and build a directory where every "
    "entry is its own statically-generated page. Next.js App Router + MDX/structured data for content + "
    "Tailwind + Vercel. Hundreds of pages pre-rendered with generateStaticParams, per-page "
    "generateMetadata for SEO, tag/category filters, full-text search, a sitemap.xml, and OG image "
    f"generation. Lighthouse 100s. Deploy to a custom domain. Programmatic SEO is how real directories "
    "pull organic traffic {DASH} this is a portfolio piece that can actually rank.".replace("{DASH}", DASH)
)
set_week(6, "project", W6_PROJECT)

set_item(6, 1, 0, "body",
    f'Read this week\'s intro above, then look at the project: "Atlas {DASH} a programmatic-SEO resource directory."\n\n'
    "In two or three sentences, write down: (1) what you'll be able to DO by Friday that you can't do "
    "today, and (2) which of the five tasks below scares you most. That task is where the real learning "
    f"is {DASH} start there if you stall.")

set_item(6, 3, 2, "title",
    "Build: a directory with /[slug] entry pages generated from a data/MDX source")
set_item(6, 3, 2, "body",
    "Build a directory with /[slug] entry pages that read from MDX files or a structured data source; "
    "pre-render every entry with generateStaticParams.\n\n"
    "Definition of done:\n"
    "  - You can DEMO it working, not just describe it.\n"
    f"  - It's your build {DASH} not a tutorial's code pasted in.\n"
    "  - You could explain to someone why each piece is there.\n\n"
    f'Stuck? Read this week\'s "common mistakes" and "debug help" tabs before you search {DASH} they were '
    "written for exactly this step.")

set_item(6, 3, 3, "body",
    "Disable JavaScript in your browser; load a directory entry page. Does it still work? It should "
    f"{DASH} Server Components render server-side.")

set_item(6, 7, 0, "body",
    f"Build Atlas {DASH} a programmatic-SEO resource directory. Next.js App Router + MDX/structured data + "
    "Tailwind + Vercel. Each entry lives as data/MDX and is pre-rendered at build time with "
    "generateStaticParams. Add tag/category filters, full-text search, a generated sitemap.xml, per-page "
    "generateMetadata, OG image generation, dark mode. Lighthouse 100s. Deploy to a custom domain. This "
    "is the architecture real directories and programmatic-SEO sites that earn organic traffic are built on.\n\n"
    "Ship checklist:\n"
    f'  - It runs from a clean clone / fresh open {DASH} no "works on my machine" steps missing.\n'
    "  - Commit it to your repo with a short README saying what it does and how to run it.\n"
    "  - Tag or note this as your Week 6 deliverable so you can look back on it.")

set_item(6, 7, 1, "body",
    "You have a page component that fetches directory entries from a data source. You write it as an async "
    "server component: async function DirectoryPage() { const entries = await fetchEntries(); return "
    "<EntryList entries={entries} />; }. What happens if the fetch takes 3 seconds? In server components, "
    "the page waits for the async operations to complete before sending HTML to the browser. The user sees "
    "nothing for 3 seconds, then gets the fully rendered page. To improve this: add a loading.tsx file in "
    f"the directory folder {DASH} Next.js shows this skeleton UI while the server component is loading. Or "
    "use Suspense boundaries within the page to stream parts of the page as they become ready.")

# ───────────────────── WEEK 16: collaborative Kanban ─────────────────────
set_item(16, 5, 2, "body",
    "Build a collaborative Kanban board with Yjs and have two browsers move cards at once with a network "
    "partition. What happens when they reconnect? Do the changes merge or conflict?")
set_item(16, 6, 1, "title",
    "Build: a collaborative Kanban board using Yjs with persistence to Postgres")
set_item(16, 6, 1, "body",
    "Implement a collaborative Kanban board using Yjs with persistence to Postgres\n\n"
    "Definition of done:\n"
    "  - You can DEMO it working, not just describe it.\n"
    f"  - It's your build {DASH} not a tutorial's code pasted in.\n"
    "  - You could explain to someone why each piece is there.\n\n"
    f'Stuck? Read this week\'s "common mistakes" and "debug help" tabs before you search {DASH} they were '
    "written for exactly this step.")

json.dump(d, open(FP, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
print("Patched full-stack-web.json: W5->Split, W6->Atlas, W16->collaborative Kanban.")
