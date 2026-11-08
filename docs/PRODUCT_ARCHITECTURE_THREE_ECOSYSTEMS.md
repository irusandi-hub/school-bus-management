# Aturan Arsitektur Produk — Tiga Ekosistem

**Status: DISETUJUI PEMILIK PRODUK — WAJIB DITERAPKAN**  
**Berlaku mulai:** 2026-11-08  
**Repository:** `school-bus-management`

Dokumen ini adalah aturan produk dan arsitektur yang mengikat seluruh desain, implementasi, pengujian, dokumentasi, serta pekerjaan agen berikutnya. Jika dokumen lama, kode, atau PR bertentangan dengan aturan ini, tandai sebagai ketidaksesuaian dan arahkan implementasi menuju aturan ini. Jangan menganggap implementasi lama sebagai keputusan yang lebih tinggi.

## 1. Hanya tiga ekosistem pengguna

Produk hanya memiliki tiga ekosistem pengguna yang terlihat dan digunakan dalam aplikasi:

1. **Operator** — pusat pengelolaan seluruh layanan dan administrasi organisasi.
2. **Pengemudi** — menjalankan tugas perjalanan yang secara sah diberikan oleh Operator.
3. **Orang Tua** — melihat informasi, memantau perjalanan anak, riwayat, dan menyampaikan laporan.

Tidak ada ekosistem pengguna Admin Pusat yang terpisah. Tidak ada ekosistem pengguna Sekolah yang terpisah dalam model produk yang disetujui saat ini.

## 2. Operator adalah satu ruang kerja terpadu

Seluruh fungsi administrasi dan operasional dikerjakan dari satu dashboard/ruang kerja Operator. Fungsi yang sebelumnya ditempatkan di area Admin Pusat bukan produk, role, atau dashboard kedua. Fungsi tersebut menjadi modul dalam ruang kerja Operator, antara lain:

- administrasi organisasi dan pengaturan akun/staf;
- data sekolah dan relasi layanan sekolah;
- data siswa dan orang tua/wali;
- armada/bus dan pengemudi;
- rute dan titik pemberhentian;
- penugasan bus, pengemudi, rute, dan tanggal;
- perjalanan dan pemantauan operasional;
- laporan, riwayat, dan audit aktivitas.

Semua modul itu merupakan satu ekosistem dan satu navigasi Operator. Kelompok menu boleh dipakai untuk merapikan pekerjaan, tetapi tidak boleh membentuk role, dashboard, atau login terpisah.

Tidak perlu membuat hierarki jabatan internal baru untuk mengakomodasi fungsi administrasi. Fungsi administrasi adalah kemampuan kerja Operator. Jika di masa depan diperlukan beberapa akun staf dalam satu organisasi, semuanya tetap berada dalam ekosistem Operator; pembatasan izin per tindakan hanya boleh ditambahkan berdasarkan kebutuhan yang disetujui, bukan dengan menciptakan ekosistem Admin baru.

## 3. Batas kewenangan tiga ekosistem

### Operator
- Mengelola data dan konfigurasi layanan dalam organisasi yang terhubung dengannya.
- Membuat dan mengubah data induk yang diperlukan untuk layanan.
- Menetapkan bus, pengemudi, rute, titik jemput, dan penugasan.
- Memberi, mengubah, dan mencabut kewenangan tugas pengemudi.
- Memantau perjalanan dan membaca laporan operasional organisasi.
- Mengelola relasi siswa–wali sesuai kewenangan dan dasar akses yang berlaku.

### Pengemudi
- Hanya memperoleh akses setelah akun terhubung ke data pengemudi aktif dan diberi penugasan yang berlaku.
- Hanya melihat tugas, rute, siswa, dan perjalanan yang menjadi kewenangannya.
- Menjalankan perjalanan, memperbarui status siswa, dan mengirim lokasi selama penugasan/perjalanan aktif sesuai aturan.
- Tidak mengelola data induk, armada, pengemudi lain, rute, atau penugasan.
- Akses tugas berakhir atau berubah ketika penugasan dicabut, diganti, atau tidak lagi aktif.

### Orang Tua
- Hanya melihat anak yang secara sah terhubung ke akun dan masih memenuhi syarat layanan.
- Melihat status, lokasi bus yang tersedia, informasi perjalanan, kamera bila integrasi sah tersedia, dan riwayat yang berhak diakses.
- Menyampaikan laporan atau informasi terkait anak/perjalanan.
- Tidak mengelola armada, rute, pengemudi, penugasan, atau data induk organisasi.

## 4. Role dan otorisasi

Role produk yang diharapkan adalah:
- `operator`
- `driver`
- `parent`

Role `admin` sebagai role pengguna aplikasi dan pintu masuk dashboard tersendiri harus dihapus dari rancangan akhir. Sekolah adalah data/entitas yang dikelola dalam ruang kerja Operator, bukan role login tersendiri.

Otorisasi harus tetap ditegakkan pada server dan database/RLS, bukan hanya dengan menyembunyikan menu. Operator dibatasi pada organisasi yang terhubung dengannya. Pengemudi dibatasi pada identitas pengemudi aktif dan penugasan yang sah. Orang Tua dibatasi pada siswa yang terhubung dan memenuhi syarat.

Akses teknis pemilik platform/support, bila suatu saat benar-benar diperlukan, bukan ekosistem pengguna harian dan tidak boleh disamakan dengan dashboard Admin Pusat yang dipakai dalam alur produk. Kebutuhan tersebut memerlukan desain keamanan, audit, dan persetujuan tersendiri.

## 5. Aturan UX, navigasi, dan autentikasi

- Landing page, halaman masuk, onboarding, dan dokumentasi pengguna hanya menampilkan tiga ekosistem: Operator, Pengemudi, Orang Tua.
- Setelah autentikasi, aplikasi menentukan area dari role dan relasi database; pengguna tidak dapat memilih atau menaikkan role sendiri.
- Pengguna Operator masuk langsung ke satu ruang kerja Operator. Tidak boleh ada halaman perantara yang meminta memilih Admin atau Operator.
- Semua fungsi administrasi yang saat ini berada di `/admin/*` harus dipindahkan/diintegrasikan ke dalam navigasi dan route ruang kerja Operator. Selama masa transisi, redirect kompatibilitas boleh dipertahankan, tetapi route lama tidak boleh menjadi dashboard atau gate role yang berdiri sendiri.
- Tidak boleh ada dua dashboard dengan fungsi duplikat, dua menu master data, atau alur login berbeda untuk administrasi dan operasional Operator.
- Bahasa antarmuka untuk pengguna umum harus memakai istilah “Operator/Pengelola” secara konsisten. Istilah “Admin Pusat” tidak ditampilkan sebagai ekosistem pengguna.

## 6. Aturan perubahan teknis dan migrasi

Audit dan implementasi harus mencakup UI, route, layout, navigasi, login/redirect, server actions, helper otorisasi, tipe role, database constraints, fungsi SQL, RLS policies, data linking, tests, README, dan dokumen keputusan.

Jangan sekadar mengganti label “Admin Pusat” menjadi “Pengelola”. Itu belum memenuhi aturan bila role `admin`, gate `requireAdmin`, ruang kerja `/admin`, atau kebijakan database admin-only masih membentuk ekosistem kedua.

Perubahan database harus dirancang dengan aman:
- inventarisasi seluruh akun dan relasi yang sudah ada sebelum migrasi;
- tentukan pemetaan akun admin lama ke akun Operator yang sah, tanpa mengasumsikan setiap akun admin memiliki organisasi;
- pertahankan data dan histori; jangan menghapus atau menimpa relasi secara diam-diam;
- sediakan transisi/backfill yang dapat diverifikasi dan rencana rollback;
- jangan menjalankan migrasi pada database lokal bersama, development hosted, atau production tanpa persetujuan eksplisit pemilik produk;
- jangan mengubah skema, RLS, atau migrasi hanya untuk menyelesaikan dokumentasi.

Tidak boleh ada penggabungan, deploy, atau migrasi database hosted tanpa persetujuan eksplisit.

## 7. Audit ketidaksesuaian awal yang sudah terverifikasi

Pada branch `develop` yang diperiksa 2026-11-08, implementasi masih memiliki pemisahan yang bertentangan dengan aturan ini:

- `lib/types.ts` masih mendefinisikan `UserRole = admin | operator | driver | parent`.
- `lib/auth.ts` masih mengenali role `admin` dan `operator` secara terpisah, serta menyediakan `requireAdmin()` dan `requireOperator()`.
- `lib/paths.ts` masih mengarahkan role `admin` ke `/admin` dan role `operator` ke `/operator`; `loginAction` di `lib/auth-actions.ts` masih memiliki dua cabang redirect dan pesan akses yang berbeda.
- `app/admin/layout.tsx` dan `app/operator/layout.tsx` masih membangun dua ruang kerja terpisah; `lib/admin/read.ts` dan `lib/operator/read.ts` masih memakai gate/context yang berbeda.
- `middleware.ts` masih melindungi prefix `/admin` dan `/operator` secara terpisah.
- Migrasi `20261031000000_admin_core_crud.sql` masih mendefinisikan `private.is_admin()` dan memakai pemeriksaan admin-only untuk operasi master data/status siswa.
- Migrasi `20261031000001_operator_driver_guardian_areas.sql` masih menetapkan constraint role dengan empat nilai termasuk `admin` dan mendefinisikan operator sebagai role terpisah.
- Migrasi `20261031000002_operator_driver_account_linking.sql` masih mensyaratkan `private.is_admin()` untuk link/unlink akun operator dan pengemudi; komentar dan pesan SQL menyebut Admin Pusat sebagai aktor yang berwenang.
- `lib/auth-actions.ts` masih mengarahkan akun operator yang belum tertaut untuk menghubungi Admin Pusat; alur aktivasi orang tua dan beberapa pesan autentikasi juga menyebut Admin Pusat.
- `README.md` masih menjelaskan dua area Admin & Operator, empat role, dan rute `/admin/*`.
- `AGENTS.md` pada `develop` sebelum PR ini masih memerintahkan pekerjaan empat area Admin Pusat, Operator, Pengemudi, dan Orang Tua/Wali.
- PR #27 sudah mengubah sebagian label Admin Pusat menjadi Pengelola dan menyatakan area admin akan digabung ke `/operator`, tetapi perubahan label tersebut belum menghapus gate, route, tipe role, atau otorisasi admin yang terpisah.

Daftar ini adalah temuan awal, bukan audit menyeluruh setiap pemanggilan SQL/komponen. Implementer wajib melakukan pencarian menyeluruh dan melaporkan semua referensi tersisa sebelum menyatakan selesai.

## 8. Kriteria penerimaan akhir

- Hanya tiga role produk: Operator, Pengemudi, Orang Tua.
- Hanya satu dashboard, layout, dan navigasi Operator yang memuat fungsi administrasi serta operasional.
- Tidak ada pemilih Admin vs Operator, halaman Admin Pusat, atau alur login Admin terpisah.
- Seluruh fungsi administrasi lama tetap tersedia di ruang kerja Operator dan hanya dapat digunakan oleh akun Operator yang berwenang.
- Pengemudi hanya dapat mengakses tugas yang diberikan kepadanya.
- Orang Tua hanya dapat mengakses anak dan perjalanan yang berhak dilihatnya.
- Semua Server Actions, route handlers, server loaders, SQL functions, dan RLS policies mengikuti batas kewenangan baru.
- Akun dan data lama ditangani melalui rencana transisi yang teruji; tidak ada data yang hilang.
- Unit test, tes otorisasi/RLS, typecheck, build, dan pemeriksaan alur login/redirect lulus.
- README, master specification, matriks tanggung jawab, instruksi agen, dan decision log konsisten dengan tiga ekosistem.
