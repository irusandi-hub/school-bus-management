# School Bus Management

Aplikasi manajemen transportasi bus sekolah untuk Project Area, sekolah, pengemudi, dan orang tua/wali. Contoh area: Dammam, Riyadh, dan Madinah.

## Status saat ini

**Arsitektur tiga ekosistem sudah diimplementasikan pada branch `feat/unified-operator-global-workspace` (PR #30, masih Draft) dan tersambung ke Supabase.** Data Project Area, sekolah, siswa, wali, bus, pengemudi, rute, penugasan, dan perjalanan disimpan di database dengan validasi, pencarian, filter, paginasi, serta kebijakan akses per peran (RLS).

Halaman pertama adalah **Main Access Gate**. Kartu hanya pintu masuk: setelah autentikasi, peran dibaca dari `profiles.role` di database, lalu pengguna diarahkan ke area miliknya. Tiga ekosistem:

- **Operator Utama** (`/operator` sebagai beranda, modul di `/admin/*`): satu-satunya kendali global platform. Operator membaca dan mengubah seluruh Project Area, sekolah, armada, pengemudi, siswa, wali, rute, penugasan, perjalanan, dan audit lintas area. Project Area dan sekolah adalah data operasional, bukan akun login atau batas hak akses. Dashboard menyediakan pilihan **Semua Area** dan tab per area; pilihan disimpan pada cookie sehingga konteks daftar, statistik, laporan, filter, dan formulir tetap konsisten antarhalaman. Selama transisi, role lama `admin` menerima ruang kerja yang sama; URL modul lama `/operator/{bus,pengemudi,siswa,penugasan,perjalanan,laporan,sekolah,wali,rute}` dialihkan ke modul bersama.
- **Pengemudi** (`/pengemudi`): satu halaman operasional dengan layout ringkas yang telah disetujui dan dipertahankan. Tombol utama pada posisi semula berubah dari **Mulai Perjalanan** menjadi **Akhiri Perjalanan**; tombol tersebut membuka panel pemeriksaan keselamatan. Checklist tetap wajib dan tombol final bertuliskan **Akhiri**. Navigasi rute, daftar siswa, progres, GPS, catatan tugas, dan riwayat tetap pada susunan operasional sebelumnya.
- **Orang Tua/Wali** (`/wali`): kartu anak adaptif untuk satu/lebih anak, sekolah dan layanan, status perjalanan, peta lokasi HP pengemudi selama perjalanan anak, live video perjalanan (eksperimental), detail penjemputan, dan riwayat perjalanan anak miliknya sendiri.

Yang **belum** aktif atau belum siap produksi:

- Posisi GPS perangkat bus — belum ada sumber data; yang tersedia hanya GPS HP pengemudi selama perjalanan aktif.
- Integrasi vendor streaming kamera (termasuk rekaman/DVR, audio, TURN/SFU) — belum ada. Signaling kamera perjalanan bersifat eksperimental, default mati, dan belum diuji pada Supabase hosted; lihat `docs/TRIP_CAMERA_REALTIME.md`.
- Integrasi HERE atau penyedia routing jalan lain; peta hanya menampilkan urutan titik.
- Penautan akun pengemudi tersedia di `/admin/pengemudi`; Project Area tidak memiliki akun login. Akun pengemudi yang belum tertaut diarahkan ke `/tanpa-akses`.
- `npm audit` melaporkan 2 kerentanan dependency (1 moderate, 1 high) yang belum diperbaiki pada PR ini.

Modul tersebut tetap memerlukan keputusan dan validasi teknis terpisah (lihat `docs/TECHNICAL_SPEC_REVIEW.md`).

> Seluruh migrasi (sembilan berkas, termasuk migrasi otoritas Operator global dan Project Area) sudah dijalankan berurutan pada database PGlite/Postgres lokal khusus pengembangan dan lulus pemeriksaan RLS. Migrasi **belum dijalankan** pada proyek Supabase mana pun dan tidak boleh dijalankan ke produksi tanpa persetujuan.

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
| `/admin` | profil `operator` (atau `admin` legacy) | Ringkasan data platform dan pintasan modul |
| `/admin/area` | Operator global | CRUD Project Area, tambah/ubah/aktif-nonaktif |
| `/admin/sekolah` | Operator global | CRUD sekolah + Project Area (nonaktifkan, bukan hapus) |
| `/admin/operator` | Operator global | URL lama; dialihkan ke `/admin/area` |
| `/admin/siswa` | Operator global | CRUD siswa + pencarian/filter |
| `/admin/siswa/[id]` | Operator global | Detail siswa, ubah status layanan, riwayat status, roster titik jemput |
| `/admin/wali` | Operator global | Pra-pendaftaran email wali, aktif/nonaktif |
| `/admin/bus` | Operator global | CRUD bus per Project Area |
| `/admin/pengemudi` | Operator global | CRUD pengemudi + penautan akun pengemudi |
| `/admin/rute` | Operator global | CRUD rute + titik jemput + penempatan siswa pada rute |
| `/admin/rute/[id]` | Operator global | Detail rute, stop, dan siswa yang terhubung |
| `/admin/penugasan` | Operator global | CRUD penugasan bus/pengemudi/rute/tanggal |
| `/admin/perjalanan` | Operator global | Pantau perjalanan, status, dan waktu (dibuat/diakhiri pengemudi) |
| `/admin/laporan` | Operator global | Rekap penggunaan layanan dan catatan audit |
| `/operator` | profil `operator` (atau `admin` legacy) | Beranda ruang kerja Operator global |
| `/operator/{bus,pengemudi,siswa,penugasan,perjalanan,laporan,sekolah,wali,rute}` | Operator global | URL modul lama; dialihkan ke modul bersama `/admin/...` |
| `/operator/laporan/export` | Operator global | Ekspor CSV perjalanan sesuai konteks area (paginasi penuh) |
| `/pengemudi` | profil `driver` + baris pengemudi aktif | Satu halaman operasional: satu tombol Mulai/Akhiri Perjalanan, dialog checklist keselamatan, navigasi rute, daftar siswa, dan GPS |
| `/pengemudi/tugas/[id]` | profil `driver` | Dialihkan ke `/pengemudi?tugas=<id>` untuk tautan lama |
| `/pengemudi/riwayat` | profil `driver` | Riwayat perjalanan miliknya |
| `/wali` | profil `parent` | Hanya siswa milik wali yang masih aktif |
| `/wali/anak/[id]` | profil `parent` | Detail anak, penjemputan, hari ini, perjalanan terakhir |
| `/wali/riwayat` | profil `parent` | Riwayat perjalanan anak miliknya |

Middleware memproteksi `/admin`, `/operator`, `/pengemudi`, `/wali`, `/akun`, dan `/tanpa-akses`. Mengubah URL atau memilih kartu lain di gate tidak menambah hak akses: setiap layout halaman memanggil pemeriksaan peran di server (`requireOperator`, `requireDriver`, `requireGuardian`; `requireAdmin` adalah alias kompatibilitas untuk modul `/admin`), dan setiap Server Action memanggil pemeriksaan yang sama sebelum menyentuh data. RLS memeriksa ulang di database.

## Modul Operator Utama

- **Project Area:** nama (mis. Dammam), kode unik, kota, kontak, dan status aktif. Area bukan perusahaan, akun, atau tingkat otoritas; nonaktifkan tanpa menghapus data operasional.
- **Sekolah:** nama, kode unik, kota, alamat, kontak, koordinat (lintang/bujur harus berpasangan), dan Project Area. Nonaktifkan tanpa menghapus.
- **Siswa:** Admissions Number unik, nama, tanggal lahir, sekolah, satu wali, alamat rumah, koordinat rumah, catatan titik jemput, status layanan.
- **Akun wali:** email wali didaftarkan Operator (unik, huruf kecil), nama, telepon. Email akun yang sudah aktif tidak dapat diubah dari formulir agar akses tidak tertukar.
- **Bus:** kode armada unik, nomor polisi, kapasitas kursi (1–100), model, Project Area, catatan.
- **Pengemudi:** nama, telepon, nomor SIM, Project Area, status aktif.
- **Status layanan siswa:** `active` (aktif), `paused` (sementara tidak menggunakan), `ended` (dihentikan). Setiap perubahan wajib menyertakan alasan dan tercatat permanen di `student_service_status_history`.
- **Audit:** penambahan dan perubahan data ditulis otomatis oleh trigger database ke `audit_logs` (aktor, entitas, waktu); isi kolom tidak disalin agar data pribadi tidak menumpuk di log.

Pencarian dan filter memakai URL (`?q=&status=&sekolah=&page=`) sehingga dapat dibagikan dan bekerja tanpa JavaScript. Setiap tindakan penonaktifan meminta konfirmasi.

## Alur akun wali

1. Operator Utama mendaftarkan email wali pada menu **Akun Wali** dan menghubungkan siswa ke wali tersebut pada menu **Data Siswa**.
2. Wali membuka `/daftar`, memasukkan email terdaftar, lalu membuka tautan verifikasi yang dikirim Supabase.
3. Setelah verifikasi, wali membuat kata sandi di `/akun/kata-sandi`. Pada langkah ini fungsi `claim_guardian_account()` memeriksa: email terverifikasi, email terdaftar dan aktif, belum terhubung ke akun lain, dan minimal satu siswa berstatus layanan aktif. Profil dibuat dengan peran `parent` oleh fungsi tersebut — bukan oleh pilihan pengguna.
4. Login berikutnya memakai email dan kata sandi. Jika seluruh siswa terkait nonaktif, login ditolak dengan pesan yang menjelaskan langkah berikutnya.

Pesan pada formulir aktivasi bersifat netral (tidak mengungkap apakah sebuah email terdaftar). Penolakan setelah verifikasi email dijelaskan secara spesifik kepada pemilik email tersebut.

## Database dan migrasi

- `supabase/migrations/20261029000000_initial_school_bus_schema.sql` — skema awal.
- `supabase/migrations/20261031000000_admin_core_crud.sql` — modul data dan audit.
- `supabase/migrations/20261031000001_operator_driver_guardian_areas.sql` — area operator/pengemudi/wali.
- `supabase/migrations/20261031000002_operator_driver_account_linking.sql` — penautan akun operator/pengemudi.
- `supabase/migrations/20261102000000_trip_safety_check.sql` — pemeriksaan keselamatan sebelum perjalanan ditutup.
- `supabase/migrations/20261106000000_trip_camera_signaling.sql` — sesi kamera perjalanan, RPC, channel privat, dan pencabutan otomatis.
- `supabase/migrations/20261107000000_trip_live_locations.sql` — satu baris lokasi GPS HP per perjalanan, RPC tulis/baca, dan pembersihan saat perjalanan berakhir.
- `supabase/migrations/20261109000000_unified_operator_global_authority.sql` — role `operator`, satu identitas global, otoritas platform-wide, dan penguncian penautan akun.
- `supabase/migrations/20261110000000_project_areas.sql` — rename Perusahaan menjadi Project Area, kolom area pada sekolah/bus/pengemudi/rute, dan trigger isolasi lintas area.

Seluruh sembilan migrasi sudah dijalankan berurutan pada PGlite/Postgres lokal (database pengembangan kosong) dan lulus seluruh pemeriksaan RLS di `supabase/tests/migration_checks.sql`. Penerapan pada proyek Supabase pengembangan **belum dilakukan** karena tidak ada kredensial; migrasi tidak boleh dijalankan ke produksi tanpa persetujuan.

Migrasi `20261110000000_project_areas.sql` menambahkan:

- **Rename tanpa menghapus data** — `public.operators` menjadi `public.project_areas`, `operators.profile_id` menjadi referensi historis `legacy_profile_id`, dan `operator_id` pada sekolah, bus, serta pengemudi menjadi `project_area_id`.
- **Rute terikat area** — `routes.school_id` dan `routes.project_area_id` diisi dari sekolah; trigger menolak sekolah dan area yang tidak cocok.
- **Isolasi lintas area** — trigger menolak penugasan yang mencampur rute/bus/pengemudi dari area berbeda, menolak siswa pada rute area lain, dan menolak pemindahan siswa yang masih memiliki roster aktif di area lama.
- **Otorisasi tetap global** — policy area-scoped lama dihapus bersama `current_operator_id()` dan helper `operator_*`; Operator memakai `private.is_admin()`, sedangkan Pengemudi/Wali tetap dibatasi penugasan/anak. Project Area bukan akun dan tidak menambah tingkatan otoritas.

Migrasi kesembilan (`20261109000000_unified_operator_global_authority.sql`) menambahkan:

- **Otoritas Operator global** — constraint role diperluas, satu akun Admin lama dipromosikan hanya jika datanya tidak ambigu, dan unique index parsial `profiles_single_global_operator_idx` menegakkan tepat satu identitas global lintas role `admin`/`operator`.
- **`private.is_admin()`** kini menerima `operator` dan `admin` legacy; policy Admin yang sudah ada menjadi otoritas platform-wide Operator tanpa duplikasi policy.
- **Penautan perusahaan dihapus** — `link_operator_account` dan `unlink_operator_account` kemudian dihapus pada migrasi Project Area; `resolve_account_uid` tetap internal untuk penautan pengemudi. Project Area bukan akun login.
- **Helper scope memeriksa role** — `current_operator_id()` mensyaratkan role `admin`/`operator` dan `current_driver_id()` mensyaratkan role `driver`, sehingga tautan baris lama tidak memberi akses ekosistem lain. Policy baca baris pengemudi sendiri memakai helper yang sama.
- **Kamera dan lokasi** — sesi kamera memakai channel privat dan pencabutan berbasis database; lokasi hanya dapat ditulis pengemudi yang ditugaskan dan dibaca wali yang terhubung.

Migrasi keempat (aditif, admin-only) menambahkan:

- `private.resolve_account_uid(text)` — mencari `auth.users` berdasarkan email terverifikasi.
- `public.link_operator_account(uuid, text)`, `public.unlink_operator_account(uuid)` — **dihapus** pada migrasi Project Area.
- `public.link_driver_account(uuid, text)`, `public.unlink_driver_account(uuid)`.
- `public.linked_account_emails(uuid[])` — daftar email akun yang tertaut untuk ditampilkan ke admin.

Semua fungsi tersebut `security definer` dengan `search_path = ''`, memeriksa `private.is_admin()`, memakai pesan Bahasa Indonesia, dan hanya diberikan kepada role `authenticated`. Penautan akun juga menyetel `profiles.role` yang sesuai; pelepasan tautan mengembalikan role menjadi `parent` hanya jika akun tidak lagi tertaut ke baris mana pun.

Migrasi ketiga (aditif) menambahkan:

- Nilai role `operator` pada check constraint `profiles.role`, kolom `operators.profile_id`, dan `schools.operator_id`.
- Tabel `student_route_stops` (roster siswa per titik jemput, unik parsial per arah) plus trigger validasi bahwa stop milik rute tersebut.
- Kolom `trips.arrived_at` untuk konfirmasi tiba di sekolah.
- Fungsi `private.current_operator_id()`, `private.current_driver_id()`, dan helper scope `security definer` (`operator_school_ids`, `operator_student_ids`, `operator_route_ids`, `operator_bus_ids`, `operator_driver_ids`, `operator_guardian_ids`, `driver_route_ids`, `driver_student_ids`, `guardian_bus_ids`). Policy tidak lagi melakukan join antar tabel yang punya policy sendiri, karena Postgres menolak policy yang saling merujuk dengan galat `infinite recursion detected in policy`.
- Indeks unik parsial `trips_one_active_idx` — satu penugasan hanya boleh punya satu perjalanan `scheduled`/`in_progress`; permintaan ganda dari luar UI tetap ditolak database.
- Policy RLS awal: operator scoped ke organisasinya, pengemudi (hanya penugasan/perjalanan miliknya + roster rute aktif + siswa pada penugasan itu), wali (hanya siswa aktif miliknya + rute/stop/perjalanan/riwayat terkait), serta policy baca sekolah untuk wali. Skop operator per-organisasi digantikan oleh otoritas global pada migrasi `20261109000000`.
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

### Bootstrap akun Operator Utama pertama

Tidak ada akun Operator yang dibuat oleh signup publik. Provisioning pertama dilakukan di luar aplikasi dengan prosedur terkontrol di [`docs/OPERATOR_BOOTSTRAP.md`](docs/OPERATOR_BOOTSTRAP.md): buat pengguna Auth terverifikasi di Supabase Dashboard, lalu jalankan blok SQL yang mempromosikan tepat satu profil menjadi `operator`. Blok tersebut menolak akun yang masih tertaut sebagai Pengemudi/Wali dan menolak jika sudah ada identitas global lain. Jangan menambahkan baris `profiles` dengan role `admin`/`operator` secara manual di luar prosedur itu: unique index global akan menolaknya atau menghasilkan identitas ganda yang ambigu.

### Penautan akun pengemudi

Penautan akun pengemudi dilakukan Operator dari UI `/admin/pengemudi` (kolom **Akun masuk** + tombol **Tautkan** / **Lepas tautan**), bukan lewat SQL manual. Server Action memanggil RPC `link_driver_account` / `unlink_driver_account`, sehingga pemeriksaan terjadi di database: pemanggil harus Operator global, email harus milik akun `auth.users` terverifikasi, dan akun Operator/Wali (termasuk tautan wali nonaktif) tidak dapat diubah menjadi Pengemudi.

Penautan akun **Project Area** tidak ada karena area bukan identitas login. Kolom lama `project_areas.legacy_profile_id` dipertahankan hanya sebagai referensi historis dan tidak memberi akses.

Akun dengan role pengemudi yang belum tertaut (atau barisnya tidak aktif) diarahkan ke `/tanpa-akses` dengan alasan yang jelas.

### Ringkasan RLS

- **Operator Utama / admin legacy:** `private.is_admin()` menerima role `operator` dan `admin`, sehingga policy Admin memberi `select`, `insert`, dan `update` platform-wide pada tabel master (Project Area, sekolah, bus, pengemudi, wali, siswa, rute, titik jemput, roster, penugasan) serta `select` pada perjalanan, peristiwa perjalanan, dan audit. Tidak ada grant `DELETE`.
- **Batas perjalanan:** perjalanan dibuat dan diakhiri oleh pengemudi yang ditugaskan, bukan dari workspace Operator. Operator memantau status/waktu dan mengekspor laporan. GPS mengikuti status perjalanan (bukan status penumpang/kamera), dan penulisan lokasi setelah perjalanan berakhir ditolak database.
- **Isolasi area:** data operasional terikat pada Project Area; trigger database menolak penugasan, roster, atau rute yang mencampur area. Konteks area di UI hanya menyaring tampilan dan tidak memberi akses baru.
- **Pengemudi:** hanya penugasan/perjalanan miliknya (via `trip_assignments.driver_id`), roster titik jemput pada rute penugasan aktif, siswa pada penugasan itu, dan baris pengemudi sendiri. `trips` hanya dapat diubah untuk penugasannya; event siswa hanya dapat ditulis atas namanya sendiri pada trip miliknya.
- **Wali:** hanya baris `students` miliknya **dan** berstatus `active`; hanya barisnya sendiri pada `guardians`; rute/stop/bus/perjalanan hanya sejauh terhubung ke siswa aktifnya; riwayat status hanya untuk siswa aktif miliknya. Lokasi dan kamera hanya untuk anak/perjalanan yang terhubung.
- **Tautan baris bukan otoritas:** `current_driver_id()` mensyaratkan role `driver`; `legacy_profile_id` pada Project Area tidak dipakai untuk otorisasi. Penautan perusahaan dan helper `current_operator_id()` sudah dihapus pada migrasi Project Area.
- **Gate tidak menambah hak:** pilihan kartu di gate atau mengubah URL tidak memengaruhi policy; setiap layout dan Server Action memeriksa sesi + role di server, dan RLS menegakkan batas yang sama di database.
- Semua tabel modul mengaktifkan RLS dan menolak secara default bila tidak ada policy yang cocok.
- Penulisan audit dan riwayat status dilakukan oleh trigger/fungsi `security definer`, sehingga tidak dapat dilewati dari UI.

## Pengujian dan verifikasi

```bash
npm run typecheck        # tsc --noEmit
npm test                 # unit test (tes/*.test.ts)
npm run test:operator:sql  # bootstrap/otoritas Operator pada PGlite
npm run test:camera:sql    # semua migrasi + fixture RLS + kamera
npm run test:location:sql  # semua migrasi + fixture RLS + lokasi GPS
npm run build              # next build produksi
```

`test:operator:sql`, `test:camera:sql`, dan `test:location:sql` membuat database PGlite in-memory sendiri, menerapkan seluruh migrasi secara berurutan, lalu menjalankan fixture. Fixture **tidak boleh** diarahkan ke database hosted atau produksi. Alternatif dengan Postgres lokal kosong:

```bash
for f in supabase/migrations/*.sql; do psql -v ON_ERROR_STOP=1 -d schoolbus_dev -f "$f"; done
psql -v ON_ERROR_STOP=1 -d schoolbus_dev -f supabase/tests/migration_checks.sql
```

`supabase/tests/migration_checks.sql` membuat data uji sintetis sendiri (profil Operator/Pengemudi/Wali, Project Area, sekolah, bus, siswa, rute, penugasan, perjalanan) lalu memeriksa: cakupan dan penulisan global Operator, penolakan tulis master data oleh Pengemudi/Wali, batas penugasan Pengemudi, isolasi Wali per anak aktif, isolasi audit/profil, penolakan `anon`, penolakan penautan akun non-Operator, dan penolakan tautan baris lama yang memberi akses lintas ekosistem. Berkas ini menolak berjalan pada database berisi data nyata; kegagalan menghentikan skrip dengan pesan spesifik.

Hasil validasi terakhir (10 November 2026, head branch PR #30):

- `npm test`: **209 tes lulus**, 0 gagal (51 suite), termasuk isolasi Project Area, status penumpang, indikator tombol selesai, alur sesi/checklist, review perjalanan selesai, pemilihan tugas setelah perjalanan selesai, siklus GPS, kontrak tombol responsif, lebar tombol perjalanan, dan konsistensi layout Pengelola.
- `npm run typecheck`: lulus tanpa galat.
- `npm run test:operator:sql`, `test:camera:sql`, `test:location:sql`: **ketiga suite lulus** pada PGlite, termasuk seluruh migrasi dan fixture RLS.
- `npm run build`: **production build lulus** (Next.js 15).
- Workflow `.github/workflows/verify-pr.yml` valid menurut `actionlint`, tetapi GitHub Actions belum pernah menjalankan job pada repo ini: semua run berakhir `startup_failure` dengan workflow sintetis `BuildFailed` (state `deleted`). Ini hambatan platform GitHub, bukan kegagalan YAML; hasil CI remote **belum tersedia**.

Unit test mencakup validasi, keamanan redirect, batas role/`scopedNext`, tanggal layanan Riyadh, sanitasi CSV, alur kamera/lokasi, dan klien simulasi. Tes tersebut tidak menggantikan pengujian browser atau database hosted.

**Belum diuji:** integrasi langsung ke proyek Supabase hosted (tidak ada kredensial pada lingkungan ini), alur email verifikasi nyata, interaksi visual/klik di browser, playback kamera pada dua perangkat nyata, serta job GitHub Actions pada runner. Server Action Mulai → status siswa → tiba → checklist → **Akhiri** sudah diuji lewat POST form asli, termasuk penolakan checklist yang belum lengkap. RLS teruji pada PGlite/Postgres lokal dengan stub `auth`, **belum terverifikasi pada platform Supabase**.

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


## Tahap pengembangan UI (DEC-023/DEC-027, legacy)

**Instruksi tahap pengembangan UI:** seluruh area (Operator, Pengemudi, Orang Tua/Wali) dapat ditinjau tanpa login pada lingkungan non-produksi. Autentikasi final tetap diimplementasikan dan diuji terpisah; mode terbuka tidak mengubah otorisasi database.

**Catatan target:** DEC-033 menetapkan tiga ekosistem — Operator, Pengemudi, dan Orang Tua/Wali. Mekanisme area terbuka merupakan alat pengembangan sementara untuk peninjauan UI, bukan role atau area target tersendiri. Jangan menjadikannya alasan mempertahankan Admin Pusat sebagai role/area target. Setelah refactor DEC-033, area yang ditinjau adalah ruang kerja Operator, Pengemudi, dan Orang Tua/Wali.

Ketentuan ini mengubah urutan implementasi, bukan standar keamanan produksi:
- Akses terbuka hanya untuk local/development/preview non-production dan harus fail-closed bila environment tidak dikenali.
- Tidak boleh aktif di production atau menggunakan database/data produksi.
- Jangan menonaktifkan RLS atau mengubah kebijakan database produksi untuk mempermudah UI.
- Data contoh hanya untuk development dan harus diberi label simulasi.
- Seluruh pemeriksaan server/database dan autentikasi final tetap wajib dipulihkan sebelum rilis production.

Catatan status: pada lingkungan non-produksi yang dikenali, mode terbuka memakai klien simulasi dan tidak pernah membuat klien Supabase. Pada produksi atau lingkungan tak dikenal, seluruh gerbang autentikasi dan RLS berlaku penuh. Bagian README lain yang menyebut autentikasi wajib di semua area menggambarkan rancangan integrasi akhir, bukan perilaku yang harus dipaksakan selama tahap UI terbuka ini. Mekanisme area terbuka dan route legacy harus dihapus atau digabungkan setelah refactor DEC-033 selesai.

### Uji kamera HP gratis (terisolasi)

Demo satu sumber/satu penonton tersedia secara opt-in pada development/preview: set `CAMERA_DEVICE_DEMO=1`, buka `/demo-kamera`. Signaling ditukar manual secara privat, video WebRTC langsung memakai STUN gratis, tanpa TURN/SFU/provider key. Ini **bukan integrasi kamera wali** dan tidak boleh dipakai dengan anak nyata. Produksi tetap 404. Petunjuk, batas jaringan dan checklist perangkat: [CAMERA_PHONE_DEMO](docs/CAMERA_PHONE_DEMO.md).

Kontrol **Mulai/Hentikan siaran uji** tersedia pada halaman operasional `/pengemudi` untuk tugas terpilih yang sedang berlangsung bila `CAMERA_DEVICE_DEMO=1` di development/preview. Konfirmasi objek uji wajib; penonton masih menukar kode privat di `/demo-kamera`, bukan akses otomatis wali. Produksi tetap tidak menampilkan kontrol. Lihat `docs/CAMERA_PHONE_DEMO.md`.
