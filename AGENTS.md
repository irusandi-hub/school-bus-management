# Instruksi Agen AI

Instruksi ini berlaku untuk semua agen AI yang bekerja di repository `school-bus-management`.

## Sebelum bekerja
- Baca `README.md`, dokumen ini, `docs/MASTER_SPEC.md`, `docs/TECHNICAL_SPEC_REVIEW.md`, dan `docs/DECISIONS_LOG.md` sesuai konteks tugas.
- Periksa status Git dan perubahan yang sudah ada.
- Pastikan permintaan pengguna memang mengizinkan perubahan kode atau dokumen.

## Batas ruang lingkup saat ini
- Proyek berada pada tahap dokumentasi dan pemeriksaan spesifikasi.
- Jangan membuat implementasi fitur bisnis, framework aplikasi, skema database final, endpoint, autentikasi, integrasi, atau migrasi sebelum tinjauan teknis disetujui.
- Jangan menambahkan layanan pihak ketiga hanya berdasarkan asumsi.
- Jangan menggabungkan proyek ini dengan repository lain.

## Kejujuran dan bukti
- Jangan mengarang isi repository, data, hasil tes, dukungan penyedia, status deployment, atau hasil integrasi.
- Bedakan fakta terverifikasi, rekomendasi, asumsi, dan hal yang belum diputuskan.
- Bila informasi tidak cukup, tulis pertanyaan atau risiko yang spesifik daripada menebak.
- Klaim “selesai” harus didukung pemeriksaan atau pengujian yang relevan.

## Keamanan
- Jangan menambahkan data nyata anak, orang tua/wali, nomor telepon, alamat rumah, koordinat rumah, kredensial, token, atau rahasia ke Git.
- Jangan menjalankan tindakan destruktif atau mengubah layanan/produksi tanpa izin eksplisit.
- Semua desain akses data harus mempertimbangkan otorisasi server/database; menyembunyikan menu di UI tidak cukup.
- Perubahan aturan akses, privasi, dan retensi harus didokumentasikan.

## Perubahan dan pelaporan
- Buat perubahan kecil dengan ruang lingkup jelas.
- Perbarui `docs/DECISIONS_LOG.md` jika ada keputusan yang disetujui atau aturan berubah.
- Laporkan file yang berubah, alasan, verifikasi yang dijalankan, hasil aktual, keterbatasan, dan tindak lanjut.
- Jangan commit, push, merge, deploy, atau menjalankan migrasi kecuali tugas secara eksplisit mengizinkannya.

## Label status
Gunakan label berikut jika relevan:
- `BELUM DIPUTUSKAN`
- `BELUM TERVERIFIKASI`
- `BELUM DIKERJAKAN`
- `SEDANG DIKERJAKAN`
- `SELESAI DAN LULUS TES`
- `TERIMPLEMENTASI TETAPI BELUM TERVERIFIKASI`
- `TERBLOKIR`
