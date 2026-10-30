# Matriks Tanggung Jawab Model Operasional

**Status:** Draf yang diperbarui berdasarkan klarifikasi pemilik produk  
**Wilayah:** Arab Saudi (wilayah lain dapat mengikuti aturan lokal yang berlaku)  
**Model yang harus didukung:** sekolah mengoperasikan bus sendiri dan/atau memakai perusahaan transportasi  
**Kota pilot:** Dammam dan sekitarnya  
**Batas:** dokumentasi dan analisis saja; tidak ada coding fitur bisnis atau pemilihan provider.

## 1. Klarifikasi ruang lingkup yang disetujui

Pemilik produk mengonfirmasi bahwa proyek ini adalah **penyedia aplikasi**, bukan operator layanan transportasi sekolah. Pengguna aplikasi adalah:
- **Sekolah**;
- **Perusahaan/operator bus sekolah beserta pengemudinya**;
- **Orang tua/wali siswa**.

Sekolah dan operator dapat menggunakan aplikasi secara bersama-sama atau masing-masing, sesuai model operasional mereka. Otoritas, izin, dan kewenangan menjalankan kegiatan transportasi melekat pada pihak yang menjalankan kegiatan tersebut, bukan otomatis pada penyedia aplikasi.

Aplikasi perlu menjelaskan kewajiban pengguna/organisasi dalam **Syarat dan Ketentuan (Terms & Conditions)**: pihak yang mendaftar dan menggunakan aplikasi menyatakan bahwa mereka memiliki izin, kewenangan, dan hak yang diperlukan untuk kegiatan serta data yang mereka kelola, dan wajib mematuhi aturan yang berlaku di wilayah operasinya. Status izin dapat perlu diperbarui jika berubah.

**Batas penting:** klausul kontrak adalah bagian dari tata kelola produk, tetapi tidak otomatis menghapus kewajiban hukum penyedia aplikasi sendiri. Rumusan final T&C, privasi, pembagian peran pemrosesan data, dan kewajiban yang tidak dapat dialihkan perlu ditinjau oleh penasihat hukum yang memahami wilayah operasi. Dokumen ini bukan pendapat hukum dan tidak menyimpulkan bahwa satu klausul sudah cukup untuk memenuhi seluruh hukum yang berlaku.

## 2. Model penggunaan yang perlu didukung

- **Model A — Sekolah menggunakan aplikasi secara mandiri:** sekolah mengelola kegiatan dan data yang menjadi kewenangannya. Status lisensi/kewenangan sekolah atau pihak terkait harus sesuai dengan kegiatan nyata.
- **Model B — Operator transportasi menggunakan aplikasi:** operator mengelola tugas yang menjadi tanggung jawabnya dan mengakses data yang diperlukan untuk penugasan yang sah.
- **Model C — Sekolah dan operator menggunakan aplikasi bersama:** akses kedua pihak dihubungkan melalui organisasi, kontrak/penugasan, dan cakupan kerja yang jelas. Jangan memberikan akses lintas sekolah hanya karena operator yang sama melayani lebih dari satu pihak.

Ketiga model di atas adalah pola penggunaan aplikasi, bukan pernyataan bahwa semua bentuk operasi diizinkan oleh peraturan. Pihak pengguna bertanggung jawab memastikan model operasinya sah.

## 3. Batas tanggung jawab secara konseptual

| Area | Tanggung jawab pengguna/organisasi | Peran penyedia aplikasi |
|---|---|---|
| Izin dan kewenangan operasional | Sekolah/operator memastikan izin dan kewenangan yang diperlukan untuk kegiatan, bus, pengemudi, dan operasi mereka | Menyediakan T&C yang jelas dan mekanisme akun/organisasi; tidak menyatakan bahwa penggunaan aplikasi menggantikan izin |
| Kebenaran data yang dimasukkan | Organisasi pengguna memastikan data yang dimasukkan akurat dan berhak diproses | Menyediakan kontrol akses, audit perubahan, dan mekanisme koreksi yang sesuai |
| Penugasan pengemudi/bus dan operasional perjalanan | Pihak yang menjalankan operasi menetapkan dan mengawasi penugasan | Menyediakan fitur sesuai ruang lingkup yang disepakati; tidak mengambil alih keputusan operasional pengguna |
| Persetujuan rute dan keselamatan lapangan | Pihak operasional yang berwenang meninjau dan menyetujui rute serta tindakan lapangan | Menyajikan rute/peringatan dengan batasan yang jelas; tidak menjanjikan bahwa hasil algoritme menjamin keselamatan atau kepatuhan |
| GPS/AVL dan kamera/DVR | Pihak yang mengadakan/mengoperasikan perangkat memastikan penggunaan dan aksesnya memiliki dasar serta kewenangan | Menyediakan kontrol teknis aplikasi sesuai kemampuan integrasi yang terbukti; tidak mengklaim akses perangkat yang belum diverifikasi |
| Data siswa, wali, lokasi, dan video | Peran dan dasar pemrosesan ditetapkan berdasarkan hubungan nyata, kontrak, dan hukum yang berlaku | Menyediakan perlindungan teknis dan informasi privasi sesuai peran hukumnya; peran legal final perlu ditinjau |
| Akun dan staf | Organisasi mengelola pengguna yang diberi wewenang dan meminta pencabutan akses saat hak berakhir | Menyediakan manajemen akun, pembatasan akses, dan pencatatan aktivitas sesuai desain |
| Kepatuhan hukum | Setiap pihak memenuhi kewajiban yang berlaku untuk perannya; kewajiban tidak boleh diasumsikan dapat dialihkan sepenuhnya melalui T&C | Memenuhi kewajiban yang berlaku pada penyedia aplikasi dan meninjau T&C/privasi dengan penasihat yang kompeten |

Tabel ini adalah pembagian konseptual untuk desain produk, bukan penetapan hukum final atau pengganti kontrak.

## 4. Persyaratan produk untuk T&C dan onboarding organisasi

- [ ] T&C menjelaskan bahwa aplikasi adalah alat bantu perangkat lunak, bukan lisensi/izin untuk menjalankan transportasi.
- [ ] Pengguna/organisasi menyatakan memiliki izin, kewenangan, dan hak yang diperlukan untuk kegiatan yang dijalankan serta data yang dimasukkan/diakses.
- [ ] Pengguna/organisasi menyatakan akan mematuhi aturan yang berlaku di wilayah operasinya dan menjaga izin tetap berlaku.
- [ ] Pengguna/organisasi wajib memperbarui informasi yang relevan dan memberi tahu jika izin, kewenangan, kontrak, atau dasar akses berubah/berakhir.
- [ ] T&C melarang penggunaan aplikasi untuk kegiatan yang tidak berizin atau akses/pemrosesan data tanpa kewenangan.
- [ ] Onboarding membedakan jenis akun/organisasi: sekolah, operator transportasi, pengemudi, dan wali; akun organisasi tidak otomatis memperoleh akses ke organisasi lain.
- [ ] Ketentuan kamera, lokasi, data siswa/wali, tujuan pemrosesan, akses, retensi, dan pengaduan dijelaskan dalam dokumen yang sesuai (T&C dan/atau pemberitahuan privasi/kontrak).
- [ ] Konsekuensi pelanggaran, penangguhan/pencabutan akses, dan penanganan data setelah akun/kontrak berakhir ditinjau secara hukum dan dinyatakan jelas.
- [ ] T&C dan pemberitahuan privasi ditinjau untuk wilayah peluncuran dan diperbarui ketika wilayah atau layanan berubah.

**Catatan:** jangan menulis bahwa pengguna menanggung “semua tanggung jawab” atau bahwa penyedia aplikasi “tidak bertanggung jawab dalam keadaan apa pun” tanpa tinjauan hukum. Jangan menjanjikan verifikasi izin otomatis kecuali proses dan bukti verifikasinya benar-benar tersedia.

## 5. Matriks aktor dan tanggung jawab operasional

| Aktivitas | Sekolah | Operator transportasi | Pengemudi | Penyedia aplikasi | Wali |
|---|---|---|---|---|---|
| Memastikan kewenangan/izin kegiatan yang dijalankan | Sesuai model | Sesuai model | Memenuhi syarat yang berlaku untuk perannya | Menjelaskan batas penggunaan aplikasi; memenuhi kewajiban hukumnya sendiri | Menggunakan fitur sesuai kewenangan |
| Menetapkan pengemudi, bus, dan perjalanan | Jika menjadi pihak operasional | Jika menjadi pihak operasional | Mengikuti penugasan sah | Menyediakan fungsi sesuai lingkup | — |
| Memasukkan/memperbarui data siswa dan wali | Sesuai kewenangan/kontrak | Hanya jika berwenang dan diperlukan | Tidak mengelola master data | Menjaga kontrol teknis dan audit | Memberi informasi yang benar dan mengajukan koreksi |
| Menyetujui relasi wali–siswa | Pihak yang ditunjuk sesuai proses | Jika diberi kewenangan yang sah | — | Menyediakan mekanisme akses yang aman | Memberi informasi pendukung sesuai proses |
| Meninjau/menyetujui rute | Jika bertanggung jawab | Jika bertanggung jawab | Mengikuti rute yang disetujui | Menyediakan data/fungsi rute dengan batasan yang jelas | — |
| Menyediakan ponsel Android dan menjalankan sesi GPS saat penugasan aktif | Menetapkan/menyetujui perangkat dan penugasan sesuai model operasi | Menyediakan/menetapkan perangkat dan penugasan sesuai model operasi | Mengaktifkan GPS hanya selama penugasan/perjalanan aktif yang sah; melaporkan kendala | Menyediakan kontrol akses, validasi, status kesegaran, dan audit sesuai rancangan | Melihat lokasi bus sesuai hak akses dan indikator waktu/kesegaran |
| Menanggapi insiden operasional | Sesuai peran | Sesuai peran | Melaporkan sesuai prosedur | Menangani insiden platform sesuai kewajiban dan kontrak | Melapor melalui kanal yang tersedia |
| Menangani data pribadi | Berdasarkan peran nyata dan hukum | Berdasarkan peran nyata dan hukum | Mengakses hanya yang dibutuhkan | Berdasarkan peran legal aktual; bukan ditentukan sepihak dalam dokumen ini | Mengakses data anak yang berhak dilihat |

Matriks ini sengaja tidak menetapkan RACI legal final. Hubungan kontraktual dan ketentuan yang berlaku harus menentukan siapa melakukan apa dalam tiap penggunaan.

## 6. Pemisahan akses antarorganisasi

- Satu operator mungkin melayani lebih dari satu sekolah, tetapi akses ke data masing-masing sekolah harus ditetapkan eksplisit dan dibatasi.
- Sekolah yang memakai operator tidak otomatis memperoleh akses ke seluruh data milik operator atau sekolah lain.
- Pengemudi hanya melihat penugasan dan data minimum yang diperlukan.
- Wali hanya melihat siswa yang relasinya telah diverifikasi/disetujui.
- Berakhirnya penugasan, hubungan kerja, kontrak, atau hak wali memicu peninjauan/pencabutan akses terkait; jejak audit tidak dihapus diam-diam.
- Hak admin platform dibatasi sesuai kebutuhan dan tidak otomatis berarti hak melihat semua data anak atau video.

## 7. Pertanyaan yang masih terbuka

| ID | Pertanyaan | Status |
|---|---|---|
| OM-01 | Kota pilot dan skala awal? | Dammam dan sekitarnya; perencanaan sekitar 100 bus |
| OM-02 | Proses onboarding dan bukti/konfirmasi kewenangan organisasi seperti apa yang realistis untuk versi awal? | PERLU DISESUAIKAN DENGAN T&C DAN TINJAUAN HUKUM |
| OM-03 | Apakah organisasi wajib memasukkan nomor/jenis izin atau hanya menyatakan kewenangan pada onboarding? | BELUM DIPUTUSKAN |
| OM-04 | Siapa di pihak sekolah/operator yang dapat mengundang dan menonaktifkan pengemudi/staf? | BELUM DIPUTUSKAN |
| OM-05 | Jika operator melayani banyak sekolah, siapa yang menyetujui setiap akses/penugasan? | BELUM DIPUTUSKAN |
| OM-06 | Apakah aplikasi akan memeriksa dokumen izin secara manual/otomatis pada versi awal, atau hanya mewajibkan pernyataan pengguna? | BELUM DIPUTUSKAN |
| OM-07 | Siapa yang mengelola perangkat, kredensial, pemeliharaan, dan respons saat GPS/DVR offline? | BELUM DIPUTUSKAN |
| OM-08 | Apakah integrasi Noor diinginkan dan diizinkan? API/izin integrasi belum terbukti. | BELUM DIPUTUSKAN |

## 8. Sumber dan batasan

Sumber awal tentang peraturan transportasi pendidikan TGA, layanan Noor, dan PDPL tercatat dalam `docs/TECHNICAL_REVIEW_FINDINGS.md`. Sumber tersebut menjadi petunjuk untuk tinjauan lanjutan, bukan kesimpulan bahwa suatu pihak telah patuh atau bahwa aplikasi wajib terintegrasi dengan sistem pemerintah.

## 9. Kriteria keluar dari tinjauan operasional

- ruang lingkup penyedia aplikasi versus pengguna organisasi terdokumentasi;
- model akses organisasi/sekolah/operator disetujui;
- T&C dan pemberitahuan privasi disusun untuk ditinjau penasihat yang kompeten;
- proses onboarding dan penanganan perubahan/berakhirnya kewenangan diputuskan;
- kota pilot dan skala cukup jelas untuk merencanakan uji teknis.

**Status akhir:** model produk sebagai penyedia aplikasi telah diklarifikasi. T&C, pembagian akses, dan kewajiban masing-masing pihak masih memerlukan perumusan dan tinjauan yang sesuai. Belum ada provider, arsitektur, atau fitur bisnis yang dipilih/diimplementasikan.
