# Tinjauan Spesifikasi Teknis — Checklist

**Status:** BELUM DIPUTUSKAN / BELUM TERVERIFIKASI  
**Tujuan:** Menentukan apakah spesifikasi cukup matang untuk menyusun arsitektur teknis. Ini bukan persetujuan untuk mulai coding.

## A. Kondisi proyek
- [ ] Dipastikan apakah proyek dimulai dari nol atau ada aplikasi/repository/database yang harus dipertahankan.
- [ ] Pemilik produk dan pihak yang berwenang menyetujui perubahan ditentukan.
- [ ] Wilayah operasi sudah ditetapkan: Arab Saudi. Tinjauan kewajiban hukum terkait anak, lokasi, kamera, transportasi sekolah, hosting, dan retensi masih harus dilakukan.
- [x] Target skala pelayanan awal sekitar 100 bus; jumlah sekolah, siswa, pengemudi, perjalanan, pengguna bersamaan, dan stop maksimum masih harus ditentukan.

## B. Platform dan penggunaan
- [ ] Kebutuhan platform awal dijawab: Admin, Pengemudi, dan Wali masing-masing membutuhkan web dan mobile. Detail OS, kesetaraan fitur antarplatform, dan kebutuhan offline belum diputuskan.
- [ ] Kebutuhan koneksi buruk/offline ditentukan.
- [ ] Bahasa, zona waktu, aksesibilitas, dan dukungan perangkat ditentukan.
- [ ] Alur login, pemulihan akun, sesi, dan pencabutan akses ditetapkan.

## C. Data dan hak akses
- [ ] Definisi status pagi/sore dan pihak yang boleh mengubah tiap status difinalisasi.
- [ ] Prosedur verifikasi nomor dan persetujuan relasi wali ditentukan.
- [ ] Kebijakan banyak wali per siswa dan banyak siswa per wali ditetapkan.
- [ ] Model audit, koreksi data historis, backup, retensi, dan pemulihan ditetapkan.
- [ ] Hak akses dievaluasi untuk UI, API, dan database.

## D. Peta dan routing bus besar
- [ ] Titik awal, tujuan, pola rute, dan aturan operasional diketahui.
- [ ] Profil bus (tinggi, berat, panjang/lebar dan batas akses) tersedia.
- [ ] Penyedia routing diuji untuk pembatasan kendaraan berat yang benar-benar diperlukan.
- [ ] Kualitas peta jalan, larangan belok, jalan satu arah, penutupan jalan, dan alternatif jalur diuji.
- [ ] Kemampuan mengunci urutan stop sambil menghitung ulang jalur antartitik dibuktikan.
- [ ] Strategi perhitungan awal dan pembaruan rute untuk 20/30/40+ stop diuji dengan data simulasi.
- [ ] Perilaku saat tidak ada rute aman ditetapkan.
- [ ] Aturan rekomendasi titik jemput bersama dan persetujuan admin ditetapkan.

## E. GPS dan validasi lokasi
- [ ] Sumber GPS masih BELUM DIPUTUSKAN; pilihan ponsel pengemudi, tracker bus/AVL, atau kombinasi belum dievaluasi.
- [ ] Penanganan akurasi, data kedaluwarsa, dan kehilangan sinyal ditentukan.
- [ ] Radius awal 100 meter diuji bersama akurasi GPS dan kondisi lokasi nyata.
- [ ] Mekanisme pengecualian yang berwenang dan auditnya ditetapkan.

## F. Fitur tambahan: kamera live
Kamera adalah fitur tambahan, bukan gerbang untuk menyelesaikan navigasi dan laporan orang tua. Validasi integrasinya dapat dijadwalkan setelah prioritas inti atau sebagai jalur terpisah tanpa menghambatnya.
- [x] Arah integrasi kamera: spesifikasi generik, tidak terkunci merek/protokol. Sumber dapat berupa perangkat/DVR langsung atau live stream yang disediakan aplikasi/platform AV yang sudah terpasang, jika integrasi resmi dan terotorisasi tersedia. Inventaris perangkat/aplikasi, protokol, autentikasi, kapasitas, dan pencabutan akses masih BELUM TERVERIFIKASI.
- [ ] Kapasitas streaming bersamaan dan dukungan perangkat mobile diuji.
- [ ] Cara menghentikan sesi streaming saat hak akses berakhir diuji.
- [ ] Kebijakan akses pengemudi dan akses per anak ditetapkan.
- [ ] Keterbatasan saat kamera offline ditetapkan.
- [ ] Dipastikan ruang lingkup awal tidak mencakup playback/unduh rekaman.

## G. Nomor HP dan pemberitahuan
- [ ] Dipilih apakah OTP diperlukan dan penyedia mana yang mendukung wilayah operasi.
- [ ] Pemberitahuan rutin SMS/WhatsApp tidak menjadi ketergantungan versi awal.
- [ ] Push notification bukan kewajiban awal kecuali diputuskan kemudian.
- [ ] Informasi status dan perjalanan tersedia dalam aplikasi dengan indikator data terbaru/kedaluwarsa.

## H. Riwayat dan laporan
- [ ] Definisi keikutsertaan sah, tidak ikut, belum dikonfirmasi, dan perjalanan dibatalkan difinalisasi.
- [ ] Riwayat operasional dipisahkan dari rekap penggunaan dan tagihan masa depan.
- [ ] Filter laporan, format ekspor, dan akses orang tua ditentukan.
- [ ] Mekanisme berbagi laporan aman dan tidak memakai tautan publik permanen.
- [ ] Koreksi riwayat memiliki jejak audit.

## I. Operasi, keamanan, dan kualitas
- [ ] Lingkungan development/staging/production ditetapkan.
- [ ] Penyimpanan rahasia, log, pemantauan, backup, dan rollback ditetapkan.
- [ ] Tes akses langsung ke API tanpa izin dirancang.
- [ ] Skenario kamera/GPS offline, siswa belum terkonfirmasi turun, dan sesi kerja belum dapat ditutup diuji.
- [ ] Kriteria penerimaan tiap tahap disepakati.

## Catatan jawaban awal

- Wilayah operasi: Arab Saudi; kota pilot disetujui Dammam dan sekitarnya.
- Kondisi awal: proyek baru dari nol.
- Platform: Admin Pusat, Pengemudi, dan Wali membutuhkan web serta mobile; cakupan fitur dan OS belum dirinci.
- Target skala awal sekitar 100 bus. Detail sekolah/siswa/pengguna bersamaan dan sumber GPS tetap BELUM DIPUTUSKAN.
- Kamera/DVR sudah terpasang. Metode integrasi stream tetap netral: perangkat/DVR langsung atau aplikasi/platform AV yang sudah ada; kelayakan tiap opsi BELUM TERVERIFIKASI.
- Temuan rinci dan sumber awal untuk konteks Arab Saudi tercatat di `docs/TECHNICAL_REVIEW_FINDINGS.md`.

## Gerbang sebelum coding
Coding fitur bisnis belum boleh dimulai sampai:
1. pertanyaan kritis yang memengaruhi keselamatan, privasi, dan integrasi memiliki jawaban atau mitigasi yang disetujui;
2. rancangan data dan hak akses telah ditinjau;
3. routing bus besar dan kamera telah melalui validasi kelayakan yang sesuai;
4. ruang lingkup tahap pertama dan kriteria penerimaannya disetujui pemilik produk.

Hasil tinjauan harus berupa daftar `LULUS`, `BELUM LULUS`, atau `TERBLOKIR` beserta bukti dan penanggung jawab.


## Pembaruan riset Arab Saudi — 2026-10-29

- [ ] **Routing bus besar belum lulus.** Dokumentasi Google Large Vehicle Routing yang diperiksa tidak mencantumkan Arab Saudi dalam wilayah tersedia. Daftar cakupan HERE yang diperiksa juga belum membuktikan cakupan pembatasan truk untuk Saudi. Wajib ada konfirmasi tertulis vendor dan uji lapangan sebelum pemilihan.
- [ ] **Kepatuhan transportasi pendidikan belum lulus.** Konfirmasi jenis operator dan persyaratan terkini kepada TGA/MoE, termasuk lisensi dan perlengkapan teknis kendaraan.
- [ ] **Privasi/data belum lulus.** Tinjau PDPL serta pemrosesan data anak, lokasi, foto/video, retensi, hosting, dan akses lintas negara dengan pihak yang kompeten.
- [x] Kota pilot Dammam dan sekitarnya; target perencanaan awal sekitar 100 bus; kamera/DVR sudah terpasang. Metode integrasi live stream dibuat generik. Sumber GPS, vendor/protokol stream, dan kelayakan integrasi tetap belum diputuskan/terverifikasi.

Sumber riset dan batasan bukti dicatat di `docs/TECHNICAL_REVIEW_FINDINGS.md`. Ini bukan pendapat hukum dan belum merupakan verifikasi langsung dari vendor atau otoritas.


## Gerbang lanjutan: operasi Arab Saudi

- [x] Ruang lingkup produk diklarifikasi: penyedia aplikasi untuk sekolah, operator bus sekolah/pengemudi, dan orang tua/wali; sekolah dan operator dapat memakai aplikasi bersama atau masing-masing.
- [ ] Susun T&C yang mewajibkan pengguna/organisasi memiliki izin, kewenangan, dan hak yang diperlukan di wilayah operasinya; tinjau oleh penasihat hukum. T&C tidak otomatis menghapus kewajiban hukum penyedia aplikasi.
- [ ] Tentukan apakah onboarding hanya meminta pernyataan kewenangan atau juga meminta nomor/dokumen izin, serta proses perubahan/berakhirnya izin.
- [ ] Tetapkan batas akses sekolah/operator/pengemudi/wali dan pencabutan akses ketika penugasan atau kontrak berakhir.
- [ ] Jangan mengasumsikan integrasi dengan Noor.
- [ ] Konfirmasi persyaratan TGA/MoE terbaru untuk jenis operator, kendaraan, pengemudi, AVL, dan kamera. Gunakan sumber lama hanya sebagai petunjuk awal, bukan spesifikasi final.
- [ ] Tinjau keputusan TGA yang diterbitkan pada April 2026 terkait jadwal persyaratan uji kompetensi profesional pengemudi dan tentukan apakah relevan dengan model operasi.
- [ ] Buat inventaris aliran data PDPL sebelum memilih hosting atau vendor: tujuan, pengendali/pemroses, lokasi data, akses, retensi, penghapusan, dan transfer lintas negara.
- [ ] Routing bus besar: minta bukti tertulis dukungan batas kendaraan untuk kota pilot Saudi dan uji dengan skenario sintetis; navigasi umum tidak cukup sebagai bukti.
- [ ] Kamera/GPS: minta dokumentasi API/protokol, autentikasi, jumlah sesi bersamaan, lokasi pemrosesan data, serta pencabutan akses sebelum membeli perangkat.

Sumber pendukung dan batasan bukti dicatat di docs/TECHNICAL_REVIEW_FINDINGS.md. Belum ada provider atau arsitektur yang dipilih dan belum ada coding fitur bisnis.


## Pembaruan keputusan operasional — 2026-10-29

- [x] Model operasional awal dijawab: **sekolah dan perusahaan transportasi** (kedua pola perlu ditinjau).
- [x] Kota pilot Arab Saudi: **Dammam dan sekitarnya**.
- [ ] Petakan tanggung jawab dan batas akses untuk sekolah yang mengoperasikan bus sendiri versus sekolah yang memakai perusahaan transportasi.
- [ ] Tentukan apakah satu sekolah boleh memakai kedua model dan apakah satu perusahaan boleh melayani beberapa sekolah.
- [ ] Tentukan siapa yang bertanggung jawab atas lisensi, pengemudi, bus, rute, GPS/AVL, kamera/DVR atau aplikasi AV yang sudah ada, hubungan wali–siswa, dan respons insiden.
- [ ] Definisikan isolasi data dan izin jika perusahaan melayani lebih dari satu sekolah; jangan menganggap staf perusahaan otomatis dapat melihat seluruh data sekolah.
- [ ] Konfirmasi persyaratan perizinan terbaru untuk kedua pola dengan TGA/MoE atau penasihat Saudi yang kompeten.
- [ ] Untuk pilot Dammam dan sekitarnya, uji bukti cakupan routing bus besar, peta, GPS, dan integrasi stream kamera/AV.

**Bukti publik yang diperiksa:** pemberitahuan Asharqia Chamber 9 September 2026 tentang regulasi transportasi pendidikan TGA (https://www.chamber.org.sa/en/information-center/memos/memo-4997/); keputusan Umm Al-Qura 10 April 2026 mengenai jadwal tes kompetensi profesional pengemudi bus (https://www.uqn.gov.sa/decisions-and-regulations/authorities/4000704); portal layanan transportasi sekolah melalui Noor (https://my.gov.sa/en/services/18428); panduan PDPL SDAIA (https://dgp.sdaia.gov.sa/wps/portal/pdp/knowledgecenter/details/PDPLCP). Sumber-sumber ini tidak membuktikan API Noor, kepatuhan sistem, atau kelayakan provider tertentu.

**Gerbang coding tetap berlaku:** belum ada coding fitur bisnis, provider belum dipilih, dan tinjauan teknis belum dinyatakan lulus.


## Artefak operasional tambahan

- [ ] Tinjau dan isi `docs/OPERATING_MODEL_RESPONSIBILITY_MATRIX.md` bersama pemilik produk, perwakilan sekolah, dan calon operator transportasi.
- [ ] Jangan mengubah nilai TBD menjadi keputusan tanpa konfirmasi tertulis atau bukti yang relevan.
- [ ] Verifikasi tanggung jawab, pemisahan data multi-sekolah, pengelolaan akses, dan proses berakhirnya kontrak sebelum desain izin disetujui.

Status: dokumen pendukung dibuat; keputusan operasional belum final; tidak ada provider dipilih dan tidak ada coding fitur bisnis.


## Pembaruan ruang lingkup penyedia aplikasi — 2026-10-29

- [x] Pemilik produk menegaskan bahwa bisnis menyediakan aplikasi, bukan menjalankan layanan transportasi sekolah.
- [x] Pengguna meliputi sekolah, perusahaan/operator bus sekolah beserta pengemudinya, dan orang tua/wali.
- [x] Sekolah dan operator dapat memakai aplikasi secara bersama-sama atau masing-masing.
- [x] Prinsip produk: organisasi/pengguna wajib memiliki izin, kewenangan, dan hak yang diperlukan untuk kegiatan serta data yang mereka kelola; prinsip ini dicantumkan dalam T&C.
- [ ] T&C dan pemberitahuan privasi harus ditinjau oleh penasihat hukum yang kompeten. Jangan menyatakan bahwa T&C menghapus semua kewajiban penyedia aplikasi.
- [ ] Prosedur onboarding dan bukti kewenangan yang diminta masih belum diputuskan.
- [x] Kota pilot Dammam dan sekitarnya; target skala sekitar 100 bus; perangkat kamera/DVR sudah terpasang.
- [ ] Sumber GPS, jumlah pengguna bersamaan, dan metode teknis integrasi stream tetap belum diputuskan/terverifikasi.

Rincian dicatat dalam `docs/MASTER_SPEC.md`, `docs/OPERATING_MODEL_RESPONSIBILITY_MATRIX.md`, dan `docs/DECISIONS_LOG.md`.


## Pembaruan kontrak antarmuka kamera — 2026-10-29

- [x] Dibuat draf kontrak antarmuka generik untuk sumber live stream, meliputi perangkat/DVR langsung dan aplikasi/platform AV yang sudah ada jika menyediakan integrasi resmi.
- [x] Ditetapkan kebutuhan dokumentasi untuk autentikasi server-side, pembuatan dan masa berlaku sesi, refresh, pencabutan, status offline, kapasitas, audit, keamanan rahasia, biaya, dan lokasi pemrosesan data.
- [x] Ditetapkan uji penerimaan untuk akses tanpa izin, relasi wali dicabut, status anak turun, token kedaluwarsa, sumber offline, dan skenario beban.
- [ ] Belum ada inventaris perangkat/platform AV aktual atau bukti kompatibilitas vendor.
- [ ] Belum ada uji perangkat, uji pencabutan sesi, pengukuran konkurensi, atau estimasi biaya yang diverifikasi.
- [ ] Belum ada vendor, protokol, atau arsitektur relay yang dipilih.

Lihat `docs/GENERIC_CAMERA_STREAMING_INTERFACE.md`. Status pekerjaan ini adalah **dokumentasi selesai untuk ditinjau; validasi teknis belum dilakukan**. Jangan mulai implementasi produksi hanya berdasarkan draf ini.


## Prioritas pelaksanaan yang diklarifikasi — 2026-10-29

**Fokus utama aplikasi: navigasi operasional bus dan informasi/laporan orang tua. Kamera live adalah fitur tambahan yang dapat dikonfigurasi kemudian dan tidak boleh menjadi prasyarat pengembangan atau pengujian alur inti.**

Urutan kerja yang disarankan:
1. **Navigasi dan perjalanan:** model perjalanan, penugasan, rute/versi rute, urutan stop, validasi GPS, status jemput/turun, penanganan data lokasi usang/offline, dan perilaku saat rute tidak aman.
2. **Informasi dan laporan wali:** status anak, lokasi bus beserta waktu pembaruan, riwayat keikutsertaan, laporan yang mudah dipahami, pembatasan akses per relasi wali, dan ekspor terbatas.
3. **Administrasi, akses, dan audit:** master data, isolasi organisasi, persetujuan relasi wali, koreksi dan audit.
4. **Kamera live:** fitur tambahan; evaluasi integrasi dan pencabutan akses tidak boleh mendahului atau menghambat validasi prioritas inti.

Gerbang teknis untuk navigasi tetap penting: bukti cakupan routing yang sesuai untuk bus di Dammam dan sekitarnya, profil kendaraan yang dibutuhkan, kualitas data jalan, kestabilan urutan stop, dan pengujian GPS. Jangan menyatakan routing bus besar lulus sebelum dibuktikan.

Untuk laporan orang tua, prioritaskan konsistensi data sumber, status yang tidak menyesatkan ketika GPS usang/offline, batas akses antarwali/antarsiswa, serta riwayat dan koreksi yang dapat diaudit.

Status kamera tetap **BELUM TERVERIFIKASI** secara teknis, tetapi bukan penghambat untuk menyusun dan memvalidasi alur inti navigasi serta laporan.
