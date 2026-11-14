# Landing refinement — 2026-11-14

Continues `fix/unified-language-selector` from `016b553`, retaining existing images, copy, navy/yellow branding and role destinations.

- Single-column mobile hero; larger contained bus image in directional organic frame.
- Native language names without flags, active checkmark; compact horizontal landing dropdown in reserved header space. Shared switcher dismissal behavior unchanged.
- App Store/Google Play badges explicitly say Segera hadir / Coming soon / قريبًا. Existing unavailable notice retained; no store URL fabricated.
- Feature strip spacing and responsive role cards; RTL image fades, arrow placement and direction adjusted.
- Landing-only demo tab moved out of fixed content overlay into reserved header pocket. Demo panel remains user-opened.

Verification: 20 i18n tests pass; TypeScript passes; diff whitespace check passes. Browser geometry matrix for id/en/ar at 360/430/768/1440: no horizontal overflow or image/text overlap. Initial English 360 dropdown exceeded bounds; final 280px adaptive panel rechecked at 360: x64–344, bottom115, title top144, demo right60. Visual screenshots inspected for mobile English/Arabic and desktop Arabic. Original photo paths unchanged. Store buttons remain informational rather than downloads.

No OTP, auth logic, database, Supabase/RLS, migrations, production deployment or main merge. Full suite/build intentionally not repeated for this scoped UI change. Hosted preview READY/CI needs authenticated GitHub/Vercel access; local browser verification is not a hosted preview claim.
