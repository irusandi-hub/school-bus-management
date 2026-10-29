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

## 3. Lingkup awal
Termasuk: login dan peran; data sekolah/siswa/wali/bus/pengemudi; persetujuan relasi wali; penugasan; perjalanan pagi dan sore terpisah; rute default yang disetujui; validasi GPS; lokasi bus dengan indikator kedaluwarsa; akses kamera live; riwayat keikutsertaan; laporan/ekspor terbatas; audit dan status integrasi.

Bukan kebutuhan awal kecuali disetujui kemudian: notifikasi rutin SMS/WhatsApp, push notification sebagai ketergantungan wajib, penagihan/pembayaran, playback atau unduh rekaman kamera, dan pengubahan otomatis urutan stop selama perjalanan aktif.

## 4. Akun dan relasi wali
- Nomor HP dapat digunakan untuk verifikasi/keamanan, bukan notifikasi rutin.
- Verifikasi nomor saja tidak membuktikan seseorang adalah wali.
- Relasi siswa–wali harus disetujui melalui prosedur admin.
- Satu wali dapat terhubung ke banyak siswa dan satu siswa dapat memiliki banyak wali, jika relasi masing-masing disetujui.
- Perubahan nomor atau pencabutan relasi harus menghentikan akses lama sesuai kebijakan.
- Terapkan batas percobaan OTP, masa berlaku, pemulihan akun, audit, dan pemeriksaan akses pada setiap permintaan sensitif.

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

## 9. Kamera live
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
