# Tinjauan Spesifikasi Teknis — Checklist

**Status:** BELUM DIPUTUSKAN / BELUM TERVERIFIKASI  
**Tujuan:** Menentukan apakah spesifikasi cukup matang untuk menyusun arsitektur teknis. Ini bukan persetujuan untuk mulai coding.

## A. Kondisi proyek
- [ ] Dipastikan apakah proyek dimulai dari nol atau ada aplikasi/repository/database yang harus dipertahankan.
- [ ] Pemilik produk dan pihak yang berwenang menyetujui perubahan ditentukan.
- [ ] Wilayah operasi sudah ditetapkan: Arab Saudi. Tinjauan kewajiban hukum terkait anak, lokasi, kamera, transportasi sekolah, hosting, dan retensi masih harus dilakukan.
- [ ] Skala awal masih BELUM DIPUTUSKAN: jumlah sekolah, siswa, bus, pengemudi, perjalanan, dan stop maksimum.

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

## F. Kamera live
- [ ] Kamera/DVR masih BELUM DIPUTUSKAN; perangkat kandidat, protokol, autentikasi, kapasitas stream, dan pencabutan akses belum diverifikasi.
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

- Wilayah operasi: Arab Saudi; kota pilot dan model operator masih perlu ditentukan.
- Kondisi awal: proyek baru dari nol.
- Platform: Admin Pusat, Pengemudi, dan Wali membutuhkan web serta mobile; cakupan fitur dan OS belum dirinci.
- Skala awal, kamera/DVR, dan sumber GPS tetap BELUM DIPUTUSKAN.
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
- [ ] Kota pilot, model operator, skala awal, kandidat kamera/DVR, dan sumber GPS tetap belum diputuskan.

Sumber riset dan batasan bukti dicatat di `docs/TECHNICAL_REVIEW_FINDINGS.md`. Ini bukan pendapat hukum dan belum merupakan verifikasi langsung dari vendor atau otoritas.


## Gerbang lanjutan: operasi Arab Saudi

- [ ] Konfirmasi apakah sistem menjadi sistem internal sekolah, operator transportasi berizin, atau layanan tambahan; jangan mengasumsikan integrasi dengan Noor.
- [ ] Konfirmasi persyaratan TGA/MoE terbaru untuk jenis operator, kendaraan, pengemudi, AVL, dan kamera. Gunakan sumber lama hanya sebagai petunjuk awal, bukan spesifikasi final.
- [ ] Tinjau keputusan TGA yang diterbitkan pada April 2026 terkait jadwal persyaratan uji kompetensi profesional pengemudi dan tentukan apakah relevan dengan model operasi.
- [ ] Buat inventaris aliran data PDPL sebelum memilih hosting atau vendor: tujuan, pengendali/pemroses, lokasi data, akses, retensi, penghapusan, dan transfer lintas negara.
- [ ] Routing bus besar: minta bukti tertulis dukungan batas kendaraan untuk kota pilot Saudi dan uji dengan skenario sintetis; navigasi umum tidak cukup sebagai bukti.
- [ ] Kamera/GPS: minta dokumentasi API/protokol, autentikasi, jumlah sesi bersamaan, lokasi pemrosesan data, serta pencabutan akses sebelum membeli perangkat.

Sumber pendukung dan batasan bukti dicatat di docs/TECHNICAL_REVIEW_FINDINGS.md. Belum ada provider atau arsitektur yang dipilih dan belum ada coding fitur bisnis.


## Pembaruan keputusan operasional — 2026-10-29

- [x] Model operasional awal dijawab: **sekolah dan perusahaan transportasi** (kedua pola perlu ditinjau).
- [ ] Kota pilot Arab Saudi: **BELUM DIPUTUSKAN**.
- [ ] Petakan tanggung jawab dan batas akses untuk sekolah yang mengoperasikan bus sendiri versus sekolah yang memakai perusahaan transportasi.
- [ ] Tentukan apakah satu sekolah boleh memakai kedua model dan apakah satu perusahaan boleh melayani beberapa sekolah.
- [ ] Tentukan siapa yang bertanggung jawab atas lisensi, pengemudi, bus, rute, GPS/AVL, kamera/DVR, hubungan wali–siswa, dan respons insiden.
- [ ] Definisikan isolasi data dan izin jika perusahaan melayani lebih dari satu sekolah; jangan menganggap staf perusahaan otomatis dapat melihat seluruh data sekolah.
- [ ] Konfirmasi persyaratan perizinan terbaru untuk kedua pola dengan TGA/MoE atau penasihat Saudi yang kompeten.
- [ ] Setelah kota pilot dipilih, uji bukti cakupan routing bus besar, peta, GPS, dan kamera/AVL di kota tersebut.

**Bukti publik yang diperiksa:** pemberitahuan Asharqia Chamber 9 September 2026 tentang regulasi transportasi pendidikan TGA (https://www.chamber.org.sa/en/information-center/memos/memo-4997/); keputusan Umm Al-Qura 10 April 2026 mengenai jadwal tes kompetensi profesional pengemudi bus (https://www.uqn.gov.sa/decisions-and-regulations/authorities/4000704); portal layanan transportasi sekolah melalui Noor (https://my.gov.sa/en/services/18428); panduan PDPL SDAIA (https://dgp.sdaia.gov.sa/wps/portal/pdp/knowledgecenter/details/PDPLCP). Sumber-sumber ini tidak membuktikan API Noor, kepatuhan sistem, atau kelayakan provider tertentu.

**Gerbang coding tetap berlaku:** belum ada coding fitur bisnis, provider belum dipilih, dan tinjauan teknis belum dinyatakan lulus.
