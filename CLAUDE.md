@AGENTS.md
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Status

Phase 0 (setup) of `plan.md` is done: every screen is still a `PlaceholderScreen` and the only DB table is `users`. Build features phase by phase (plan.md §4), and add DB tables only when the feature that needs them lands (full model in plan.md §3). Where plan.md and `docs/Meeboo-SPEC.md` disagree, plan.md is newer (it came from a 2026-09-24 interview). One open conflict: the spec suggests Claude for AI, plan.md says OpenAI. Ask before picking.

## Commands

```bash
npm run typecheck        # tsc --noEmit
npm run lint             # expo lint (flat config in eslint.config.js)
npm run format           # prettier, includes Tailwind class sorting
npx expo install --check # CI runs this; SDK-version drift fails the build
npm run db:generate      # drizzle-kit: create a migration from src/db/schema.ts → src/db/migrations
npm run db:migrate       # apply migrations to DATABASE_URL
npm run trigger:dev      # run Trigger.dev tasks locally (needs TRIGGER_PROJECT_REF)
npx eas-cli@latest build --profile development            # dev build on a device (HealthKit needs this, not Expo Go)
npx eas-cli@latest build --profile development-simulator  # iOS simulator dev build
```

No test runner is set up yet. plan.md calls for Vitest/Jest on the pure logic in `src/core/` (badges, avatar stepping, units, Zod schemas).

Smoke-test the bundle without a device: `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_x npx expo export --platform ios --output-dir <tmp>`

## Architecture

The app, the API and the background jobs share one package and one TypeScript config (`@/*` → `src/*`, `@/assets/*` → `assets/*`):

- **App (Expo Router, `src/app/`)**: `_layout.tsx` sets up Sentry (`src/lib/sentry.ts`, imported before the providers so errors during setup are captured), then `ClerkProvider` (tokens in SecureStore), then TanStack Query. The root layout throws if `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is missing.
- **Auth routing** is done with guards in each group's `_layout.tsx`, not with a central redirect table. `index.tsx` sends users to `/home` or `/sign-in`. `(auth)` sends signed-in users away, while `(onboarding)` and `(tabs)` send signed-out users to sign-in. A check for whether onboarding is complete is still missing (phase 1).
- **Tabs** use `NativeTabs` from `expo-router/unstable-native-tabs` (SDK 57 path; it moves to `expo-router/native-tabs` in SDK 58) with SF Symbol and Material icons. The spec's mockups show two conflicting nav bars. The decided structure is Home · Progress · Workouts · Nutrition · Me.
- **API (`src/app/api/**/+api.ts`)** runs server-side on EAS Hosting, which is why `app.json` has `web.output: "server"`. Each route must verify the Clerk session token. The Clerk webhook (`user.created/updated/deleted`) lands here in phase 1.
- **DB**: Drizzle with the Neon HTTP driver. `src/db/client.ts` throws without `DATABASE_URL` and is server-only.
- **Background jobs**: Trigger.dev v4 tasks live in `trigger/` (the config sets `dirs: ['./trigger']`). They handle all AI work (plan generation, macro estimates, moderation) and cron jobs. The app follows runs live through Realtime hooks, using tokens minted by the API. Pass an idempotency key on every trigger.
- **Styling**: NativeWind v4 (Tailwind 3). The CSS entry is `src/global.css`. `metro.config.js` combines Sentry's Metro config with `withNativeWind`, and `babel.config.js` sets `jsxImportSource: 'nativewind'`. The `.css` module declaration in `nativewind-env.d.ts` is needed because TS 6 type-checks side-effect imports.
- **Native config** lives only in `app.json` plugins (Clerk, Sentry, SecureStore, Apple auth). `ios/` and `android/` are generated and git-ignored.

## Product rules that affect code

- Users must be 16+. Progress photos are 18+ only and stored as private ImageKit files served through short-lived signed URLs.
- Badge tiers (Stone → Bronze → Silver → Gold → Emerald → Diamond) come from a deterministic formula based on strength relative to bodyweight. AI only writes the celebration text.
- The body avatar is chosen from two separate axes, `muscle` a–j and `fat` a–j (per sex, in `assets/body-types/`). It is never a single 10-step scale. Never reuse the garbled labels from the mockups (see spec §8).
- Items listed as undecided in spec §7 (app icon, Home stat tiles, nutrition thresholds, muscle-group list, badge scaling) get clearly marked placeholders, not values that look final.
