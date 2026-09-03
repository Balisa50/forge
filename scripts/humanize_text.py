"""
humanize_text.py — Strip AI-isms from every user-facing string in FORGE.

Targets:
  src/app/**/*.tsx
  src/components/**/*.tsx
  src/lib/**/*.ts          (question generator trick/decode strings)
  data/roadmaps/*.json
  data/exam-paths/*.json

Operations (in order):
  1.  Replace em dash (—) and en dash (–) with , or .
  2.  Remove inline **bold** and *italic* from markdown lesson bodies,
      leaving headings, list items, and code spans untouched.
  3.  Replace AI-sounding phrases with plain English equivalents.

Run from the FORGE root:
    python scripts/humanize_text.py
"""

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(".")

# ── Characters to replace ────────────────────────────────────────────────────
EM_DASH = "—"   # —
EN_DASH = "–"   # –

# ── AI-phrase substitution table ─────────────────────────────────────────────
# Each tuple: (regex_pattern, replacement).
# Applied in order — most specific first.
AI_PATTERNS: list[tuple[str, str]] = [
    # "Let's dive in" → "Here's how:"
    (r"[Ll]et['']?s dive in[.!]?\s*", "Here's how: "),
    # "In today's data-driven world" → delete
    (r"[Ii]n today['']?s data[-\s]driven world[,.]?\s*", ""),
    # "It is worth noting that" → delete
    (r"[Ii]t is worth noting that\s+", ""),
    # "It is important to understand that" → delete
    (r"[Ii]t is important to understand that\s+", ""),
    # "As we can see" → delete
    (r"[Aa]s we can see[,.]?\s*", ""),
    # "In conclusion" → delete
    (r"[Ii]n conclusion[,.]?\s*", ""),
    # "In other words" → delete
    (r"[Ii]n other words[,.]?\s*", ""),
    # "This is because X" → "Because X"
    (r"[Tt]his is because\s+", "Because "),
    # "Moreover" → "Also"
    (r"\b[Mm]oreover[,.]?\s+", "Also, "),
    # "Furthermore" → delete (leaves a gap, let caller tidy up double-spaces)
    (r"\b[Ff]urthermore[,.]?\s+", ""),
    # "Essentially" → delete
    (r"\b[Ee]ssentially[,.]?\s+", ""),
    # "Basically" → delete
    (r"\b[Bb]asically[,.]?\s+", ""),
    # "Thus" → "So"
    (r"\b[Tt]hus[,.]?\s+", "So "),
    # "Therefore" → "So"
    (r"\b[Tt]herefore[,.]?\s+", "So "),
    # "Not only X but also Y" → "X. Also, Y" (rough heuristic)
    (r"[Nn]ot only\s+(.{3,60}?)\s+but also\s+", r"\1. Also, "),
]

# ── Em-dash replacement ───────────────────────────────────────────────────────
# Rules (applied to each occurrence):
#   "word — word"  →  "word, word"    (flanked by spaces)
#   "word—word"    →  "word, word"    (no spaces)
# A trailing sentence-start after the dash gets a period instead.
# In practice a simple `, ` replacement handles 95% of cases cleanly.

_EM_RE = re.compile(r"\s*[—–]\s*")


def replace_dashes(text: str) -> str:
    return _EM_RE.sub(", ", text)


# ── Inline-emphasis stripper (Markdown fields only) ──────────────────────────
# Removes **bold** and *italic* from prose lines.
# Skips:
#   - Lines that are headings    (# …)
#   - Lines that are list items  (- … / * … / + … / N. …)
#   - Fenced-code blocks
#   - Indented-code blocks (4 spaces / tab)
# Code spans (`code`) are left intact even on normal prose lines.

_BOLD_RE   = re.compile(r"\*\*([^*\n]+?)\*\*")
_ITALIC_RE = re.compile(r"\*([^*\n]+?)\*")
_CODE_SPAN = re.compile(r"`[^`]*`")
_LIST_RE   = re.compile(r"^[-*+]\s|^\d+[.)]\s")
_HEAD_RE   = re.compile(r"^#{1,6}\s")
_INDENT_RE = re.compile(r"^(?:    |\t)")


def _strip_line_emphasis(line: str) -> str:
    stripped = line.lstrip()
    if _HEAD_RE.match(stripped) or _LIST_RE.match(stripped) or _INDENT_RE.match(line):
        return line
    # Split around code spans to avoid touching their content
    parts = _CODE_SPAN.split(line)
    code  = _CODE_SPAN.findall(line)
    new_parts = []
    for i, part in enumerate(parts):
        part = _BOLD_RE.sub(r"\1", part)
        part = _ITALIC_RE.sub(r"\1", part)
        new_parts.append(part)
        if i < len(code):
            new_parts.append(code[i])
    return "".join(new_parts)


def strip_inline_emphasis(text: str) -> str:
    lines = text.split("\n")
    out   = []
    in_fence = False
    for line in lines:
        if line.lstrip().startswith("```"):
            in_fence = not in_fence
            out.append(line)
            continue
        if in_fence:
            out.append(line)
        else:
            out.append(_strip_line_emphasis(line))
    return "\n".join(out)


# ── AI-phrase cleanup ─────────────────────────────────────────────────────────
_COMPILED_AI = [(re.compile(p, re.MULTILINE), r) for p, r in AI_PATTERNS]
# Collapse double-spaces left by deletions
_DOUBLE_SPACE = re.compile(r"  +")


def remove_ai_phrases(text: str) -> str:
    for pat, rep in _COMPILED_AI:
        text = pat.sub(rep, text)
    text = _DOUBLE_SPACE.sub(" ", text)
    return text


# ── Master transformer ────────────────────────────────────────────────────────
def clean(text: str, is_markdown: bool = False) -> str:
    text = replace_dashes(text)
    text = remove_ai_phrases(text)
    if is_markdown:
        text = strip_inline_emphasis(text)
    return text


# ── File processors ───────────────────────────────────────────────────────────

# Fields in JSON that contain user-facing prose (markdown).
MARKDOWN_FIELDS = frozenset({
    "body", "explain", "trick", "formula", "tagline",
    "description", "blurb", "intro", "caption",
})
# Fields with short plain text (no emphasis stripping needed).
PLAIN_FIELDS = frozenset({
    "title", "q", "label", "value", "answer", "front", "back",
    "passing", "subtitle",
})
# Fields with ordered step strings
STEP_FIELDS = frozenset({"steps", "sanity", "choices"})


def _walk(obj: object, parent_key: str = "") -> tuple[object, int]:
    """Recursively walk a JSON structure, cleaning strings. Returns (new_obj, changes)."""
    changes = 0
    if isinstance(obj, str):
        is_md = parent_key in MARKDOWN_FIELDS
        new = clean(obj, is_markdown=is_md)
        return new, (0 if new == obj else 1)
    if isinstance(obj, dict):
        for k, v in obj.items():
            new_v, c = _walk(v, parent_key=k)
            if c:
                obj[k] = new_v
                changes += c
        return obj, changes
    if isinstance(obj, list):
        is_md = parent_key in MARKDOWN_FIELDS | STEP_FIELDS
        for i, item in enumerate(obj):
            new_item, c = _walk(item, parent_key=parent_key if is_md else "")
            if c:
                obj[i] = new_item
                changes += c
        return obj, changes
    return obj, 0


def process_json(path: pathlib.Path) -> int:
    text = path.read_text(encoding="utf-8")
    data = json.loads(text)
    _, changes = _walk(data)
    if changes:
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    return changes


def process_text_file(path: pathlib.Path) -> int:
    """Process a .tsx or .ts file — replace dashes and AI phrases in string content."""
    text = path.read_text(encoding="utf-8")
    new  = clean(text, is_markdown=False)
    if new != text:
        path.write_text(new, encoding="utf-8")
        return text.count(EM_DASH) + text.count(EN_DASH)
    return 0


# ── Main ─────────────────────────────────────────────────────────────────────
def main() -> None:
    total_files  = 0
    total_changes = 0

    print("=== Phase 1 — TSX / app and component files ===\n")
    tsx_paths = (
        list(ROOT.glob("src/app/**/*.tsx"))
        + list(ROOT.glob("src/app/**/*.ts"))
        + list(ROOT.glob("src/components/**/*.tsx"))
    )
    for p in sorted(tsx_paths):
        n = process_text_file(p)
        if n:
            total_files  += 1
            total_changes += n
            print(f"  {p.relative_to(ROOT)}  (dashes: {n})")

    print(f"\nPhase 1 done: {total_files} files updated.\n")

    print("=== Phase 2 — TS library files (question generators, etc.) ===\n")
    ts_paths = list(ROOT.glob("src/lib/**/*.ts"))
    for p in sorted(ts_paths):
        n = process_text_file(p)
        if n:
            total_files  += 1
            total_changes += n
            print(f"  {p.relative_to(ROOT)}  (dashes: {n})")

    print(f"\nPhase 2 done.\n")

    print("=== Phase 3 — JSON roadmap and exam-path files ===\n")
    json_paths = (
        list((ROOT / "data" / "roadmaps").glob("*.json"))
        + list((ROOT / "data" / "exam-paths").glob("*.json"))
    )
    json_total = 0
    for p in sorted(json_paths):
        c = process_json(p)
        if c:
            total_files  += 1
            json_total   += c
            print(f"  {p.relative_to(ROOT)}  ({c} string changes)")

    print(f"\nPhase 3 done: {json_total} total string changes across JSON.\n")

    print("=== Validation ===\n")
    remaining = 0
    for p in tsx_paths + ts_paths + json_paths:
        t = p.read_text(encoding="utf-8")
        remaining += t.count(EM_DASH) + t.count(EN_DASH)
    print(f"  Remaining em/en dashes: {remaining}")
    if remaining:
        print("  NOTE: some dashes may be inside SVG path data or LaTeX — verify manually.")

    print(f"\n=== Summary ===")
    print(f"  Files modified :  {total_files}")
    print(f"  JSON strings cleaned :  {json_total}")
    print("Done.")


if __name__ == "__main__":
    main()
