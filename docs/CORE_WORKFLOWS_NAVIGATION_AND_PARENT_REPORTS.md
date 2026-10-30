# Alur Inti Produk: Navigasi Bus dan Laporan Orang Tua

**Status:** DRAF KEBUTUHAN OPERASIONAL UNTUK DITINJAU  
**Prioritas:** UTAMA — mendahului fitur live stream kamera  
**Konteks pilot:** Dammam dan sekitarnya; target perencanaan sekitar 100 bus  
**Batas:** Dokumen kebutuhan/alur. Bukan implementasi dan bukan bukti bahwa penyedia peta, GPS, atau routing tertentu sudah kompatibel.

## 1. Sasaran produk

Membantu pengemudi menjalankan perjalanan berdasarkan rute yang disetujui, mencatat status siswa secara konsisten, dan memberi orang tua informasi yang akurat tanpa membuat mereka menafsirkan data mentah.

Keberhasilan alur inti dinilai dari:
- pengemudi mengetahui tugas, urutan stop, siswa terkait, dan tindakan yang harus dilakukan;
- rute yang disetujui tidak berubah diam-diam ketika perjalanan berlangsung;
- status setiap siswa tercatat terpisah untuk perjalanan pagi dan sore;
- lokasi bus selalu disertai waktu pembaruan dan indikator kualitas/kedaluwarsa;
- wali hanya melihat siswa yang relasinya disetujui dan laporan yang sesuai kewenangannya;
- riwayat dan laporan dapat ditelusuri ke catatan operasional, termasuk koreksi;
- kamera live dapat tidak tersedia atau belum dikonfigurasi tanpa menghalangi alur ini.

## 2. Aktor dan tanggung jawab

| Aktor | Tanggung jawab utama dalam alur inti | Tidak boleh |
|---|---|---|
| Admin sekolah/operator sesuai kewenangan | Mengelola data dan penugasan yang menjadi tanggung jawab organisasinya; meninjau dan menyetujui rute; menangani koreksi yang beralasan. | Mengakses organisasi lain tanpa hak; mengubah perjalanan aktif secara diam-diam. |
| Pengemudi | Memeriksa tugas dan rute; menjalankan stop sesuai urutan; merekam status siswa; melaporkan data salah atau kendala; menyelesaikan pemeriksaan akhir perjalanan/kabin. | Mengubah data induk siswa/wali; mengubah urutan stop yang disetujui; mengesahkan status dengan GPS tidak memenuhi syarat tanpa pengecualian resmi. |
| Orang tua/wali | Melihat status anak, informasi perjalanan, lokasi bus beserta waktu pembaruan, serta riwayat/laporan anak yang berhak diakses. | Melihat anak lain, mengubah catatan operasional, atau menganggap lokasi usang sebagai posisi terkini. |
| Sistem | Memvalidasi hak akses, konsistensi status, GPS, versi rute, waktu pembaruan, audit, dan batas organisasi. | Menampilkan data lama seolah-olah real-time atau menganggap status yang tidak diketahui sebagai berhasil. |

Sekolah dan perusahaan/operator dapat memakai aplikasi bersama atau secara terpisah. Izin akses harus mengikuti model operasional dan penugasan yang dikonfigurasi; jangan memberi akses lintas organisasi secara otomatis.

## 3. Alur sebelum perjalanan

1. Organisasi yang berwenang memastikan data siswa, wali, titik jemput, bus, pengemudi, dan jadwal yang diperlukan sudah tersedia.
2. Sistem membedakan perjalanan pagi dan sore sebagai perjalanan terpisah.
3. Ketika data relevan berubah, sistem menyiapkan versi rute untuk perjalanan mendatang.
4. Rute menampilkan urutan stop, jalur jalan, estimasi jarak/waktu, profil bus yang digunakan, waktu perhitungan, serta status versi.
5. Admin yang berwenang meninjau rute dan menyetujui atau meminta perbaikan. Rute yang belum disetujui tidak boleh ditampilkan sebagai rute operasional final.
6. Pengemudi melihat tugas, bus, jadwal, daftar siswa/stop, dan versi rute yang disetujui sebelum mulai.
7. Jika penugasan, kendaraan, atau data penting berubah setelah persetujuan, sistem menunjukkan bahwa rute perlu ditinjau ulang untuk perjalanan mendatang. Jangan mengganti rute aktif diam-diam.

### Perilaku rute yang wajib

- Urutan stop yang disetujui tetap terkunci selama perjalanan.
- Siswa yang tidak ikut dapat dilewati tanpa mengurutkan ulang stop tersisa.
- Penutupan jalan boleh memicu perhitungan jalur alternatif di antara stop, tetapi urutan stop tetap.
- Jika tidak ada jalur yang dapat dipastikan aman atau layanan routing gagal, tampilkan peringatan yang jelas dan arahkan ke prosedur operasional; jangan mengklaim rute aman.
- Rute yang masuk akal untuk mobil penumpang tidak otomatis dianggap layak untuk bus besar. Dukungan kendaraan dan kondisi jalan di area pilot wajib dibuktikan.
- Saran menggabungkan titik jemput berdekatan bukan perubahan otomatis; persetujuan admin dan status tiap siswa tetap terpisah.

## 4. Alur selama perjalanan

1. Pengemudi memulai sesi kerja dan memuat penugasan serta versi rute yang disetujui.
2. Sistem memastikan bus/pengemudi cocok dengan penugasan. Penggantian harus melalui alur yang berwenang dan tercatat.
3. Untuk setiap stop, pengemudi melihat siswa terkait dan tindakan yang diperlukan.
4. Status siswa dicatat secara individual, dengan waktu, aktor, perjalanan, stop, dan hasil validasi lokasi yang relevan.
5. Status minimal yang harus dibedakan:
   - **Belum dikonfirmasi** — belum ada konfirmasi yang sah;
   - **Ikut / dikonfirmasi naik** — siswa telah dikonfirmasi naik;
   - **Tidak ikut** — siswa tidak menggunakan bus pada perjalanan tersebut;
   - **Dikonfirmasi turun** — siswa telah dikonfirmasi turun sesuai alur perjalanan;
   - **Perlu ditinjau / pengecualian** — ada masalah data atau proses yang memerlukan penanganan berwenang.
6. Status **tidak ikut** tidak sama dengan **tidak masuk sekolah**. Keduanya harus menjadi konsep terpisah jika absensi sekolah kelak diintegrasikan.
7. Status belum dikonfirmasi tidak dihitung sebagai ikut atau tidak ikut dalam hitungan final. Laporan harus memperlihatkan status belum lengkap, bukan mengubahnya menjadi kepastian.
8. Sistem memvalidasi GPS dengan koordinat acuan, akurasi, dan kesegaran data. Radius 100 meter adalah nilai awal yang harus diuji, bukan jaminan akurasi universal.
9. Jika GPS usang, tidak tersedia, atau akurasinya tidak memenuhi syarat, konfirmasi normal tidak dinyatakan valid. Gunakan alur pengecualian yang berwenang dan diaudit bila kebijakan mengizinkannya.
10. Setiap perubahan status penting dan pengecualian memiliki jejak audit. Koreksi tidak menghapus catatan sebelumnya tanpa jejak.

## 5. Lokasi bus dan kualitas data

Lokasi yang ditampilkan kepada wali harus mencakup:
- posisi terakhir yang diterima;
- waktu pengambilan/pembaruan terakhir;
- indikator keadaan data, misalnya **Terbaru**, **Mulai terlambat**, **Usang**, atau **Tidak tersedia**;
- pesan yang jelas bahwa posisi mungkin tidak mencerminkan keadaan saat ini jika pembaruan terlambat.

Batas waktu untuk setiap label harus ditentukan berdasarkan sumber GPS, interval pengiriman, kondisi jaringan, dan hasil pengujian; jangan mengarang interval atau menganggap sumber selalu aktif. Simpan timestamp dari sumber dan waktu penerimaan server bila tersedia. Urutkan pembaruan agar paket terlambat tidak menimpa lokasi yang lebih baru.

Jika koneksi terputus:
- jangan memindahkan marker seolah-olah bus masih bergerak berdasarkan data lama;
- pertahankan posisi terakhir hanya dengan label waktu dan status usang;
- tampilkan keadaan tidak tersedia jika belum ada posisi yang bisa digunakan;
- setelah koneksi pulih, verifikasi urutan waktu dan penugasan sebelum memperbarui tampilan.

Sumber lokasi fase pertama **DISETUJUI: ponsel Android pengemudi yang sedang ditugaskan**. GPS/AVL bawaan bus ditunda ke fase berikutnya. Lokasi harus terkait penugasan/perjalanan aktif yang sah. Interval, ambang status usang, batas akurasi, perangkat minimum, konsumsi baterai/data, serta perilaku latar belakang dan offline masih **BELUM DIPUTUSKAN** sampai diuji pada perangkat pilot.

## 6. Pengalaman orang tua/wali

Beranda wali memprioritaskan jawaban atas pertanyaan berikut:
1. Anak mana yang sedang dilihat?
2. Apakah anak dijadwalkan menggunakan bus pada perjalanan ini?
3. Apa status terakhir yang telah dikonfirmasi, dan kapan?
4. Di mana posisi bus terakhir yang diketahui, serta seberapa baru datanya?
5. Apa riwayat keikutsertaan dan laporan untuk periode yang dipilih?

Ketentuan tampilan:
- Pilihan anak hanya memuat relasi wali–siswa yang disetujui dan aktif.
- Jika perjalanan belum dimulai, tampilkan status sebelum perjalanan; jangan tampilkan seolah-olah bus sedang bergerak.
- Jika anak belum dikonfirmasi naik, jangan menyatakan bahwa anak berada di bus.
- Jika anak telah dikonfirmasi turun, tampilkan status turun beserta waktu jika tersedia.
- Jika status belum diketahui, tampilkan **Belum dikonfirmasi** atau **Perlu konfirmasi**, bukan asumsi.
- Jika lokasi usang, jelaskan waktu pembaruan terakhir dan jangan menyebutnya lokasi langsung.
- Informasi pagi dan sore ditampilkan sebagai perjalanan terpisah.
- Kamera tidak wajib muncul di beranda atau menjadi bagian dari indikator kesiapan perjalanan.

## 7. Riwayat dan laporan

### Riwayat per siswa
Catat per perjalanan: tanggal, perjalanan pagi/sore, jadwal/penugasan, status keikutsertaan, waktu konfirmasi yang relevan, sumber/aktor perubahan, dan status pengecualian. Riwayat operasional harus tetap dapat ditelusuri ketika ada koreksi.

### Ringkasan orang tua
Sediakan tampilan ringkas per anak dan periode, dengan jumlah status yang jelas:
- keikutsertaan terkonfirmasi;
- tidak ikut;
- belum dikonfirmasi atau perlu ditinjau;
- perjalanan yang dibatalkan/bermasalah jika status tersebut sudah ditetapkan kebijakannya.

Jangan memasukkan status belum dikonfirmasi ke jumlah ikut atau tidak ikut. Jangan menyamakan pembatalan perjalanan dengan siswa tidak ikut sebelum aturan bisnisnya diputuskan.

### Laporan admin
Admin yang berwenang dapat memeriksa rekap per sekolah/operator, bus, perjalanan, dan periode sesuai lingkup aksesnya. Laporan harus dapat ditelusuri ke catatan sumber. Ekspor perlu membatasi data pribadi yang tidak dibutuhkan.

### Format dan koreksi
- PDF untuk laporan yang dibaca manusia; CSV untuk data tabular, sesuai kebutuhan yang disetujui.
- Setiap ekspor dicatat: siapa, kapan, lingkup data, dan format.
- Koreksi historis memerlukan alasan dan menyimpan pelaksana, waktu, serta nilai sebelum/sesudah yang relevan.
- Tautan berbagi tidak boleh publik permanen; akses ekspor harus mengikuti izin pengguna dan masa berlaku.
- Aturan tagihan, harga, dan perhitungan pembayaran berada di luar lingkup awal.

## 8. Akhir perjalanan dan pengecualian

- Pengemudi menyelesaikan status siswa dan memeriksa kabin secara fisik sebelum menutup sesi kerja.
- Status siswa yang masih tercatat di bus atau belum jelas harus memicu peringatan dan mengikuti kebijakan penutupan yang ditetapkan.
- Gangguan GPS, pengemudi/bus pengganti, siswa tidak hadir, stop yang dilewati, pembatalan, dan keadaan darurat harus memiliki alur pencatatan yang jelas.
- Jangan membiarkan kegagalan jaringan menghapus status yang telah dicatat. Strategi offline, konflik sinkronisasi, dan batas penggunaan offline masih harus diputuskan dan diuji.
- Pengecualian tidak boleh mengubah urutan stop atau status siswa lain secara otomatis.

## 9. Kriteria penerimaan prioritas inti

### Navigasi dan perjalanan
- [ ] Pengemudi hanya melihat tugas dan bus yang ditugaskan kepadanya.
- [ ] Mulai perjalanan memuat versi rute yang telah disetujui, bukan menghitung ulang urutan stop.
- [ ] Perubahan data relevan membuat versi rute baru untuk perjalanan berikutnya dan tidak diam-diam mengubah perjalanan aktif.
- [ ] Stop yang dilewati tidak mengurutkan ulang stop tersisa.
- [ ] Rute yang tidak dapat dibuktikan layak untuk profil bus menghasilkan peringatan atau status terblokir, bukan status aman palsu.
- [ ] GPS di luar radius awal, usang, tidak akurat, atau tidak tersedia tidak lolos validasi normal.
- [ ] Posisi lama selalu disertai timestamp/status kualitas dan tidak disajikan sebagai posisi real-time.
- [ ] Gangguan jaringan dan pemulihan tidak menyebabkan pembaruan lokasi mundur atau status ganda tanpa penanganan.

### Status siswa dan laporan
- [ ] Perjalanan pagi dan sore disimpan terpisah.
- [ ] Siswa yang tidak ikut tetap ada dalam master data.
- [ ] Belum dikonfirmasi tidak dihitung sebagai ikut atau tidak ikut.
- [ ] Orang tua hanya dapat melihat anak dengan relasi yang disetujui dan aktif, termasuk melalui API langsung.
- [ ] Status yang ditampilkan kepada wali cocok dengan catatan operasional dan menampilkan waktu yang relevan.
- [ ] Rekap dapat ditelusuri ke data sumber dan membedakan status tidak ikut, belum dikonfirmasi, pengecualian, dan pembatalan bila status pembatalan sudah didefinisikan.
- [ ] Koreksi historis menyimpan alasan, aktor, waktu, dan perubahan yang relevan.
- [ ] Ekspor dan akses laporan dicatat serta dibatasi berdasarkan peran/organisasi.
- [ ] Penutupan sesi memeriksa status siswa dan hasil pemeriksaan kabin.
- [ ] Fitur kamera belum dikonfigurasi tidak menghalangi pengujian alur inti.

### QA keamanan
- [ ] Uji API langsung untuk wali yang tidak terhubung, relasi wali dicabut, organisasi lain, pengemudi yang tidak ditugaskan, dan sesi yang sudah berakhir.
- [ ] Uji duplikasi, urutan kedatangan data, waktu server/sumber, koneksi terputus, sinkronisasi, serta koreksi data.
- [ ] Uji skenario sintetis 20/30/40+ stop dan profil kendaraan yang ditentukan sebelum menyatakan routing lulus.
- [ ] Tidak menggunakan data anak nyata dalam tes tanpa izin dan perlindungan yang sesuai.

## 10. Hal yang masih harus diputuskan atau dibuktikan

- Platform untuk masing-masing peran (web/mobile), OS sasaran, kebutuhan bahasa, dan dukungan aksesibilitas.
- Sumber GPS/AVL, interval pembaruan, ambang status usang, dan kebutuhan offline.
- Penyedia routing yang mendukung batas bus di Dammam dan sekitarnya, profil kendaraan, dan bukti kondisi jalan.
- Perjalanan batal, siswa tidak ditemukan, pengemudi/bus pengganti, prosedur darurat, dan otoritas pengecualian.
- Definisi status final, pihak yang berhak mengoreksi status, dan proses sengketa/koreksi.
- Format laporan wajib, periode, penerima, aturan ekspor, dan retensi.
- Kebutuhan notifikasi; SMS/WhatsApp/push bukan ketergantungan awal kecuali disetujui kemudian.
- Model offline dan strategi konflik sinkronisasi.
- Jumlah sekolah/siswa/pengemudi dan jumlah pengguna bersamaan untuk menguji skala.
- Routing dan GPS belum terverifikasi secara lapangan; dokumen ini tidak menyatakan provider mana pun lulus.

## 11. Tahap pelaksanaan yang disarankan

1. Finalisasi status operasional, kewenangan organisasi, dan alur pengecualian.
2. Verifikasi pilihan routing dan sumber GPS pada skenario Dammam; lakukan proof-of-compatibility tanpa data anak nyata.
3. Tinjau model data, versi rute, status siswa-perjalanan, timestamp lokasi, audit, dan kontrol akses.
4. Bangun fondasi akses, master data, penugasan, dan audit.
5. Bangun alur perjalanan/rute/GPS dan status siswa.
6. Bangun tampilan wali, riwayat, laporan, dan ekspor terbatas.
7. Jalankan QA API/UI, simulasi rute, pengujian jaringan/GPS, serta uji lapangan yang disetujui.
8. Evaluasi kamera sebagai fitur tambahan terpisah setelah atau paralel tanpa memblokir alur inti.

**Status keseluruhan:** spesifikasi alur inti telah dirinci untuk ditinjau. Implementasi, validasi provider, uji lapangan, dan persetujuan operasional belum dilakukan.
