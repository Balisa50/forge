# Video punch list — the road to forge-v5.0-zero-asterisk

**Bar:** every week ≥3 on-topic videos. **Current state (v4.0-ship):** 704 videos,
0 off-topic, integrity gate green. **Weeks still below 3: 85.**

> Note: the coverage_report "gap" column (34) measures the gap to each track's
> *target* (≥80% of weeks). This list measures the gap to **100%** — every week
> ≥3 — which is the v5.0 bar. That is why it is larger.

## Classification & action

| Type | Count | What it is | Action |
|------|-------|------------|--------|
| **A — Concept week** | 52 | A real teachable topic (Animations, Accessibility, Networking, Time series) | **Curate a video.** Paste URLs into `data/roadmaps/MANUAL_REQUIRED.csv`; run import → enrich → audit. |
| **B — Project / ship week** | 33 | Build/ship/retro iterations (vX.Y, "Ship + retro", "Capstone", "Portfolio") | **No external video.** Set the week's `submissionConfig` to `video_only` or `video_and_file` — the student records their own walkthrough. (Feature shipped; mentor picks it per week.) |
| **C — Micro-concept (day-level)** | — | "Buffering & flushing", "Critic/reviewer pattern" | Day-level only; replace the day's video requirement with a deep-dive second lesson. Does not by itself put a week under 3. |

---

## Type B — switch to a video submission (33 weeks)

These are project/ship weeks. No tutorial belongs here; the proof IS the student's build.

- **data-analysis:** W3, W4, W8, W9, W10, W11, W12, W13, W15, W16, W18, W19, W23, W24, W27
- **data-science:** W3, W10, W20, W21, W22, W23, W27, W29, W31
- **ai-engineering:** W2, W3
- **cybersecurity:** W2, W23
- **devops-cloud:** W2, W24
- **data-engineering:** W24
- **bi-analytics:** W15

## Type A — curate a video (52 weeks)

These are genuine concept weeks worth a hand-picked video. Most need just +1.

- **mobile-engineering (13):** W6 Animations & Gestures · W7 Theming/Dark Mode/Design Systems · W9 Camera & Media · W10 Location/Maps/Geofencing · W13 Networking/Offline/Sync · W15 Background Tasks · W16 Analytics & Crash Reporting · W18 Accessibility · W19 Internationalisation · W20 Testing on Mobile · W21 EAS Build & Submit · W22 Updates/OTA · W23 App Store Optimisation
- **full-stack-web (6):** W14 Transactional Email · W16 WebSockets/Real-time · W17 Testing · W20 Observability · W22 Scaling · W23 Polish
- **data-analysis (3):** W6 Statistical thinking · W17 A/B test planning · W25 Storytelling masterclass
- **data-science (4):** W6 Statistical inference · W14 A/B testing · W35 Causal inference · W43 Differential privacy
- **data-engineering (7):** W6 Airflow/Dagster · W15 dbt staging · W16 dbt marts/dimensional model · W17 Orchestration · W18 Streaming increment · W19 Data quality gates · W21 Serving layer
- **bi-analytics (5):** W6 Advanced DAX · W8 Data modelling/warehouse · W9 Business statistics · W10 A/B testing · W11 KPIs & storytelling
- **ai-automation (5):** W1 What is AI Automation · W9 Email automation · W15 Browser automation/computer use · W18 Selling automation services · W19 Client project
- **ml-engineering (4):** W6 Trees & Ensembles · W13 Experiment tracking · W14 GPU training · W18 Model monitoring
- **cybersecurity (3):** W9 Logging/SIEM/Detection · W19 Compliance (SOC2/ISO27001/GDPR) · W22 Tabletop & Red Teaming
- **ai-engineering (1):** W23 Safety & Latency engineering
- **devops-cloud (1):** W15 Multi-cloud & vendor lock-in

---

## Process per type

**Type A:** add rows to `MANUAL_REQUIRED.csv` (track, week, concept, concept_key,
video_id), then:
```
python data/roadmaps/import_videos.py MANUAL_REQUIRED.csv --no-enrich
python data/roadmaps/enrich_track.py --all
python data/roadmaps/coverage_report.py
python scripts/audit_roadmap_integrity.py    # must pass
```

**Type B:** mentor sets `submissionConfig` per week in the dashboard (or bulk-set
via the DB) to `video_only` / `video_and_file`. No roadmap change needed.

**Do not tag forge-v5.0-zero-asterisk** until coverage genuinely shows every week
≥3 (or every remaining week is a Type B converted to a video submission). No false tag.
