# Meeboo — Product & Design Spec (for Claude Code)

Meeboo is an AI personal trainer app for mobile. Target user: someone who
can't afford a human personal trainer. Meeboo (the mascot) acts as that
trainer — always available, AI-powered. Target: publishable to the App
Store by November.

**Rule #1 for whoever builds this:** every image referenced below already
exists as a file in this asset pack. Use the files. Do not regenerate,
reinterpret, or "improve" the mascot, the body-type characters, or the
badge icons — import them as static image assets.

---

## 1. The mascot — Meeboo

- File: `mascot/meeboo-mascot.png` (transparent background, ready to use).
- A round blue character with a flame on its head, dot eyes, simple smile,
  two small legs. Same role as Duolingo's owl: appears everywhere, is the
  face of the app, the chat partner on the Home tab.
- The female palette variant (pink, same shape) is only used inside the
  body-type quiz illustrations, not as a second mascot — Meeboo itself is
  gender-neutral and always blue.
- The app icon / store cover has **not** been designed yet — treat this as
  an open task, not something to infer from the slides.

---

## 2. Asset pack contents

```
mascot/            meeboo-mascot.png            → the mascot, transparent PNG
badges/            diamond.png emerald.png gold.png
                   silver.png bronze.png stone.png
body-types/        male-muscle-a.png … male-muscle-j.png      (10, thin → very muscular)
                   male-fat-a.png … male-fat-j.png            (10, thin → heavy)
                   female-muscle-a.png … female-muscle-j.png  (10)
                   female-fat-a.png … female-fat-j.png        (10)
design-reference/  01-quiz-gender-select.png
                   02-quiz-height-weight.png
                   03-quiz-workout-baseline.png
                   04-quiz-current-body-type.png
                   05-quiz-goal-body-type.png
                   06-home-screen.png
                   07-progress-screen.png
                   08-workout-screen.png
                   09-nutrition-screen.png
```

- `mascot/`, `badges/`, `body-types/` are **final assets** — drop them
  straight into the app.
- `design-reference/` are **layout targets, not assets** — screenshots to
  match visually (spacing, colors, hierarchy, copy), not images to embed.
  Rebuild these as real UI. See §8 for where they disagree with each other.
- `body-types/` are cut from two reference sheets, each with two
  independent sliders: `muscle` (definition, thin→muscular) and `fat`
  (body fat, thin→heavy), each `a`–`j` (10 steps). The character shown in
  the quiz and in the Progress-tab avatar should be composited/selected
  from these two axes based on the user's quiz answers — not a single
  10-point "body type" list.

---

## 3. Onboarding quiz

Order, per the slides:
1. **Gender** — Male / Female. (`01-quiz-gender-select.png`)
2. **Height & weight** — sliders, cm and kg. (`02-quiz-height-weight.png`)
3. **Weekly workout baseline** — how many days/week (0–6 dial), and where:
   Home / Gym / Outdoors–Sport / First time. (`03-quiz-workout-baseline.png`)
4. **Current body type** — swipe left/right through the 10 `muscle`
   images (or `fat`, TBD which axis this screen targets — see §8) for the
   selected gender. (`04-quiz-current-body-type.png`)
5. **Goal body type** — same picker, "what would you like to look like."
   (`05-quiz-goal-body-type.png`)

Explicitly **out of scope for v1** (user's own call, to avoid overwhelming
a first-time user): body-fat percentage as a quiz input, daily calorie
target as a quiz input. Revisit for a later "advanced setup" version.

Body fat % was ruled out **as a quiz question** because it's impractical
for a user to self-measure — keep that in mind if it resurfaces elsewhere
(see the Home-tab water-stat question in §8).

---

## 4. Main app — 4 tabs

### Home (`06-home-screen.png`)
- Greeting ("Good morning, {name}"), Meeboo character, speech bubble
  prompt ("Ask me anything about your training").
- "Ask Meeboo" text input — a chat scoped to health/fitness topics only.
  This does not need a strong model; a lightweight model is fine here.
- Daily stat tiles: Sleep, Steps, and two more that are still undecided
  (see §8 — water and "calories left" are both flagged for replacement).

### Progress (`07-progress-screen.png`)
- A body figure (front/back, should be a real 3D or flippable 2D model,
  built from the same visual language as the mascot/body-type assets)
  surrounded by badge icons, one per muscle group, connected by lines.
- Tapping a muscle shows a progress bar (e.g. "72/100") and — per the
  user's spec — how much more weight to lift next session to reach the
  next badge tier.
- Muscle groups visible in the mockup: Forearms, Upper Back, Biceps,
  Triceps, Abdominals, with "more muscle groups below" — the full list
  still needs to be defined; don't assume the mockup's 5 are exhaustive.
- Progress photo log: a camera button opens an album of the user's
  photos over time, tagged with milestones/records, framed as a
  celebratory scrapbook rather than a plain gallery.

### Workouts (`08-workout-screen.png`)
- AI generates a full week of sessions after the quiz, then **regenerates
  the coming week's plan every week**, based on what actually happened
  the previous week (adaptive, not a fixed static program). Variety
  (e.g. an occasional swim or climbing day instead of always
  push/pull/legs) is a nice-to-have, not a hard requirement.
- During a session: rather than manual set-by-set logging, the app
  notifies the user ("Have you done your rep?") and a single tap logs it.
- Long-term arc: right after onboarding, AI drafts a longer plan (the
  user said 6–24 months) that the weekly plans work toward.

### Nutrition (`09-nutrition-screen.png`)
- Users log meals; AI estimates macros (protein/calories/fat/carbs/sugar)
  from the ingredients the user provides. The nutrition-scoring thresholds
  (what counts as "high protein," "low calorie," etc.) are not defined
  yet — flag as an open task, don't invent numbers.
- Community angle: users can share their own meals/recipes (ingredients,
  optionally a photo or video) for others to browse.
- Meals are organized into category shelves (High Protein, High Calorie,
  Low Calorie, and similarly for a "cheat day"/low-sugar section) with a
  favorites list.

---

## 5. Badge / ranking system

Six tiers, worst → best: **Stone → Bronze → Silver → Gold → Emerald →
Diamond**. Icons in `badges/`.

- One badge per muscle group, driven by how much weight the user lifts
  for exercises targeting that muscle.
- Scoring must be **relative to the user's own bodyweight and body
  stats**, not an absolute kg number — the same lift means a different
  badge for a lighter vs. heavier person. (This is the same idea as
  bodyweight-relative strength standards used in strength training —
  worth researching that concept directly rather than inventing kg
  thresholds from scratch.)
- The user's own rough expectation: an average person lands around
  Silver/Gold, a very dedicated/visibly-fit person around Emerald,
  Diamond reserved for a bodybuilder-level lifter — but this should scale
  per body type rather than being one fixed curve for everyone.

---

## 6. Where the AI is actually doing work

Don't build every screen as "AI-powered" — the spec is specifically
uneven:

| Screen | AI involvement |
|---|---|
| Home chat | Light. Fitness-scoped Q&A, no heavy reasoning needed. |
| Progress | Heavy **once**, right after the quiz (drafts the long-term plan). Day-to-day badge math is deterministic, not AI. |
| Workouts | Heavy, but only at plan-generation time — once at onboarding, then once per week to regenerate. |
| Nutrition | Triggered per meal log, to estimate macros from ingredients. Not continuous. |

On the "which AI/API" open question from the transcript: since there's
already an Anthropic account in use for this project, calling the Claude
API directly (a `messages` request per feature above) is a reasonable
default for all four of these — no separate AI vendor is required.

---

## 7. Explicitly undecided (do not silently resolve these — ask or flag)

- App icon / store cover — not designed.
- Home tab: the "water" tile is flagged for likely replacement (possibly
  with body-fat %, despite body fat being ruled out as a quiz input for
  being hard to self-measure — this tension is unresolved, flag it back
  to the user rather than picking one).
- Home tab: "calories left" tile is flagged for replacement with
  something else, not yet chosen.
- Nutrition scoring thresholds (macwhat counts as high-protein, etc.).
- Full muscle-group list for the Progress badge system.
- Exact badge-scaling formula per body type.

---

## 8. Known inconsistencies across the reference mockups

These slides were produced as separate AI-generated concept images, not a
unified design file, so they don't agree with each other on every detail.
Don't try to reconcile them automatically — pick one system and confirm
it, rather than averaging or guessing:

- **Two different bottom nav bars appear.** Home/Progress/Workout screens
  use a 5-tab dark bar (Home, Progress, Train, Workouts, Me — note "Train"
  and "Workouts" both appear, which is itself likely a slide-generation
  duplicate). The Nutrition screen and the onboarding "Workout Baseline"
  screen use a different 4-tab light bar (Nutrition, Home, Workouts,
  Profile). Pick one nav structure for the whole app.
- **Two different badge art styles.** The flat vector badges in
  `badges/` differ from the glossy 3D-style badge icons drawn on the
  Progress screen mockup itself. Use the `badges/` files as the real
  assets; treat the Progress-screen versions as a stand-in.
- **The body-type reference art has garbled labels** ("Chird", "Geuetal",
  "Full-" with no following word) — these are AI-image-generation
  artifacts, not real category names. The real category names are only
  the ones spoken by the user: current-body labels are Thin/Average/
  Athletic/Muscular (male) and Thin/Average/Curvy/Full-Figured (female);
  don't reuse the garbled label text anywhere in the UI.
- **Current-body and goal-body quiz screens show an identical
  highlighted example** (Athletic/(f) for male, Average/(g) for female)
  in both "current" and "goal" mockups — that's a mockup artifact, not a
  spec that current should default to the same value as goal.

---

## 9. Notes for Claude Code specifically

- Read this whole file before writing any UI code.
- Every screen you build should visually match its file in
  `design-reference/` — same layout, spacing, color direction, copy —
  but rebuilt as functioning UI, not a screenshot embed.
- Every mascot, badge, or body-type image you need already exists in this
  pack. If you think you need a new character/badge/icon graphic,
  stop and ask instead of generating one.
- Where §7 lists something as undecided, build a reasonable placeholder
  and say so, rather than inventing a permanent-looking value.
