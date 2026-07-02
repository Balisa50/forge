===D1===
## KPIs and storytelling: where analysis becomes decisions

You can clean data, model it, write DAX and SQL, and run experiments. None of it matters if the people who decide do not understand or act on it. This week is the human half of BI: choosing **metrics that actually measure success**, and presenting them so a busy executive *gets it and acts*. It is the skill that turns a competent analyst into a trusted advisor.

The week's arc: what makes a KPI good (and why most "KPIs" are vanity metrics), frameworks for choosing the *one* metric that matters (North Star, OKRs), then the craft of communication, narrative structure, choosing the right chart, and the visual design (colour, type, layout) that makes a dashboard readable in five seconds.

The mindset: a dashboard is a *persuasion and decision* tool, not a data dump. The best analysts ruthlessly cut. Ten metrics that look impressive but answer nothing lose to three that drive a decision. "What will someone *do* differently because of this number?" is the question behind every choice this week.

Today, orient: look at your Superstore dashboard with fresh eyes and ask, for each number on it, "what decision does this drive, and for whom?" Flag any metric that is there because it was easy, not because it matters. That audit is the start of thinking like a BI advisor, not a chart factory.

===D2===
## KPI design principles

A **KPI** (Key Performance Indicator) is a metric tied to a specific objective, the *key* word is "key". Most dashboards drown in metrics; the skill is picking the few that signal whether the business is actually winning.

What separates a real KPI from a vanity metric:
- **It is actionable.** A change in it tells you to *do* something. "Page views" rarely does (vanity); "checkout conversion rate" does (if it drops, you investigate the funnel).
- **It ties to an objective.** Revenue, retention, efficiency, every KPI should ladder up to a business goal someone owns.
- **It is a rate or ratio more often than a raw count.** "Number of signups" hides whether you are improving; "signup conversion rate" controls for traffic and reveals real performance. Raw counts grow with scale and flatter you.
- **Leading vs lagging.** *Lagging* indicators report the result (revenue, churn) after the fact. *Leading* indicators predict it (trial-to-paid rate, support response time) and can still be influenced. Good dashboards pair them: the lagging KPI for accountability, the leading one to steer.

The classic anti-patterns to avoid: **vanity metrics** (big, flattering, useless, total registered users ever), and **metric overload** (50 numbers so nothing stands out). A focused scorecard of 5–8 real KPIs beats a wall of 40.

Today, design a proper KPI scorecard for a Superstore-style retail business: pick 5–6 KPIs, and for each write its objective, whether it is leading or lagging, and the action a bad value would trigger. Cut anything that fails the "what would someone *do*?" test.

===D3===
## North Star metric and OKRs

Two frameworks help a whole organisation align on what matters, and BI analysts are increasingly expected to know them because they design the metrics behind them.

**The North Star Metric** is the *single* metric that best captures the core value your product delivers to customers, the one number the whole company optimises. Examples: Airbnb, nights booked; Spotify, time spent listening; a marketplace, transactions. A good North Star has three traits: it reflects real customer value (not just revenue), it predicts long-term success, and the whole team can influence it. The discipline of choosing *one* forces clarity, and your dashboards should make the North Star and its inputs unmistakable.

**OKRs (Objectives and Key Results)** are how teams set and track goals. An **Objective** is a qualitative, ambitious aim ("Become the preferred store for repeat buyers"). Each has 2–4 **Key Results**, specific, measurable outcomes that prove you hit it ("Increase repeat-purchase rate from 22% to 30%", "Raise NPS from 40 to 55"). KRs are metrics, which is where you come in: BI analysts build the dashboards that track KRs in real time, so a quarterly OKR is not a guess at the end but a live readout.

Why this matters for you: when a stakeholder asks for "a dashboard", the senior move is to ask "what objective does this serve, and which key results should it track?" That reframes a pile of charts into a tool that drives the company's actual goals.

Today, define a North Star metric for the Superstore business and justify it (why it captures value better than raw revenue). Then write one Objective with 2–3 measurable Key Results, and note which of your KPIs from yesterday would track each KR.

===D4===
## Narrative structure for data presentations

Data does not speak for itself, you give it a story. A presentation that is just "here are 12 charts" leaves the audience to find the point (they will not). A *narrative* leads them to the conclusion and the action.

The reliable structure, borrowed from journalism and consulting:
- **Lead with the answer (BLUF, the same principle as good writing).** Open with the headline finding and the recommendation: "Profit is down 8% this quarter, driven by deep discounting in the West; I recommend capping discounts at 20%." Executives want the conclusion first, then the support.
- **Then the "why": the supporting evidence,** the two or three charts that prove the headline, in a logical order. Each chart earns its place by advancing the argument.
- **Then the "so what": the recommendation and its impact.** What to do, and what happens if they do.
- **Anticipate the pushback.** Address the obvious objection ("isn't discounting driving volume?") with data before they raise it.

A useful frame is **situation -> complication -> resolution**: here is where we are, here is the problem the data reveals, here is what to do about it. That tension is what makes people listen.

The cardinal rule: **one slide / one section, one message.** If a chart has no sentence-long takeaway, cut it or fix it. And put the takeaway *in the title*: "Sales by Region" is a label; "West is dragging total profit despite high sales" is a finding. Titles that state the insight are the single biggest upgrade to a data presentation.

Today, take an insight from your Superstore analysis and structure a 3-part data story: the headline + recommendation, two supporting charts (with insight-stating titles), and the "so what". Write it as if presenting to a manager who has 60 seconds.

===D5===
## Chart selection: match the chart to the question

The wrong chart hides the insight; the right one makes it obvious. There is a small, learnable mapping from "what are you comparing?" to "which chart".

- **Comparison across categories** (sales by region) -> **bar chart** (horizontal if labels are long). Reliable, precise, the default workhorse.
- **Trend over time** (monthly sales) -> **line chart.** Time goes on the x-axis, always.
- **Part-to-whole** (share of sales by category) -> a **stacked bar** or a **single 100% bar**, and use a **pie only** for 2–3 slices at most (pies are hard to compare; analysts mostly avoid them).
- **Relationship between two numbers** (discount vs profit) -> **scatter plot.** The right tool for correlation.
- **Single key number** (total revenue, conversion %) -> **a big card / KPI tile.** Do not bury the headline number in a chart.
- **Distribution** (spread of order values) -> **histogram** or **box plot.**
- **Geographic** (sales by state) -> a **map**, but only when location is genuinely the point; a bar chart is often clearer.

The anti-patterns to avoid: 3D charts (distort), dual-axis charts (mislead), pie charts with eight slices (unreadable), and "chart junk" (gridlines, shadows, clutter that adds no information).

The deeper principle: **start from the question, not the chart.** "Which region is growing fastest?" demands a line chart of regions over time; "what's our product mix?" demands a part-to-whole. Pick the question, then the chart that answers it most directly.

Today, take three questions about Superstore and, for each, name the right chart and one wrong chart and why. Then rebuild one visual on your dashboard that currently uses a sub-optimal chart type.

===D6===
## Colour, typography, and layout

Good visual design is not decoration, it is what lets the eye find the message instantly. A few principles take a non-designer dashboard from amateur to professional.

**Colour, used with restraint:**
- Pick a small palette (one or two brand colours plus neutrals). A rainbow signals chaos.
- Use colour to *mean* something: one accent colour to highlight the key series, grey for context. Colour everything and nothing stands out.
- Reserve red/green for genuinely good/bad (and remember red-green colour-blindness, pair colour with labels or icons, never rely on hue alone).

**Typography and numbers:**
- One or two fonts, consistent sizes, clear hierarchy (big for the headline number, smaller for detail).
- Format numbers for humans: 1.2M not 1,234,567; round to the precision that matters; align decimals.

**Layout:**
- People read top-left first (a Z-pattern). Put the most important number/visual there.
- Group related visuals; leave white space, crowding is the most common amateur tell.
- Align everything to a grid. Misaligned boxes read as careless.
- Most-important to least-important, top-left to bottom-right.

The overarching idea is **the data-ink principle:** maximise the share of the visual that conveys information, minimise everything else (heavy gridlines, borders, backgrounds, 3D effects). When you are unsure, remove, not add. A clean, aligned, restrained dashboard reads as trustworthy; a busy, rainbow one reads as junior, regardless of how good the underlying analysis is.

Today, apply these to your Superstore dashboard: cut to a two-colour palette with one accent, fix number formatting, align to a grid, add white space, and remove any chart junk. Screenshot before/after, the difference will be obvious.

===D7===
## Ship it

Turn the week into your strongest dashboard yet, plus the story around it.

Produce:
- **A redesigned, executive-ready dashboard** of the Superstore data: a focused KPI scorecard (5–8 real KPIs, leading + lagging), the right chart per question, insight-stating titles, and clean two-colour design with proper number formatting and alignment.
- **A one-page data story** to accompany it: headline finding + recommendation, two supporting visuals, the "so what", in narrative (situation -> complication -> resolution) structure.

Commit with a README framing: "An executive BI dashboard plus a data-storytelling write-up, demonstrating KPI design, North Star/OKR thinking, narrative structure, and visualisation best practice."

```
git add storytelling/ && git commit -m "BI: KPI scorecard + executive dashboard + data story"
git push
```

This is a high-leverage portfolio piece because most analysts show charts, not *communication*. Being able to say "here is the one number that matters, here is what I recommend, and here is why" is what gets an analyst into the room where decisions are made. Practise delivering your data story out loud in 90 seconds, that is the interview skill it builds. Next week: Python, for when Power BI is not enough.
