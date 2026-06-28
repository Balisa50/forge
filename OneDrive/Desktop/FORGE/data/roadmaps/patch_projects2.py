#!/usr/bin/env python3
"""Mission 1, pass 2: scrub remaining todo/blog vocabulary from week-level fields
of full-stack-web W5/W6/W16, mapping it to the Split / Atlas / Kanban projects.
The 'resources' subtree is skipped (it cites a real developer's blog by name)."""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
FP = HERE / "full-stack-web.json"
DASH = "—"
d = json.load(open(FP, encoding="utf-8"))

# Ordered (most specific first) per-week vocabulary maps.
W5 = [
    ("todo-app-beyond", "split-expense-tracker"),
    ("Repo todo-app", "Repo split-expense-tracker"),
    ("my-todos", "my-split"),
    ("Todo App Beyond Todos", f"Split {DASH} a group expense tracker"),
    ("Todo App", "Expense Tracker"), ("todo app", "expense tracker"),
    ("TodoItem", "ExpenseItem"), ("deleteTodo", "deleteExpense"),
    ("addTodo", "addExpense"), ("newTodo", "newExpense"),
    ("setTodos", "setExpenses"), ("todos.push", "expenses.push"),
    ("filtered todo list", "filtered expense list"),
    ("todo items", "expense items"), ("todo list", "expense list"),
    ("a todo is dragged", "an expense is dragged"),
    ("mark a todo as complete", "mark an expense as settled"),
    ("complete a todo", "settle an expense"),
    ("between todos", "between expenses"),
    ("todos", "expenses"), ("Todos", "Expenses"),
    ("todo", "expense"), ("Todo", "Expense"),
]
W6 = [
    ("blog posts", "directory entries"), ("blog post", "directory entry"),
    ("Blog deployed", "Directory deployed"),
    ("App Router blog", "App Router directory"),
    ("your blog", "your directory"), ("Blog with CMS", "programmatic-SEO directory"),
    ("a blog", "a directory"), ("blog/[slug]", "directory/[slug]"),
    ("/blog", "/directory"), ("blog", "directory"), ("Blog", "Directory"),
    ("real posts", "real entries"),
    ("PostList", "EntryList"), ("fetchPosts", "fetchEntries"),
    ("BlogPage", "DirectoryPage"),
    ("posts", "entries"), ("Posts", "Entries"),
]
W16 = [
    ("collaborative todo list", "collaborative Kanban board"),
    ("collaborative todo", "collaborative Kanban board"),
    ("todo list", "Kanban board"), ("todo", "card"), ("Todo", "Card"),
]


def scrub(node, repls, in_resources=False):
    if isinstance(node, dict):
        return {k: scrub(v, repls, in_resources or k == "resources") for k, v in node.items()}
    if isinstance(node, list):
        return [scrub(v, repls, in_resources) for v in node]
    if isinstance(node, str) and not in_resources:
        s = node
        for a, b in repls:
            s = s.replace(a, b)
        return s
    return node


for wn, repls in [(5, W5), (6, W6), (16, W16)]:
    d["weeks"][wn - 1] = scrub(d["weeks"][wn - 1], repls)

json.dump(d, open(FP, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
print("Pass 2 complete: scrubbed W5/W6/W16 (resources preserved).")
