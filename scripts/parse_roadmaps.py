"""
Parse the LaTeX roadmaps in ~/Desktop/mentoring into structured JSON
that THE FORGE can seed into the Roadmap → Phase → Week → ... hierarchy.

Outputs:
    data/roadmaps/data-science.json
    data/roadmaps/data-analysis.json
    data/roadmaps/bi-analytics.json

Each file is shaped:
    {
      "slug": "data-science",
      "title": "Data Science",
      "total_weeks": 20,
      "weeks": [
        {
          "number": 1,
          "title": "Python for Data Science — Environment & Foundations",
          "phase": "Foundations",
          "commitment_hours": "25-35",
          "context": "...",
          "topics": [...],
          "tasks": [...],
          "project": "...",
          "resources": [{ "label": ..., "url": ..., "note": ... }, ...],
          "questions": [...],
          "exercises": [...],
          "outputs": [...]
        },
        ...
      ]
    }
"""
from __future__ import annotations

import json
import re
from pathlib import Path

SOURCE_DIR = Path(r"C:\Users\Abdoulie Balisa\OneDrive\Desktop\mentoring")
OUT_DIR = Path(__file__).resolve().parent.parent / "data" / "roadmaps"

FILES = [
    ("data-science", "Data Science", "Data_Science_Roadmap.tex"),
    ("data-analysis", "Data Analysis", "Data_Analysis_Roadmap.tex"),
    ("bi-analytics", "BI Analytics", "BI_Analytics_Roadmap.tex"),
]


def unescape_tex(text: str) -> str:
    """Strip the most common TeX escapes / formatting noise."""
    text = text.replace("\\&", "&").replace("\\%", "%").replace("\\#", "#")
    text = text.replace("\\$", "$").replace("\\_", "_")
    text = text.replace("--", "—").replace("`", "'").replace("''", '"')
    text = re.sub(r"\\textbf\{([^{}]*)\}", r"\1", text)
    text = re.sub(r"\\textit\{([^{}]*)\}", r"\1", text)
    text = re.sub(r"\\emph\{([^{}]*)\}", r"\1", text)
    text = re.sub(r"\\href\{([^{}]+)\}\{([^{}]+)\}", r"\2 (\1)", text)
    text = re.sub(r"\\small", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_items(block: str) -> list[str]:
    """Get \\item entries from an itemize/enumerate block."""
    items: list[str] = []
    for raw in re.findall(r"\\item\s+(.+?)(?=\\item|\\end\{(?:itemize|enumerate)\})", block, re.DOTALL):
        cleaned = unescape_tex(raw)
        if cleaned:
            items.append(cleaned)
    return items


def extract_resources(block: str) -> list[dict]:
    """Special parser for the Resources section — captures href URL + label + note."""
    out: list[dict] = []
    pattern = re.compile(
        r"\\item\s+\\href\{([^{}]+)\}\{\\textbf\{([^{}]+)\}\}\s*(?:\\textit\{([^{}]*?(?:\{[^{}]*\}[^{}]*?)*)\})?",
        re.DOTALL,
    )
    for url, label, note in pattern.findall(block):
        out.append({
            "label": unescape_tex(label),
            "url": url.strip(),
            "note": unescape_tex(re.sub(r"\\small", "", note or "")) if note else "",
        })
    # Some \item resources are non-link bullets — capture those too
    plain_items = re.findall(r"\\item\s+(?!\\href)([^\\][^\n]*)", block)
    for line in plain_items:
        cleaned = unescape_tex(line)
        if cleaned and not any(r["label"] in cleaned for r in out):
            out.append({"label": cleaned, "url": "", "note": ""})
    return out


def find_section(week_body: str, title_keywords: list[str]) -> str:
    """Find a tcolorbox section whose title contains any of the keywords."""
    # Match tcolorbox … title={…} … \end{tcolorbox}
    # We use a simple state machine because the boxes can nest.
    title_re = re.compile(r"title=\{([^{}]+)\}", re.DOTALL)
    starts: list[tuple[int, str]] = []
    for m in title_re.finditer(week_body):
        title = m.group(1)
        if any(k.lower() in title.lower() for k in title_keywords):
            starts.append((m.start(), title))
    if not starts:
        return ""
    start_pos = starts[0][0]
    # Walk forward, tracking begin/end tcolorbox until we close the one we opened.
    body = week_body[start_pos:]
    depth = 0
    i = 0
    open_re = re.compile(r"\\begin\{tcolorbox\}")
    close_re = re.compile(r"\\end\{tcolorbox\}")
    # We're already inside a tcolorbox header — find the opening backwards
    pre = week_body[:start_pos]
    last_begin = pre.rfind("\\begin{tcolorbox}")
    if last_begin == -1:
        return ""
    section = week_body[last_begin:]
    depth = 0
    out_parts = []
    cursor = 0
    while cursor < len(section):
        ob = open_re.search(section, cursor)
        cb = close_re.search(section, cursor)
        if not cb:
            break
        if ob and ob.start() < cb.start():
            depth += 1
            cursor = ob.end()
        else:
            depth -= 1
            if depth == 0:
                return section[: cb.start()]
            cursor = cb.end()
    return section


def parse_week(block: str, week_number: int) -> dict:
    """Parse a single week's tex block into a dict."""
    # Title: from the header "Week N: ..."
    title_match = re.search(r"Week\s*" + str(week_number) + r":\s*([^}\\]+)", block)
    title = unescape_tex(title_match.group(1)) if title_match else f"Week {week_number}"

    # Phase: "Phase X: NAME" in the banner subtitle
    phase_match = re.search(r"Phase\s*\d+:\s*([A-Za-z ,&]+)", block)
    phase = unescape_tex(phase_match.group(1)) if phase_match else ""

    # Commitment
    commit_match = re.search(r"Estimated commitment:\s*([\d—\-–]+)\s*hours", block)
    commitment = commit_match.group(1) if commit_match else ""

    # Context paragraph — first italic blockquote
    ctx_match = re.search(r"\\textit\{([^{}]+)\}", block)
    context = unescape_tex(ctx_match.group(1)) if ctx_match else ""

    def sect(*keywords):
        s = find_section(block, list(keywords))
        return s

    topics_block = sect("Topics to Study")
    tasks_block = sect("Tasks", "Deliverables")
    project_block = sect("Real-World Project", "Project")
    resources_block = sect("Resources")
    questions_block = sect("Think Like", "Questions")
    exercises_block = sect("Practical Exercises", "Exercises")
    outputs_block = sect("Expected Outputs", "Outputs")

    # Project is a paragraph, not a list
    project_text = ""
    if project_block:
        para = re.sub(r"^.*?\\bottomtitle=\d+pt[^]]*\]", "", project_block, flags=re.DOTALL)
        para = re.sub(r"\\begin\{tcolorbox\}.*?\]", "", para, flags=re.DOTALL)
        project_text = unescape_tex(para)

    return {
        "number": week_number,
        "title": title,
        "phase": phase,
        "commitment_hours": commitment,
        "context": context,
        "topics": extract_items(topics_block),
        "tasks": extract_items(tasks_block),
        "project": project_text,
        "resources": extract_resources(resources_block),
        "questions": extract_items(questions_block),
        "exercises": extract_items(exercises_block),
        "outputs": extract_items(outputs_block),
    }


def split_weeks(tex: str) -> list[tuple[int, str]]:
    """Cut the full file into per-week chunks using % WEEK N markers."""
    pattern = re.compile(r"^%\s*WEEK\s+(\d+)[: ].*?$", re.MULTILINE)
    matches = list(pattern.finditer(tex))
    weeks: list[tuple[int, str]] = []
    for i, m in enumerate(matches):
        n = int(m.group(1))
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(tex)
        weeks.append((n, tex[start:end]))
    return weeks


def parse_roadmap(slug: str, title: str, path: Path) -> dict:
    tex = path.read_text(encoding="utf-8", errors="ignore")
    weeks = []
    for n, block in split_weeks(tex):
        try:
            weeks.append(parse_week(block, n))
        except Exception as e:  # pragma: no cover
            print(f"  ! week {n}: {e}")
    return {
        "slug": slug,
        "title": title,
        "total_weeks": len(weeks),
        "weeks": weeks,
    }


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for slug, title, fname in FILES:
        src = SOURCE_DIR / fname
        if not src.exists():
            print(f"skip {fname} — not found")
            continue
        data = parse_roadmap(slug, title, src)
        dest = OUT_DIR / f"{slug}.json"
        dest.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        # Quick sanity print
        wk = data["weeks"][0] if data["weeks"] else None
        topics_n = len(wk["topics"]) if wk else 0
        tasks_n = len(wk["tasks"]) if wk else 0
        print(f"{slug}: {data['total_weeks']} weeks -> {dest.name}  (week 1: {topics_n} topics, {tasks_n} tasks)")


if __name__ == "__main__":
    main()
