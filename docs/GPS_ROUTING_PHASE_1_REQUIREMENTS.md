# Kebutuhan Fase Awal: Routing dan GPS

**Status:** Kebutuhan awal disepakati; rincian teknis dan vendor belum terverifikasi.  
**Wilayah pilot:** Dammam dan sekitarnya, Arab Saudi.  
**Skala perencanaan:** sekitar 100 bus.

## 1. Keputusan sumber GPS

- **GPS HP pengemudi adalah sumber lokasi utama dan prioritas untuk fase awal.**
- **GPS/tracker bawaan bus adalah fitur opsional fase pengembangan berikutnya.** Bukan kebutuhan peluncuran, bukan prasyarat GPS HP, dan bukan penghambat alur inti.
- Jangan membangun integrasi vendor GPS bus, konfigurasi sumber per bus, atau perpindahan otomatis antarsumber pada fase awal.
- Arsitektur boleh menjaga batas antarmuka sumber lokasi agar integrasi masa depan memungkinkan, tanpa membangun adapter/vendor integration sekarang.

## 2. Perilaku GPS HP

1. Lokasi dikirim hanya untuk penugasan/perjalanan aktif yang sah.
2. Setiap pembaruan menyertakan koordinat, waktu pengukuran bila tersedia, waktu penerimaan server, dan informasi akurasi perangkat.
3. Server mengaitkan lokasi dengan penugasan, pengemudi, bus, dan perjalanan yang aktif. Paket terlambat atau dari sesi lama tidak boleh menimpa lokasi terbaru.
4. Wali melihat posisi terakhir, waktu pembaruan, dan status data. Lokasi usang tidak boleh ditampilkan sebagai real-time.
5. Izin dicabut, GPS tidak tersedia, akurasi buruk, pembatasan latar belakang, atau jaringan terputus harus menghasilkan status yang jujur. Jangan mengarang pergerakan atau diam-diam mengganti sumber.
6. GPS dapat menentukan posisi tanpa internet, tetapi pengiriman ke server memerlukan koneksi. Perilaku offline dan sinkronisasi harus diuji.
7. Interval pengiriman, ambang status usang, batas akurasi, konsumsi baterai/data, dan perilaku latar belakang masih **BELUM DIPUTUSKAN** hingga diuji pada HP Android yang relevan.

## 3. Penugasan dan pergantian bus

- Penugasan menghubungkan pengemudi, bus, jadwal, perjalanan, dan rute yang disetujui.
- Pengemudi dapat berganti bus melalui proses berwenang; bus/perangkat GPS tidak dianggap melekat permanen pada akun pengemudi.
- Perubahan penugasan dicatat dan memicu pemeriksaan kesesuaian rute. Jangan mengganti rute aktif diam-diam.
- Fase awal mengambil lokasi dari HP pengemudi yang ditugaskan. GPS bus yang mungkin sudah terpasang ditunda ke fase berikutnya.

## 4. Validasi lokasi jemput/turun

- Koordinat acuan yang disetujui menjadi dasar validasi.
- Radius 100 meter hanya nilai awal untuk diuji, bukan jaminan universal.
- Validasi mempertimbangkan jarak, akurasi, kesegaran lokasi, serta penugasan/perjalanan yang benar.
- Lokasi di luar batas, data usang, akurasi buruk, atau GPS tidak tersedia tidak boleh lolos sebagai konfirmasi normal. Pengecualian harus berwenang dan diaudit.
- Catat hasil validasi dan data minimum yang diperlukan untuk audit, sesuai kebijakan privasi.

## 5. Bukti routing sebelum memilih vendor

Rute perjalanan mendatang dihitung dari stop dan profil kendaraan, lalu ditinjau/disetujui Operator. Saat perjalanan dimulai, pengemudi memuat versi yang disetujui; urutan stop tidak dioptimalkan ulang secara diam-diam.

Uji harus mencakup:
- cakupan jalan Dammam dan sekitarnya;
- batas bus yang relevan, termasuk tinggi, berat, panjang/lebar, dan larangan kendaraan;
- jalan satu arah, larangan belok, putar balik, penutupan jalan, tempat berhenti yang layak, dan lalu lintas jika tersedia;
- skenario sintetis 20, 30, dan 40+ stop;
- kestabilan urutan stop saat jalur antartitik dihitung ulang;
- kegagalan ketika tidak ada jalur yang dapat dipastikan layak;
- versi, profil kendaraan, jarak, estimasi waktu, dan persetujuan yang dapat ditelusuri.

Routing mobil biasa tidak otomatis layak untuk bus besar. Cakupan dan kemampuan vendor di Arab Saudi perlu bukti tertulis dan pengujian. Belum ada vendor yang dinyatakan lulus.

## 6. Rencana uji awal

Gunakan data sintetis atau data yang telah diizinkan, bukan data anak nyata tanpa persetujuan dan perlindungan yang sesuai.

1. Uji HP Android dengan izin aktif, ditolak, dan dicabut.
2. Uji aplikasi terbuka/latar belakang, layar terkunci, hemat baterai, jaringan lemah, dan jaringan terputus.
3. Uji akurasi buruk, data usang, paket terlambat, dan pemulihan jaringan.
4. Pastikan wali melihat waktu pembaruan/status yang benar.
5. Uji pergantian bus/pengemudi agar lokasi sesi lama tidak tercampur.
6. Uji radius awal 100 meter sebelum menetapkan kebijakan final.
7. Uji routing 20/30/40+ stop dengan profil bus dan kendala jalan wilayah pilot.

## 7. Kriteria penerimaan

- [ ] GPS HP pengemudi menjadi sumber utama fase awal.
- [ ] GPS bus bawaan ditunda dan tidak menghambat peluncuran GPS HP.
- [ ] Lokasi terkait dengan penugasan/perjalanan aktif yang sah.
- [ ] Wali melihat waktu pembaruan dan status kesegaran yang benar.
- [ ] Izin dicabut, GPS buruk, data usang, dan jaringan putus tidak menampilkan kepastian palsu.
- [ ] Paket terlambat tidak menimpa lokasi yang lebih baru.
- [ ] Pergantian bus/pengemudi tercatat dan lokasi tidak tercampur antarperjalanan.
- [ ] Radius 100 meter, interval, ambang usang, dan kebijakan offline difinalisasi setelah pengujian.
- [ ] Vendor routing tidak dinyatakan lulus tanpa bukti cakupan dan kendala bus di Dammam.

## 8. Hal yang belum diputuskan

Model/versi minimum HP Android; interval pembaruan; batas akurasi dan ambang status terbaru/usang; perilaku pencatatan saat internet putus; profil bus untuk pengujian; dan penyedia routing yang lolos verifikasi.

**Status:** Sumber GPS fase awal disepakati. Parameter, validasi lapangan, pilihan vendor routing, dan implementasi belum selesai/terverifikasi.