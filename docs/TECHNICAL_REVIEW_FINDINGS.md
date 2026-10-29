# Hasil Tinjauan Awal Spesifikasi Teknis

**Tanggal pemeriksaan:** 2026-10-29  
**Status:** TINJAUAN AWAL — BELUM SIAP MENETAPKAN ARSITEKTUR  
**Sumber internal:** `README.md`, `AGENTS.md`, `docs/MASTER_SPEC.md`, `docs/TECHNICAL_SPEC_REVIEW.md`, `docs/DECISIONS_LOG.md`.  
**Jenis pekerjaan:** dokumentasi dan riset kelayakan awal saja. Tidak ada implementasi aplikasi, database, atau integrasi.

## 1. Ringkasan

Repository berhasil diakses dan dokumen fondasi tersedia. Master specification mencakup tiga peran, relasi wali, perjalanan pagi/sore, versi rute, validasi GPS, akses kamera live, riwayat, ekspor, audit, serta pemeriksaan kabin sebelum sesi pengemudi ditutup.

Namun, spesifikasi belum cukup untuk memilih arsitektur final atau memulai coding fitur bisnis. Beberapa keputusan penting belum tersedia, khususnya wilayah operasi, platform aplikasi, sumber GPS, model kamera/DVR, skala sistem, dan bukti dukungan routing untuk bus besar di wilayah yang benar-benar digunakan.

## 2. Status berdasarkan bukti yang tersedia

| Area | Status | Alasan |
|---|---|---|
| Peran dan prinsip hak akses | Kebutuhan awal terdokumentasi | Tiga peran dan kebutuhan pembatasan akses telah ditulis; implementasi keamanan belum ada. |
| Perjalanan dan riwayat | Kebutuhan awal terdokumentasi | Pagi/sore terpisah; status belum dikonfirmasi dikecualikan dari hitungan final. |
| Versi dan urutan rute | Kebutuhan awal terdokumentasi | Urutan stop yang disetujui harus stabil; rute aktif tidak boleh berubah diam-diam. |
| Validasi GPS | BELUM TERVERIFIKASI | Radius awal 100 m disebutkan, tetapi sumber GPS, akurasi lapangan, dan interval pembaruan belum ditentukan. |
| Routing bus besar | TERBLOKIR untuk pemilihan provider | Wilayah operasi dan penyedia belum diputuskan; kemampuan provider harus dibuktikan di wilayah tersebut. |
| Kamera live | TERBLOKIR untuk desain integrasi | Model perangkat, protokol, autentikasi, batas streaming bersamaan, dan mekanisme pencabutan belum diketahui. |
| Platform dan autentikasi | BELUM DIPUTUSKAN | Belum diputuskan web/mobile, metode login, pemulihan akun, dan kebutuhan offline. |
| Kepatuhan, retensi, dan hosting | BELUM DIPUTUSKAN | Negara/wilayah operasi dan persyaratan hukumnya belum ditetapkan. |
| QA | Kriteria awal tersedia, belum dijalankan | Repository belum memiliki aplikasi atau tes integrasi; kriteria di dokumen belum merupakan hasil tes. |

## 3. Temuan penting dari riset routing awal

### 3.1 Dukungan teknis vendor tidak otomatis berarti tersedia di wilayah operasi

Dokumentasi resmi Google menyebut Routes API Large Vehicle Routing dapat menggunakan dimensi kendaraan dan informasi berat untuk mempertimbangkan pembatasan jalan. Namun, dokumentasi yang diperiksa juga menyatakan fitur ini tersedia secara geografis terbatas dan memerlukan provisioning/akses tertentu. Halaman overview menyebut ketersediaan umum di 48 negara bagian AS dan Jepang eksperimental; dokumentasi yang sama memperingatkan hasil rute dapat berupa best effort yang masih melanggar pembatasan.

Sumber:
- Google Routes API — Large vehicle routing overview: https://developers.google.com/maps/documentation/routes/lvr
- Google Routes API — Generate large vehicle routes & ETAs: https://developers.google.com/maps/documentation/routes/lvr-routes-etas

**Kesimpulan:** jangan memilih Google sebagai provider final sebelum wilayah operasi dikonfirmasi dan akses/dukungan untuk wilayah itu diverifikasi. Dokumentasi yang diperiksa tidak mendukung asumsi bahwa fitur Large Vehicle Routing Google tersedia di semua negara.

### 3.2 Alternatif vendor juga memerlukan verifikasi wilayah dan kontrak

Dokumentasi resmi HERE menjelaskan truck routing dengan parameter kendaraan dan pembatasan legal/fisik: https://docs.here.com/routing/docs/routing-v8-truck-routing

Dokumentasi resmi 2GIS menyatakan ketersediaan Truck Directions bergantung pada opsi deployment dan cakupan wilayah: https://docs.2gis.com/en/api/navigation/truck-directions/overview

Sumber-sumber ini menunjukkan bahwa ada API yang mendeskripsikan dukungan routing kendaraan besar, tetapi **belum membuktikan** cakupan peta, kualitas pembatasan jalan, akses komersial, harga, atau kelayakannya untuk lokasi proyek. Belum ada provider yang dipilih.

### 3.3 Uji kelayakan routing yang diperlukan

Setelah wilayah dan profil kendaraan ditentukan, buat set pengujian sintetis tanpa data pribadi anak:
- rute dengan 20, 30, dan 40+ stop;
- tinggi, lebar, panjang, berat, dan batas kendaraan yang relevan;
- jalan satu arah, larangan belok/U-turn, pembatasan kendaraan, dan penutupan jalan;
- rute yang tidak memiliki jalur aman yang valid;
- stop yang dilewati tanpa mengubah urutan stop yang disetujui;
- perubahan koordinat/data yang menghasilkan versi rute baru untuk perjalanan berikutnya;
- status/peringatan provider ketika kendala tidak dapat dipenuhi.

Jangan menggunakan hasil kalkulasi sebagai jaminan hukum atau keselamatan tanpa proses tinjauan rute dan validasi lapangan.

## 4. Gerbang yang masih menghalangi keputusan teknis

### P0 — Harus dijawab sebelum memilih platform atau vendor
1. **Wilayah operasi pertama:** negara dan kota/daerah yang akan dilayani.
2. **Kondisi awal proyek:** benar-benar mulai dari nol atau ada aplikasi, database, atau perangkat yang harus dipertahankan.
3. **Platform pengguna:** apakah admin menggunakan web; pengemudi menggunakan Android; wali menggunakan Android/iOS/web; dan apakah harus bekerja saat koneksi buruk.
4. **Profil operasi:** perkiraan jumlah sekolah, siswa, bus, pengemudi, perjalanan harian, dan jumlah stop maksimum.
5. **Perangkat kamera/DVR:** merek/model atau daftar perangkat yang akan dipakai, protokol dan autentikasi yang tersedia.
6. **Sumber GPS:** GPS dari ponsel pengemudi, perangkat tracker di bus, atau keduanya.

### P1 — Harus dituntaskan sebelum rancangan teknis disetujui
7. Metode login, pemulihan akun, verifikasi nomor, serta cara admin menyetujui hubungan wali–siswa.
8. Kebijakan retensi data, audit, ekspor, backup/restore, dan durasi penyimpanan lokasi.
9. Aturan perjalanan batal, status siswa yang belum jelas, pergantian bus/pengemudi, dan pengecualian darurat.
10. Target kualitas layanan, penanganan offline, monitoring, serta proses rilis/rollback.

## 5. Rekomendasi tahap selanjutnya

1. Jawab enam pertanyaan P0 di atas.
2. Berdasarkan wilayah operasi, buat matriks vendor untuk routing bus besar, peta jalan, cakupan wilayah, batas jumlah waypoint, traffic/ETA, harga, lisensi, dan akses API.
3. Berdasarkan perangkat nyata atau kandidat perangkat yang bisa diuji, validasi kamera live, autentikasi dan pencabutan akses.
4. Susun rancangan konseptual data dan matriks izin untuk Admin Pusat, Pengemudi, dan Orang Tua/Wali.
5. Minta persetujuan atas ruang lingkup tahap pertama dan kriteria penerimaan.
6. Baru setelah gerbang tersebut lulus, susun arsitektur final dan mulai implementasi bertahap.

## 6. Batas pemeriksaan ini

- Tidak ada aplikasi atau tes integrasi yang dijalankan karena repository saat ini berisi dokumentasi fondasi, bukan aplikasi.
- Tidak ada database, kebijakan RLS, penyimpanan berkas, GPS, kamera, atau akses vendor yang diverifikasi.
- Informasi vendor di atas berasal dari dokumentasi publik dan tidak menggantikan uji langsung, verifikasi ketersediaan wilayah, peninjauan lisensi, atau konfirmasi komersial.
- Tidak ada keputusan platform, provider, database, atau framework yang dibuat dalam laporan ini.
