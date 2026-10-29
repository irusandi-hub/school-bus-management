# school-bus-management

Fondasi dokumentasi untuk proyek aplikasi manajemen transportasi bus sekolah.

**Status proyek:** tahap persiapan kebutuhan dan pemeriksaan spesifikasi.  
**Versi master specification:** 0.1 (draf kebutuhan).  
**Implementasi fitur bisnis:** belum dimulai.

## Tujuan

Menyiapkan satu sumber acuan yang konsisten untuk tiga peran aplikasi:

- Admin Pusat
- Pengemudi
- Orang Tua/Wali

Repository ini sengaja dimulai dari dokumentasi dan aturan kerja. Framework, bahasa pemrograman, database, penyedia peta/routing, layanan GPS, dan integrasi kamera belum ditentukan sebelum kelayakannya diperiksa.

## Dokumen utama

- [`docs/MASTER_SPEC.md`](docs/MASTER_SPEC.md) — sumber acuan kebutuhan produk.
- [`docs/TECHNICAL_SPEC_REVIEW.md`](docs/TECHNICAL_SPEC_REVIEW.md) — daftar pemeriksaan sebelum arsitektur dan coding diputuskan.
- [`docs/DECISIONS_LOG.md`](docs/DECISIONS_LOG.md) — catatan keputusan dan perubahan.
- [`docs/AI_AGENT_RULES.md`](docs/AI_AGENT_RULES.md) — aturan wajib bagi agen AI.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — cara mengusulkan perubahan.
- [`AGENTS.md`](AGENTS.md) — instruksi kerja untuk agen coding.

## Aturan dasar

1. Baca master specification dan instruksi repository sebelum mengusulkan atau mengubah file.
2. Jangan mengimplementasikan fitur bisnis sebelum pemeriksaan spesifikasi teknis selesai dan disetujui.
3. Jangan menganggap integrasi atau kemampuan teknis tersedia tanpa bukti.
4. Tandai hal yang belum diputuskan sebagai `BELUM DIPUTUSKAN` dan hal yang belum dibuktikan sebagai `BELUM TERVERIFIKASI`.
5. Perubahan pada aturan produk harus melalui catatan keputusan.
6. Jangan memasukkan data pribadi siswa/orang tua, kredensial, token, API key, atau data produksi ke repository.

## Status

Repository ini adalah fondasi dokumentasi saja. Belum ada aplikasi, database, API, integrasi GPS/kamera, autentikasi, atau routing yang diimplementasikan.
