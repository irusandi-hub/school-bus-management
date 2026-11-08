# Instruksi Agen AI

Instruksi ini berlaku untuk semua agen AI yang bekerja pada repository `school-bus-management`.

## Aturan produk tertinggi — wajib dipatuhi

Baca dan patuhi `docs/PRODUCT_ARCHITECTURE_THREE_ECOSYSTEMS.md`. Dokumen tersebut adalah keputusan produk yang disetujui pemilik produk dan mengikat semua pekerjaan.

**Produk hanya memiliki tiga ekosistem pengguna: Operator, Pengemudi, dan Orang Tua.**
- Operator adalah satu-satunya pusat pengelolaan dan administrasi organisasi. Semua fungsi yang dahulu berada di Admin Pusat harus menjadi modul dalam satu dashboard/navigasi Operator.
- Pengemudi hanya menjalankan tugas yang diberikan Operator dan hanya memiliki akses pada penugasan yang sah.
- Orang Tua hanya memantau anak, perjalanan, riwayat, dan menyampaikan laporan sesuai hak akses.
- Tidak ada role/dashboard Admin Pusat terpisah dan tidak ada role Sekolah terpisah.
- Jangan membuat hierarki internal tambahan untuk memisahkan administrasi dari operasional. Jika kelak dibutuhkan pembatasan staf, tetap berada dalam ekosistem Operator dan harus mendapat persetujuan.

Jika kode, dokumen lama, atau PR bertentangan dengan aturan ini, laporkan sebagai ketidaksesuaian dan implementasikan menuju aturan ini. Jangan mempertahankan pemisahan Admin/Operator hanya karena sudah ada di kode.

## Batas teknis dan keamanan

- Gunakan satu backend, satu database, dan satu sistem autentikasi. Perbedaan akses ditegakkan berdasarkan role, organisasi, relasi, dan penugasan.
- Otorisasi wajib di server dan database/RLS; menyembunyikan menu saja tidak cukup.
- Operator dibatasi pada organisasi yang terhubung dengannya; Pengemudi pada tugas aktif yang ditugaskan; Orang Tua pada siswa yang terhubung dan memenuhi syarat.
- Jangan menganggap penggantian label Admin menjadi Pengelola sudah cukup. Audit role, route, layout, redirect, server actions, helper, SQL functions, constraints, grants, policies, tests, dan dokumentasi.
- Jangan membuat perubahan skema, RLS, migrasi, atau data hosted tanpa persetujuan eksplisit pemilik produk. Sebelum mengusulkan migrasi, petakan akun lama dan organisasi terkait, strategi backfill, preservasi histori, serta rollback.
- Jangan merge PR, deploy, atau menjalankan migrasi tanpa persetujuan eksplisit.
- Jangan masukkan data pribadi siswa/wali, nomor telepon, alamat rumah, koordinat rumah, kredensial, token, atau rahasia ke Git.
- Mode pengembangan terbuka hanya boleh aktif pada environment non-production yang dikenali secara eksplisit dan harus fail-closed.

## Sebelum bekerja

- Baca `README.md`, dokumen ini, `docs/PRODUCT_ARCHITECTURE_THREE_ECOSYSTEMS.md`, `docs/DECISIONS_LOG.md`, dan spesifikasi terkait tugas.
- Periksa branch, status Git, perubahan lokal, PR terbuka, dan pekerjaan branch lain. Jangan menimpa pekerjaan yang belum digabung.
- Tentukan apakah tugas hanya audit, dokumentasi, atau implementasi. Audit dilakukan read-only kecuali pemilik produk secara eksplisit meminta perubahan.
- Jangan mengulang audit luas jika bukti yang tersedia masih berlaku; periksa hanya bagian yang relevan dan mismatch yang nyata.

## Kejujuran dan verifikasi

- Jangan mengarang isi repository, data, hasil tes, status deployment, atau hasil integrasi.
- Bedakan fakta terverifikasi, rekomendasi, asumsi, dan hal yang belum diketahui.
- Klaim selesai harus didukung pemeriksaan dan pengujian relevan.
- Laporkan file berubah, alasan, perintah tes yang benar-benar dijalankan, hasil aktual, keterbatasan, dan tindak lanjut.

## Proses perubahan

- Buat perubahan kecil dan terfokus, tetapi jangan membagi satu refactor arsitektur menjadi PR bertumpuk yang saling bergantung tanpa alasan.
- Perbarui `docs/DECISIONS_LOG.md` bila ada keputusan produk baru.
- Jangan commit, push, merge, deploy, atau menjalankan migrasi kecuali tugas secara eksplisit mengizinkannya.
- Bila refactor memerlukan perubahan database, berhenti pada rancangan migrasi dan minta persetujuan sebelum menjalankannya.

## Label status

Gunakan label berikut bila relevan:
- `BELUM DIPUTUSKAN`
- `BELUM TERVERIFIKASI`
- `BELUM DIKERJAKAN`
- `SEDANG DIKERJAKAN`
- `SELESAI DAN LULUS TES`
- `TERIMPLEMENTASI TETAPI BELUM TERVERIFIKASI`
- `TERBLOKIR`
