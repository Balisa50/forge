# FORGE Mentoring Flow — end-to-end integration test

The complete mentor → student → mentor loop, exactly as it works today.
Use this as the manual test script after a deploy. **Every step must pass.**

---

## Setup
- One mentor account.
- One mentee account, linked to that mentor via an active `MentorLink`.
- A roadmap seeded for the mentee. The mentor has released **Week N** with a
  deadline in the future (Task `releasedAt` is set, `status !== "locked"`).

## Step 1 — Mentor writes review questions for the week
1. Mentor opens `/dashboard/mentor/<menteeId>`, scrolls to **Week N**, expands it.
2. In the **Questions for this week** panel (renders `<MentorQuestionBank>`),
   the mentor types a question and clicks **Add**. They optionally fill in
   the **Rubric / ideal answer** (private — never sent to the student).
3. They repeat for as many questions as they want (this matches "I can add
   as many questions as I want, each with its own text field, and a private
   rubric").
4. The questions persist via `POST /api/mentor/questions` →
   `MentorQuestion` rows, all `isActive: true`, ordered by `position`.

**No "Send to Student" button is required** — once authored, the questions
appear automatically on the student's side. (Authoring **is** publishing.)

## Step 2 — Student sees the questions on the week page
1. Mentee opens their dashboard, clicks **Open this week** on the released
   week. They land on `/learn/<slug>/<N>`.
2. **Below the day stream**, the new **Mentor Review** section renders.
   It is powered by `GET /api/mentee/review-state?taskId=...` and shows:
   - The status pill **ANSWER TO SUBMIT** (gold)
   - Every question, numbered, in the order the mentor wrote them
   - A CTA button **Answer in the daily check-in** that links to
     `/dashboard/checkin`

**Verification:** Questions never appear in the chat thread (`/dashboard/notes`).
That page now carries an explicit banner pointing students to the week page
for review questions.

## Step 3 — Student answers and submits
1. Student opens `/dashboard/checkin` (linked from the Mentor Review section).
2. The check-in form fetches `/api/mentee/questions?taskId=...` and renders
   one answer textarea per mentor question.
3. The student writes their answers, attaches their proof-of-work evidence
   (URL or upload), and clicks **Submit**.
4. `POST /api/checkins` runs:
   - The mentor-question gate blocks submission if any answer is empty.
   - On success it creates a `Checkin` row AND an `Interrogation` row in
     `mode: "mentor_async"` with the answers laid into the transcript
     and `mentorReviewerId` set to the mentor who authored the questions.

## Step 4 — Student sees "Awaiting review" while waiting
1. The student re-opens the week. Mentor Review section now shows:
   - Status pill **AWAITING MENTOR REVIEW** (gold)
   - Each question with the student's own answer block underneath
   - No score/feedback yet — those appear after grading.
2. The **Journal** at `/dashboard/journal` lists this check-in with the
   pill **AWAITING REVIEW** (yellow). It will **never** auto-show "PASSED"
   while the mentor's review is pending. *(That was the auto-pass bug; fixed.)*

## Step 5 — Mentor sees it in Pending Reviews
1. Mentor opens `/dashboard/mentor/reviews`.
2. `GET /api/mentor/reviews` returns every `Interrogation` where
   `mode = "mentor_async"`, `mentorReviewerId = <this mentor>`,
   `mentorReviewedAt IS NULL`, `completedAt IS NOT NULL`.
3. The student's submission is listed; clicking it opens an inline panel
   showing:
   - What the student built (evidence link + description)
   - Each question (read from transcript), the student's answer,
     and a 0–10 score input (default 7)
   - A free-text **Feedback** box
   - A **Mentor rating (1–5)** selector — visible-to-mentee badge
   - Action buttons: **Mark Passed** / **Send Back (Needs Rework)** / Cancel

## Step 6 — Mentor grades
1. Mentor adjusts per-question scores, types feedback, picks a 1–5 rating
   and clicks **Mark Passed**.
2. `POST /api/mentor/reviews` runs atomically in a transaction:
   - `Interrogation.passed = true`, `mentorReviewedAt = now`,
     `overallScore` = average of per-question scores (×10),
     `feedback` saved, per-answer scores merged into the transcript.
   - `Checkin.status = "passed"`.
   - `Task.status = "verified"`, `verifiedAt = now`.
   - `Task.mentorRating = <selected 1–5>` (this is what the student will see).
3. The student is notified via `sendNotification("mentor-action", ...)`.

## Step 7 — Student sees the verdict
1. Mentee re-opens the week.
   The Mentor Review section now shows:
   - Status pill **PASSED** (green) + rating badge `n/5` (gold)
   - Every question still listed, with their answer + the per-question
     score the mentor gave (`Mentor scored this answer X/10`)
   - **Mentor feedback** panel in green with the mentor's note
2. The Journal entry updates to **PASSED** + the score pill + the
   **Mentor rating: n/5** pill + the feedback in italics.
3. The next week (if released) becomes the new current week on the
   dashboard.

## Step 8 — Send-back path ("Needs Rework")
If the mentor clicked **Send Back** instead:
- `Interrogation.passed = false`, feedback saved, `mentorReviewedAt = now`.
- `Checkin.status = "failed"`.
- `Task.status = "available"` (so the student can resubmit).
- Student sees status pill **NEEDS REWORK** (red), with the per-answer
  scores and feedback. They can answer again via the check-in.

---

## What is **not** in the chat thread
- Mentor questions → live on the week page (Mentor Review section).
- Student answers → submitted with the check-in, displayed on the week page.
- Mentor verdict + rating + feedback → on the week page + Journal.

`/dashboard/notes` carries only mentor messages, resource grants and
extension requests. It now has a banner that says so explicitly so students
don't go hunting for questions there.

## Verification checklist after deploy
- [ ] Mentor can add 5 questions with rubrics; they persist after refresh.
- [ ] Student opens the week — sees the 5 questions, in order, in **Mentor Review**.
- [ ] Student submits answers through check-in; week page now shows answers + AWAITING REVIEW.
- [ ] Journal shows **AWAITING REVIEW**, not PASSED.
- [ ] Mentor opens `/dashboard/mentor/reviews` — the submission is there.
- [ ] Mentor scores, feedback, picks a rating, clicks **Mark Passed**.
- [ ] Student sees **PASSED**, rating badge, per-answer scores, and feedback
      on the week page **and** in the Journal entry.
- [ ] `Task.mentorRating` is set to the rating the mentor picked.
