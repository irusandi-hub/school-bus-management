# Kontrak Antarmuka Generik Live Stream Kamera

**Status:** DRAF SPESIFIKASI — BELUM DIVERIFIKASI TERHADAP PERANGKAT/PLATFORM AKTUAL  
**Konteks pilot:** Dammam dan sekitarnya, target perencanaan sekitar 100 bus  
**Batas lingkup:** kamera/DVR telah terpasang; aplikasi menyediakan akses live stream. Dokumen ini tidak memilih vendor, protokol, atau arsitektur final dan bukan implementasi.

## 1. Tujuan dan prinsip

Menetapkan kemampuan minimum yang harus dibuktikan oleh sumber video agar dapat diintegrasikan dengan aplikasi secara aman, tanpa mengunci merek atau metode koneksi tertentu.

Sumber yang dapat dievaluasi:
1. **Perangkat/DVR langsung:** sumber menyediakan antarmuka resmi yang dapat diakses oleh konektor server.
2. **Aplikasi/platform AV yang sudah ada:** platform menyediakan API, SDK, atau mekanisme handoff stream resmi dan terotorisasi.

Keduanya adalah opsi, bukan pernyataan bahwa perangkat yang ada pasti mendukungnya. Jika sumber tidak menyediakan integrasi resmi, autentikasi yang memadai, atau pencabutan akses yang dapat diuji, tandai **TIDAK KOMPATIBEL UNTUK LINGKUP AWAL**. Jangan menebak endpoint, mengambil URL tersembunyi, melakukan scraping, atau melewati kontrol vendor.

## 2. Arsitektur logis

1. Pengguna meminta akses melalui aplikasi.
2. Backend aplikasi memverifikasi identitas, peran, penugasan bus/perjalanan, relasi wali, dan kondisi akses terkini. Operator memiliki akses global; batas hanya berlaku untuk Pengemudi dan Orang Tua/Wali.
3. Konektor server berkomunikasi dengan sumber yang terdaftar menggunakan kredensial yang disimpan di server.
4. Backend membuat sesi streaming yang terbatas dan mengembalikan metadata pemutaran yang diperlukan klien.
5. Backend memeriksa ulang izin ketika sesi diperbarui atau diperpanjang, dan mencabut/menghentikan akses saat kondisi izin berakhir.

**Jangan** menaruh kredensial perangkat/platform di aplikasi klien. Hindari URL publik permanen. Gunakan sesi/token berumur pendek atau relay/proxy terkontrol bila diperlukan dan didukung; metode final harus dipilih berdasarkan bukti teknis, kebutuhan latensi, keamanan, biaya, dan lokasi pemrosesan data. Token berumur pendek saja tidak cukup jika URL lama tetap dapat digunakan tanpa pemeriksaan izin.

## 3. Kontrak kemampuan minimum

Setiap sumber atau konektor harus mendokumentasikan kemampuan berikut. Jika tidak didukung, catat keterbatasan dan nilai apakah risiko tersebut dapat diterima; jangan menganggap dukungan tersedia.

| Area | Informasi/kemampuan minimum yang harus dibuktikan |
|---|---|
| Identitas sumber | ID sumber unik, ID bus yang dipetakan, perangkat/kanal kamera, sekolah/operator pengelola sebagai data, dan status pemetaan. |
| Otorisasi integrasi | Metode resmi API/SDK/protokol; alur autentikasi server-ke-sumber; hak penggunaan/integrasi tertulis; scope akses minimum. |
| Pembuatan sesi | Membuat sesi stream untuk sumber tertentu dan mengembalikan ID sesi, metadata pemutaran, waktu mulai, serta waktu kedaluwarsa. |
| Metadata media | Protokol/transport, format/container, codec, resolusi, frame rate, audio jika ada, persyaratan browser/perangkat, dan batas latensi yang terukur. |
| Masa berlaku | TTL sesi/token yang terdokumentasi, aturan refresh/renewal, dan respons saat kredensial atau sesi kedaluwarsa. |
| Penghentian/pencabutan | Operasi revoke/stop yang terdokumentasi, waktu efektif pencabutan, perilaku terhadap koneksi aktif dan token/URL lama, serta bukti pengujian. |
| Kesehatan sumber | Status online/offline, alasan kegagalan yang aman ditampilkan, waktu data/status terakhir, dan mekanisme mendeteksi sumber tidak merespons. |
| Kegagalan jaringan | Perilaku timeout, retry/backoff, pemulihan koneksi, serta status yang dikembalikan saat stream tidak tersedia. |
| Kapasitas | Batas sesi per kamera/perangkat/akun, jumlah penonton bersamaan, batas API, dan perilaku saat kapasitas terlampaui. |
| Audit | ID sumber dan sesi, aktor atau ID pengguna internal, waktu pembuatan/penghentian, hasil otorisasi, serta kode alasan kegagalan. Hindari menulis token/kredensial ke log. |
| Keamanan rahasia | Penyimpanan rahasia server-side, rotasi kredensial, pencabutan kredensial, lingkungan uji, dan proses penanganan kebocoran. |
| Operasi dan biaya | Ketergantungan jaringan, perkiraan bandwidth per stream, biaya lisensi/API/relay, dukungan, batas pemakaian, serta lokasi pemrosesan dan penyimpanan metadata/video. |
| Perubahan versi | Versi API/SDK/firmware yang didukung, kebijakan perubahan/deprekasi, dokumentasi integrasi, dan kanal dukungan vendor. |

Protokol seperti RTSP/RTSPS, WebRTC, HLS, API/SDK vendor, atau mekanisme lain hanya **keluarga opsi yang perlu dievaluasi**. Tidak ada protokol yang dipilih atau diasumsikan tersedia sebelum dibuktikan pada perangkat/platform aktual.

## 4. Aturan otorisasi aplikasi

Backend harus mengevaluasi izin saat sesi dibuat dan setiap kali sesi diperpanjang/di-refresh. Pemeriksaan minimal:

- **Pengemudi:** sesi kerja aktif dan penugasan bus yang sah.
- **Orang tua/wali:** relasi wali–siswa disetujui; siswa tertentu telah dikonfirmasi berada di bus; perjalanan dan penugasan cocok; izin akses belum dicabut.
- **Batas akses:** Operator dapat mengakses seluruh bus/perjalanan/siswa; Pengemudi hanya penugasan yang diberikan; Orang Tua/Wali hanya anak dan perjalanan yang berhak. Jangan memakai organisasi/wilayah sebagai filter akses Operator.
- **Perubahan status:** ketika anak dikonfirmasi turun, relasi dicabut, penugasan berakhir, sesi kerja berakhir, atau akses dinonaktifkan, sesi terkait harus dihentikan/dicabut sesuai kemampuan yang sudah diverifikasi.
- **Pemisahan anak:** akses wali terhadap satu anak tidak boleh memberi akses otomatis ke anak lain di bus yang sama.
- **Akses langsung:** endpoint backend dan sumber stream tidak boleh mengizinkan klien melewati pemeriksaan izin aplikasi.

Jika sumber tidak dapat menghentikan koneksi aktif atau membuat token/URL lama tidak berlaku, dokumentasikan risiko tersebut dan jangan menyebut pencabutan akses sebagai terjamin. Tetapkan batas waktu pencabutan yang dapat diuji sebelum persetujuan produksi.

## 5. Metadata sesi yang disarankan

Antarmuka internal aplikasi sebaiknya menormalisasi respons sumber menjadi struktur konseptual berikut, tanpa mewajibkan nama field vendor tertentu:

- source_id, bus_id, camera_channel_id
- session_id, created_at, expires_at
- playback_method dan metadata pemutaran yang diperlukan
- source_status, last_status_at
- concurrency_limit atau informasi kapasitas bila disediakan
- provider_error_code yang aman untuk diagnostik
- revocation_supported dan status hasil pencabutan

Ini contoh konsep, bukan skema API final. Jangan kirim kredensial sumber, token jangka panjang, alamat internal sensitif, atau detail rahasia vendor kepada klien.

## 6. Beban dan kinerja

Target sekitar 100 bus adalah skala perencanaan, **bukan** target 100 stream simultan. Jumlah penonton bersamaan, pola puncak, durasi tontonan, jumlah kamera per bus, kualitas video, serta bandwidth belum diputuskan.

Sebelum memilih sumber atau desain relay:
- inventaris jumlah kanal kamera per bus dan batas sumber;
- ukur latensi awal, stabilitas, waktu mulai, kualitas pada jaringan seluler, dan penggunaan data;
- uji beban dengan jumlah bus serta penonton bersamaan yang disepakati berdasarkan skenario operasional;
- hitung biaya stream langsung, platform AV, relay, egress, dan lisensi;
- uji akses serentak pengemudi dan wali bila skenario itu diizinkan;
- tetapkan perilaku saat batas kapasitas terlampaui agar aplikasi menampilkan status yang jelas, bukan mengaku stream aktif.

## 7. Uji penerimaan integrasi

Setiap konektor harus menyediakan bukti untuk tes berikut sebelum dinyatakan lulus:

1. Sumber yang terdaftar dan berwenang dapat memulai live stream.
2. Pengguna tanpa login atau tanpa peran yang sesuai ditolak oleh backend.
3. Pengemudi yang tidak ditugaskan, wali yang tidak terhubung, dan wali dengan relasi yang dicabut ditolak; Operator tetap memiliki akses global.
4. Wali ditolak jika anak belum dikonfirmasi berada di bus atau sudah dikonfirmasi turun.
5. Sesi berhenti/ditolak setelah izin dicabut; token/URL lama tidak dapat membuka kembali akses setelah batas waktu pencabutan yang disetujui.
6. Sesi kedaluwarsa tidak dapat dipakai ulang tanpa refresh yang sah.
7. Sumber offline, jaringan putus, kredensial salah, batas konkurensi tercapai, dan layanan AV tidak tersedia menghasilkan status/kesalahan yang dapat ditangani.
8. Pemulihan setelah jaringan kembali tidak melewati otorisasi ulang.
9. Kredensial sumber tidak terlihat pada klien maupun log biasa.
10. Semua pembuatan, penolakan, refresh, dan pencabutan sesi tercatat tanpa membocorkan rahasia.
11. Uji perangkat, browser, dan sistem operasi sasaran yang benar-benar dipilih.
12. Uji beban pada skenario konkurensi yang disetujui untuk pilot sekitar 100 bus.

Simpan hasil uji, tanggal, versi perangkat/firmware/API, konfigurasi, dan keterbatasan. Jangan mencatat tes sebagai lulus hanya karena satu stream berhasil diputar.

## 8. Bukti yang harus dikumpulkan

Untuk setiap model perangkat/DVR atau aplikasi/platform AV, kumpulkan:
- nama produk, model/versi/firmware dan jumlah unit/kanal yang dipakai;
- dokumentasi resmi API/SDK/protokol dan versi;
- bukti hak integrasi/otorisasi dari pemilik atau vendor;
- diagram alur autentikasi dan manajemen kredensial;
- bukti sesi berumur pendek, refresh, stop/revoke, dan perilaku token lama;
- batas penonton bersamaan, batas API, codec/protokol, persyaratan klien, dan batas bandwidth;
- lokasi pemrosesan data, subprosesor, retensi, biaya, dan syarat kontrak yang relevan;
- hasil tes pada jaringan/perangkat pilot serta kontak dukungan.

Ketiadaan dokumen atau bukti ditandai **BELUM TERVERIFIKASI**, bukan diisi dengan dugaan.

## 9. Pertanyaan terbuka

- Perangkat/DVR apa dan firmware/kanal apa yang sudah terpasang pada bus pilot?
- Aplikasi/platform AV apa yang telah digunakan, jika ada, dan apakah pemiliknya menyediakan integrasi resmi?
- Berapa kamera per bus dan berapa penonton bersamaan pada jam sibuk?
- Apakah pengemudi dan wali boleh menonton sumber yang sama secara bersamaan?
- Perangkat mobile, browser, dan versi OS apa yang harus didukung?
- Berapa batas waktu pencabutan sesi yang dapat diterima dan dibuktikan?
- Apakah sumber memerlukan relay/proxy, dan di wilayah mana stream diproses?
- Siapa yang memiliki hak untuk mengizinkan pemrosesan/penayangan video dan bagaimana dasar serta pemberitahuan privasinya dikelola?
- Berapa anggaran bandwidth, relay, lisensi, dan biaya vendor yang dapat diterima?

## 10. Status dan gerbang berikutnya

**Status saat ini:** spesifikasi generik didokumentasikan; tidak ada vendor/protokol yang dipilih; tidak ada integrasi atau tes perangkat yang dilakukan.

Langkah berikutnya adalah inventarisasi perangkat dan platform AV aktual, meminta bukti resmi, lalu menjalankan proof-of-compatibility terbatas pada lingkungan uji. Jangan mulai implementasi produksi sebelum hak integrasi, keamanan akses, pencabutan, kompatibilitas, biaya, dan persyaratan privasi ditinjau. Persetujuan dokumen ini bukan jaminan bahwa suatu perangkat/platform kompatibel.
