# Hasil Tinjauan Awal Spesifikasi Teknis

**Tanggal pemeriksaan:** 2026-10-29  
**Status:** TINJAUAN AWAL — BELUM SIAP MENETAPKAN ARSITEKTUR  
**Sumber internal:** `README.md`, `AGENTS.md`, `docs/MASTER_SPEC.md`, `docs/TECHNICAL_SPEC_REVIEW.md`, `docs/DECISIONS_LOG.md`.  
**Jenis pekerjaan:** dokumentasi dan riset kelayakan awal saja. Tidak ada implementasi aplikasi, database, atau integrasi.

## 1. Ringkasan

Repository berhasil diakses dan dokumen fondasi tersedia. Master specification mencakup tiga peran, relasi wali, perjalanan pagi/sore, versi rute, validasi GPS, akses kamera live, riwayat, ekspor, audit, serta pemeriksaan kabin sebelum sesi pengemudi ditutup.

Namun, spesifikasi belum cukup untuk memilih arsitektur final atau memulai coding fitur bisnis. Jawaban awal pemilik proyek kini menetapkan Arab Saudi sebagai wilayah operasi, proyek baru dari nol, dan kebutuhan ketiga peran di web serta mobile. Skala sistem, perangkat kamera/DVR, dan sumber GPS tetap belum diputuskan. Dukungan routing bus besar di wilayah operasi juga belum terbukti.

## 2. Status berdasarkan bukti yang tersedia

| Area | Status | Alasan |
|---|---|---|
| Peran dan prinsip hak akses | Kebutuhan awal terdokumentasi | Tiga peran dan kebutuhan pembatasan akses telah ditulis; implementasi keamanan belum ada. |
| Perjalanan dan riwayat | Kebutuhan awal terdokumentasi | Pagi/sore terpisah; status belum dikonfirmasi dikecualikan dari hitungan final. |
| Versi dan urutan rute | Kebutuhan awal terdokumentasi | Urutan stop yang disetujui harus stabil; rute aktif tidak boleh berubah diam-diam. |
| Validasi GPS | BELUM TERVERIFIKASI | Radius awal 100 m disebutkan, tetapi sumber GPS, akurasi lapangan, dan interval pembaruan belum ditentukan. |
| Routing bus besar | TERBLOKIR untuk pemilihan provider | Wilayah operasi dan penyedia belum diputuskan; kemampuan provider harus dibuktikan di wilayah tersebut. |
| Kamera live | TERBLOKIR untuk desain integrasi | Model perangkat, protokol, autentikasi, batas streaming bersamaan, dan mekanisme pencabutan belum diketahui. |
| Platform dan autentikasi | KEBUTUHAN PLATFORM DIKETAHUI; DETAIL BELUM DIPUTUSKAN | Admin, pengemudi, dan wali masing-masing membutuhkan web dan mobile; OS mobile, cakupan fitur antarplatform, metode login, pemulihan akun, dan kebutuhan offline belum dirinci. |
| Kepatuhan, retensi, dan hosting | WILAYAH DITETAPKAN; ANALISIS HUKUM BELUM SELESAI | Wilayah operasi adalah Arab Saudi; aturan yang berlaku untuk layanan, data anak, lokasi, kamera, hosting, retensi, dan transfer data masih harus ditinjau secara khusus. |
| QA | Kriteria awal tersedia, belum dijalankan | Repository belum memiliki aplikasi atau tes integrasi; kriteria di dokumen belum merupakan hasil tes. |

## 3. Jawaban awal pemilik proyek dan dampaknya

| Pertanyaan | Jawaban | Dampak pada tinjauan |
|---|---|---|
| Wilayah operasi pertama | Arab Saudi | Verifikasi provider, cakupan peta/routing, hukum, privasi, hosting, dan integrasi harus secara eksplisit mencakup Arab Saudi dan kota pilot yang nantinya dipilih. Kota pilot belum disebutkan. |
| Kondisi awal | Proyek baru dari nol | Tidak ada sistem lama yang dinyatakan perlu dipertahankan. Ini belum berarti framework, database, atau arsitektur tertentu sudah dipilih. |
| Platform Admin Pusat | Web dan mobile | Perlu ditentukan apakah kedua platform wajib memiliki seluruh kemampuan admin atau mobile hanya untuk fungsi tertentu. |
| Platform Pengemudi | Web dan mobile | Perlu diputuskan apakah pengemudi benar-benar perlu web selain aplikasi mobile, serta bagaimana GPS dan kamera berperilaku di tiap platform. |
| Platform Wali | Web dan mobile | Perlu ditentukan dukungan Android/iOS dan apakah web harus setara dengan aplikasi mobile untuk peta langsung serta kamera. |
| Skala awal | BELUM DIPUTUSKAN | Belum dapat membuat perkiraan kapasitas, biaya, target kinerja, atau jumlah perjalanan/stop untuk uji beban. |
| Kamera/DVR | BELUM DIPUTUSKAN | Integrasi kamera tidak dapat dirancang atau dipilih sebelum perangkat kandidat dan akses teknisnya diketahui. |
| Sumber GPS | BELUM DIPUTUSKAN | Jangan menetapkan ponsel pengemudi atau tracker bus sebagai sumber final. Bandingkan keandalan, interval, akses perangkat, biaya, dan perilaku saat offline. |

### 3.1 Catatan awal regulasi dan operasional Arab Saudi

Riset awal menemukan sumber publik pemerintah/otoritas yang relevan, tetapi ini bukan pendapat hukum dan belum merupakan audit kepatuhan lengkap:
- Sistem Transportasi Darat di Jalan Arab Saudi yang diterbitkan melalui platform National Center for Archives and Records memuat perizinan dan kewajiban kegiatan transportasi darat: https://ncar.gov.sa/document-details/eyJpdiI6IjJyYWpBUmZOeVVTb2JMYWN4S2lubUE9PSIsInZhbHVlIjoiLzZGdk8za3VzNHR5OCtNVnJzQjRjZz09IiwibWFjIjoiMzBlMTFmNDZiNjZjZTY3MDZhYzY4MjlkMGY0NGJiOWJiYzkwZDRiMzA1YmQwNzIwMjBiOTgzZTNmYThlZTg3OSIsInRhZyI6IiJ9
- Pengumuman Saudi Press Agency mengenai perlengkapan teknis dan keselamatan bus, termasuk sistem pelacakan elektronik dan kamera interior: https://www.spa.gov.sa/w1820872
- Portal layanan pemerintah Saudi menjelaskan layanan transportasi sekolah melalui sistem Noor: https://my.gov.sa/en/services/18428

**Tindak lanjut:** identifikasi jenis operator yang akan menggunakan aplikasi (misalnya sekolah, operator transportasi berizin, atau keduanya), kota pilot, serta pihak yang bertanggung jawab atas perizinan. Verifikasi persyaratan terkini langsung dengan Transport General Authority (TGA) dan Ministry of Education (MoE), termasuk apakah perangkat AVL/tracker dan kamera yang diwajibkan secara operasional dapat diintegrasikan. Jangan menyimpulkan bahwa kewajiban regulasi tersebut otomatis berarti aplikasi harus memakai provider tertentu.

## 4. Temuan penting dari riset routing awal

### 4.1 Dukungan teknis vendor tidak otomatis berarti tersedia di wilayah operasi

Dokumentasi resmi Google menyebut Routes API Large Vehicle Routing dapat menggunakan dimensi kendaraan dan informasi berat untuk mempertimbangkan pembatasan jalan. Namun, dokumentasi yang diperiksa juga menyatakan fitur ini tersedia secara geografis terbatas dan memerlukan provisioning/akses tertentu. Halaman overview menyebut ketersediaan umum di 48 negara bagian AS dan Jepang eksperimental; dokumentasi yang sama memperingatkan hasil rute dapat berupa best effort yang masih melanggar pembatasan.

Sumber:
- Google Routes API — Large vehicle routing overview: https://developers.google.com/maps/documentation/routes/lvr
- Google Routes API — Generate large vehicle routes & ETAs: https://developers.google.com/maps/documentation/routes/lvr-routes-etas

**Kesimpulan:** jangan memilih Google sebagai provider final sebelum wilayah operasi dikonfirmasi dan akses/dukungan untuk wilayah itu diverifikasi. Dokumentasi yang diperiksa tidak mendukung asumsi bahwa fitur Large Vehicle Routing Google tersedia di semua negara.

### 4.2 Alternatif vendor juga memerlukan verifikasi wilayah dan kontrak

Dokumentasi resmi HERE menjelaskan truck routing dengan parameter kendaraan dan pembatasan legal/fisik: https://docs.here.com/routing/docs/routing-v8-truck-routing

Dokumentasi resmi 2GIS menyatakan ketersediaan Truck Directions bergantung pada opsi deployment dan cakupan wilayah: https://docs.2gis.com/en/api/navigation/truck-directions/overview

Sumber-sumber ini menunjukkan bahwa ada API yang mendeskripsikan dukungan routing kendaraan besar, tetapi **belum membuktikan** cakupan peta, kualitas pembatasan jalan, akses komersial, harga, atau kelayakannya untuk lokasi proyek. Belum ada provider yang dipilih.

### 4.3 Uji kelayakan routing yang diperlukan

Setelah wilayah dan profil kendaraan ditentukan, buat set pengujian sintetis tanpa data pribadi anak:
- rute dengan 20, 30, dan 40+ stop;
- tinggi, lebar, panjang, berat, dan batas kendaraan yang relevan;
- jalan satu arah, larangan belok/U-turn, pembatasan kendaraan, dan penutupan jalan;
- rute yang tidak memiliki jalur aman yang valid;
- stop yang dilewati tanpa mengubah urutan stop yang disetujui;
- perubahan koordinat/data yang menghasilkan versi rute baru untuk perjalanan berikutnya;
- status/peringatan provider ketika kendala tidak dapat dipenuhi.

Jangan menggunakan hasil kalkulasi sebagai jaminan hukum atau keselamatan tanpa proses tinjauan rute dan validasi lapangan.

## 5. Gerbang yang masih menghalangi keputusan teknis

### P0 — Harus dijawab sebelum memilih platform atau vendor
1. **Kota/daerah pilot di Arab Saudi dan model operator:** sekolah, operator transportasi berizin, atau keduanya.
2. **Skala operasi:** perkiraan jumlah sekolah, siswa, bus, pengemudi, perjalanan harian, dan jumlah stop maksimum.
3. **Batas platform:** apakah semua fungsi Admin, Pengemudi, dan Wali harus tersedia setara di web dan mobile; OS mobile yang wajib didukung.
4. **Perangkat kamera/DVR:** kandidat merek/model, protokol, autentikasi, concurrent streams, dan mekanisme pencabutan akses.
5. **Sumber GPS:** bandingkan ponsel pengemudi, tracker bus/AVL, dan kombinasi keduanya berdasarkan bukti lapangan.
6. **Kepatuhan dan data:** penanggung jawab legal, hosting/data residency, retensi data anak/lokasi/video, serta ketentuan akses lintas negara.

### P1 — Harus dituntaskan sebelum rancangan teknis disetujui
7. Metode login, pemulihan akun, verifikasi nomor, serta cara admin menyetujui hubungan wali–siswa.
8. Kebijakan retensi data, audit, ekspor, backup/restore, dan durasi penyimpanan lokasi.
9. Aturan perjalanan batal, status siswa yang belum jelas, pergantian bus/pengemudi, dan pengecualian darurat.
10. Target kualitas layanan, penanganan offline, monitoring, serta proses rilis/rollback.

## 6. Rekomendasi tahap selanjutnya

1. Jawab enam pertanyaan P0 di atas.
2. Berdasarkan wilayah operasi, buat matriks vendor untuk routing bus besar, peta jalan, cakupan wilayah, batas jumlah waypoint, traffic/ETA, harga, lisensi, dan akses API.
3. Berdasarkan perangkat nyata atau kandidat perangkat yang bisa diuji, validasi kamera live, autentikasi dan pencabutan akses.
4. Susun rancangan konseptual data dan matriks izin untuk Admin Pusat, Pengemudi, dan Orang Tua/Wali.
5. Minta persetujuan atas ruang lingkup tahap pertama dan kriteria penerimaan.
6. Baru setelah gerbang tersebut lulus, susun arsitektur final dan mulai implementasi bertahap.

## 7. Batas pemeriksaan ini

- Tidak ada aplikasi atau tes integrasi yang dijalankan karena repository saat ini berisi dokumentasi fondasi, bukan aplikasi.
- Tidak ada database, kebijakan RLS, penyimpanan berkas, GPS, kamera, atau akses vendor yang diverifikasi.
- Informasi vendor di atas berasal dari dokumentasi publik dan tidak menggantikan uji langsung, verifikasi ketersediaan wilayah, peninjauan lisensi, atau konfirmasi komersial.
- Tidak ada keputusan platform, provider, database, atau framework yang dibuat dalam laporan ini.
