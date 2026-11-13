# Persyaratan Umum Integrasi Live Stream Kamera Bus

**Status:** Draf persyaratan vendor-netral; bukan desain implementasi final.  
**Pilot:** Dammam dan sekitarnya.  
**Skala perencanaan:** sekitar 100 bus.  
**Batas lingkup:** aplikasi menghubungkan live stream dari sistem kamera/DVR atau AV yang sudah terpasang. Aplikasi tidak mengadakan atau memasang perangkat kamera/DVR.

## 1. Prinsip desain

Aplikasi tidak boleh mengunci integrasi pada satu merek kamera, DVR, protokol, atau aplikasi AV sebelum inventaris perangkat nyata dilakukan. Spesifikasi awal mendefinisikan kontrak kemampuan dan keamanan; adapter koneksi dipilih setelah sumber stream yang tersedia diverifikasi.

Dua jalur integrasi yang diperbolehkan untuk dievaluasi:

1. **Langsung dari perangkat/DVR:** perangkat menyediakan API/SDK atau protokol streaming yang didukung dan dapat diakses secara aman.
2. **Melalui aplikasi/platform AV yang sudah terpasang:** aplikasi/platform AV menyediakan API/SDK, sesi stream, atau mekanisme handoff yang resmi dan diizinkan untuk aplikasi pihak ketiga.

Jalur ketiga berupa gateway/relay perantara hanya boleh dipertimbangkan jika dibutuhkan untuk kompatibilitas atau keamanan, dan setelah arsitektur, biaya, hosting, serta kewenangan aksesnya ditinjau. Belum ada jalur yang dipilih.

## 2. Kontrak kemampuan minimum

Sumber stream yang diusulkan harus dapat menyediakan, secara langsung atau melalui integrasi resmi:

- identitas bus dan kanal/kamera yang jelas;
- status stream: tersedia, sedang tersambung, tidak tersedia, atau gagal;
- metode autentikasi dan otorisasi yang terdokumentasi;
- cara memulai dan mengakhiri sesi stream;
- kontrol token/sesi yang membatasi masa berlaku dan mendukung pencabutan atau mekanisme penghentian yang teruji;
- informasi batas penonton bersamaan, kualitas/resolusi, latensi, bandwidth, dan biaya yang relevan;
- perilaku ketika perangkat, AV platform, relay, atau jaringan offline;
- dukungan teknis, versi API/protokol, dan kebijakan perubahan yang diketahui.

Jika salah satu kemampuan tidak tersedia, catat sebagai keterbatasan eksplisit. Jangan mengklaim pencabutan seketika jika hanya dapat dilakukan setelah token kedaluwarsa atau jika stream masih dapat dibuka melalui aplikasi vendor.

## 3. Otorisasi aplikasi

Aplikasi harus memeriksa hak akses pada server untuk setiap permintaan pembuatan atau penggunaan sesi stream. Operator memiliki akses global; Pengemudi dibatasi penugasan; Orang Tua/Wali dibatasi relasi anak dan status perjalanan. Jangan memakai organisasi/wilayah sebagai filter akses Operator.

- Pengemudi: akses sesuai sesi kerja aktif dan kewenangannya.
- Orang tua/wali: hanya akses yang sah ketika anak yang terkait telah dikonfirmasi berada di bus; akses berakhir saat anak turun atau hak dicabut.
- Operator: akses global sesuai kebutuhan kerja dan audit; Pengemudi/Wali dibatasi peran dan penugasan/relasi.

URL publik permanen atau kredensial perangkat yang dibagikan ke aplikasi klien tidak boleh dijadikan satu-satunya pengaman. Utamakan sesi/token singkat dan terikat pada pengguna/izin, server-side authorization, serta proxy/relay terproteksi jika dibutuhkan. Uji apakah stream yang sudah dibuka atau token lama tetap bekerja setelah akses dicabut; dokumentasikan batas waktu pencabutan aktual.

## 4. Privasi dan keamanan

Sebelum memilih jalur integrasi, catat di mana video dan metadata diproses atau diteruskan, apakah ada penyimpanan, apakah data keluar dari Arab Saudi, siapa yang dapat mengakses, bagaimana akses vendor dikelola, dan bagaimana insiden ditangani. Kebutuhan awal tidak mencakup playback atau unduh rekaman. Jangan menyimpan stream atau membuat rekaman baru tanpa keputusan produk dan tinjauan hukum/privasi.

Uji dengan video/perangkat yang diizinkan; jangan memakai rekaman anak nyata tanpa otorisasi dan perlindungan yang sesuai.

## 5. Kapasitas dan ketahanan

Target sekitar 100 bus adalah skala layanan awal, bukan asumsi bahwa semua bus akan melakukan streaming bersamaan. Sebelum estimasi kapasitas final, tentukan pola penggunaan dan puncak penonton bersamaan. Ukur setidaknya:

- jumlah bus online dan jumlah sesi stream bersamaan;
- latensi awal dan kestabilan playback;
- penggunaan bandwidth per stream dan biaya jaringan/relay;
- batas penonton dari perangkat/platform;
- perilaku saat jaringan buruk, perangkat offline, atau koneksi terputus;
- kemampuan kembali tersambung tanpa membuka akses yang sudah dicabut.

UI harus menunjukkan status offline/gagal secara jelas dan tidak menampilkan stream lama seolah-olah masih live.

## 6. Bukti yang harus diminta

Untuk setiap opsi, simpan:

- merek/model/firmware perangkat atau nama/versi aplikasi AV;
- dokumentasi API/SDK/protokol resmi dan syarat penggunaan;
- konfirmasi tertulis bahwa integrasi pihak ketiga diizinkan;
- alur autentikasi dan contoh sesi/token tanpa kredensial produksi;
- lokasi pemrosesan/relay dan kebijakan data;
- batas kapasitas, kualitas, latensi, bandwidth, harga, SLA, dan dukungan;
- hasil uji akses sah/tidak sah, pencabutan, offline, dan konkurensi.

Demo yang berhasil dibuka satu kali bukan bukti bahwa otorisasi, pencabutan, kapasitas, atau kompatibilitas sudah terverifikasi.

## 7. Kriteria penerimaan integrasi

Integrasi belum boleh dinyatakan selesai dan lulus tes sampai:

1. sumber stream dan izin integrasinya teridentifikasi;
2. pengguna tanpa hak ditolak oleh server;
3. orang tua tidak dapat melihat bus/stream di luar haknya;
4. akses anak yang sudah turun atau haknya dicabut dihentikan sesuai batas teknis yang telah disetujui;
5. URL/token lama diuji setelah pencabutan;
6. status offline dan pemulihan ditampilkan dengan benar;
7. beban dan jumlah penonton bersamaan yang disepakati telah diuji;
8. biaya, batas layanan, dan lokasi pemrosesan data terdokumentasi.

## 8. Hal yang tetap belum diputuskan

- Apakah perangkat dapat diakses langsung atau harus melalui aplikasi/platform AV yang sudah ada.
- Merek/model/firmware kamera dan DVR, aplikasi AV, serta protokol yang tersedia.
- Apakah diperlukan adapter atau relay perantara.
- Jumlah puncak stream bersamaan, kualitas video, latensi yang dapat diterima, dan anggaran bandwidth.
- Lokasi hosting/relay dan persyaratan transfer data.
- SLA serta batas waktu pencabutan stream yang dapat dibuktikan.
