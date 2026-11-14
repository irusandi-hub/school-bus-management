# Internationalization — Indonesian, English, Arabic

## Product rules
- Supported locales: `id`, `en`, `ar`.
- Indonesian (`id`) is the default and fallback locale.
- Arabic (`ar`) is right-to-left. RTL must affect document direction and component alignment, not just translated strings.
- Language choice is a presentation preference. It must not change role, authorization, routes, database content, or account identity.

## Implementation
- The root layout reads the `sbm_locale` cookie and sets the initial HTML `lang` and `dir`.
- `LocaleProvider` updates the active locale immediately and persists it in a one-year, same-site cookie.
- `lib/i18n/messages.ts` stores user-facing messages; `lib/i18n/navigation.ts` stores shared navigation labels.
- `LocaleSwitcher` is shared by landing, account entry, and role workspace shells.
- Arabic uses Noto Sans Arabic and RTL-specific layout rules in `app/globals.css`.
- No new runtime dependency or Supabase schema change is required.

## Scope of this implementation stage
The locale foundation, landing page, shared navigation, workspace shell labels, and account entry forms are localized, including validation and success feedback for guardian email activation. The current migration also covers the Operator administration modules (areas, schools, buses, drivers, guardians, students, routes, assignments, trips, and reports), the Driver dashboard and trip review, and the Guardian dashboard, child detail, and trip history. Shared loading/error states, driver safety feedback, navigation copy, guardian live-map status copy, live-camera controls and connection feedback, student-action success feedback, Operator student-list search feedback, and Driver camera-publisher status messages have also been connected to the locale dictionary. Automated verification (tests, typecheck, SQL fixtures, production build) now passes; see the verification record below. Remaining work is a route-by-route visual and interactive review in all three locales. Do not declare full application localization complete until that review is done.

## Acceptance checklist
- [x] Indonesian is selected by default for a new visitor (verified in source: `defaultLocale` + `sbm_locale` cookie fallback). Not yet re-checked in a browser.
- [x] Language selection persists after navigation and reload (one-year `sbm_locale` cookie written by `LocaleProvider`). Not yet re-checked in a browser.
- [x] English uses LTR and Arabic uses RTL at the document level (`dir` from `getDirection` in the root layout, plus `html[dir="rtl"]` rules in `app/globals.css`).
- [ ] Arabic text uses an Arabic-capable font and remains readable in mixed text/numbers — font stack is configured, visual review still outstanding.
- [x] All three user ecosystems retain their existing route and access behavior (no route, role, or access changes in this work).
- [ ] Landing layout, approved copy intent, and existing images remain intact — visual review still outstanding.
- [ ] Operator, Driver, and Guardian routes are checked at mobile and desktop sizes — visual review still outstanding.
- [ ] Forms, dialogs, empty/error/loading states, tables, and action feedback are translated — source coverage is in place, per-screen review still outstanding.
- [x] Unit tests, typecheck, and production build pass (see verification record below).
- [x] No database, RLS, migration, production deployment, or role architecture changes are introduced by i18n.


## Source audit snapshot — 2026-11-14
- Static source review covered the shared locale switcher/provider, Operator pages, Driver and Guardian operational components, account entry forms, and shared loading/error states.
- Locale message dictionaries contain 347 keys in each of `id`, `en`, and `ar`; the key sets match (checked again during verification below).
- The operational copy dictionary contains 953 entries with no duplicate keys.
- The `LocaleSwitcher` is mounted once in `app/layout.tsx` (`global-locale-switcher`), so every page — landing, account entry, Operator, Driver, Guardian — shows the switcher in the same position. Labels come from `localeDisplayNames`: 🇮🇩 Bahasa, 🇬🇧 English, 🇸🇦 العربية.
- The branch's Vercel status reports a build-rate-limit failure; that is a hosting-side limit, not a build error, and is outside this repository.
- Resolved: `package-lock.json` used to lag behind `package.json` (10 declared dependencies were absent from the lockfile root). It has been regenerated with npm and `npm ci` now succeeds.

## Verification record — 2026-11-14
Environment: Node v22.23.3, npm 10.9.9, Linux sandbox.

Commands run in order, from a clean `node_modules` state where relevant:

| Command | Result | Notes |
| --- | --- | --- |
| `npm install --no-audit --no-fund` | pass | Regenerated `package-lock.json` (lockfileVersion 3) from `package.json`. |
| `npm ci --no-audit --no-fund` | pass | 77 packages installed; confirms the lockfile now matches `package.json`. |
| `npm test` | pass | 257 tests, 257 pass, 0 fail (95 top-level tests, 53 suites). |
| `npm run typecheck` | pass | `tsc --noEmit` clean. |
| `npm run test:operator:sql` | pass | pglite migration + RLS checks. |
| `npm run test:camera:sql` | pass | camera signaling/RLS fixture. |
| `npm run test:location:sql` | pass | live-location authorization fixture. |
| `npm run build` | pass | `next build` exit 0, 8/8 static pages generated. A webpack cache write logged `ENOSPC` in the sandbox (disk quota), which did not fail the build. |

### Defects found and fixed during verification
- `lib/guardian/journey.ts` used `@/lib/...` aliases. Node's test runner cannot resolve the alias, so `tests/guardian-journey.test.ts` crashed before running. Switched to relative `../i18n/*.ts` imports, matching the existing convention for modules loaded by tests.
- `components/driver/StudentStatusControls.tsx` called `copy()` in the main component without defining it (typecheck error) and imported the async server `Pill` into a client component (Next build error; async components cannot render inside client components). Added the local `copy` helper and a synchronous `StatusPill` using the same `pill <tone>` markup.
- Five static source-assertion tests still expected pre-i18n Indonesian literals and one expected an older English safety-check wording. They now assert the translation keys and the shipped `id`/`en`/`ar` strings, so the original expectations are still covered.
- `package-lock.json` regenerated (see above).

### GitHub Actions status — blocked outside the repository
- The workflow file is valid YAML and registers normally (`Verify PR`, workflow id 417282093, state `active`, path `.github/workflows/verify-pr.yml`, 0 runs).
- Every run in the repository — 697 runs including pushes to `main` — is instead attached to workflow id `412371807`, an empty-named, `state: deleted` record with `path: "BuildFailed"`, concluding `startup_failure` in 0s with zero jobs and no logs.
- This includes the verification run for the head commit containing the lockfile fix. No job, step, or runner is ever created, so no repository change can alter the outcome.
- `GET /repos/.../actions/permissions` reports Actions enabled with `allowed_actions: all`, so the workflow is not filtered by an action allow-list.
- Diagnosis: the failure happens at GitHub's ingress/dispatch stage before the workflow is evaluated. Known causes for this exact signature are an exhausted private-repository Actions minute quota / blocked spending limit (billing is not readable with the current integration token: HTTP 403) or an orphaned `BuildFailed` workflow registration on GitHub's side.
- Required follow-up (repository owner): check Settings → Billing → Actions (minutes and spending limit) and, if billing is healthy, ask GitHub Support to re-index the `BuildFailed` workflow registration. Until then the workflow cannot be reported as passing, even though every step it runs passes locally.

### Still not verified
- Route-by-route visual review in all three locales (including Arabic RTL layout) at mobile and desktop sizes.
- Actual GitHub Actions execution of the workflow (blocked as described above).
