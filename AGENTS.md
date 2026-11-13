# Instruksi Agen AI

Berlaku untuk semua agen yang bekerja pada repository `school-bus-management`.

## Aturan produk tertinggi

Baca `docs/PRODUCT_ARCHITECTURE_THREE_ECOSYSTEMS.md`. Aturan ini disetujui pemilik produk dan mengikat semua pekerjaan.

Dokumen lama yang masih menyebut Admin Pusat, empat area, atau pembatasan Operator berdasarkan organisasi/wilayah adalah **legacy**. Jangan mengikuti bagian tersebut; gunakan DEC-033 dan dokumen arsitektur tiga ekosistem. Keberadaan route `/admin` di kode saat ini bukan izin untuk mempertahankan role Admin sebagai target.

**Hanya tiga ekosistem: Operator, Pengemudi, Orang Tua.**
- Hanya ada satu Operator Utama, pemegang kendali tertinggi atas seluruh aplikasi dan seluruh database operasional.
- Semua fungsi administrasi dan operasional berada dalam satu dashboard/navigasi Operator.
- Tidak ada Admin Pusat sebagai role/dashboard/ekosistem terpisah.
- Sekolah adalah data yang dikelola Operator, bukan akun/ekosistem.
- Wilayah operasi adalah data pemetaan, pembagian tugas, dan audit. Wilayah tidak membentuk tenant, role, organisasi, hierarki, atau batas akses. Operator selalu dapat mengakses semua wilayah dan data.
- Pengemudi hanya dapat mengakses penugasan/perjalanan yang diberikan kepadanya.
- Orang Tua hanya dapat mengakses anak dan perjalanan yang sah terhubung dengannya.

Jangan menciptakan multi-operator, multi-tenant, pembatasan Operator berdasarkan `operator_id`/wilayah, atau hierarki staf tanpa keputusan baru dari pemilik produk.

## Keamanan dan batas perubahan

- Gunakan satu backend, database, dan sistem autentikasi.
- Otorisasi wajib ditegakkan di server dan RLS; menyembunyikan menu saja tidak cukup.
- Migrasi transisi harus menjaga data, histori, akun, dan relasi lama. Jika pemetaan akun/relasi ambigu, migrasi harus berhenti fail-closed.
- Pengemudi dan Orang Tua tetap dibatasi sesuai identitas/relasi/penugasan.
- Jangan memasukkan data pribadi anak/wali, koordinat, kredensial, token, atau rahasia ke Git.
- Jangan menjalankan migrasi pada database mana pun, merge, atau deploy tanpa persetujuan eksplisit. Persetujuan menyiapkan migration file tidak sama dengan persetujuan menjalankannya.
- Jangan mengubah layanan hosted atau produksi tanpa persetujuan eksplisit.

## Proses kerja

- Baca README, dokumen arsitektur, decision log, dan spesifikasi yang relevan.
- Periksa branch, PR terbuka, dan pekerjaan yang belum digabung. Jangan menimpa branch lain.
- Audit semua referensi role, route, layout, redirect, middleware, Server Action, server loader, SQL function, constraints, grants, policies, dan tests yang relevan.
- Hindari audit luas berulang bila bukti masih berlaku; fokus pada mismatch yang nyata.
- Jangan membagi satu refactor arsitektur menjadi PR bertumpuk yang saling bergantung tanpa alasan.

## Verifikasi dan pelaporan

- Jangan mengarang isi repository, hasil tes, integrasi, atau status deploy.
- Klaim selesai harus didukung tes yang benar-benar dijalankan.
- Laporkan file yang berubah, tes aktual, hasil, keterbatasan, dan tindak lanjut.
- Tandai hal yang belum terverifikasi secara jelas.

## Browser automation — Agent Browser

- Use Vercel `agent-browser` for real-browser verification of UI and user workflows; a successful build or unit test alone is not proof that the browser experience works.
- Before first use in an environment, check `agent-browser --version`. If unavailable, install the CLI with `npm install -g agent-browser`, then install its browser with `agent-browser install`. On Linux, use `agent-browser install --with-deps` only when required system browser libraries are missing and the environment permits installing them.
- Before using the tool, load the version-matched instructions with `agent-browser skills get core` and follow them. Use `npx skills add vercel-labs/agent-browser` only when the agent harness supports skills.
- Standard interaction loop: `agent-browser open <URL>` → `agent-browser snapshot -i` → interact using fresh element refs → take a new snapshot after navigation or meaningful DOM changes. Use `agent-browser --help` for current command syntax.
- Verify changed workflows, visible controls, validation/error states, keyboard/focus behavior where relevant, and responsive layouts. For this project, include 360/390/430px mobile widths and at least one desktop width when UI changes.
- Inspect browser console/errors and capture screenshots for material UI changes or regressions. A click is not successful unless the resulting page/state is checked.
- Use only synthetic development/preview data and explicitly authorized test accounts. Never expose, save, or enter real student/guardian personal data, production credentials, or secrets into browser sessions, screenshots, traces, or Git.
- Never use browser automation to mutate production data, submit real parent/driver workflows, send messages, or perform irreversible actions. Do not bypass authentication or authorization to claim a protected workflow passed.
- If a route requires authentication, report it as blocked/not tested unless an authorized test account and safe non-production environment are available.
- Report the exact URL/environment, routes and viewport sizes tested, actions performed, observed results, console errors, screenshots/evidence, and anything not tested. Distinguish browser-tested behavior from build/unit-test results.
- Do not add `agent-browser` as an application runtime dependency or commit browser binaries/auth state unless explicitly required and approved.
