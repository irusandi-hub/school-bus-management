# Hasil Tinjauan Awal Spesifikasi Teknis

**Tanggal pemeriksaan:** 2026-10-29  
**Status:** TINJAUAN AWAL — BELUM SIAP MENETAPKAN ARSITEKTUR  
**Sumber internal:** `README.md`, `AGENTS.md`, `docs/MASTER_SPEC.md`, `docs/TECHNICAL_SPEC_REVIEW.md`, `docs/DECISIONS_LOG.md`.  
**Jenis pekerjaan:** dokumentasi dan riset kelayakan awal saja. Tidak ada implementasi aplikasi, database, atau integrasi.

> **Catatan 2026-11-08:** temuan ini adalah snapshot sebelum DEC-033. Model yang berlaku adalah tiga ekosistem — Operator, Pengemudi, dan Orang Tua/Wali — dengan satu Operator Utama dan akses global. Bagian yang menyebut sekolah/operator sebagai pengguna/akun atau pembatasan akses antarorganisasi adalah legacy dan tidak boleh dijadikan dasar desain baru.

## 1. Ringkasan

Repository berhasil diakses dan dokumen fondasi tersedia. Master specification mencakup tiga ekosistem, relasi wali, perjalanan pagi/sore, versi rute, validasi GPS, akses kamera live, riwayat, ekspor, audit, serta pemeriksaan kabin sebelum sesi pengemudi ditutup.

Namun, spesifikasi belum cukup untuk memilih arsitektur final atau memulai coding fitur bisnis. Jawaban awal pemilik proyek menetapkan Arab Saudi sebagai wilayah operasi, proyek baru dari nol, dan kebutuhan ketiga ekosistem di web serta mobile. Sekolah dan perusahaan transportasi adalah data yang dikelola Operator, bukan akun/tenant. Kota pilot, skala sistem, perangkat kamera/DVR, dan sumber GPS tetap belum diputuskan. Dukungan routing bus besar di wilayah operasi juga belum terbukti.

## 2. Status berdasarkan bukti yang tersedia

| Area | Status | Alasan |
|---|---|---|
| Peran dan prinsip hak akses | Kebutuhan awal terdokumentasi; DEC-033 mengikat | Tiga ekosistem (Operator, Pengemudi, Wali) dan batas akses telah ditulis; implementasi keamanan belum ada. |
| Perjalanan dan riwayat | Kebutuhan awal terdokumentasi | Pagi/sore terpisah; status belum dikonfirmasi dikecualikan dari hitungan final. |
| Versi dan urutan rute | Kebutuhan awal terdokumentasi | Urutan stop yang disetujui harus stabil; rute aktif tidak boleh berubah diam-diam. |
| Validasi GPS | BELUM TERVERIFIKASI | Radius awal 100 m disebutkan, tetapi sumber GPS, akurasi lapangan, dan interval pembaruan belum ditentukan. |
| Routing bus besar | TERBLOKIR untuk pemilihan provider | Kota pilot belum diputuskan; kemampuan provider harus dibuktikan di wilayah tersebut. |
| Kamera live | TERBLOKIR untuk desain integrasi | Model perangkat, protokol, autentikasi, batas streaming bersamaan, dan mekanisme pencabutan belum diketahui. |
| Platform dan autentikasi | Kebutuhan platform diketahui; detail belum diputuskan | Operator, pengemudi, dan wali membutuhkan web serta mobile; OS, cakupan fitur, login, pemulihan akun, dan kebutuhan offline belum dirinci. |
| Kepatuhan, retensi, dan hosting | BELUM SELESAI | Wilayah operasi Arab Saudi; aturan yang berlaku untuk layanan, data anak, lokasi, kamera, hosting, retensi, dan transfer data perlu ditinjau khusus. |
| QA | Kriteria awal tersedia, belum dijalankan | Repository belum memiliki aplikasi atau tes integrasi; kriteria di dokumen belum merupakan hasil tes. |

## 3. Keputusan dan pertanyaan yang masih terbuka

| Pertanyaan | Status |
|---|---|
| Wilayah operasi | Arab Saudi |
| Model operasional | Satu Operator Utama; sekolah dan perusahaan adalah data |
| Kota pilot | BELUM DIPUTUSKAN |
| Skala awal | BELUM DIPUTUSKAN |
| Kamera/DVR | BELUM DIPUTUSKAN |
| Sumber GPS | BELUM DIPUTUSKAN |
| Provider routing/peta | BELUM DIPILIH |
| Platform/framework/database | BELUM DIPILIH |

Model final adalah satu Operator Utama yang mengelola seluruh sekolah dan wilayah. Sekolah/perusahaan tidak menjadi akun atau tenant; jangan membangun isolasi akses Operator berdasarkan organisasi/wilayah. Tanggung jawab lisensi, pengemudi, rute, GPS/AVL, kamera, data pribadi, dan pencabutan akses tetap perlu dikonfirmasi dengan pihak terkait.

## 4. Catatan riset awal

- Dokumentasi Google Large Vehicle Routing menyatakan ketersediaan geografis terbatas; jangan menganggap fiturnya tersedia di Arab Saudi tanpa konfirmasi tertulis dan tes. Sumber: https://developers.google.com/maps/documentation/routes/lvr
- Cakupan routing kendaraan besar dari penyedia lain juga belum dibuktikan untuk kota pilot yang belum dipilih. Dokumentasi produk tidak menggantikan tes jalan nyata, pemeriksaan batas kendaraan, dan konfirmasi kontrak.
- Pemberitahuan Asharqia Chamber tanggal 9 September 2026 merujuk pada peraturan pelaksanaan aktivitas transportasi pendidikan TGA yang diterbitkan pada 2025. Penerapan pada operator yang dipilih harus dikonfirmasi melalui regulasi resmi dan/atau penasihat yang kompeten. Sumber: https://www.chamber.org.sa/en/information-center/memos/memo-4997/
- Layanan transportasi sekolah melalui Noor membuktikan adanya layanan digital, bukan ketersediaan API publik atau izin integrasi. Sumber: https://www.moe.gov.sa/en/knowledgecenter/eservices/Pages/studentransport.aspx
- Panduan SDAIA membahas PDPL dan data pribadi seperti alamat, nomor kontak, foto/video serta aturan transfer data ke luar Kerajaan. Tinjauan ini bukan pendapat hukum dan belum menyatakan desain patuh. Sumber: https://dgp.sdaia.gov.sa/wps/portal/pdp/knowledgecenter/details/PDPLCP

## 5. Artefak pendukung yang tersedia

- `docs/OPERATING_MODEL_RESPONSIBILITY_MATRIX.md` — matriks tanggung jawab untuk model satu Operator; seluruh penugasan yang belum dikonfirmasi tetap TBD.
- `docs/VENDOR_TECHNICAL_EVIDENCE_CHECKLIST.md` — daftar bukti yang harus diminta dari kandidat routing, GPS/AVL, kamera/DVR, hosting, keamanan, dan integrasi. Termasuk kriteria tes pilot dan bukti yang perlu disimpan.

Checklist vendor adalah alat pengumpulan bukti, bukan keputusan vendor atau bukti bahwa kemampuan sudah tersedia. Status routing tetap terblokir sampai cakupan kota Saudi, batas kendaraan besar, dan perilaku kegagalan diuji.

## 6. Gerbang sebelum arsitektur dan coding

1. Tetapkan kota pilot dan kisaran skala awal.
2. Konfirmasi bagaimana Operator mengelola sekolah dan perusahaan transportasi sebagai data; tentukan pihak yang bertanggung jawab atas izin dan operasional.
3. Tentukan kandidat kamera/DVR dan sumber GPS/AVL berdasarkan perangkat serta dokumentasi nyata.
4. Dapatkan konfirmasi tertulis cakupan routing kendaraan besar di kota pilot dan lakukan tes dengan skenario representatif.
5. Tinjau kewajiban perizinan, perlindungan data, lokasi pemrosesan, retensi, dan transfer data dengan pihak yang kompeten.
6. Lengkapi matriks akses Operator/Pengemudi/Wali dan kriteria penerimaan; jangan memakai organisasi/wilayah sebagai batas akses Operator.
7. Catat keputusan di `docs/DECISIONS_LOG.md`; pertahankan status BELUM DIPUTUSKAN/BELUM TERVERIFIKASI jika bukti belum cukup.

## 7. Batas pemeriksaan

- Repository yang diperiksa merupakan fondasi dokumentasi; tidak ada aplikasi atau tes integrasi yang dijalankan.
- Database, RLS, penyimpanan berkas, GPS, kamera, akses vendor, dan integrasi Noor belum diverifikasi.
- Tidak ada provider, framework, database, atau arsitektur final yang dipilih.
- Tidak ada fitur bisnis atau integrasi yang diimplementasikan.
