# Kebijakan Pemilihan Layanan Routing

**Status:** Arah evaluasi HERE-first; vendor belum disetujui untuk produksi.  
**Wilayah pilot:** Dammam dan sekitarnya, Arab Saudi.  
**Prioritas:** routing yang terkelola penyedia, data jalan terkini, cakupan Saudi, serta aplikasi pengemudi yang ringan.

## 1. Keputusan produk

- Gunakan layanan routing pihak ketiga yang sudah tersedia dan dikelola penyedianya. Jangan membangun mesin routing atau basis data jalan sendiri pada fase awal.
- Data jalan dan informasi lalu lintas harus diperbarui oleh penyedia sesuai kemampuan layanan. Jangan menjanjikan pembaruan real-time untuk semua jenis data tanpa bukti dari penyedia.
- Aplikasi pengemudi harus tetap ringan dan kompatibel dengan sebanyak mungkin HP Android yang masih layak digunakan. Hindari menjadikan SDK navigasi native yang besar sebagai prasyarat peluncuran.
- Utamakan perhitungan rute melalui API server dan tampilkan hasil rute pada antarmuka peta yang ringan. Navigasi langkah demi langkah dapat dibuka melalui aplikasi eksternal bila dibutuhkan, setelah kesesuaian alur operasional dipastikan.
- GPS HP pengemudi adalah sumber lokasi utama fase awal. GPS/tracker bawaan bus tetap fitur opsional fase berikutnya.
- Tidak ada vendor yang dipilih final sampai bukti cakupan, batas kendaraan, biaya, persyaratan penggunaan data, dan hasil uji tersedia.

## 2. Prioritas evaluasi

**HERE Routing menjadi kandidat utama untuk PoC** karena dokumentasi resminya menjelaskan Routing API dengan mode bus serta data lalu lintas/insiden terkini. Ini hanya prioritas pengujian, bukan keputusan final. Sebelum PoC, wajib ada izin komersial tertulis untuk pelacakan armada, penampilan posisi kendaraan, dan perhitungan rute; paket Base Plan mengecualikan kategori Asset Management. Cakupan produk untuk Dammam juga harus dikonfirmasi. Referensi: https://docs.here.com/routing/reference/routing-v8-api-overview, https://docs.here.com/traffic-api/docs/real-time-traffic-here-traffic-api-v7-concepts, https://www.here.com/get-started/pricing/base-plan-restrictions, https://docs.here.com/coverage/docs/here-coverage-information.

HudHud Maps dipertahankan sebagai **opsi cadangan**, bukan pengujian paralel awal. Pertimbangkan hanya jika HERE tidak lulus cakupan, lisensi, biaya, atau uji rute wajib.

## 2. Kandidat untuk diverifikasi

### HudHud Maps

Alasan diperiksa lebih dahulu: penyedia berfokus pada data peta Arab Saudi dan mempublikasikan layanan Directions API, Distance Matrix, Route Optimization, serta SDK peta/navigasi. Dokumentasi publik menyebut Directions API hingga 25 titik per permintaan dan Distance Matrix hingga 100×100. Angka ini bukan bukti bahwa satu rute operasional 40+ stop dapat dihitung sekaligus, atau bahwa batas bus sekolah didukung.

Bukti yang wajib diminta: batas waypoint/stop aktual untuk perencanaan multi-stop, dukungan tinggi/berat/lebar/panjang bus dan larangan jalan, data satu arah/larangan belok/putar balik, cakupan Dammam, pembaruan lalu lintas dan penutupan jalan, SLA, harga, batas pemakaian, serta ketentuan penggunaan dan penyimpanan hasil rute.

### HERE Routing

Alasan diperiksa: HERE Routing API mendokumentasikan routing kendaraan berat dan parameter kendaraan. Namun, jangan mengasumsikan atribut truk otomatis memadai untuk bus sekolah. Cakupan atribut pembatasan kendaraan di Dammam, mode bus/private bus, serta perilaku pada jalan lokal harus dikonfirmasi dan diuji.

Bukti yang wajib diminta: cakupan resmi Saudi untuk routing dan atribut kendaraan berat, kesesuaian profil bus sekolah, batas stop/waypoint dan optimasi, pembaruan lalu lintas, SLA, harga, batas pemakaian, serta hasil uji rute di Dammam.

HERE adalah prioritas PoC; HudHud adalah cadangan. Keduanya belum disetujui untuk produksi dan tidak ada klaim kompatibilitas bus sekolah sebelum pengujian.

## 3. Persyaratan teknis wajib

1. Routing harus berjalan untuk Dammam dan sekitarnya, bukan hanya wilayah yang didukung secara umum.
2. Rute mobil penumpang tidak boleh dianggap otomatis layak untuk bus. Uji profil kendaraan aktual yang tersedia, termasuk dimensi dan batas akses yang relevan.
3. Sistem harus mendukung perencanaan dengan 20, 30, dan 40+ stop. Jika layanan membatasi jumlah waypoint per permintaan, rancangan harus menangani batas tersebut tanpa mengubah urutan stop yang disetujui; hasil penggabungan segmen harus diuji.
4. Operator meninjau dan menyetujui versi rute. Pengemudi memuat versi tersebut saat mulai perjalanan. Jangan mengurutkan ulang stop secara diam-diam.
5. Perubahan kondisi jalan dapat memicu jalur alternatif antartitik, tetapi urutan stop tetap dipertahankan. Jika kelayakan jalur tidak dapat dipastikan, tampilkan peringatan.
6. Catat versi rute, waktu perhitungan, profil kendaraan, jarak, ETA, dan peringatan pembatasan yang dikembalikan layanan.
7. Kegagalan atau batas layanan harus ditangani dengan pesan yang jelas; jangan menampilkan rute seolah-olah terjamin aman.
8. API key dan kredensial disimpan di server atau mekanisme aman sesuai ketentuan penyedia; jangan menanamkan rahasia server dalam aplikasi HP.

## 4. Persyaratan aplikasi ringan

- Peta untuk melihat rute harus dapat dipisahkan dari mesin perhitungan routing.
- Muat hanya layer yang diperlukan: jalan, rute, stop, posisi bus, dan label penting. Hindari efek visual/layer berat yang tidak dibutuhkan operasional.
- Jangan mengunduh atau menyimpan area peta besar di HP kecuali ada kebutuhan offline yang disetujui dan lisensi mengizinkan.
- Uji pada beberapa kelas HP Android, termasuk perangkat dengan RAM dan CPU terbatas, layar terkunci, baterai hemat, serta jaringan lemah.
- Ukur waktu membuka peta/rute, konsumsi memori, baterai, penggunaan data, respons interaksi, dan kegagalan aplikasi. Tetapkan ambang penerimaan setelah perangkat sasaran diketahui.
- Jika aplikasi eksternal digunakan untuk panduan belokan, aplikasi utama tetap menjadi sumber status perjalanan dan GPS operasional. Jangan menganggap lokasi dari aplikasi eksternal otomatis tersedia kembali ke server.

## 5. Bukti sebelum keputusan vendor

- Dokumentasi resmi dan konfirmasi tertulis vendor tentang cakupan Dammam, kendaraan yang didukung, batas waypoint, lalu lintas, penutupan jalan, lisensi, dan harga.
- Uji skenario sintetis 20/30/40+ stop dengan rute lokal yang ditinjau orang yang memahami operasi.
- Uji kendaraan representatif dan catat semua peringatan/pelanggaran pembatasan yang dikembalikan API.
- Bandingkan kualitas rute, kestabilan urutan stop, waktu respons, keandalan, penggunaan data, dan total biaya pada volume pilot sekitar 100 bus.
- Pastikan kontrak dan kebijakan privasi membolehkan pemrosesan koordinat siswa/stop dan lokasi bus sesuai kebutuhan serta hukum yang berlaku.
- Catat hasil sebagai **LULUS**, **BELUM LULUS**, atau **TERBLOKIR**, dengan bukti; jangan memilih hanya berdasarkan brosur atau demo.

## 6. Status

- [x] Gunakan layanan routing terkelola yang sudah ada; tidak membangun mesin routing sendiri.
- [x] Prioritaskan data jalan terkini dan pengalaman aplikasi pengemudi yang ringan.
- [x] GPS HP pengemudi tetap sumber utama fase awal; GPS bus opsional di masa depan.
- [ ] Dapatkan konfirmasi tertulis lisensi komersial, paket, harga, SLA, dan cakupan HERE di Dammam.
- [ ] Uji HERE Routing pada rute Dammam dengan dimensi bus aktual.
- [ ] Evaluasi HudHud sebagai cadangan hanya jika HERE gagal pada gerbang wajib.
- [ ] Uji skenario 20/30/40+ stop, kualitas rute, performa HP, biaya, dan persyaratan penggunaan data.
- [ ] Pilih vendor setelah bukti lengkap dan hasil dibandingkan.

**Kesimpulan:** HERE adalah kandidat utama untuk PoC, bukan vendor final. Dapatkan izin komersial tertulis dan uji data lalu lintas, cakupan Dammam, dan kelayakan jalur bus sebelum integrasi. HudHud tetap opsi cadangan.