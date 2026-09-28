# Meeboo — Spec Summary & Implementation Plan

## Context
Meeboo is an AI fitness coach in your phone, for people who can't afford (or stay disciplined without) a personal trainer. A cute 3D-style mascot (blue ball, two hands/feet, flame on top) guides the user from their current body to their goal body. Source material: `~/Library/Mobile Documents/com~apple~CloudDocs/Meeboo-SPEC.md` + assets in `…/meeboo-assets claude/` (mascot, 6 badges, 40 body-type PNGs, 9 design-reference mockups), refined by a structured interview on 2026-09-24. A previous attempt (`Meeboo-app faliure/`) was an untouched Expo SDK 57 template living in iCloud Drive; this plan starts clean outside iCloud.

---

## 1. Spec summary

**Users:** 16+ (DOB at signup; under-16 blocked). Progress photos 18+ only. iOS first; Android later from same codebase.
**Launch target:** public App Store ~May 2027; TestFlight beta ~Feb–Mar 2027. Free at launch (no payments in v1).

**Navigation (5 tabs):** Home · Progress · Workouts · Nutrition · Me.

**Onboarding quiz:** sign in (Clerk: Apple + Google) → DOB → sex → height/weight (cm/kg, lb/in toggle) → days/week (0–6) + where (Home/Gym/Outdoor-Sport/First time) → main obstacle → medical conditions → current body (swipe muscle a–j × fat a–j for sex) → goal body → AI generates long-term plan (6–24 mo) + first week. Serious medical flags (heart condition, pregnancy, eating-disorder history) show a "check with your doctor" gate before the plan starts.

**Home:** greeting, Meeboo mascot, "Ask Meeboo" chat (fitness/health-scoped, replies in the user's language, no diagnosis/medication advice). Stat tiles: Sleep, Steps, Calories burned (Apple Health), Calories eaten (from Meeboo food log).

**Workouts:** AI weekly plan auto-generated each Monday from last week's actual logs; user can drag days, swap exercises, or "keep same schedule". Sets are pre-filled with target (e.g. 3×10 @ 30 kg); one tap confirms, edit if different. AI applies progressive overload (30 → 32 kg). Missed workouts are absorbed, never shamed. Offline logging queued and synced.

**Progress:** 2D 3D-style body avatar with front/back flip; a badge pin per muscle group (Stone→Bronze→Silver→Gold→Emerald→Diamond). Tap muscle → score bar (72/100) + "lift X kg more for next tier". Badges = deterministic formula (bodyweight-relative strength standards); AI only writes the celebratory copy. Avatar steps along muscle/fat axes toward the goal body as average tier rises (never past real progress). Private progress-photo log (18+), and an automatic monthly AI "memory book" album (first vs latest, records, cute captions) when ≥8 photos that month.

**Nutrition:** (a) personal food log: type ingredients/grams or "I ate this" on a recipe → AI macro estimate (kcal, protein, carbs, fat, sugar, salt) → feeds Home. (b) community recipes: ingredients+grams, cook time, photo, optional video (≤5 min, 720p, ≤~200 MB); AI computes nutrition info; category shelves (High Protein, Low Calorie, High Calorie, Low Sugar, Vegan…) + search + favorites. Moderation: OpenAI moderation check before publish, report + block, 3 reports auto-hide, simple admin review page.

**Me:** profile & quiz data edit, units, language, notification prefs, Apple Health permissions, data export, **account deletion** (Apple requirement), sign out.

**Notifications (v1):** workout reminders (user-chosen time), new weekly plan (Mon), badge/milestone, daily photo reminder (18+ opt-in), memory-book ready.

**Languages:** UI in ~10 (EN, ES, PT, FR, DE, IT, JA, KO, ZH, HI), AI-translated then spot-checked; AI chat answers in any language. RTL deferred.

## 2. Architecture

| Concern | Choice |
|---|---|
| App | Expo (SDK 57 / RN 0.86 as seen in prior template — confirm latest at init) + Expo Router, TypeScript, **dev build** (HealthKit needs it; not Expo Go) |
| Styling | NativeWind + one design-token file (Meeboo palette from mockups) |
| Client state | TanStack Query (server data, optimistic set confirm) + Zustand (active workout session, persisted offline queue) |
| API | Expo API Routes (`+api.ts`), deployed to EAS Hosting; every route verifies Clerk session token |
| DB | Neon Postgres + Drizzle ORM (Neon serverless driver); Neon branches for dev/prod |
| Auth | Clerk (Apple + Google) via `@clerk/clerk-expo`; **Clerk webhooks** (Svix-verified) `user.created/updated/deleted` → API route → upsert `users` / enqueue purge |
| Background jobs | **Trigger.dev** tasks: `generate-long-term-plan`, `generate-weekly-plan` (cron Mon, per-user fan-out), `estimate-meal-macros`, `analyze-recipe`, `moderate-content`, `build-memory-book` (cron monthly), `send-notifications`, `purge-user-data`, `recompute-badges`. App follows runs live via Trigger.dev Realtime hooks (public access token minted by API). Idempotency keys on every trigger. |
| AI | OpenAI: small model for chat/macros/copy, stronger model for plan generation; Structured Outputs (JSON schema) validated with Zod; OpenAI moderation endpoint for UGC |
| Media | ImageKit: signed direct uploads (auth params from API route; private key server-only). Progress photos = **private files, short-lived signed URLs**. Videos compressed on-device to 720p, adaptive streaming |
| Health | Apple HealthKit (sleep, steps, active energy) via a maintained RN HealthKit lib w/ config plugin (verify at init) |
| Push | expo-notifications + Expo push service, sent from Trigger.dev |
| Observability | Sentry (app + API routes + Trigger tasks); AI-spend tracking table + Sentry alert on monthly budget threshold |
| CI/CD | GitHub Actions: typecheck, lint, tests; EAS Build → TestFlight; EAS Submit for release |

**Repo location:** `~/Developer/meeboo` (out of iCloud), GitHub remote. Assets copied from `meeboo-assets claude/` into `assets/`.

Proposed layout (single package):
```
src/app/(auth)/…  (onboarding)/…  (tabs)/{home,progress,workouts,nutrition,me}
src/app/api/…+api.ts          # REST routes + webhooks/clerk+api.ts
src/features/<domain>/        # UI + hooks per tab
src/core/                     # pure logic: badges.ts, avatar.ts, units.ts, zod schemas (shared app/API/tasks)
src/db/schema.ts, db/migrations/
trigger/                      # Trigger.dev tasks
src/i18n/<locale>.json
assets/{mascot,badges,body-types}
```

## 3. Data model (core entities)
- `users` (id = Clerk id, email, dob, locale, units, created_at, deleted_at)
- `profiles` (sex, height_cm, weight_kg, days_per_week, training_location, obstacle, current_muscle_idx, current_fat_idx, goal_muscle_idx, goal_fat_idx, avatar_muscle_idx, avatar_fat_idx)
- `medical_flags` (user_id, condition, severity, doctor_ack_at)
- `weight_logs`
- `long_term_plans` (user_id, horizon_months, phases jsonb, model, version)
- `weekly_plans` (user_id, week_start UNIQUE per user, status, source_run_id) → `planned_workouts` (day, order) → `planned_sets` (exercise_id, target_reps, target_kg)
- `exercises` (catalog, seeded) ↔ `exercise_muscles` (muscle_group, weight share)
- `set_logs` (planned_set_id?, exercise_id, reps, kg, performed_at, client_uuid UNIQUE for offline idempotency)
- `muscle_scores` (user_id, muscle_group, score, tier, updated_at) + `badge_events`
- `daily_health` (user_id, date UNIQUE, sleep_min, steps, active_kcal)
- `food_logs` (user_id, eaten_at, recipe_id?, ingredients jsonb, macros jsonb, status)
- `recipes` (author_id, title, ingredients jsonb, cook_min, macros, tags[], status: pending/public/hidden) → `recipe_media` (imagekit file id, type), `recipe_favorites`, `reports`, `blocks`
- `progress_photos` (user_id, imagekit_file_id private, taken_at) → `memory_books` (month, content jsonb)
- `chat_messages`, `ai_usage` (user_id, feature, date, count, tokens, cost), `push_tokens`, `notification_prefs`

## 4. Implementation phases (→ May 2027)
0. **Setup (Oct):** new repo in `~/Developer/meeboo`, write `plan.md` (this doc) into repo, `create-expo-app` (verify versions), NativeWind, Sentry, Clerk, Neon+Drizzle, Trigger.dev init, EAS dev build, CI.
1. **Auth + onboarding (Oct–Nov):** Clerk sign-in, webhook sync, age gate, full quiz with body-type swipers, medical gate, `generate-long-term-plan` + first week with Realtime progress screen.
2. **Workouts + badges (Nov–Dec):** exercise catalog seed, weekly plan UI (drag/swap/keep), set confirm flow + offline queue, `generate-weekly-plan` cron, badge formula + tests, Progress screen (flip avatar, pins, detail sheet), avatar stepping.
3. **Home + nutrition log (Jan):** HealthKit sync, stat tiles, Ask Meeboo chat (streaming, caps), food log + `estimate-meal-macros`.
4. **Community recipes (Feb):** recipe create w/ ImageKit photo/video, `analyze-recipe` + `moderate-content`, shelves/search/favorites, report/block, admin page. **TestFlight beta.**
5. **Photos + polish (Mar):** 18+ progress photos (private), `build-memory-book`, all notifications, i18n ×10, Me page incl. export & deletion (`purge-user-data`).
6. **Hardening + launch (Apr–May):** beta feedback, performance, privacy policy/terms, App Store privacy labels & HealthKit disclosures, submission.

## 5. ASSUMPTIONS (not firmly decided by you)
- Tabs = Home, Progress, Workouts, Nutrition, Me (from your "4 pages + Me").
- Muscle groups (~14): Front: chest, shoulders, biceps, forearms, abs, obliques, quads. Back: traps, upper back/lats, lower back, triceps, glutes, hamstrings, calves.
- Badge formula: Epley estimated 1RM ÷ bodyweight per exercise, mapped to muscles by `exercise_muscles` weights, tiers from published strength standards scaled by sex; bodyweight exercises scored by reps. Calibrated so average ≈ Silver/Gold, Diamond ≈ bodybuilder.
- Nutrition shelf thresholds (e.g. "High Protein" ≥ 20 g/serving or ≥ 25% kcal from protein) — placeholders, to be confirmed.
- AI caps: 30 chat msgs/day, 15 meal estimates/day; weekly/long-term plans uncapped.
- Memory book trigger: monthly anniversary with ≥ 8 photos that month.
- Water / body-fat tiles dropped (your new tile list replaces them).
- Admin moderation page = a protected route in the same app/API for your Clerk user only.
- App icon/store art still undesigned — placeholder until you provide it; no new mascot art generated.

## 6. OPEN RISKS
- **Scope for one developer by May 2027** is still large; community video + moderation is the most cuttable piece if behind.
- **Expo API Routes / EAS Hosting** is newer; if a blocker appears (e.g. webhook raw-body handling, Node libs), fallback is a small Hono service using the same Drizzle schema.
- **AI plan quality & safety**: must validate generated plans against rules (volume limits, medical flags) — bad advice is the biggest product/liability risk.
- **Badge fairness** depends on calibration data; needs beta tuning.
- **Health/medical data = sensitive (GDPR special category, HealthKit rules)**: explicit consent, privacy policy, no ads use, encryption, deletion.
- **UGC moderation** (videos especially — moderation only checks thumbnails/text) and App Store Guideline 1.2 review.
- **AI & ImageKit costs** while free; video bandwidth could spike.
- **Versions**: confirm current Expo SDK, Clerk Expo SDK, Trigger.dev (v4) and HealthKit library docs at init — don't rely on memory.
- **iCloud**: the old folders stay in iCloud; do not develop there.

## 7. Verification
- Unit tests (Vitest/Jest): badge scoring, avatar stepping, unit conversion, AI output Zod validation, macro parsing.
- Webhook test via Clerk dashboard "send test event" + Svix signature check; Trigger.dev dashboard test runs for each task with idempotency replays.
- End-to-end on a physical iPhone dev build: sign up → quiz → plan generated live → log sets offline/online → badge changes → HealthKit tiles populate → food log macros → publish recipe (moderated) → delete account purges DB + ImageKit.
- Sentry receives a deliberate test error from app, API and a task.
