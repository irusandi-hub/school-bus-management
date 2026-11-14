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
The locale foundation, landing page, shared navigation, workspace shell labels, and account entry forms are localized, including validation and success feedback for guardian email activation. The current migration also covers the Operator administration modules (areas, schools, buses, drivers, guardians, students, routes, assignments, trips, and reports), the Driver dashboard and trip review, and the Guardian dashboard, child detail, and trip history. Shared loading/error states, driver safety feedback, navigation copy, and guardian live-map status copy have also been connected to the locale dictionary. Remaining work is a route-by-route visual and interactive review in all three locales, plus automated test, typecheck, and production-build verification. Do not declare full application localization complete until those checks pass.

## Acceptance checklist
- [ ] Indonesian is selected by default for a new visitor.
- [ ] Language selection persists after navigation and reload.
- [ ] English uses LTR and Arabic uses RTL at the document level.
- [ ] Arabic text uses an Arabic-capable font and remains readable in mixed text/numbers.
- [ ] All three user ecosystems retain their existing route and access behavior.
- [ ] Landing layout, approved copy intent, and existing images remain intact.
- [ ] Operator, Driver, and Guardian routes are checked at mobile and desktop sizes.
- [ ] Forms, dialogs, empty/error/loading states, tables, and action feedback are translated.
- [ ] Unit tests, typecheck, and production build pass.
- [ ] No database, RLS, migration, production deployment, or role architecture changes are introduced by i18n.
