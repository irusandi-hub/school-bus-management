# Aturan Arsitektur Produk — Tiga Ekosistem

**Status: DISETUJUI PEMILIK PRODUK — WAJIB DITERAPKAN**  
**Berlaku mulai:** 2026-11-08  
**Repository:** `school-bus-management`

Dokumen ini mengikat seluruh desain, implementasi, pengujian, dokumentasi, dan pekerjaan agen. Jika dokumen lama, kode, atau PR bertentangan, implementasi harus diarahkan ke aturan ini.

## 1. Hanya tiga ekosistem pengguna

1. **Operator** — satu pusat kendali dan pengelolaan seluruh aplikasi.
2. **Pengemudi** — menjalankan tugas perjalanan yang diberikan Operator.
3. **Orang Tua** — memantau anak/perjalanan dan menyampaikan laporan.

Tidak ada ekosistem Admin Pusat atau Sekolah yang terpisah. Sekolah adalah data/entitas yang dikelola Operator.

## 2. Satu Operator Utama, satu kendali aplikasi

- Hanya ada **satu Operator Utama** sebagai pemegang kewenangan tertinggi di dalam aplikasi.
- Operator mengelola seluruh sekolah, siswa, wali, bus, pengemudi, wilayah, rute, penugasan, perjalanan, laporan, dan audit.
- Semua fungsi administrasi lama menjadi modul dalam satu dashboard, satu navigasi, satu autentikasi, dan satu ekosistem Operator.
- Tidak ada perusahaan/operator tenant kedua, akun operator wilayah, dashboard admin, atau pusat kendali paralel.
- Pembagian fungsi administrasi dan operasional di menu hanyalah pengelompokan pekerjaan, bukan role atau tingkatan kewenangan baru.
- Tidak perlu membuat hierarki staf atau permission matrix baru. Jika kebutuhan tersebut muncul di masa depan, harus dimintakan keputusan tersendiri.

## 3. Wilayah operasi dan pembagian tugas adalah DATA

Wilayah operasi bukan batas keamanan, bukan tenant, bukan organisasi baru, dan bukan pembatas akses Operator.

Data wilayah dipakai untuk pemetaan dan audit pembagian pekerjaan, meliputi:
- nama/kode dan cakupan wilayah;
- area/titik penjemputan dan pengantaran;
- siswa yang dipetakan ke wilayah;
- pengemudi yang ditugaskan;
- penanggung jawab atau catatan pembagian tugas bila diperlukan;
- masa berlaku penugasan dan riwayat perubahan penanggung jawab.

Operator Utama selalu dapat melihat, membuat, memperbarui, dan mengaudit seluruh data lintas wilayah. Penugasan wilayah hanya menjawab **siapa menangani area/tugas tertentu dan kapan**, bukan siapa boleh melihat database.

Jangan menggunakan `region_id`, `area_id`, atau penugasan wilayah sebagai filter RLS untuk Operator. Jangan mengunci akses data induk Operator berdasarkan wilayah. Pengemudi tetap hanya melihat penugasan perjalanan yang diberikan kepadanya; pembatasan Pengemudi berasal dari identitas dan penugasan, bukan dari wilayah sebagai role.

## 4. Batas kewenangan tiga ekosistem

### Operator
- Kendali penuh atas seluruh data dan operasional aplikasi.
- Input, lihat, perbarui, dan kelola data siswa, sekolah, wali, bus, pengemudi, wilayah, rute, titik, penugasan, perjalanan, laporan, dan audit.
- Menetapkan dan mengubah penugasan serta tanggung jawab wilayah.
- Melihat seluruh wilayah dan riwayat pembagian tugas.

### Pengemudi
- Akses hanya setelah akun terhubung ke data pengemudi aktif.
- Hanya melihat tugas, rute, siswa, dan perjalanan yang ditugaskan kepadanya.
- Menjalankan perjalanan dan mengirim pembaruan sesuai alur tugas.
- Tidak mengelola database induk, armada, pengemudi lain, wilayah, atau penugasan.

### Orang Tua
- Hanya melihat anak yang terhubung secara sah ke akun dan memenuhi syarat layanan.
- Melihat status, lokasi bus bila tersedia, perjalanan, riwayat, kamera bila integrasi sah tersedia, dan mengirim laporan.
- Tidak mengelola data induk atau operasional.

## 5. Role dan otorisasi

Role produk akhir:
- `operator`
- `driver`
- `parent`

Role `admin` harus ditransisikan secara aman menjadi `operator`; role itu tidak boleh menjadi ekosistem atau dashboard tersendiri. Transisi akun lama wajib memetakan akun Operator Utama yang sah, mempertahankan data dan histori, dan tidak boleh mengasumsikan setiap akun admin lama memiliki relasi/organisasi yang benar.

Otorisasi wajib ditegakkan di server dan database/RLS:
- Operator: akses global ke seluruh data aplikasi.
- Pengemudi: hanya identitas, penugasan, perjalanan, roster, dan data operasional yang menjadi tugasnya.
- Orang Tua: hanya siswa dan perjalanan anak yang berhak diakses.

Jangan membuat multi-tenant atau pembatasan RLS berdasarkan perusahaan/wilayah. Wilayah adalah data audit, bukan security boundary.

## 6. UX, route, dan autentikasi

- Landing page, login, onboarding, dan dokumentasi hanya menampilkan Operator, Pengemudi, dan Orang Tua.
- Login menentukan akses dari role dan relasi database; pengguna tidak dapat memilih atau menaikkan role sendiri.
- Operator masuk langsung ke satu ruang kerja Operator tanpa pemilihan Admin/Operator.
- Seluruh modul lama `/admin/*` harus dipindahkan/diintegrasikan ke ruang kerja `/operator/*`. Redirect kompatibilitas boleh dipakai sementara, tetapi tidak boleh mempertahankan layout/gate Admin tersendiri.
- Tidak boleh ada dashboard, navigasi, atau alur login Admin Pusat terpisah.

## 7. Migrasi dan keselamatan data

Audit implementasi mencakup role, routes, layouts, redirects, middleware, Server Actions, server loaders, SQL functions, constraints, grants, RLS, linking akun, tests, README, dan seluruh dokumen.

Migrasi wajib:
- mempertahankan seluruh data dan histori;
- menyiapkan pemetaan semua akun `admin` dan `operator` lama;
- membuat satu identitas Operator Utama yang sah dan memastikan relasi seluruh data menunjuk ke entitas pusat tersebut;
- menangani konflik akun tertaut/duplikasi secara eksplisit dan fail-closed;
- memindahkan hak master-data dari `private.is_admin()` ke otorisasi Operator;
- menghapus role lama hanya setelah backfill dan verifikasi;
- mempertahankan pembatasan Pengemudi dan Orang Tua;
- memasukkan tes RLS yang membuktikan Operator dapat mengelola semua wilayah, sedangkan Pengemudi dan Orang Tua tetap terisolasi;
- menyertakan strategi rollback dan pemeriksaan pra/pasca migrasi.

**Tidak boleh mengasumsikan database kosong.** Jika data/relasi lama ambigu, migrasi harus berhenti dengan pesan yang jelas, bukan memilih akun secara otomatis.

Migrasi boleh disiapkan sebagai file pada branch setelah proses pembuatan migration lokal yang benar. Persetujuan ini tidak mengizinkan menjalankannya pada Supabase lokal bersama, development hosted, staging, atau production. Tidak ada merge/deploy tanpa persetujuan tersendiri.

## 8. Temuan ketidaksesuaian awal

Pada branch `develop` yang diperiksa 2026-11-08:
- `lib/types.ts` masih memiliki empat role.
- `lib/auth.ts` memiliki `requireAdmin()` dan `requireOperator()`.
- `lib/paths.ts`, `lib/auth-actions.ts`, middleware, dan dua layout memisahkan Admin/Operator.
- `lib/admin/read.ts` dan `lib/operator/read.ts` memakai gate berbeda.
- Migrasi lama memakai `private.is_admin()` untuk master data dan linking akun.
- Model `operator_id` lama membatasi data ke organisasi Operator, bertentangan dengan satu Operator Utama.
- README dan beberapa dokumen lama masih menggambarkan empat role/multi-tenant.

Daftar ini adalah titik awal, bukan audit final. Implementer harus mencari seluruh referensi sebelum menyatakan selesai.

## 9. Kriteria penerimaan

- Tepat tiga role: Operator, Pengemudi, Orang Tua.
- Tepat satu Operator Utama dengan kendali global aplikasi.
- Satu dashboard/layout/navigasi Operator memuat semua fungsi administrasi dan operasional.
- Tidak ada dashboard/gate/login Admin terpisah.
- Tidak ada operator tenant kedua atau isolasi data berdasarkan `operator_id`/wilayah.
- Wilayah hanya data pemetaan, pembagian tugas, dan audit; Operator dapat melihat dan mengelola semuanya.
- Pengemudi hanya dapat mengakses tugas yang diberikan.
- Orang Tua hanya dapat mengakses anak dan perjalanan yang berhak dilihat.
- Transisi akun dan data lama teruji tanpa kehilangan data.
- Unit test, tes otorisasi/RLS, typecheck, build, serta alur login/redirect lulus.
- README, master spec, decision log, dan instruksi agen konsisten.
