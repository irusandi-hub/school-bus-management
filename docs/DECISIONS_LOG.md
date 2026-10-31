# Catatan Keputusan

Catat keputusan yang disetujui pemilik produk. Jangan mencatat rekomendasi yang belum disetujui sebagai keputusan final.

## Format entri
- **ID:** DEC-XXX
- **Tanggal:**
- **Status:** DISETUJUI / DITOLAK / DITUNDA
- **Keputusan:**
- **Alasan:**
- **Dampak pada dokumen/tes:**
- **Pihak yang menyetujui:**

## Keputusan awal dari percakapan

### DEC-001 — Tiga peran pengguna
- **Status:** DISETUJUI
- **Keputusan:** Sistem memiliki Admin Pusat, Pengemudi, dan Orang Tua/Wali. Setiap pengguna login dan memperoleh hak akses sesuai perannya.
- **Dampak:** Master specification, desain autentikasi, otorisasi server/database, dan QA.

### DEC-002 — Informasi utama melalui aplikasi
- **Status:** DISETUJUI
- **Keputusan:** Status, perjalanan, dan lokasi diakses melalui aplikasi. Notifikasi rutin SMS/WhatsApp tidak termasuk kebutuhan versi awal. Nomor HP digunakan untuk verifikasi/keamanan bila diperlukan.
- **Dampak:** Ruang lingkup integrasi dan desain pengalaman pengguna.

### DEC-003 — Riwayat keikutsertaan sejak versi pertama
- **Status:** DISETUJUI
- **Keputusan:** Riwayat keikutsertaan siswa disimpan sejak awal agar dapat menjadi dasar rekap penggunaan dan kemungkinan tarif masa depan. Penagihan belum termasuk kebutuhan awal.
- **Dampak:** Model data, laporan, audit, dan QA.

### DEC-004 — Rute default dihitung sebelum sesi kerja
- **Status:** DISETUJUI
- **Keputusan:** Rute default dihitung ketika data awal/relevan berubah, ditinjau dan disetujui admin, lalu dimuat saat pengemudi memulai sesi.
- **Dampak:** Desain routing dan versi rute.

### DEC-005 — Urutan stop stabil
- **Status:** DISETUJUI
- **Keputusan:** Setelah disetujui, urutan stop dikunci. Siswa yang tidak ikut dilewati tanpa mengurutkan ulang stop tersisa. Penutupan jalan dapat mengubah jalur antartitik tanpa mengubah urutan stop.
- **Dampak:** Routing runtime dan QA.

### DEC-006 — Radius validasi awal
- **Status:** DISETUJUI SEBAGAI KEBUTUHAN AWAL
- **Keputusan:** Radius awal untuk validasi jemput/turun adalah 100 meter, dengan pemeriksaan akurasi dan kesegaran GPS. Radius dan perilaku akhir masih harus divalidasi teknis/lapangan.
- **Dampak:** Validasi lokasi dan QA.

### DEC-007 — Siklus akses kamera
- **Status:** DISETUJUI
- **Keputusan:** Pengemudi memiliki akses sesuai sesi kerja aktif. Akses orang tua untuk seorang anak berlaku saat anak dikonfirmasi berada di bus dan berakhir saat anak turun/akses dicabut. Server harus menegakkan pencabutan akses.
- **Dampak:** Otorisasi streaming dan QA keamanan.

### DEC-008 — Pemeriksaan kabin
- **Status:** DISETUJUI
- **Keputusan:** Sebelum sesi kerja diakhiri, pengemudi wajib memeriksa kabin secara fisik. Status siswa yang masih di bus/tidak jelas memicu peringatan dan menahan penutupan normal sesuai aturan.
- **Dampak:** Alur akhir sesi dan QA.

### DEC-009 — Titik jemput bersama hanya rekomendasi
- **Status:** DISETUJUI
- **Keputusan:** Koordinat yang berdekatan sekitar 5–10 meter dapat memicu rekomendasi pemeriksaan titik bersama. Penggabungan hanya setelah ditinjau dan disetujui admin; identitas dan status siswa tetap terpisah.
- **Dampak:** Master data, UI admin, routing, dan QA.

### DEC-010 — Proyek dimulai dengan dokumentasi
- **Status:** DISETUJUI
- **Keputusan:** Repository `school-bus-management` dimulai dari dokumentasi dan aturan proyek; implementasi fitur bisnis menunggu tinjauan spesifikasi teknis.
- **Dampak:** Struktur repository dan instruksi agen.

### DEC-011 — Peran produk adalah penyedia aplikasi
- **Tanggal:** 2026-10-29
- **Status:** DISETUJUI
- **Keputusan:** Proyek menyediakan aplikasi untuk sekolah, perusahaan/operator bus sekolah beserta pengemudinya, dan orang tua/wali siswa. Sekolah dan operator dapat menggunakan aplikasi bersama-sama atau masing-masing sesuai model operasi mereka. Penyedia aplikasi tidak diposisikan sebagai operator transportasi sekolah.
- **Alasan:** Pemilik produk secara eksplisit membatasi ruang lingkup bisnis pada penyediaan aplikasi.
- **Dampak pada dokumen/tes:** Perbarui master specification, matriks model operasi, onboarding organisasi, matriks akses multi-organisasi, dan rancangan T&C/privasi. Jangan menyimpulkan bahwa penyedia aplikasi bebas dari kewajiban hukumnya sendiri.

### DEC-012 — Kewenangan pengguna dan Terms & Conditions
- **Tanggal:** 2026-10-29
- **Status:** DISETUJUI SEBAGAI PRINSIP PRODUK; REDAKSI HUKUM BELUM FINAL
- **Keputusan:** Pengguna/organisasi yang menjalankan kegiatan melalui aplikasi wajib memiliki izin, kewenangan, dan hak yang diperlukan serta mematuhi peraturan yang berlaku di wilayah operasinya. Prinsip ini dijelaskan dalam Terms & Conditions; perubahan atau berakhirnya kewenangan perlu ditangani sesuai proses yang akan ditentukan.
- **Alasan:** Pemilik produk menyatakan izin dan kewenangan operasional melekat pada masing-masing pihak; aplikasi disediakan sebagai perangkat lunak.
- **Dampak pada dokumen/tes:** Susun T&C dan onboarding yang menyatakan tanggung jawab pengguna/organisasi dengan jelas; tinjau rumusan oleh penasihat hukum yang kompeten. T&C tidak otomatis menghapus kewajiban hukum penyedia aplikasi dan tidak menggantikan kebijakan privasi, keamanan, atau kewajiban lain yang berlaku. Belum diputuskan apakah onboarding memerlukan nomor/dokumen izin atau hanya pernyataan pengguna.

### DEC-013 — Kota pilot, skala awal, dan sumber kamera
- **Tanggal:** 2026-10-29
- **Status:** DISETUJUI UNTUK ASUMSI PERENCANAAN AWAL
- **Keputusan:** Kota pilot adalah Dammam dan sekitarnya. Target skala pelayanan awal sekitar 100 bus. Kamera dan DVR sudah terpasang secara mandiri pada bus; aplikasi hanya menyediakan akses live stream. Sumber stream boleh berupa perangkat/DVR langsung atau aplikasi/platform AV yang sudah terpasang, selama integrasi resmi/terotorisasi dan kontrol akses memadai tersedia. Aplikasi tidak mengadakan atau memasang perangkat.
- **Alasan:** Dikonfirmasi langsung oleh pemilik produk.
- **Dampak pada dokumen/tes:** Uji cakupan routing dan GPS di area pilot; inventaris perangkat kamera/DVR aktual; inventaris perangkat/DVR dan aplikasi/platform AV yang sudah ada; verifikasi protokol, autentikasi, kompatibilitas, hak integrasi, pencabutan akses, kapasitas stream bersamaan, bandwidth, dan biaya. Target 100 bus tidak berarti 100 stream bersamaan; kebutuhan konkurensi masih harus diukur.

### DEC-014 — Spesifikasi umum sumber live stream kamera
- **Tanggal:** 2026-10-29
- **Status:** DISETUJUI SEBAGAI ARAH DESAIN; METODE TEKNIS BELUM DIPUTUSKAN
- **Keputusan:** Spesifikasi integrasi kamera dibuat umum dan tidak dikunci ke merek, perangkat, atau protokol tertentu. Live stream dapat diambil langsung dari perangkat/DVR yang telah terpasang atau disediakan melalui aplikasi/platform AV yang sudah berjalan pada sistem bus, selama tersedia integrasi resmi/terotorisasi dan memenuhi keamanan serta kontrol akses aplikasi.
- **Alasan:** Pemilik produk ingin menghindari ketergantungan pada satu metode koneksi sebelum perangkat dan kemampuan integrasinya diketahui.
- **Dampak pada dokumen/tes:** Tetapkan antarmuka integrasi yang netral terhadap sumber; evaluasi opsi direct-device/DVR dan AV-platform handoff berdasarkan dokumentasi resmi, autentikasi, kemampuan pencabutan sesi, batas stream bersamaan, latensi, jaringan, biaya, dan lokasi pemrosesan data. Jangan menerima URL publik permanen sebagai mekanisme akses yang aman. Tidak ada pilihan teknis atau vendor yang difinalkan.

### DEC-021 — Implementasi modul data Admin Pusat dan akun wali
- **Tanggal:** 2026-10-31
- **Status:** DISETUJUI (instruksi pemilik produk untuk tahap implementasi ini)
- **Keputusan:** Pemilik produk meminta implementasi nyata modul data Admin Pusat (sekolah, operator, siswa, wali, bus, pengemudi) yang tersambung ke Supabase, beserta alur akun wali sesuai DEC-017. Ini membuka gerbang implementasi DEC-010 **hanya** untuk modul data dan akun; GPS, routing, kamera, integrasi perangkat/vendor, dan modul perjalanan tetap di luar lingkup dan tetap memerlukan gerbang terpisah.
- **Aturan turunan yang diterapkan:**
  - Peran akun hanya dibaca dari `public.profiles.role` di database. Tidak ada pemilih peran yang memberi hak akses.
  - Akun wali hanya dapat diklaim jika email terverifikasi, sudah didaftarkan Admin pada tabel `guardians`, aktif, dan memiliki minimal satu siswa berstatus layanan `active`. Klaim dilakukan oleh fungsi `public.claim_guardian_account()`; fungsi itu juga yang menulis `profiles.role = 'parent'`.
  - Satu siswa hanya memiliki satu wali (`students.guardian_id`), satu wali dapat memiliki banyak siswa (`guardians.id`).
  - Status layanan siswa (`active`, `paused`, `ended`) terpisah dari kehadiran perjalanan dan GPS. Perubahan status wajib beralasan dan hanya melalui `public.set_student_service_status()`; histori dicatat pada `student_service_status_history` yang bersifat append-only.
  - Tidak ada penghapusan data: nonaktifkan menggantikan hapus, dan tidak ada hak `DELETE` yang diberikan pada tabel modul ini.
- **Alasan:** Instruksi eksplisit untuk melanjutkan pembangunan modul data dengan penyimpanan nyata dan akses aman, tanpa menunggu modul operasional yang masih bergantung pada vendor/perangkat.
- **Dampak pada dokumen/tes:** README, backlog, dan migrasi `20261031000000_admin_core_crud.sql`. Pengujian yang dijalankan hanya typecheck, build, dan unit test fungsi validasi karena belum ada kredensial Supabase maupun lingkungan database untuk pengujian integrasi.

## Hal yang belum diputuskan

Lihat `TECHNICAL_SPEC_REVIEW.md`, bagian 19 pada `MASTER_SPEC.md`, serta `OPERATING_MODEL_RESPONSIBILITY_MATRIX.md`. Jangan mengubah pertanyaan terbuka menjadi keputusan tanpa persetujuan.


### DEC-015 — Antarmuka generik integrasi live stream
- **Tanggal:** 2026-10-29
- **Status:** DISETUJUI SEBAGAI ARAH DOKUMENTASI; KONTRAK TEKNIS DAN KOMPATIBILITAS BELUM TERVERIFIKASI
- **Keputusan:** Dokumentasikan kemampuan minimum integrasi live stream secara netral terhadap vendor, dengan sumber potensial berupa perangkat/DVR langsung atau aplikasi/platform AV yang telah terpasang. Antarmuka harus mencakup autentikasi server-side, sesi terbatas, pemeriksaan izin, pencabutan akses, status sumber, batas konkurensi, audit, serta bukti kompatibilitas.
- **Alasan:** Pemilik produk meminta spesifikasi integrasi umum sebelum menentukan metode atau vendor.
- **Dampak pada dokumen/tes:** Gunakan `docs/GENERIC_CAMERA_STREAMING_INTERFACE.md` sebagai daftar kebutuhan dan bukti evaluasi. Protokol, vendor, arsitektur relay, target konkurensi, dan batas waktu pencabutan tetap BELUM DIPUTUSKAN sampai perangkat/platform aktual diuji. Dokumen ini bukan persetujuan implementasi produksi.


### DEC-016 — Prioritas navigasi dan laporan orang tua
- **Tanggal:** 2026-10-29
- **Status:** DISETUJUI
- **Keputusan:** Fokus utama aplikasi adalah navigasi operasional bus sekolah dan informasi/laporan orang tua. Live stream kamera adalah fitur tambahan yang dapat dikonfigurasi atau diaktifkan kemudian; kesiapan integrasi kamera bukan prasyarat untuk menyelesaikan alur inti.
- **Alasan:** Pemilik produk menegaskan bahwa pekerjaan sebelumnya terlalu berfokus pada perangkat AV, padahal video hanya fitur tambahan.
- **Dampak pada dokumen/tes:** Prioritaskan validasi rute dan urutan stop, GPS, status jemput/turun, status lokasi terbaru/usang, riwayat keikutsertaan, laporan orang tua, isolasi akses, dan audit. Dokumen kamera tetap dipertahankan sebagai referensi lanjutan dan tidak boleh menggeser prioritas navigasi/laporan.


### DEC-017 — Model akun wali, email, dan kelayakan layanan siswa
- **Tanggal:** 2026-10-30
- **Status:** DISETUJUI
- **Keputusan:** Email wali harus dipra-daftarkan oleh Admin Pusat dan disimpan di database. Signup menggunakan email terdaftar, tautan verifikasi email, lalu pembuatan kata sandi. Sign-in menggunakan email dan kata sandi; Admissions Number hanya identitas siswa. Satu siswa hanya memiliki satu relasi akun wali, sementara satu akun wali dapat terhubung ke beberapa siswa. Tidak ada kategori akun keluarga.
- **Kelayakan layanan:** Signup dan sign-in memerlukan setidaknya satu siswa terkait berstatus layanan aktif. Jika akun memiliki beberapa siswa dan hanya sebagian aktif, akun tetap dapat digunakan hanya untuk siswa aktif. Jika semua siswa terkait nonaktif, akses layanan ditolak. Status layanan siswa terpisah dari kehadiran/perjalanan dan status GPS; riwayat tidak dihapus otomatis saat status berubah.
- **Alasan:** Dikonfirmasi langsung oleh pemilik produk.
- **Dampak pada dokumen/tes:** Perbarui MASTER_SPEC, model data dan matriks akses setelah tinjauan; uji relasi satu wali per siswa, banyak siswa per wali, email pra-daftar/verifikasi, semua kombinasi status aktif/nonaktif, dan pemutusan akses server/database. Desain implementasi dan migrasi tetap menunggu gerbang tinjauan teknis.

### DEC-018 — Pesan wajib untuk semua penolakan dan kegagalan
- **Tanggal:** 2026-10-30
- **Status:** DISETUJUI
- **Keputusan:** Setiap penolakan, validasi gagal, akses ditolak, tindakan tidak tersedia, atau proses gagal wajib memberikan informasi yang jelas, ringkas, akurat, dan relevan. Bila memungkinkan, sertakan langkah berikutnya. Tidak boleh ada kegagalan senyap atau tombol nonaktif tanpa alasan yang dapat dipahami.
- **Batas keamanan:** Pesan tidak boleh membocorkan data siswa, keberadaan akun orang lain, rahasia, kredensial, token, stack trace, atau detail internal server. Bila penyebab belum diketahui, jangan menebak; sampaikan bahwa proses belum berhasil dan berikan langkah pemulihan yang aman. Detail teknis dicatat di log internal terlindungi.
- **Alasan:** Dikonfirmasi langsung oleh pemilik produk.
- **Dampak pada dokumen/tes:** Terapkan ke seluruh peran dan fitur, termasuk autentikasi, CRUD, otorisasi, perjalanan, GPS, kamera/video, dan ekspor. QA wajib mencakup seluruh jalur penolakan/kegagalan dan memeriksa kejelasan pesan serta tidak adanya kebocoran data.

### DEC-019 — Tampilan wali adaptif dan ringkas untuk banyak siswa
- **Tanggal:** 2026-10-30
- **Status:** DISETUJUI
- **Keputusan:** Akun satu siswa dan banyak siswa menggunakan model akun yang sama. UI menampilkan kartu/frame anak berukuran ringkas dan adaptif; informasi video, GPS, dan status harus dapat terlihat bersama tanpa membuat kartu anak terlalu besar atau menampilkan panel kosong besar saat data tidak tersedia.
- **Alasan:** Pemilik produk menginginkan tampilan yang efisien untuk beberapa informasi sekaligus.
- **Dampak pada dokumen/tes:** Audit dan desain ulang UI wali responsif; uji satu dan beberapa siswa pada layar ponsel serta layar lebih lebar. Kebutuhan ini belum dianggap terimplementasi sebelum diverifikasi pada aplikasi.


### DEC-020 — Sumber GPS fase pertama untuk pilot
- **Tanggal:** 2026-10-30
- **Status:** DISETUJUI UNTUK ARAH FASE PERTAMA; PARAMETER DAN KELAYAKAN LAPANGAN BELUM TERVERIFIKASI
- **Keputusan:** Sumber GPS fase pertama adalah ponsel Android milik pengemudi yang sedang ditugaskan. GPS/AVL bawaan bus ditunda ke fase berikutnya. Lokasi hanya dikirim untuk penugasan/perjalanan aktif yang sah. Pergantian pengemudi atau bus harus mengakhiri keterkaitan sesi lama dan tercatat.
- **Hal yang tetap terbuka:** Interval pengiriman, ambang status usang, batas akurasi, perangkat minimum, konsumsi baterai/data, perilaku latar belakang dan offline harus ditentukan melalui pengujian pada perangkat pilot.
- **Alasan:** Dikonfirmasi oleh pemilik produk sebagai sumber GPS untuk fase pertama.
- **Dampak pada dokumen/tes:** MASTER_SPEC, alur inti, dan tinjauan teknis harus konsisten. Uji siklus hidup sesi saat pergantian pengemudi/bus, izin lokasi, aplikasi di latar belakang/layar terkunci, jaringan putus/pulih, akurasi, kesegaran, baterai, dan penggunaan data. Keputusan ini tidak menyatakan perangkat atau perilaku GPS sudah lulus uji dan tidak mengizinkan implementasi sebelum gerbang tinjauan teknis disetujui.
