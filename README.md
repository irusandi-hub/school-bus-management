# School Bus Management

Aplikasi manajemen transportasi bus sekolah untuk sekolah, operator bus, pengemudi, dan orang tua/wali. Pilot perencanaan: Dammam dan sekitarnya.

## Status saat ini

**Modul data Admin Pusat, alur akun wali, Main Access Gate, dan tiga area pengguna sudah diimplementasikan dan tersambung ke Supabase.** Data sekolah, operator, siswa, wali, bus, dan pengemudi disimpan di database dengan validasi, pencarian, filter, paginasi, serta kebijakan akses per peran (RLS).

Halaman pertama adalah **Main Access Gate** dengan tiga kartu masuk (Admin & Operator, Pengemudi, Orang Tua/Wali). Kartu hanya pintu masuk: setelah autentikasi, peran dibaca dari `profiles.role` dan relasi organisasi di database, lalu pengguna diarahkan ke area miliknya. Area yang terpisah:

- **Admin & Operator** (`/admin`, `/operator`): ringkasan, sekolah, siswa/wali, bus, pengemudi, rute, penugasan, perjalanan, laporan/audit. Operator hanya melihat dan mengelola organisasinya (CRUD bus/pengemudi/penugasan organisasi; rute dibaca saja), Admin Pusat mengelola seluruh platform.
- **Pengemudi** (`/pengemudi`): tugas hari ini, manifest siswa per titik jemput, mulai/akhiri perjalanan, konfirmasi tiba, status siswa (sudah naik/turun/tidak ikut/kendala), riwayat perjalanan sendiri. Tanpa menu administrasi dan tanpa data pengemudi lain.
- **Orang Tua/Wali** (`/wali`): kartu anak adaptif untuk satu/lebih anak, sekolah dan layanan, status perjalanan, detail penjemputan, riwayat perjalanan anak miliknya sendiri.

Yang **belum** aktif dan sengaja tidak ditampilkan sebagai fitur berjalan:

- Posisi bus langsung (GPS) — belum ada sumber data; UI hanya menampilkan keterangan bahwa GPS belum tersedia.
- Kamera live / streaming dan tautan kamera — tidak ada integrasi; tautan tidak ditampilkan.
- Integrasi HERE atau penyedia routing lain.
- Integrasi perangkat GPS bus dan vendor eksternal.
- Penautan akun operator/pengemudi sudah tersedia di `/admin/operator` dan `/admin/pengemudi` (email akun + tombol tautkan/lepas). Akun yang belum tertaut diarahkan ke `/tanpa-akses` beserta alasannya.

Modul tersebut tetap memerlukan keputusan dan validasi teknis terpisah (lihat `docs/TECHNICAL_SPEC_REVIEW.md`).

> Keempat migrasi sudah dijalankan berurutan pada database Postgres lokal khusus pengembangan dan lulus pemeriksaan RLS. Migrasi **belum dijalankan** pada proyek Supabase mana pun (tidak ada kredensial) dan tidak boleh dijalankan ke produksi tanpa persetujuan.

## Menjalankan secara lokal

Persyaratan: Node.js 20+ dan npm.

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

Variabel lingkungan yang diperlukan (lihat `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Tanpa variabel tersebut aplikasi tetap dapat dibuka, tetapi halaman data menampilkan pemberitahuan bahwa database belum dikonfigurasi (tidak ada crash dan tidak ada data contoh).

**Live Video wali (kontrak integrasi, belum aktif).** Sumber siaran kamera dibaca di server dari `LIVE_VIDEO_STREAMS` berisi JSON `{"<studentId>:<tripId>":{"url":"https://...","mimeType":"video/mp4","expiresAt":"2026-11-04T10:00:00Z"}}`. Hanya URL HTTPS yang diterima, dan nilainya hanya dikirim ke wali yang terhubung ketika anak tercatat berada di bus. Selama variabel ini kosong atau tidak valid, area Live Video menampilkan status "kamera belum terhubung" tanpa indikator LIVE, tanpa siaran contoh, dan tanpa rekaman.

Selama tahap pengembangan UI (DEC-023, DEC-027), keempat area terbuka tanpa login otomatis pada lingkungan non-produksi yang dikenali: `next dev` lokal dan **Vercel Preview** (`VERCEL_ENV=preview`, diisi Vercel sendiri sehingga tidak perlu konfigurasi tambahan). Mode ini fail-closed: produksi (`VERCEL_ENV=production`, `NODE_ENV=production` tanpa penanda platform, atau penanda lingkungan tak dikenal) selalu tertutup sekalipun `DEV_OPEN_ACCESS=1` terpasang, dan mode ini tidak pernah membuat klien Supabase sehingga tidak menyentuh database nyata — datanya berasal dari dataset simulasi berlabel.

Sakelar darurat: set `DEV_OPEN_ACCESS=0` untuk mematikan akses terbuka di lingkungan non-produksi dan kembali ke alur autentikasi normal.

Konfigurasi tambahan pada Supabase Dashboard → Authentication → URL Configuration:

- Site URL: alamat aplikasi (mis. `http://localhost:3000`).
- Redirect URL yang diizinkan: `http://localhost:3000/auth/callback` dan URL produksi yang setara.
- Aktifkan konfirmasi email agar tautan verifikasi wali berfungsi.

## Rute aplikasi

| Rute | Akses | Isi |
| --- | --- | --- |
| `/` | publik | **Main Access Gate**: tiga kartu akses (Admin & Operator, Pengemudi, Orang Tua/Wali) |
| `/login` | publik | Masuk dengan email dan kata sandi; redirect mengikuti peran dari database |
| `/daftar` | publik | Meminta tautan verifikasi email wali |
| `/auth/callback` | publik | Penukaran kode verifikasi Supabase |
| `/tanpa-akses` | sesi terverifikasi | Akun tanpa peran/organisasi yang sah (mis. belum tertaut) |
| `/akun/kata-sandi` | sesi terverifikasi | Membuat kata sandi + klaim akun wali |
| `/admin` | profil `admin` | Ringkasan data nyata dan pintasan modul |
| `/admin/sekolah` | profil `admin` | CRUD sekolah + penempatan operator (nonaktifkan, bukan hapus) |
| `/admin/operator` | profil `admin` | CRUD operator |
| `/admin/siswa` | profil `admin` | CRUD siswa + pencarian/filter |
| `/admin/siswa/[id]` | profil `admin` | Detail siswa, ubah status layanan, riwayat status, roster titik jemput |
| `/admin/wali` | profil `admin` | Pra-pendaftaran email wali, aktif/nonaktif |
| `/admin/bus` | profil `admin` | CRUD bus |
| `/admin/pengemudi` | profil `admin` | CRUD pengemudi |
| `/admin/rute` | profil `admin` | CRUD rute + titik jemput + penempatan siswa pada rute |
| `/admin/rute/[id]` | profil `admin` | Detail rute, stop, dan siswa yang terhubung |
| `/admin/penugasan` | profil `admin` | CRUD penugasan bus/pengemudi/rute/tanggal |
| `/admin/perjalanan` | profil `admin` | Daftar perjalanan + status + konfirmasi tiba |
| `/admin/laporan` | profil `admin` | Rekap penggunaan layanan dan catatan audit |
| `/operator` | profil `operator` + baris operator aktif | Ringkasan organisasi |
| `/operator/{bus,pengemudi,siswa,penugasan,perjalanan,laporan}` | profil `operator` | Data organisasi miliknya; rute hanya baca |
| `/pengemudi` | profil `driver` + baris pengemudi aktif | Tugas hari ini (hanya penugasan miliknya) |
| `/pengemudi/tugas/[id]` | profil `driver` | Manifest, mulai/akhiri, konfirmasi tiba, status siswa |
| `/pengemudi/riwayat` | profil `driver` | Riwayat perjalanan miliknya |
| `/wali` | profil `parent` | Hanya siswa milik wali yang masih aktif |
| `/wali/anak/[id]` | profil `parent` | Detail anak, penjemputan, hari ini, perjalanan terakhir |
| `/wali/riwayat` | profil `parent` | Riwayat perjalanan anak miliknya |

Middleware memproteksi `/admin`, `/operator`, `/pengemudi`, `/wali`, `/akun`, dan `/tanpa-akses`. Mengubah URL atau memilih kartu lain di gate tidak menambah hak akses: setiap layout halaman memanggil pemeriksaan peran di server (`requireAdmin`, `requireOperator`, `requireDriver`, `requireGuardian`), dan setiap Server Action memanggil pemeriksaan yang sama sebelum menyentuh data.

## Modul Admin Pusat

- **Sekolah & operator:** nama, kode unik, kota, alamat, kontak, dan koordinat sekolah (lintang/bujur, harus diisi berpasangan). Nonaktifkan tanpa menghapus.
- **Siswa:** Admissions Number unik, nama, tanggal lahir, sekolah, satu wali, alamat rumah, koordinat rumah, catatan titik jemput, status layanan.
- **Akun wali:** email wali didaftarkan admin (unik, huruf kecil), nama, telepon. Email akun yang sudah aktif tidak dapat diubah dari formulir agar akses tidak tertukar.
- **Bus:** kode armada unik, nomor polisi, kapasitas kursi (1–100), model, operator, catatan.
- **Pengemudi:** nama, telepon, nomor SIM, operator, status aktif.
- **Status layanan siswa:** `active` (aktif), `paused` (sementara tidak menggunakan), `ended` (dihentikan). Setiap perubahan wajib menyertakan alasan dan tercatat permanen di `student_service_status_history`.
- **Audit:** penambahan dan perubahan data ditulis otomatis oleh trigger database ke `audit_logs` (aktor, entitas, waktu); isi kolom tidak disalin agar data pribadi tidak menumpuk di log.

Pencarian dan filter memakai URL (`?q=&status=&sekolah=&page=`) sehingga dapat dibagikan dan bekerja tanpa JavaScript. Setiap tindakan penonaktifan meminta konfirmasi.

## Alur akun wali

1. Admin Pusat mendaftarkan email wali pada menu **Akun Wali** dan menghubungkan siswa ke wali tersebut pada menu **Data Siswa**.
2. Wali membuka `/daftar`, memasukkan email terdaftar, lalu membuka tautan verifikasi yang dikirim Supabase.
3. Setelah verifikasi, wali membuat kata sandi di `/akun/kata-sandi`. Pada langkah ini fungsi `claim_guardian_account()` memeriksa: email terverifikasi, email terdaftar dan aktif, belum terhubung ke akun lain, dan minimal satu siswa berstatus layanan aktif. Profil dibuat dengan peran `parent` oleh fungsi tersebut — bukan oleh pilihan pengguna.
4. Login berikutnya memakai email dan kata sandi. Jika seluruh siswa terkait nonaktif, login ditolak dengan pesan yang menjelaskan langkah berikutnya.

Pesan pada formulir aktivasi bersifat netral (tidak mengungkap apakah sebuah email terdaftar). Penolakan setelah verifikasi email dijelaskan secara spesifik kepada pemilik email tersebut.

## Database dan migrasi

- `supabase/migrations/20261029000000_initial_school_bus_schema.sql` — skema awal.
- `supabase/migrations/20261031000000_admin_core_crud.sql` — modul data Admin Pusat.
- `supabase/migrations/20261031000001_operator_driver_guardian_areas.sql` — area operator/pengemudi/wali.
- `supabase/migrations/20261031000002_operator_driver_account_linking.sql` — penautan akun operator/pengemudi.

Keempat migrasi sudah dijalankan berurutan pada Postgres 14 lokal (database pengembangan kosong) dan lulus seluruh pemeriksaan RLS di `supabase/tests/migration_checks.sql`. Penerapan pada proyek Supabase pengembangan **belum dilakukan** karena tidak ada kredensial.

Migrasi keempat (aditif, admin-only) menambahkan:

- `private.resolve_account_uid(text)` — mencari `auth.users` berdasarkan email terverifikasi.
- `public.link_operator_account(uuid, text)`, `public.unlink_operator_account(uuid)`.
- `public.link_driver_account(uuid, text)`, `public.unlink_driver_account(uuid)`.
- `public.linked_account_emails(uuid[])` — daftar email akun yang tertaut untuk ditampilkan ke admin.

Semua fungsi tersebut `security definer` dengan `search_path = ''`, memeriksa `private.is_admin()`, memakai pesan Bahasa Indonesia, dan hanya diberikan kepada role `authenticated`. Penautan akun juga menyetel `profiles.role` yang sesuai; pelepasan tautan mengembalikan role menjadi `parent` hanya jika akun tidak lagi tertaut ke baris mana pun.

Migrasi ketiga (aditif) menambahkan:

- Nilai role `operator` pada check constraint `profiles.role`, kolom `operators.profile_id`, dan `schools.operator_id`.
- Tabel `student_route_stops` (roster siswa per titik jemput, unik parsial per arah) plus trigger validasi bahwa stop milik rute tersebut.
- Kolom `trips.arrived_at` untuk konfirmasi tiba di sekolah.
- Fungsi `private.current_operator_id()`, `private.current_driver_id()`, dan helper scope `security definer` (`operator_school_ids`, `operator_student_ids`, `operator_route_ids`, `operator_bus_ids`, `operator_driver_ids`, `operator_guardian_ids`, `driver_route_ids`, `driver_student_ids`, `guardian_bus_ids`). Policy tidak lagi melakukan join antar tabel yang punya policy sendiri, karena Postgres menolak policy yang saling merujuk dengan galat `infinite recursion detected in policy`.
- Indeks unik parsial `trips_one_active_idx` — satu penugasan hanya boleh punya satu perjalanan `scheduled`/`in_progress`; permintaan ganda dari luar UI tetap ditolak database.
- Policy RLS baru: operator (scoped ke organisasinya), pengemudi (hanya penugasan/perjalanan miliknya + roster rute aktif + siswa pada penugasan itu), wali (hanya siswa aktif miliknya + rute/stop/perjalanan/riwayat terkait), serta policy baca sekolah untuk wali.
- Trigger audit untuk `routes`, `route_stops`, dan `student_route_stops`.

Migrasi kedua bersifat aditif dan dapat ditinjau:

- Menambah tabel `schools`, `operators`, `guardians`, `student_service_status_history`, `audit_logs`.
- Menambah kolom siswa (sekolah, wali, tanggal lahir, alamat/koordinat rumah, status layanan) dan mengganti nama `students.student_code` menjadi `admissions_number`.
- Mempertahankan data lama: nama sekolah teks bebas di-backfill menjadi baris `schools`, relasi wali lama dipindahkan ke model satu wali per siswa. Tabel lama `guardian_students` tidak dihapus, hanya tidak dipakai lagi dan tertutup oleh RLS.
- Menambah kolom bus (operator, model, catatan) dan pengemudi (nama, telepon, operator); `drivers.profile_id` menjadi opsional karena akun pengemudi belum dibuat pada tahap ini.
- Menambah fungsi `set_student_service_status()` (admin-only, wajib alasan) dan `claim_guardian_account()` (klaim akun wali).
- Membatasi grant: `anon` tidak memiliki akses tabel; `authenticated` hanya mendapat operasi yang diperlukan. **Tidak ada grant `DELETE`** pada tabel modul ini, dan kolom `students.service_status` serta `guardians.profile_id` tidak dapat diubah langsung melalui API.

Menerapkan migrasi (pilih salah satu, pada proyek pengembangan):

```bash
supabase db push          # dengan Supabase CLI tertaut ke proyek dev
# atau tempelkan isi file migrasi pada SQL Editor proyek dev
```

### Membuat akun Admin Pusat pertama

Pembuatan akun admin dilakukan di luar aplikasi, karena aplikasi tidak boleh memberi peran admin kepada pengguna sendiri:

1. Buat pengguna pada Supabase Dashboard → Authentication → Users.
2. Jalankan pada SQL Editor (peran server):

```sql
insert into public.profiles (id, full_name, role)
values ('<uuid-pengguna-auth>', 'Nama Admin', 'admin')
on conflict (id) do update
  set role = 'admin', full_name = excluded.full_name;
```

### Penautan akun operator dan pengemudi

Penautan dilakukan oleh Admin Pusat dari UI, bukan lewat SQL manual:

- `/admin/operator` — kolom **Akun masuk** menampilkan email akun yang tertaut (atau “Belum tertaut”), dengan formulir email + tombol **Tautkan** / **Lepas tautan**.
- `/admin/pengemudi` — perlakuan yang sama untuk baris pengemudi.

Server Action memanggil RPC `link_operator_account` / `link_driver_account` (dan `unlink_*`), sehingga pemeriksaan admin terjadi di database. Email harus milik akun `auth.users` yang sudah terverifikasi, belum tertaut ke baris lain, dan role-nya belum dipakai peran lain. Pesan kegagalan ditampilkan apa adanya dalam Bahasa Indonesia, sedangkan pesan internal yang tidak dikenal diganti dengan kalimat umum agar tidak membocorkan detail.

Akun dengan role operator/pengemudi yang belum tertaut (atau barisnya tidak aktif) diarahkan ke `/tanpa-akses` dengan alasan yang jelas.

### Ringkasan RLS

- Admin Pusat: `select`, `insert`, `update` pada tabel master, hanya jika `profiles.role = 'admin'` (fungsi `private.is_admin()`).
- Operator: hanya barisnya sendiri pada `operators`; sekolah, bus, pengemudi, siswa, wali, rute, penugasan, dan perjalanan organisasinya; rute hanya `select`; skop dihitung oleh `private.current_operator_id()`.
- Pengemudi: hanya penugasan/perjalanan miliknya (via `trip_assignments.driver_id`), roster titik jemput pada rute penugasan aktif, dan siswa yang terdaftar pada penugasan itu. `trips` dapat diubah hanya oleh penugasan miliknya.
- Wali: hanya baris `students` miliknya **dan** berstatus `active`; hanya barisnya sendiri pada `guardians`; rute/stop/bus/perjalanan hanya sejauh terhubung ke siswa aktifnya; riwayat status hanya untuk siswa aktif miliknya.
- Posisi kartu di gate tidak memengaruhi policy apa pun: tidak ada policy yang memakai input dari klien selain sesi autentikasi.
- Semua tabel modul mengaktifkan RLS dan menolak secara default bila tidak ada policy yang cocok.
- Penulisan audit dan riwayat status dilakukan oleh trigger/fungsi `security definer`, sehingga tidak dapat dilewati dari UI.

## Pengujian dan verifikasi

```bash
npm run typecheck   # tsc --noEmit
npm test            # unit test fungsi validasi & keamanan redirect
npm run build       # next build

# Uji migrasi + RLS pada Postgres pengembangan (HANYA database kosong/dev)
psql -v ON_ERROR_STOP=1 -d schoolbus_dev -f supabase/migrations/20261029000000_initial_school_bus_schema.sql
psql -v ON_ERROR_STOP=1 -d schoolbus_dev -f supabase/migrations/20261031000000_admin_core_crud.sql
psql -v ON_ERROR_STOP=1 -d schoolbus_dev -f supabase/migrations/20261031000001_operator_driver_guardian_areas.sql
psql -v ON_ERROR_STOP=1 -d schoolbus_dev -f supabase/migrations/20261031000002_operator_driver_account_linking.sql
psql -v ON_ERROR_STOP=1 -d schoolbus_dev -f supabase/tests/migration_checks.sql
```

`supabase/tests/migration_checks.sql` membuat data uji sendiri (delapan profil, dua operator, dua sekolah, dua bus, dua pengemudi, dua wali, tiga siswa, dua rute, tiga titik jemput, dua penugasan, dua perjalanan) lalu menjalankan T1–T14: cakupan operator, penolakan tulis lintas organisasi, cakupan pengemudi, larangan menulis di luar tugas, isolasi wali, isolasi profil/audit, wewenang admin, penolakan `anon`, penolakan penautan akun oleh non-admin, keberhasilan penautan/pelepasan oleh admin, serta penyembunyian email akun dari non-admin. Berkas ini menolak berjalan pada database berisi data nyata dan diakhiri pesan “SEMUA PEMERIKSAAN MIGRASI DAN RLS LULUS”.

Perubahan ini lulus `typecheck`, 28 unit test, `next build`, serta keempat migrasi dan seluruh pemeriksaan T1–T14 pada Postgres 14 lokal. Unit test mencakup normalisasi email/kode, validasi Admissions Number, format telepon, parsing koordinat, sanitasi kata kunci pencarian, status layanan, penolakan redirect ke URL eksternal, pemetaan peran ke area, penolakan `next` lintas area (`scopedNext`), serta label arah rute/status perjalanan/status siswa.

Smoke test pada preview: `/` menampilkan Main Access Gate dengan tiga kartu akses, `/login` merender formulir masuk, dan seluruh rute internal tanpa konfigurasi Supabase menampilkan pemberitahuan “Database belum dikonfigurasi” (tanpa data contoh dan tanpa crash).

**Belum diuji:** integrasi langsung ke platform Supabase (tidak ada kredensial pada lingkungan ini), alur email verifikasi nyata, dan pengujian otomatisasi Server Action lewat browser. RLS sudah diuji pada Postgres lokal dengan stub `auth`, sehingga isolasi antarperan **teruji di database lokal tetapi belum terverifikasi di platform Supabase**.

## Keamanan dan batasan

Jangan masukkan data pribadi siswa/orang tua, kredensial, token, API key, atau data produksi ke Git. Otorisasi ditegakkan di server dan database, bukan dengan menyembunyikan menu. Peran tidak pernah ditentukan oleh pilihan tampilan. Koordinat rumah hanya dapat dibaca admin dan wali siswa terkait.

Risiko yang masih terbuka dan perlu ditangani sebelum produksi: rate limiting khusus formulir aktivasi (saat ini bergantung pada batas bawaan Supabase Auth), pemulihan kata sandi mandiri, verifikasi ulang email saat admin mengganti email wali, serta tinjauan PDPL dan kewajiban Saudi terkait data anak dan lokasi.

## Dokumen acuan

- [Master specification](docs/MASTER_SPEC.md)
- [Tinjauan spesifikasi teknis](docs/TECHNICAL_SPEC_REVIEW.md)
- [Catatan keputusan](docs/DECISIONS_LOG.md)
- [Arsip backlog implementasi](docs/IMPLEMENTATION_BACKLOG.md)
- [Alur inti navigasi dan laporan orang tua](docs/CORE_WORKFLOWS_NAVIGATION_AND_PARENT_REPORTS.md)
- [Evaluasi penyedia routing](docs/ROUTING_PROVIDER_EVALUATION.md)


## Tahap pengembangan UI (DEC-023)

**Instruksi tahap terbaru:** sebelum integrasi autentikasi final, seluruh area Admin Pusat, Operator, Pengemudi, dan Orang Tua/Wali harus dapat ditinjau tanpa login, registrasi, verifikasi email, atau penautan akun. Urutan pengerjaan: Admin Pusat → Operator → Pengemudi → Orang Tua/Wali → integrasi autentikasi/otorisasi final.

Ketentuan ini mengubah urutan implementasi, bukan standar keamanan produksi:
- Akses terbuka hanya untuk local/development/preview non-production dan harus fail-closed bila environment tidak dikenali.
- Tidak boleh aktif di production atau menggunakan database/data produksi.
- Jangan menonaktifkan RLS atau mengubah kebijakan database produksi untuk mempermudah UI.
- Data contoh hanya untuk development dan harus diberi label simulasi.
- Seluruh pemeriksaan server/database dan autentikasi final tetap wajib dipulihkan sebelum rilis production.

Catatan status: bagian README lain yang menyebut autentikasi wajib di semua area menggambarkan rancangan integrasi akhir, bukan perilaku yang harus dipaksakan selama tahap UI terbuka ini. README perlu diselaraskan lagi setelah implementasi mode development selesai.
