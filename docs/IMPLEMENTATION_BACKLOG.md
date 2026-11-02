# Arsip Backlog Implementasi Produk

**Tanggal pembaruan:** 2026-10-30  
**Status umum:** Arsip kebutuhan dan keputusan; bukan bukti bahwa fitur sudah tersedia.  
**Tujuan:** Menjadi sumber kesinambungan ketika pekerjaan dilanjutkan di chat atau sesi agen baru.

## Cara menggunakan arsip ini

1. Baca `AGENTS.md`, `README.md`, `docs/MASTER_SPEC.md`, `docs/TECHNICAL_SPEC_REVIEW.md`, dan `docs/DECISIONS_LOG.md` sebelum melanjutkan.
2. Audit kode dan database aktual untuk setiap butir. Jangan menganggap dokumentasi berarti fitur telah dibuat.
3. Tandai tiap butir sebagai `BELUM DIAUDIT`, `BELUM DIKERJAKAN`, `SEDANG DIKERJAKAN`, `TERIMPLEMENTASI BELUM DIVERIFIKASI`, `SELESAI DAN LULUS TES`, atau `TERBLOKIR`, dengan bukti.
4. Jangan mengubah database produksi, menambahkan RLS/policy, menjalankan migrasi, merge, atau deploy tanpa izin eksplisit. Gerbang tinjauan teknis DEC-010 tetap berlaku.
5. Saat keputusan baru disetujui, perbarui MASTER_SPEC dan DECISIONS_LOG serta backlog ini.

## A. Keputusan produk yang harus dipertahankan

- [x] Tiga peran utama: Admin Pusat, Pengemudi, Orang Tua/Wali.
- [x] Produk adalah penyedia aplikasi, bukan operator transportasi sekolah.
- [x] Pilot Dammam dan sekitarnya; target perencanaan awal sekitar 100 bus.
- [x] Fokus utama: navigasi operasional bus dan informasi/laporan wali. Kamera live adalah fitur tambahan.
- [x] Satu siswa hanya terhubung ke satu wali/akun wali.
- [x] Satu akun wali dapat terhubung ke beberapa siswa; tidak ada kategori akun keluarga terpisah.
- [x] Email wali harus dipra-daftarkan admin dan disimpan di database. Signup hanya menggunakan email terdaftar; verifikasi tautan dilakukan sebelum membuat kata sandi. Login dengan email dan kata sandi.
- [x] Admissions Number adalah identitas siswa, bukan username/login. Nomor HP hanya kontak.
- [x] Minimal satu siswa terkait harus berstatus aktif mengikuti layanan agar signup/akses akun diizinkan.
- [x] Jika sebagian siswa nonaktif tetapi setidaknya satu masih aktif, akun dapat digunakan hanya untuk siswa aktif. Jika seluruh siswa nonaktif, akses layanan ditolak.
- [x] Status layanan siswa berbeda dari kehadiran pada perjalanan dan status GPS. Perubahan status tidak menghapus riwayat.
- [x] Semua penolakan/kegagalan/kontrol nonaktif yang menghalangi tindakan harus menjelaskan alasan dengan jelas dan ringkas, serta langkah berikutnya bila tersedia. Jangan membocorkan data sensitif atau mengarang penyebab.
- [x] UI wali memakai frame/kartu anak yang ringkas dan adaptif. Informasi video, GPS, dan status dapat tampil bersama; hindari kartu terlalu besar dan panel kosong besar ketika data tidak tersedia.

## B. Backlog wajib sebelum/selama implementasi

### B1. Audit kesenjangan implementasi
- [ ] Audit seluruh halaman, komponen, route handler/API, server actions, autentikasi, database, storage, dan integrasi.
- [ ] Untuk setiap keputusan di bagian A, catat file/komponen/endpoint/database yang merealisasikan aturan atau nyatakan belum ada.
- [ ] Bedakan fitur yang hanya berupa UI preview/mock dari fitur yang benar-benar tersambung ke database.
- [ ] Catat hasil tes aktual; jangan mengklaim lolos tanpa bukti.

### B2. Pesan penolakan dan kegagalan — prioritas lintas sistem
- [ ] Buat inventaris seluruh kondisi ditolak/gagal: validasi form, email, signup/login, verifikasi, sesi kedaluwarsa, hak akses, status siswa, CRUD, duplikasi data, konflik perubahan, jaringan/server, GPS, kamera/video, perjalanan/rute, dan ekspor.
- [ ] Buat katalog pesan berbahasa sederhana: penyebab yang diketahui, tindakan pengguna berikutnya, dan kapan harus menghubungi admin.
- [ ] Pastikan tombol nonaktif yang menghalangi tindakan menjelaskan alasannya melalui teks atau bantuan kontekstual yang mudah ditemukan.
- [ ] Pastikan respons API memiliki kode/status terstruktur dan pesan aman yang konsisten; UI menerjemahkannya menjadi bahasa pengguna.
- [ ] Jika penyebab tidak diketahui, jangan menebak. Sampaikan bahwa proses belum berhasil, berikan langkah aman (misalnya coba lagi/periksa koneksi), dan sediakan kode referensi bila sesuai.
- [ ] Jangan membocorkan keberadaan email/akun orang lain, data anak, koordinat rumah, kredensial, token, stack trace, atau detail internal.
- [ ] Catat detail diagnostik di log internal dengan akses terbatas dan minimisasi data pribadi.
- [ ] Uji setiap jalur gagal/ditolak, bukan hanya jalur sukses.

Contoh kondisi yang perlu dipetakan: email belum didaftarkan; email belum diverifikasi; tidak ada siswa aktif; siswa tertentu tidak aktif; data wajib kosong; format salah; Admissions Number/email duplikat; tidak berwenang; sesi berakhir; GPS tidak tersedia/usang/tidak akurat/di luar radius; kamera offline/tidak terkonfigurasi; koneksi gagal; server gagal; data konflik. Contoh ini bukan pesan final untuk semua kondisi: wording harus mengikuti konteks dan keamanan.

### B3. Akun wali, pra-pendaftaran, dan status layanan
- [ ] Audit struktur saat ini: tabel profil/wali, siswa, Admissions Number, email, relasi, status layanan, serta constraint unik/FK.
- [ ] Rancang model relasi satu siswa–satu wali dan satu wali–banyak siswa tanpa membuat tipe akun keluarga.
- [ ] Tentukan sumber kebenaran email wali dan proses admin untuk menambah/mengubah email secara aman.
- [ ] Rancang signup berbasis email yang telah dipra-daftarkan; token verifikasi terbatas waktu dan sekali pakai; pembuatan kata sandi setelah verifikasi.
- [ ] Login menggunakan email + kata sandi; Admissions Number tidak dipakai sebagai kredensial.
- [ ] Terapkan syarat minimal satu siswa aktif untuk signup/akses akun dan isolasi akses siswa nonaktif.
- [ ] Definisikan status layanan (aktif, sementara tidak ikut/tidak aktif sementara, dikeluarkan/dihentikan, atau istilah final yang disetujui), alasan, tanggal efektif, aktor, dan riwayat perubahan.
- [ ] Pastikan status layanan tidak tercampur dengan status kehadiran perjalanan atau status GPS.
- [ ] Uji kasus satu siswa aktif; semua nonaktif; campuran aktif/nonaktif; email belum terdaftar; email salah; token kedaluwarsa/terpakai; perubahan email; pencabutan relasi.
- [ ] Jangan ungkap apakah email terdaftar kepada pihak yang tidak berwenang; pesan harus tetap jelas tetapi aman.

### B4. Administrasi data dan CRUD nyata
- [ ] Audit menu admin yang sudah ada dan tandai menu aktif, preview, tidak berfungsi, atau belum dibuat.
- [ ] Rancang CRUD admin untuk sekolah, bus, pengemudi, siswa, wali, rute, stop, penugasan, dan titik lokasi.
- [ ] Admin dapat mengelola data siswa, Admissions Number unik, sekolah, nama, tanggal lahir, email wali, nomor kontak, status layanan, dan titik rumah/penjemputan pada peta.
- [ ] Koordinat rumah adalah data privat dan tidak boleh tampil ke pengguna yang tidak berwenang.
- [ ] Tentukan arsip/nonaktif vs hapus permanen; pertahankan riwayat operasional dan audit.
- [ ] Pastikan semua perubahan tersimpan di database dan ada validasi, pencarian, pagination, empty state, error state, serta konfirmasi untuk tindakan penting.

### B5. UI wali ringkas dan adaptif
- [ ] Audit UI aktual untuk akun dengan satu dan beberapa siswa.
- [ ] Gunakan model akun yang sama; jangan munculkan label atau mode khusus “akun keluarga”.
- [ ] Kartu/frame tiap anak harus kompak agar beberapa anak dapat ditampilkan bersamaan dengan video, GPS, dan status.
- [ ] Pada layar ponsel, susun informasi tanpa kartu anak oversized; pada layar lebar, manfaatkan tata letak berdampingan.
- [ ] Saat video/GPS belum tersedia atau offline, tampilkan status ringkas dan jangan sisakan panel kosong besar.
- [ ] Uji ukuran layar ponsel dan desktop, satu siswa, beberapa siswa, serta data video/GPS tersedia dan tidak tersedia.

### B6. Navigasi, perjalanan, GPS, dan laporan wali
- [ ] Validasi model perjalanan pagi/sore, penugasan, rute yang disetujui, urutan stop stabil, dan versi rute.
- [ ] Verifikasi provider routing bus besar untuk Dammam; jangan menyatakan dukungan tanpa bukti vendor dan pengujian.
- [ ] Setelah alur GPS benar-benar diimplementasikan dan perangkat uji tersedia, validasi sumber GPS ponsel Android pengemudi yang sedang ditugaskan: akurasi, kesegaran, offline, konsumsi baterai/data, dan background.
- [ ] Tetapkan interval, ambang kesegaran, batas akurasi, perangkat minimum, serta radius penjemputan melalui keputusan/konfigurasi saat dibutuhkan; jangan memperlakukan angka contoh sebagai ketetapan atau menguji parameter sebelum tersedia.
- [ ] Status jemput/turun dan riwayat keikutsertaan harus konsisten dan dapat diaudit.
- [ ] Wali hanya melihat status/laporan anak yang berhak diakses.
- [ ] Tampilkan timestamp pembaruan lokasi dan status usang/offline dengan jelas.
- [ ] Uji perjalanan batal, pergantian bus/pengemudi, rute tidak aman, dan pengecualian berwenang.

### B7. Kamera live — prioritas setelah alur inti
- [ ] Inventaris perangkat/DVR dan aplikasi/platform AV yang sudah terpasang.
- [ ] Verifikasi dokumentasi integrasi resmi, autentikasi server-side, pencabutan sesi, konkurensi, biaya, bandwidth, dan lokasi pemrosesan.
- [ ] Pastikan akses wali hanya saat anak terkait dikonfirmasi berada di bus dan akses dicabut saat turun/izin berakhir.
- [ ] Tampilkan status kamera belum dikonfigurasi/offline/gagal dengan pesan ringkas; jangan tampilkan panel kosong.
- [ ] Jangan menjadikan kamera sebagai penghambat penyelesaian navigasi dan laporan inti.

### B8. Keamanan, audit, dan kesiapan rilis
- [ ] Finalisasi matriks akses Admin/Pengemudi/Wali dan isolasi antarorganisasi.
- [ ] Rancang RLS dan hak akses database setelah tinjauan teknis; jangan memakai UI hiding sebagai keamanan.
- [ ] Periksa grants, policies, Storage, fungsi privileged, session revocation, rate limits, dan proteksi password.
- [ ] Audit tindakan admin, perubahan status, relasi wali, ekspor, dan koreksi historis.
- [ ] Tinjau PDPL dan kewajiban Saudi terkait data anak, lokasi, kamera, retensi, hosting, dan transfer lintas negara.
- [ ] Susun QA end-to-end dan uji lapangan sebelum rilis bertahap.

## C. Kondisi audit database yang sudah diketahui (read-only, 2026-10-29)

- 11 tabel inti ditemukan: `profiles`, `buses`, `drivers`, `students`, `guardian_students`, `routes`, `route_stops`, `trip_assignments`, `trips`, `trip_student_events`, `bus_locations`.
- RLS aktif pada 11 tabel dan belum ada policy pada tabel-tabel tersebut saat audit.
- Role `anon` dan `authenticated` memiliki SQL grants luas pada tabel-tabel itu. RLS tanpa policy saat audit berarti akses baris melalui RLS ditolak; jangan menyimpulkan data terbuka hanya dari grants tersebut.
- Audit tidak membuktikan bahwa tabel kosong; estimasi statistik jumlah baris tidak tersedia.
- Tabel `organizations`, `schools`, `audit_logs`, dan `route_versions` belum ditemukan pada pemeriksaan saat itu.
- Password leaked protection dilaporkan nonaktif; lima foreign key belum memiliki supporting index (detail harus diaudit ulang).
- **Tidak ada perubahan database, policy, migration, atau seed data yang dilakukan dalam audit tersebut.** Periksa ulang kondisi aktual sebelum tindakan berikutnya.

## D. Status dan catatan kesinambungan

Arsip ini mencatat kebutuhan yang disetujui dan item pekerjaan yang belum terbukti selesai. Checklist tidak boleh dicentang hanya karena desain atau dokumentasi sudah dibuat. Setiap perubahan status harus menyertakan bukti: file/commit, hasil tes, pemeriksaan database bila relevan, dan keterbatasan.

**Urutan kerja yang disarankan:** audit kode dan database → cocokkan dengan keputusan/backlog → finalisasi technical review dan model akses → persetujuan pemilik produk → implementasi bertahap → QA tiap jalur sukses dan gagal.  


## Urutan verifikasi backlog — 2026-10-30

Gunakan urutan berikut untuk setiap item; checklist tidak meminta pengujian prematur.

- **Dokumentasi/desain:** boleh ditinjau sekarang berdasarkan keputusan dan bukti yang sudah tersedia.
- **Konfigurasi:** parameter yang dapat diatur kemudian tetap berstatus terbuka sampai pemilik produk/operasi memilih nilainya. Tidak perlu memaksa keputusan sekarang jika belum dibutuhkan untuk desain inti.
- **Implementasi:** tes UI/API/database hanya dijadwalkan setelah bagian terkait benar-benar tersedia. Mockup, menu preview, atau spesifikasi bukan bukti implementasi.
- **Integrasi/perangkat/vendor:** uji hanya setelah akses, perangkat, kredensial, lisensi, dan data uji yang sah tersedia.
- **Lapangan/operasional:** lakukan ketika pilot dan pihak operasional siap; jangan mengganti bukti lapangan dengan asumsi atau simulasi yang tidak representatif.

Kamera live tetap tambahan dan dapat dikonfigurasi kemudian. Jangan menjadikan konfigurasi atau pengujian kamera sebagai prasyarat backlog navigasi dan laporan inti. Parameter GPS yang dapat dikonfigurasi juga tidak otomatis menjadi blocker tinjauan spesifikasi; yang harus ditinjau sekarang adalah prinsip sesi terikat penugasan, otorisasi, timestamp/kesegaran yang terlihat, dan perlindungan akses lokasi.

## Status implementasi modul data — 2026-10-31

**Dasar:** DEC-021. Ruang lingkup hanya modul data Admin Pusat dan akun wali; perjalanan, GPS, routing, kamera, dan vendor tetap di luar lingkup.

### Terimplementasi (kode + migrasi), terverifikasi sebatas statis/unit

- [x] CRUD sekolah: `app/admin/sekolah/*`, tabel `schools`, policy admin, nonaktifkan tanpa hapus.
- [x] CRUD operator: `app/admin/operator/*`, tabel `operators`.
- [x] CRUD siswa: `app/admin/siswa/*`, `students`, relasi satu sekolah dan satu wali, koordinat rumah privat.
- [x] CRUD wali (pra-pendaftaran email): `app/admin/wali/*`, tabel `guardians`.
- [x] CRUD bus: `app/admin/bus/*`, kolom operator/model/catatan pada `buses`.
- [x] CRUD pengemudi: `app/admin/pengemudi/*`, kolom nama/telepon/operator pada `drivers`.
- [x] Riwayat status layanan append-only: `student_service_status_history` + `set_student_service_status()`.
- [x] Audit otomatis: trigger `private.audit_row_change()` ke `audit_logs`.
- [x] Alur akun wali: `/daftar`, `/akun/kata-sandi`, `claim_guardian_account()`, login email + kata sandi.
- [x] Peran dari database: tidak ada pemilih peran yang memberi akses; `/admin` menolak peran selain `admin`.
- [x] Pencarian, filter, paginasi, empty state, loading state, notifikasi berhasil/gagal, konfirmasi tindakan.

**Bukti:** `npm run typecheck` lulus, `npm test` 21/21 lulus, `npm run build` lulus. Migrasi `supabase/migrations/20261031000000_admin_core_crud.sql` ditulis dan belum diterapkan ke database mana pun.

### `TERIMPLEMENTASI TETAPI BELUM TERVERIFIKASI`

- Eksekusi migrasi pada Postgres/Supabase nyata, termasuk backfill nama sekolah lama dan relasi wali lama.
- Perilaku RLS dengan akun admin, wali, dan pengguna tanpa profil yang sebenarnya (uji isolasi antarwali belum dijalankan).
- Alur email verifikasi Supabase end-to-end dan masa berlaku tautan.
- Kebijakan rate limiting formulir aktivasi (saat ini hanya mengandalkan batas bawaan Supabase Auth).
- Pemulihan kata sandi mandiri dan verifikasi ulang saat admin mengganti email wali.

### `BELUM DIKERJAKAN` (di luar lingkup DEC-021)

- CRUD rute, stop, penugasan, dan perjalanan.
- Tampilan audit di UI (data audit sudah tersimpan di database).
- Pembuatan akun login pengemudi dan modul pengemudi.
- GPS, routing, kamera, dan integrasi vendor.

### Catatan audit database

Audit read-only 2026-10-29 mencatat 11 tabel inti dengan RLS aktif dan tanpa policy. Migrasi ini mengasumsikan skema awal persis seperti `20261029000000_initial_school_bus_schema.sql`. Sebelum menerapkan, periksa kembali skema aktual: nama constraint unik `students_student_code_key`, keberadaan kolom `active`/`school_name` pada `students`, dan apakah tabel `schools`/`operators` sudah dibuat manual di proyek tersebut.

---

## Status implementasi Main Access Gate dan tiga area — 2026-10-31

**Dasar:** permintaan implementasi UI utama (gate, tiga area pengguna, pemisahan hak akses, identitas School Bus Yellow). CRUD Admin Pusat dari DEC-021 dipertahankan.

### Terimplementasi (kode + migrasi), terverifikasi sebatas statis/unit

- [x] Main Access Gate di `/`: tiga kartu akses dengan ikon, deskripsi, dan tombol masuk; kartu hanya pintu masuk ke `/login?peran=...`.
- [x] Gate per-peran: judul/isi kartu menyesuaikan `?peran=`; tanpa kartu terpilih, tiga kartu ditampilkan.
- [x] Arah pasca-login mengikuti `profiles.role` (admin → `/admin`, operator → `/operator`, driver → `/pengemudi`, parent → `/wali`) melalui `lib/auth.ts` dan `scopedNext`.
- [x] Area Admin & Operator: `/admin` (ringkasan, laporan/audit), `/admin/rute`, `/admin/rute/[id]`, `/admin/penugasan`, `/admin/perjalanan`, plus CRUD lama; form sekolah menempatkan operator.
- [x] Area Operator: `/operator` + bus, pengemudi, siswa, rute (baca), penugasan, perjalanan, laporan — dibatasi `operators.profile_id` aktif milik akun.
- [x] Area Pengemudi: `/pengemudi` (tugas hari ini), `/pengemudi/tugas/[id]` (manifest + mulai/akhiri/tiba + status siswa), `/pengemudi/riwayat` — hanya penugasan miliknya.
- [x] Area Wali: `/wali` (kartu anak adaptif), `/wali/anak/[id]`, `/wali/riwayat` — hanya siswa aktif miliknya.
- [x] Pemeriksaan peran di server pada setiap layout halaman dan setiap Server Action; middleware melindungi seluruh rute internal.
- [x] Migrasi `20261031000001_operator_driver_guardian_areas.sql`: role operator, tautan akun operator/pengemudi, `student_route_stops`, `trips.arrived_at`, policy RLS per peran, trigger audit.
- [x] Identitas School Bus Yellow: token terpusat di `app/globals.css` (`#FFC431`, `#FFD670`, `#FFE4A1`, `#FFEEC5`, `#FFF4DB`, teks `#252525`/`#666666`, latar `#FFFDF8`, garis `#E9E3D8`); tombol utama kuning dengan teks gelap; sidebar netral dengan aksen kuning; status tetap memakai warna semantik.
- [x] Empty state, loading state (streaming), pesan galat, dan konfirmasi tindakan pada seluruh tampilan baru.
- [x] Unit test `scopedNext`/`homeForRole` (isolasi tujuan pasca-login) dan label arah rute/status perjalanan/status siswa.

**Bukti:** `npm run typecheck` lulus, `npm test` 28/28 lulus, `npm run build` lulus (39 route). Preview: `/` menampilkan gate tiga kartu; rute internal tanpa Supabase menampilkan pemberitahuan konfigurasi tanpa data contoh.

## Iterasi 2026-11-01 — penuntasan alur inti

### `SELESAI DAN LULUS TES`

- [x] Migrasi `20261031000002_operator_driver_account_linking.sql`: `resolve_account_uid`, `link_operator_account`, `unlink_operator_account`, `link_driver_account`, `unlink_driver_account`, `linked_account_emails` (admin-only, `security definer`, `search_path = ''`).
- [x] UI penautan akun: `/admin/operator` dan `/admin/pengemudi` menampilkan email akun tertaut dan formulir tautkan/lepas tautan; pesan galat dari database diteruskan dalam Bahasa Indonesia.
- [x] Detail rute operator `GET /operator/rute/[id]` (ringkasan, urutan titik, roster per titik) — tetap hanya-baca sesuai DEC-022.
- [x] Alur pengemudi: `confirmArrival`/`endTrip` memeriksa jumlah baris terpengaruh; `endTrip` meminta konfirmasi bila masih ada siswa berstatus naik atau belum dicatat (pemeriksaan kabin versi lunak).
- [x] RLS operator di-scope penuh: rute/titik jemput/roster/penugasan hanya untuk sekolah milik organisasi; tulis lintas organisasi ditolak database.
- [x] Perbaikan bug migrasi: `private.current_guardian_id()` dipindah setelah kolom `students.guardian_id` ada; deklarasi `%type` pada `do` block diganti `text`.
- [x] Perbaikan bug RLS serius: policy saling merujuk menyebabkan `infinite recursion detected in policy` (schools ↔ students, schools ↔ guardians, trip_assignments ↔ buses, trip_assignments ↔ routes). Seluruh skop lintas tabel dipindah ke helper `security definer`.
- [x] Indeks unik parsial `trips_one_active_idx` (satu perjalanan aktif per penugasan) sebagai pertahanan database di luar UI.
- [x] Suite uji `supabase/tests/migration_checks.sql` (T1–T14): cakupan dan penolakan lintas organisasi, cakupan pengemudi, isolasi wali, wewenang admin, penolakan `anon`, penautan akun, dan penyembunyian email akun.

**Bukti:** keempat migrasi dijalankan berurutan pada Postgres 14 lokal (database kosong + stub `auth`), lalu `supabase/tests/migration_checks.sql` berakhir dengan “SEMUA PEMERIKSAAN MIGRASI DAN RLS LULUS”. `npm run typecheck` lulus, `npm test` 28/28 lulus, `npm run build` lulus.

### `TERIMPLEMENTASI TETAPI BELUM TERVERIFIKASI`

- Penerapan migrasi pada proyek Supabase pengembangan (tidak ada kredensial di lingkungan ini; migrasi hanya diuji pada Postgres lokal dengan stub `auth`).
- Alur login tiga peran dan penautan akun operator/pengemudi end-to-end lewat browser.
- Pengujian Server Action otomatis (validasi, pesan galat, dan efek samping).

### `BELUM DIKERJAKAN`

- GPS nyata, kamera live, dan routing (tanpa data palsu; UI hanya menyatakan belum tersedia).
- Uji responsivitas visual pada perangkat nyata dan audit kontras warna.
