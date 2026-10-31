# School Bus Management

Aplikasi manajemen transportasi bus sekolah untuk sekolah, operator bus, pengemudi, dan orang tua/wali. Pilot perencanaan: Dammam dan sekitarnya.

## Status saat ini

**Modul data Admin Pusat dan alur akun wali sudah diimplementasikan dan tersambung ke Supabase.** Data sekolah, operator, siswa, wali, bus, dan pengemudi disimpan di database dengan validasi, pencarian, filter, paginasi, serta kebijakan akses per peran (RLS).

Yang **belum** aktif dan sengaja tidak ditampilkan sebagai fitur berjalan:

- Penugasan, perjalanan pagi/sore, rute, dan urutan stop.
- GPS langsung dari ponsel pengemudi.
- Integrasi HERE atau penyedia routing lain.
- Kamera live / streaming.
- Integrasi perangkat GPS bus dan vendor eksternal.

Modul tersebut tetap memerlukan keputusan dan validasi teknis terpisah (lihat `docs/TECHNICAL_SPEC_REVIEW.md`).

> Migrasi database pada perubahan ini **belum dijalankan** ke database mana pun. Terapkan dan tinjau di proyek pengembangan terlebih dahulu; jangan menjalankan migrasi ke produksi tanpa persetujuan.

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

Konfigurasi tambahan pada Supabase Dashboard → Authentication → URL Configuration:

- Site URL: alamat aplikasi (mis. `http://localhost:3000`).
- Redirect URL yang diizinkan: `http://localhost:3000/auth/callback` dan URL produksi yang setara.
- Aktifkan konfirmasi email agar tautan verifikasi wali berfungsi.

## Rute aplikasi

| Rute | Akses | Isi |
| --- | --- | --- |
| `/` | publik | Halaman informasi + status modul yang jujur |
| `/login` | publik | Masuk dengan email dan kata sandi |
| `/daftar` | publik | Meminta tautan verifikasi email wali |
| `/auth/callback` | publik | Penukaran kode verifikasi Supabase |
| `/akun/kata-sandi` | sesi terverifikasi | Membuat kata sandi + klaim akun wali |
| `/admin` | profil `admin` | Ringkasan data nyata dan pintasan modul |
| `/admin/sekolah` | profil `admin` | CRUD sekolah (nonaktifkan, bukan hapus) |
| `/admin/operator` | profil `admin` | CRUD operator |
| `/admin/siswa` | profil `admin` | CRUD siswa + pencarian/filter |
| `/admin/siswa/[id]` | profil `admin` | Detail siswa, ubah status layanan, riwayat status |
| `/admin/wali` | profil `admin` | Pra-pendaftaran email wali, aktif/nonaktif |
| `/admin/bus` | profil `admin` | CRUD bus |
| `/admin/pengemudi` | profil `admin` | CRUD pengemudi |
| `/wali` | profil `parent` | Hanya siswa milik wali yang masih aktif |

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

### Ringkasan RLS

- Admin: `select`, `insert`, `update` pada tabel master, hanya jika `profiles.role = 'admin'` (fungsi `private.is_admin()`).
- Wali: hanya baris `students` miliknya **dan** berstatus `active`; hanya barisnya sendiri pada `guardians`; riwayat status hanya untuk siswa aktif miliknya.
- Pengemudi: belum memiliki policy baca data siswa karena modul penugasan belum ada.
- Semua tabel modul mengaktifkan RLS dan menolak secara default bila tidak ada policy yang cocok.
- Penulisan audit dan riwayat status dilakukan oleh trigger/fungsi `security definer`, sehingga tidak dapat dilewati dari UI.

## Pengujian dan verifikasi

```bash
npm run typecheck   # tsc --noEmit
npm test            # unit test fungsi validasi & keamanan redirect
npm run build       # next build
```

Perubahan ini lulus `typecheck`, 21 unit test, dan `next build`. Unit test mencakup normalisasi email/kode, validasi Admissions Number, format telepon, parsing koordinat, sanitasi kata kunci pencarian, status layanan, dan penolakan redirect ke URL eksternal.

**Belum diuji:** integrasi langsung ke database Supabase (tidak ada kredensial pada lingkungan ini), eksekusi migrasi pada Postgres, alur email verifikasi nyata, serta pengujian RLS dengan beberapa akun. Semua butir tersebut perlu dijalankan di proyek pengembangan sebelum dinyatakan selesai.

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
