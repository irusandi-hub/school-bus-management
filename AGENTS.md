# Instruksi Agen AI

Instruksi ini berlaku untuk semua agen AI yang bekerja di repository `school-bus-management`.

## Tahap kerja yang sedang berlaku
- Fokus sekarang adalah menyelesaikan dan meninjau seluruh halaman serta alur UI untuk Admin Pusat, Operator, Pengemudi, dan Orang Tua/Wali.
- Selama pengembangan UI, semua area harus dapat dibuka tanpa login, verifikasi email, pendaftaran akun, atau penautan akun. Gunakan mode pengembangan yang eksplisit dan terbatas pada local/development/preview.
- Autentikasi, verifikasi email, pembatasan akses berdasarkan peran, RLS, dan penautan akun diintegrasikan setelah seluruh area UI selesai ditinjau.
- Kelonggaran akses pengembangan tidak boleh aktif pada production dan tidak boleh membuka database/data produksi. Jangan menonaktifkan RLS atau memperluas akses database produksi.
- Jangan membuat data anak/orang tua nyata. Data simulasi hanya boleh digunakan pada development dan harus diberi label jelas.

## Urutan implementasi dan review
1. Admin Pusat
2. Operator
3. Pengemudi
4. Orang Tua/Wali
5. Integrasi autentikasi dan otorisasi final setelah empat area UI ditinjau.

Pada setiap halaman, periksa konten, fungsi tombol/form, alur kerja, hubungan data, tampilan ponsel/desktop, pesan gagal/penolakan, dan fitur yang belum tersedia. GPS, HERE/routing, dan kamera harus diberi status belum tersedia sampai integrasi benar-benar ada.

## Sebelum bekerja
- Baca README.md, dokumen ini, docs/MASTER_SPEC.md, docs/TECHNICAL_SPEC_REVIEW.md, dan docs/DECISIONS_LOG.md sesuai konteks.
- Periksa branch, perubahan, dan PR yang sudah ada. Jangan menimpa pekerjaan branch lain.
- Ikuti kontrak data bersama; jangan membuat skema/field berbeda antar area tanpa memperbarui keputusan dan dokumentasi.

## Kejujuran dan bukti
- Jangan mengarang isi repository, data, hasil tes, dukungan penyedia, status deployment, atau hasil integrasi.
- Bedakan fakta terverifikasi, rekomendasi, asumsi, dan hal yang belum diputuskan.
- Klaim selesai harus didukung pemeriksaan atau pengujian relevan.

## Keamanan
- Jangan masukkan data nyata anak, wali, nomor telepon, alamat rumah, koordinat rumah, kredensial, token, atau rahasia ke Git.
- Jangan mengubah layanan/produksi, menjalankan migrasi produksi, merge, atau deploy tanpa izin eksplisit.
- Mode pengembangan terbuka harus fail-closed: hanya aktif pada environment non-production yang dikenali secara eksplisit. Bila environment tidak jelas, akses terbuka harus nonaktif.
- Otorisasi final tetap wajib ditegakkan di server dan database saat tahap integrasi keamanan dilakukan.

## Perubahan dan pelaporan
- Buat perubahan kecil dengan ruang lingkup jelas.
- Perbarui docs/DECISIONS_LOG.md jika keputusan disetujui atau aturan berubah.
- Laporkan file berubah, verifikasi yang dijalankan, hasil aktual, keterbatasan, dan tindak lanjut.
- Jangan commit, push, merge, deploy, atau menjalankan migrasi kecuali tugas secara eksplisit mengizinkannya.
