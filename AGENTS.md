# Instruksi Agen AI

Berlaku untuk semua agen yang bekerja pada repository `school-bus-management`.

## Aturan produk tertinggi

Baca `docs/PRODUCT_ARCHITECTURE_THREE_ECOSYSTEMS.md`. Aturan ini disetujui pemilik produk dan mengikat semua pekerjaan.

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
