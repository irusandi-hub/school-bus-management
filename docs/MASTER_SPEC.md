# MASTER SPECIFICATION
## Aplikasi Manajemen Transportasi Bus Sekolah

**Versi:** 0.1 — draf induk kebutuhan  
**Status:** Draf kebutuhan produk; belum menjadi spesifikasi teknis final.

## 1. Prinsip
Jangan mulai coding berdasarkan asumsi. Tandai hal yang belum diputuskan sebagai `BELUM DIPUTUSKAN` dan kemampuan eksternal yang belum dibuktikan sebagai `BELUM TERVERIFIKASI`. Keselamatan anak, privasi, auditabilitas, dan bukti pengujian lebih penting daripada sekadar kecepatan.

## 2. Peran
- **Admin Pusat:** mengelola data induk, sekolah, siswa, wali, bus, pengemudi, jadwal, penugasan, titik jemput, kamera, perjalanan, rute, laporan, koreksi dan audit.
- **Pengemudi:** melihat penugasan sendiri, memulai/menutup sesi kerja, melihat siswa yang ditugaskan, mengikuti rute disetujui, mengonfirmasi status siswa, melaporkan kesalahan, mengakses kamera selama tugas aktif, dan memeriksa kabin sebelum menutup sesi.
- **Orang Tua/Wali:** hanya melihat anak yang relasinya telah disetujui, status perjalanan, lokasi bus dan waktu pembaruan, kamera live saat anak dikonfirmasi berada di bus dan akses sah, serta riwayat anak sendiri.

Semua peran login masing-masing. Otorisasi harus ditegakkan di server dan database, bukan hanya dengan menyembunyikan menu.

## 3. Prioritas produk dan lingkup awal

**Prioritas utama versi awal adalah navigasi operasional bus sekolah dan informasi/laporan untuk orang tua.** Kamera live merupakan fitur tambahan yang dapat diaktifkan atau dikonfigurasi pada tahap berikutnya; integrasi kamera tidak boleh menjadi prasyarat untuk menyelesaikan alur inti.

Urutan prioritas:
1. **Navigasi dan operasional perjalanan:** penugasan, perjalanan pagi/sore, rute yang disetujui, urutan stop, validasi GPS, status jemput/turun, penanganan GPS usang/offline, dan konsistensi rute aktif.
2. **Informasi dan laporan orang tua:** status anak, lokasi bus dengan waktu pembaruan yang jelas, riwayat keikutsertaan, laporan yang mudah dipahami, serta ekspor terbatas sesuai hak akses.
3. **Administrasi dan pengawasan:** pengelolaan sekolah, siswa, wali, bus, pengemudi, penugasan, koreksi data, audit, dan pemisahan akses antarorganisasi.
4. **Fitur tambahan:** live stream kamera, yang dapat diaktifkan setelah kebutuhan inti berjalan dan kompatibilitas/izin integrasinya dipastikan.

Lingkup dasar mencakup login dan peran; data sekolah/siswa/wali/bus/pengemudi; persetujuan relasi wali; penugasan; perjalanan pagi dan sore terpisah; rute default yang disetujui; validasi GPS; lokasi bus dengan indikator kedaluwarsa; riwayat keikutsertaan; laporan/ekspor terbatas; audit dan status integrasi. Kamera live dicatat sebagai kemampuan tambahan, bukan gerbang peluncuran fitur inti.

Bukan kebutuhan awal kecuali disetujui kemudian: notifikasi rutin SMS/WhatsApp, push notification sebagai ketergantungan wajib, penagihan/pembayaran, playback atau unduh rekaman kamera, dan pengubahan otomatis urutan stop selama perjalanan aktif.

## 4. Akun, email, dan relasi orang tua/wali
- Email orang tua/wali harus didaftarkan oleh Admin Pusat dan disimpan di database sebelum proses signup. Signup hanya dapat dimulai dengan email yang telah terdaftar; sistem mengirim tautan verifikasi ke alamat tersebut. Setelah verifikasi, pengguna membuat kata sandi dan masuk menggunakan email serta kata sandi.
- Nomor Admissions Number adalah identitas siswa, bukan username atau kredensial login.
- Satu siswa hanya boleh memiliki satu relasi akun orang tua/wali aktif. Satu akun orang tua/wali dapat terhubung ke satu atau beberapa siswa. Tidak ada jenis akun khusus “akun keluarga”; jumlah kartu siswa yang ditampilkan mengikuti relasi yang sah.
- Signup mensyaratkan email terdaftar yang terhubung dengan setidaknya satu siswa berstatus layanan aktif. Sign-in juga hanya diizinkan jika akun memiliki setidaknya satu siswa berstatus layanan aktif.
- Status layanan siswa terpisah dari status kehadiran/perjalanan dan status GPS. Jika salah satu siswa nonaktif tetapi masih ada siswa lain yang aktif, akun tetap dapat digunakan hanya untuk siswa aktif. Jika semua siswa terkait nonaktif, akun tidak dapat mengakses layanan siswa.
- Menonaktifkan layanan siswa tidak menghapus data historis, relasi, atau catatan perjalanan secara otomatis. Perubahan status dan alasan yang diwajibkan harus dapat diaudit.
- Email digunakan untuk login; nomor telepon adalah informasi kontak dan bukan pengganti email atau Admissions Number.
- Perubahan email, pencabutan relasi, dan penonaktifan layanan harus memperbarui akses di server/database, bukan hanya menyembunyikan UI.
- Terapkan pembatasan percobaan, token verifikasi sekali pakai yang kedaluwarsa, pemulihan akun, audit, dan pemeriksaan akses pada setiap permintaan sensitif. Pesan signup tidak boleh mengungkap apakah email atau nomor Admissions Number milik orang lain terdaftar.

## 5. Master data konseptual
Sekolah; Siswa; Orang tua/wali; Relasi siswa–wali; Titik jemput; Bus (kapasitas, dimensi, tinggi, berat, profil akses); Pengemudi; Penugasan; Rute dan versi rute; Perjalanan; Stop perjalanan; Status siswa-perjalanan; Data lokasi bus; Perangkat kamera; Sesi kamera/izin akses; Riwayat keikutsertaan; Rekap penggunaan; Laporan/ekspor; Log audit; Status integrasi. Ini daftar kebutuhan, bukan skema SQL final.

## 6. Status perjalanan dan riwayat
- Perjalanan pagi dan sore berdiri sendiri.
- Siswa tetap ada di master data walaupun tidak ikut pada perjalanan tertentu.
- Keikutsertaan yang dikonfirmasi dihitung; “tidak ikut” tidak dihitung; “belum dikonfirmasi” dikecualikan dari hitungan final.
- “Tidak masuk sekolah” berbeda dari “tidak menggunakan bus”.
- Riwayat operasional disimpan sejak versi pertama. Rekap penggunaan dan kemungkinan tagihan masa depan harus dipisahkan. Aturan tagihan untuk perjalanan batal belum diputuskan.
- Admin dapat melihat/mengekspor sesuai kewenangan. Wali hanya dapat mengakses riwayat anak yang berhak dilihat.
- Laporan PDF harus mudah dibaca; CSV untuk data tabular. Berbagi memakai fitur berbagi perangkat atau tautan aman yang kedaluwarsa, bukan tautan publik permanen.
- Koreksi historis wajib menyimpan pelaksana, waktu, alasan, dan nilai sebelum/sesudah bila relevan.

## 7. Rute dan bus besar
- Rute default dihitung saat data awal atau data relevan berubah, bukan saat pengemudi menekan Mulai.
- Admin meninjau dan menyetujui versi rute, urutan stop, jalur jalan, estimasi waktu/jarak, profil kendaraan, waktu kalkulasi, dan status persetujuan.
- Pengemudi memuat rute yang disimpan saat mulai. Tidak ada optimasi ulang atau perubahan urutan otomatis saat mulai.
- Harus diuji untuk 20/30/40+ stop serta pembatasan kendaraan berat, tinggi/berat/dimensi, jalan satu arah, larangan belok, U-turn, penutupan jalan, tempat berhenti aman, dan lalu lintas jika tersedia.
- Jangan mengklaim penyedia mendukung kendala bus besar sebelum diverifikasi dengan bukti.
- Stop siswa yang tidak ikut dilewati tanpa mengurutkan ulang stop lainnya.
- Penutupan jalan boleh menghitung ulang jalur di antara stop tetapi tidak mengubah urutan stop. Jika tidak ada jalur aman, beri peringatan.
- Perubahan data membuat versi rute untuk perjalanan berikutnya; jangan mengubah rute aktif diam-diam.
- Koordinat berdekatan sekitar 5–10 m hanya memunculkan saran titik jemput bersama; admin harus menyetujui. Identitas dan konfirmasi siswa tetap terpisah.

## 8. GPS dan validasi jemput/turun
- Koordinat tersimpan menjadi acuan.
- Radius awal 100 m; validasi juga memeriksa akurasi dan kesegaran GPS.
- Di luar radius, GPS tidak akurat, kedaluwarsa, atau tidak tersedia berarti konfirmasi normal tidak sah.
- Admin dapat menyetujui titik alternatif. Pengecualian darurat harus berwenang dan diaudit.
- Simpan lokasi, waktu, akurasi, jarak, hasil validasi, aktor, siswa, dan perjalanan sesuai kebutuhan.
- Wali harus melihat status kedaluwarsa/tidak tersedia saat data lokasi usang atau perangkat offline.

## 9. Fitur tambahan: kamera live
Kamera bukan fungsi inti yang harus selesai sebelum navigasi dan laporan orang tua dapat digunakan. Kemampuan ini dapat dikonfigurasi/diaktifkan pada tahap berikutnya sesuai prioritas produk dan kesiapan teknis.

- Kamera dan DVR sudah terpasang secara mandiri pada bus. Aplikasi hanya menyediakan akses ke live stream; pengadaan, pemasangan, atau pengelolaan fisik perangkat bukan lingkup aplikasi awal. Jalur integrasi dibuat generik dan belum mengunci merek/protokol: stream dapat berasal langsung dari perangkat/DVR atau diteruskan melalui aplikasi/platform AV yang sudah terpasang, selama tersedia integrasi resmi/terotorisasi dan kontrol akses memadai. Tidak termasuk playback atau unduh rekaman.
- Pengemudi dapat mengakses kamera selama sesi kerja aktif.
- Wali hanya dapat mengakses stream selama anak tertentu telah dikonfirmasi berada di bus dan izin masih berlaku. Akses berakhir saat anak turun atau izin dicabut, meskipun bus masih membawa siswa lain.
- Server harus mengautentikasi dan mengotorisasi setiap akses. Tautan lama tidak boleh melewati autentikasi. Hentikan/cabut stream jika didukung dan tampilkan status offline.
- Inventaris perangkat kamera/DVR dan aplikasi/platform AV yang sudah terpasang, cara stream diekspos, API/protokol yang tersedia, autentikasi, hak integrasi, kapasitas akses bersamaan, biaya/batas, serta mekanisme pencabutan masih harus diverifikasi. Jangan menganggap perangkat atau aplikasi AV kompatibel sebelum dibuktikan.

## 10. Sesi kerja dan pemeriksaan kabin
Sesi kerja pengemudi berbeda dari sesi perjalanan anak. Sebelum menutup tugas, pengemudi harus memeriksa kabin secara fisik. Jika ada siswa yang masih tercatat di bus atau statusnya belum jelas, sistem memperingatkan dan menahan penutupan normal sesuai kebijakan. Catat pelaksana, waktu, dan hasil pemeriksaan.

## 11. Keamanan dan privasi
Data anak, kontak wali, dan lokasi harus dibatasi berdasarkan kebutuhan. Terapkan hak akses minimum, otorisasi server/database, audit tindakan admin dan ekspor, sesi yang dapat dicabut, tautan kedaluwarsa, retensi sesuai hukum, backup dan uji pemulihan. Jangan menggunakan data produksi nyata untuk pengujian tanpa izin dan perlindungan.

## 12. Kriteria penerimaan awal
- Pengemudi tidak dapat mengubah nomor wali; permintaan ditolak server.
- Wali tidak dapat membuka data anak lain, termasuk melalui akses API langsung.
- Perjalanan pagi/sore independen; siswa yang tidak ikut tetap ada di master.
- Status belum dikonfirmasi tidak masuk hitungan final.
- GPS di luar radius, usang, tidak akurat, atau offline tidak lolos validasi normal.
- Saat anak turun, akses kamera wali anak tersebut dicabut tanpa otomatis mencabut akses wali lain yang sah.
- Kamera/GPS offline terlihat jelas.
- Setiap penolakan, kegagalan validasi, akses ditolak, tindakan yang tidak tersedia, atau proses yang gagal memberi pesan jelas, ringkas, akurat, dan—bila memungkinkan—langkah berikutnya. Tidak boleh ada tombol nonaktif atau kegagalan senyap tanpa penjelasan.
- Pesan pengguna tidak membocorkan data anak, keberadaan akun orang lain, rahasia, atau detail internal server; penyebab yang belum diketahui tidak boleh ditebak.
- Rute yang tidak layak untuk bus besar memberi peringatan; stop yang dilewati tidak mengubah urutan.
- Perubahan data membuat versi rute baru untuk perjalanan mendatang, bukan mengubah rute aktif diam-diam.
- Penutupan sesi memeriksa status siswa dan pemeriksaan kabin.
- Ekspor wali hanya berisi data anak yang berhak diakses; koreksi historis diaudit.
- Uji tambahan mencakup relasi wali dicabut, perubahan nomor, kegagalan OTP, akses kamera bersamaan, pergantian bus/pengemudi, perjalanan batal, dan akses API tanpa izin.

## 13. Hal yang belum diputuskan atau harus diverifikasi
- Apakah ada aplikasi/database lama yang harus dipertahankan.
- Platform final (admin web, aplikasi pengemudi, portal wali), metode login, pemulihan akun, dan kebutuhan offline.
- Wilayah operasi awal: Arab Saudi; kota pilot disetujui Dammam dan sekitarnya. Kewajiban hukum spesifik terkait anak, lokasi, kamera, serta transportasi tetap perlu ditinjau.
- Skala target awal: pelayanan sekitar 100 bus. Jumlah sekolah, siswa, pengemudi, pengguna bersamaan, dan pola penugasan masih harus ditentukan.
- Prosedur pembuktian relasi wali dan definisi final semua status.
- Inventaris model/firmware kamera-DVR yang sudah terpasang, protokol streaming, metode autentikasi dan pencabutan; sumber GPS/AVL dan interval pembaruan.
- Penyedia peta/routing yang benar-benar mendukung bus besar.
- Aturan perjalanan batal, keadaan darurat, pergantian kendaraan, dan status siswa belum jelas.
- Model tarif masa depan, retensi, backup, format laporan, hosting, database, monitoring, dan proses rilis.

## 14. Gerbang sebelum implementasi
Sebelum coding fitur bisnis: jawab atau mitigasi pertanyaan kritis keselamatan/privasi/integrasi; tinjau rancangan data dan hak akses; validasi routing bus besar dan kamera; serta setujui lingkup tahap pertama dan kriteria penerimaan. Tahapan yang disarankan: audit/inventarisasi → finalisasi kebutuhan → validasi teknis → rancangan → fondasi akses/master data/audit → operasional perjalanan/GPS/rute → portal wali/riwayat/kamera → QA/uji lapangan → rilis bertahap.

## 15. Aturan Agen AI
Agen harus mengaudit repository, database, dan integrasi sebelum menyimpulkan; bekerja sesuai lingkup; tidak mengarang fakta/hasil tes; menandai hal yang belum diketahui; tidak melakukan tindakan destruktif, migrasi produksi, merge atau deployment tanpa izin; dan melaporkan file yang berubah, perintah tes serta hasil aktual, keterbatasan, risiko, dan tindak lanjut.

Status yang digunakan: `BELUM DIPUTUSKAN`, `BELUM TERVERIFIKASI`, `BELUM DIKERJAKAN`, `SEDANG DIKERJAKAN`, `SELESAI DAN LULUS TES`, `TERIMPLEMENTASI TETAPI BELUM TERVERIFIKASI`, `TERBLOKIR`.


## 16. Model produk: penyedia aplikasi

Produk ini adalah **aplikasi untuk mendukung operasional**, bukan penyedia layanan transportasi sekolah. Pengguna utamanya:
- Sekolah;
- Perusahaan/operator bus sekolah dan pengemudinya;
- Orang tua/wali siswa.

Sekolah dan operator dapat memakai aplikasi bersama-sama atau secara terpisah sesuai model operasional yang sah. Aplikasi harus mendukung pembatasan akses sesuai organisasi, hubungan kerja, penugasan, dan tujuan penggunaan; keanggotaan pada satu organisasi tidak otomatis memberikan akses ke organisasi lain.

### Kewenangan dan izin pengguna

Pihak yang menggunakan aplikasi untuk menjalankan kegiatan operasional wajib memiliki izin, kewenangan, dan hak yang diperlukan serta mematuhi peraturan yang berlaku di wilayah operasinya. Prinsip ini harus dinyatakan dengan jelas dalam Terms & Conditions. Organisasi pengguna juga bertanggung jawab untuk memastikan bahwa data yang dimasukkan atau dibagikan memang boleh diproses untuk tujuan tersebut.

T&C harus menjelaskan bahwa aplikasi tidak menggantikan izin atau kewenangan operasional. Organisasi perlu memberi tahu jika kewenangan, izin, kontrak, atau hak akses yang relevan berubah atau berakhir. Prosedur onboarding, bukti izin yang diminta (jika ada), penangguhan, dan pencabutan akses masih BELUM DIPUTUSKAN.

Ketentuan kontrak tidak otomatis menghapus kewajiban hukum yang mungkin melekat pada penyedia aplikasi. T&C dan pemberitahuan privasi harus ditinjau oleh penasihat hukum yang kompeten untuk wilayah peluncuran; spesifikasi ini bukan pendapat hukum.

### Batas tanggung jawab

Pihak sekolah/operator bertanggung jawab atas kegiatan yang dijalankan dan keputusan operasional yang menjadi kewenangannya, termasuk memastikan izin serta penugasan yang sah. Penyedia aplikasi menyediakan fungsi perangkat lunak dan kontrol teknis sesuai lingkup produk, serta memenuhi kewajiban yang berlaku bagi penyedia aplikasi. Pembagian tanggung jawab yang tepat harus diselaraskan dengan hukum, kontrak, dan peran aktual setiap pihak; tidak boleh ditentukan sepihak hanya dengan kalimat umum di T&C.

Lihat juga `docs/OPERATING_MODEL_RESPONSIBILITY_MATRIX.md` dan `docs/DECISIONS_LOG.md`.


## 17. Kontrak integrasi live stream kamera

Persyaratan umum integrasi kamera, terlepas dari vendor atau metode koneksi, dicatat dalam `docs/GENERIC_CAMERA_STREAMING_INTERFACE.md`. Dokumen tersebut adalah draf kontrak kemampuan dan uji penerimaan, bukan jaminan kompatibilitas atau keputusan memilih vendor/protokol.

Sumber potensial meliputi perangkat/DVR langsung atau aplikasi/platform AV yang sudah terpasang, hanya jika metode integrasi resmi dan terotorisasi tersedia. Backend harus mengendalikan otorisasi, sesi stream, kedaluwarsa, dan pencabutan akses. URL publik permanen dan penyimpanan kredensial sumber di klien tidak diterima sebagai pola aman.

Sebelum implementasi, inventaris perangkat/platform aktual dan buktikan autentikasi, kemampuan pencabutan, dukungan klien, batas stream bersamaan, biaya, serta lokasi pemrosesan data. Target sekitar 100 bus bukan asumsi 100 stream simultan.


## 18. Prinsip tahapan produk

Navigasi operasional dan laporan orang tua menjadi fokus utama. Pekerjaan kamera live harus diperlakukan sebagai fitur tambahan dan tidak boleh mengambil alih prioritas desain, validasi, maupun implementasi inti.

Sebelum menilai produk inti siap diuji, prioritaskan pembuktian:
- rute dan urutan stop yang disetujui dapat digunakan pengemudi dengan aman;
- status jemput/turun dan riwayat keikutsertaan tercatat konsisten;
- lokasi bus menampilkan waktu pembaruan dan kondisi data usang/offline secara jujur;
- orang tua hanya melihat anak yang relasinya disetujui, status perjalanan yang relevan, dan laporan anak yang berhak diakses;
- laporan mudah dipahami, dapat ditelusuri ke data operasional, dan koreksinya diaudit.

Kamera live dapat direncanakan setelah alur inti stabil. Kontrak antarmuka kamera tetap tersedia sebagai dokumentasi pendukung, bukan indikator bahwa kamera adalah prioritas pertama.


## 19. Spesifikasi alur inti navigasi dan laporan orang tua

Alur operasional dan kriteria penerimaan terperinci ada di `docs/CORE_WORKFLOWS_NAVIGATION_AND_PARENT_REPORTS.md`. Dokumen ini menjadi rujukan kerja untuk alur sebelum perjalanan, navigasi dan status selama perjalanan, lokasi bus beserta kesegaran data, tampilan wali, riwayat, laporan, pengecualian, dan QA.

Dokumen alur inti memprioritaskan navigasi dan laporan orang tua. Kamera live adalah fitur tambahan dan tidak menjadi gerbang penyelesaian atau pengujian alur inti. Routing bus besar dan sumber GPS tetap harus dibuktikan secara teknis; dokumen kebutuhan tidak berarti provider sudah dipilih atau dinyatakan lulus.


## 20. Standar pesan penolakan dan kegagalan

Setiap kondisi penolakan atau kegagalan di seluruh peran dan fitur wajib memberikan informasi yang jelas, ringkas, akurat, dan relevan dengan tindakan yang sedang dilakukan. Berlaku untuk autentikasi, formulir, CRUD, validasi data, otorisasi, penugasan, perjalanan, GPS, kamera/video, ekspor, dan operasi sistem.

- Jelaskan apa yang tidak dapat dilakukan dan alasan yang aman untuk diungkapkan.
- Berikan langkah berikutnya bila pengguna dapat menyelesaikan masalah, misalnya melengkapi data, mencoba kembali, atau menghubungi Admin Pusat.
- Tombol yang dinonaktifkan harus disertai alasan yang dapat dipahami; kegagalan tidak boleh hanya ditunjukkan dengan layar kosong, indikator berputar tanpa akhir, atau perubahan yang tidak terjadi.
- Gunakan pesan umum yang aman bila rincian dapat membocorkan keberadaan akun, data siswa, atau izin pengguna lain. Jangan mengungkap rahasia, token, stack trace, kredensial, atau detail internal server.
- Bila penyebab belum diketahui, nyatakan bahwa permintaan belum berhasil dan berikan langkah pemulihan yang aman; jangan mengarang penyebab.
- Detail teknis yang dibutuhkan untuk investigasi dicatat pada log internal yang terlindungi dan tidak menyalin rahasia atau data pribadi secara tidak perlu.
- QA harus menguji pesan pada setiap jalur penolakan dan kegagalan, termasuk kegagalan jaringan/server, validasi, sesi kedaluwarsa, akses tanpa izin, siswa nonaktif, GPS usang/offline, dan kamera tidak tersedia.
