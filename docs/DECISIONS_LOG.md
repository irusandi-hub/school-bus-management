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


### DEC-022 — Main Access Gate, tiga area pengguna, dan identitas visual School Bus Yellow
- **Tanggal:** 2026-10-31
- **Status:** DISETUJUI UNTUK IMPLEMENTASI UI; ISOLASI RLS ANTARPERAN BELUM TERVERIFIKASI
- **Keputusan:**
  - Halaman pertama menjadi **Main Access Gate** dengan tiga kartu: Admin & Operator, Pengemudi, Orang Tua/Wali. Kartu hanya pintu masuk ke `/login?peran=...`; kartu tidak pernah menentukan hak akses. Setelah autentikasi, peran dibaca dari `profiles.role` dan relasi organisasi (`operators.profile_id`, `drivers.profile_id`, relasi wali–siswa), lalu pengguna diarahkan ke area miliknya. `scopedNext` menolak tujuan pasca-login yang berada di luar area peran.
  - Tiga area terpisah dengan layout, navigasi, dan Server Action sendiri: Admin & Operator (`/admin`, `/operator`), Pengemudi (`/pengemudi`), Orang Tua/Wali (`/wali`). Admin Pusat = kewenangan platform; Operator = hanya organisasinya (CRUD bus/pengemudi/penugasan sendiri, rute hanya baca). Pengemudi hanya penugasan/perjalanan miliknya. Wali hanya siswa aktif miliknya. Setiap layout dan Server Action memanggil pemeriksaan peran di server, dan seluruh rute internal dilindungi middleware.
  - Peran baru `operator` ditambahkan melalui migrasi aditif `20261031000001_operator_driver_guardian_areas.sql` (role operator, `operators.profile_id`, `schools.operator_id`, `student_route_stops`, `trips.arrived_at`, policy RLS per peran, trigger audit). Skema tidak diubah di luar kebutuhan area baru, dan migrasi **belum dijalankan**.
  - Identitas visual **School Bus Yellow**: `#FFC431` (brand), `#FFD670`, `#FFE4A1`, `#FFEEC5`, `#FFF4DB` sebagai token pusat di `app/globals.css`; teks `#252525`/`#666666`, latar `#FFFDF8`, garis `#E9E3D8`. Tombol utama kuning dengan teks gelap, sidebar netral dengan aksen kuning, status operasional tetap memakai warna semantik (bukan semua kuning).
  - Tidak ada data GPS, perjalanan, atau kamera yang dibuat-buat; modul yang belum tersedia hanya menampilkan keterangan jujur, dan tautan kamera tidak ditampilkan sama sekali.
- **Alasan:** Permintaan pemilik produk untuk satu gerbang akses, tiga pengalaman pengguna terpisah, pemisahan hak akses di server/database, dan identitas visual konsisten, sambil mempertahankan CRUD Admin Pusat dari DEC-021.
- **Dampak pada dokumen/tes:** README (rute, migrasi, ringkasan RLS, penautan akun operator/pengemudi), status backlog. Verifikasi: `typecheck` lulus, 28 unit test lulus, `next build` lulus, preview gate dan rute internal dicek. **BELUM TERVERIFIKASI:** eksekusi migrasi, isolasi RLS dengan akun tiap peran, dan alur login end-to-end — lingkungan ini tidak memiliki kredensial Supabase. Jangan menganggap isolasi antarperan teruji sebelum pengujian di proyek pengembangan.



### DEC-023 — UI terbuka selama tahap pengembangan
- **Tanggal:** 2026-11-01
- **Status:** DISETUJUI
- **Keputusan:** Selama tahap pembangunan dan peninjauan UI, seluruh area Admin Pusat, Operator, Pengemudi, dan Orang Tua/Wali dapat dibuka tanpa login, pendaftaran akun, verifikasi email, atau penautan akun. Autentikasi, verifikasi, pemeriksaan peran, RLS, dan pembatasan akses final ditunda sampai seluruh halaman dan alur empat area selesai ditinjau.
- **Batas keamanan wajib:** Mode terbuka hanya boleh aktif pada local/development/preview non-production dengan deteksi environment yang eksplisit dan fail-closed. Mode ini tidak boleh aktif di production, tidak boleh memakai atau membuka data produksi, dan tidak membenarkan pelemahan RLS/database produksi. Data simulasi hanya boleh dipakai di development serta harus diberi label.
- **Urutan pengerjaan:** Admin Pusat → Operator → Pengemudi → Orang Tua/Wali → integrasi autentikasi dan otorisasi final.
- **Alasan:** Pemilik produk meminta semua halaman dan workflow selesai dan ditinjau sebelum proses autentikasi/registrasi diintegrasikan.
- **Dampak pada dokumen/tes:** Perbarui AGENTS.md, README, konfigurasi environment, middleware, server guards, dan pengujian agar mode pengembangan terbuka terpisah tegas dari keamanan production. Setiap halaman diuji fungsi, hubungan data, responsivitas, pesan gagal/penolakan, serta penandaan fitur GPS/routing/kamera yang belum tersedia.
- **Pihak yang menyetujui:** Pemilik produk melalui percakapan 2026-11-01.

### DEC-024 — Dataset simulasi bertahan selama proses server hidup
- **Tanggal:** 2026-11-02
- **Status:** DISETUJUI
- **Keputusan:** Mode pengembangan terbuka memakai satu dataset simulasi in-memory yang dibuat sekali per proses server, bukan per request, sehingga tambah/ubah dari Server Action terlihat pada halaman berikutnya. Dataset kembali ke kondisi awal saat server dimulai ulang dan tidak pernah menyentuh database produksi.
- **Batas:** Hanya aktif pada environment non-production yang dikenali eksplisit (fail-closed). Dataset tidak meniru kebijakan RLS, sehingga isolasi antaroperator di mode ini belum dapat dijadikan bukti keamanan.
- **Dampak pada dokumen/tes:** `tests/dev-simulation.test.ts` mengunci perilaku persistensi ini.

### DEC-025 — Perjalanan tidak boleh ditutup tanpa pemeriksaan keselamatan
- **Tanggal:** 2026-11-02
- **Status:** DISETUJUI
- **Keputusan:** Pengemudi hanya dapat mengakhiri perjalanan setelah (1) kedatangan di sekolah dikonfirmasi, (2) seluruh siswa aktif pada rute sudah dicatat statusnya, dan (3) tiga pemeriksaan keselamatan wajib dikonfirmasi (kondisi bus, kecocokan jumlah siswa, tidak ada siswa tertinggal). Bukti pemeriksaan disimpan pada kolom `trips.safety_checked_at`, `trips.safety_check_notes`, dan `trips.student_count_confirmed`.
- **Penegakan:** Validasi di Server Action (`lib/driver/trip-end.ts`) dan batasan database `trips_completed_requires_safety_check` agar perjalanan berstatus `completed` selalu memiliki jejak pemeriksaan.
- **Dampak pada dokumen/tes:** Migration `20261102000000_trip_safety_check.sql`, pengujian `tests/driver-trip-end.test.ts`.

### DEC-026 — Penuntasan area peran: skop RLS, penautan akun via UI, dan penjagaan perjalanan
- **Tanggal:** 2026-11-01
- **Status:** DISETUJUI UNTUK IMPLEMENTASI; MIGRASI TERUJI PADA POSTGRES LOKAL, BELUM DITERAPKAN KE SUPABASE
- **Keputusan:**
  - **Skop operator di database, bukan di menu.** Operator hanya dapat membaca rute/titik jemput/roster siswa yang sekolahnya milik organisasinya (`routes.school_name` = nama sekolah dengan `schools.operator_id` = organisasi operator), dan hanya dapat membuat penugasan yang rute, bus, serta pengemudinya milik organisasi itu. Rute dan titik jemput tetap hanya-baca bagi operator (sesuai DEC-022 dan MASTER_SPEC: Admin menyetujui rute); operator mendapat halaman detail `/operator/rute/[id]` untuk melihat urutan titik dan roster per titik.
  - **Policy RLS tidak boleh melakukan join antar tabel yang memiliki policy sendiri.** PostgreSQL menolak policy yang saling merujuk (`infinite recursion detected in policy`), dan pola itu muncul pada schools↔students, schools↔guardians, trip_assignments↔buses, serta trip_assignments↔routes. Seluruh skop lintas tabel dipindahkan ke fungsi `security definer` di skema `private` (`operator_school_ids`, `operator_student_ids`, `operator_route_ids`, `operator_bus_ids`, `operator_driver_ids`, `operator_guardian_ids`, `driver_route_ids`, `driver_student_ids`, `guardian_bus_ids`), dengan `search_path = ''` dan grant hanya ke `authenticated`.
  - **Penautan akun operator/pengemudi dilakukan Admin Pusat lewat UI.** Migrasi `20261031000002_operator_driver_account_linking.sql` menambahkan RPC `link_operator_account`, `unlink_operator_account`, `link_driver_account`, `unlink_driver_account`, dan `linked_account_emails`. Semuanya memeriksa `private.is_admin()` di database; email harus milik akun `auth.users` terverifikasi dan belum tertaut ke baris lain. Halaman `/admin/operator` dan `/admin/pengemudi` menampilkan email akun tertaut serta formulir tautkan/lepas tautan. Pelepasan tautan mengembalikan `profiles.role` menjadi `parent` bila akun tidak lagi tertaut.
  - **Satu perjalanan aktif per penugasan dijaga database.** Indeks unik parsial `trips_one_active_idx` pada `trips (assignment_id)` untuk status `scheduled`/`in_progress` mencegah dua perjalanan aktif meskipun permintaan dikirim di luar UI.
  - **Akhir perjalanan memakai pemeriksaan kabin versi lunak.** `endTrip` menolak bila tidak ada baris yang berubah (misalnya perjalanan sudah diakhiri pengguna lain) dan meminta konfirmasi eksplisit (`acknowledge_open`) bila masih ada siswa berstatus naik atau belum dicatat; konfirmasi dicatat sebagai pengecualian yang diketahui, bukan kegagalan senyap.
- **Alasan:** Permintaan pemilik produk agar area peran benar-benar selesai dan hak akses diperiksa server/database, bukan berdasarkan pilihan menu atau URL, tanpa data contoh palsu.
- **Dampak pada dokumen/tes:** README (daftar migrasi keempat, penautan akun lewat UI, ringkasan RLS, cara menjalankan uji migrasi), `docs/IMPLEMENTATION_BACKLOG.md`. Verifikasi: keempat migrasi dijalankan berurutan pada Postgres 14 lokal (database kosong + stub `auth`), lalu `supabase/tests/migration_checks.sql` (T1–T14) berakhir dengan “SEMUA PEMERIKSAAN MIGRASI DAN RLS LULUS”; `npm run typecheck` lulus, `npm test` 28/28 lulus, `npm run build` lulus. **BELUM TERVERIFIKASI:** penerapan migrasi pada proyek Supabase pengembangan, alur login/penautan akun end-to-end lewat browser, dan pengujian Server Action otomatis. GPS, routing, dan kamera tetap ditunda.

**Catatan integrasi PR #12:** Pemeriksaan kabin versi lunak di atas tetap berlaku sebagai konfirmasi tambahan untuk status naik, bukan pengganti DEC-025. Kedatangan, pencatatan seluruh siswa, dan tiga checklist keselamatan tetap wajib; kegagalan pembacaan roster/event menolak penutupan, dan pembaruan tanpa baris berubah ditolak.

### DEC-027 — Akses terbuka Preview memakai penanda platform, bukan dua variabel dashboard
- **Tanggal:** 2026-11-03
- **Status:** DISETUJUI UNTUK IMPLEMENTASI (perbaikan setelah PR #14 di-merge)
- **Masalah:** Setelah PR #14 di-merge, deploy Vercel masih mengarahkan ke `/login`. Penyebabnya: `isDevOpenAccess()` mensyaratkan `DEV_OPEN_ACCESS=1` **dan** `NEXT_PUBLIC_APP_ENV=preview` di environment Preview, sementara `NODE_ENV` pada deploy non-development selalu `production`, sehingga penanda preview tunggal tidak pernah cukup. Kedua variabel itu hanya bisa diisi dari dashboard Vercel.
- **Keputusan:** Jenis lingkungan ditentukan satu fungsi terpusat `deploymentKind()` di `lib/dev-open-access.ts` dari penanda yang disuntikkan platform: `VERCEL_ENV` (`production`/`preview`/`development`), `NODE_ENV`, dan penanda aplikasi (`APP_ENV`/`NEXT_PUBLIC_APP_ENV`).
  - `production` selalu tertutup, termasuk bila `DEV_OPEN_ACCESS=1` atau `PRODUCTION=1` terpasang.
  - Lingkungan tak dikenal (`NODE_ENV=production` tanpa penanda Vercel, `VERCEL_ENV` asing, penanda aplikasi asing) tertutup — fail-closed.
  - `preview` (Vercel Preview) dan `development` (lokal) **terbuka secara default**, sehingga peninjauan UI tidak lagi bergantung pada pengaturan dashboard Vercel.
  - Sakelar darurat `DEV_OPEN_ACCESS=0/false/off/no` menutup mode di lingkungan non-produksi.
  - `NEXT_PUBLIC_APP_ENV=preview` tidak lagi wajib; bila ada dan bernilai `production`, justru menutup mode.
- **Batas keamanan tetap:** mode terbuka tidak pernah membuat klien Supabase (tidak ada permintaan ke database), RLS dan seluruh policy tidak diubah, tidak ada akun atau data produksi yang dibuat, dan gerbang `requireAdmin/requireOperator/requireDriver/requireGuardian`, pemeriksaan peran, serta skop organisasi tetap utuh untuk lingkungan tertutup. Pita peringatan kini menyebut lingkungan aktif (lokal/Vercel Preview).
- **Verifikasi (2026-11-03):** `npm run typecheck` lulus, `npm test` 60/60 lulus, `npm run build` lulus.
  - Kondisi 1 (Preview, `VERCEL_ENV=preview`, tanpa `DEV_OPEN_ACCESS`): 15 rute empat area termasuk halaman detail dan ekspor CSV menjawab `200` tanpa redirect.
  - Kondisi 2 (Preview, `DEV_OPEN_ACCESS=0`): `/admin`, `/operator`, `/pengemudi`, `/wali` menjawab `307` ke `/login?next=…`.
  - Kondisi 3 (Production, `VERCEL_ENV=production` + `DEV_OPEN_ACCESS=1`): keempat area `307` ke `/login`, gerbang akses menampilkan CTA masuk, tanpa pita mode pengembangan.
- **Belum terverifikasi:** perilaku pada deployment Vercel sebenarnya (URL Preview terbaru) — lingkungan ini tidak memiliki akses ke pengaturan/deployment Vercel maupun kredensial proyek Supabase pengembangan.

### Kamera HP — demo gratis yang diizinkan (2026-11-05)
- **Status:** Pengembangan demo gratis disetujui pengguna; boleh satu bus/sumber. Tidak ada persetujuan layanan berbayar.
- **Implementasi tahap awal:** uji perangkat satu publisher/satu viewer terisolasi di `/demo-kamera`, opt-in development/preview, signaling manual privat, STUN tanpa TURN/SFU. Ini pilihan teknis awal, bukan persetujuan arsitektur produksi.
- **Batas:** kamera tidak dihubungkan ke identitas/data simulasi wali/pengemudi. Integrasi perjalanan tetap membutuhkan autentikasi dan pencabutan server yang teruji. Tidak mengaktifkan layanan provider atau deployment. Lihat `docs/CAMERA_PHONE_DEMO.md`.

### Tombol siaran pengemudi — tahap uji perangkat (2026-11-05)
- Pengguna meminta tombol siaran pada pengemudi. Ditambahkan panel opt-in di detail tugas berlangsung dengan persetujuan objek uji, tombol mulai/hentikan, preview lokal, dan signaling privat manual yang sudah ada.
- Tidak membuat endpoint signaling publik, pemetaan stream ke identitas simulasi, akses wali otomatis, layanan berbayar, atau perubahan RLS. Flag server development/preview tetap wajib; produksi menutup fitur.
- Ini kontrol uji perangkat pada UI pengemudi, bukan integrasi kamera operasional. Kamera tidak boleh dipakai dengan anak nyata sampai otorisasi/pencabutan server terverifikasi.

### Pilihan sumber siaran pengemudi (2026-11-05)
- Sesuai permintaan pengguna, panel menyediakan Kamera perangkat seluler (HP yang menjalankan aplikasi) dan Kamera bus.
- Kamera bus hanya placeholder pengembangan berikutnya, dengan keterangan “Fitur ini memerlukan setting oleh operator layanan aplikasi.” Tombolnya nonaktif; tidak ada URL, kredensial, atau koneksi vendor ditambahkan.
- Beralih sumber membongkar komponen kamera seluler dan menghapus konfirmasi pengujian; kembali ke seluler tidak memulai kamera otomatis. Batas development/preview dan signaling manual tetap berlaku.

### DEC-028 — Fitur selalu terlihat; status dan alasan yang berubah
- **Tanggal:** 2026-11-06
- **Status:** DISETUJUI UNTUK IMPLEMENTASI UI
- **Keputusan:** Fitur yang sudah diimplementasikan tetap ditampilkan meskipun perjalanan, data, atau prasyaratnya belum siap. Status harus mengikuti kondisi aktual, kontrol tindakan tetap terlihat, dan kontrol yang dinonaktifkan wajib memiliki alasan yang dapat dipahami pengguna. Menampilkan fitur tidak mengubah otorisasi server/database, RLS, validasi perjalanan, atau aturan akses kamera.
- **Penerapan:** Panel kamera, tindakan siswa, navigasi, penutupan perjalanan, pemutar wali, dan formulir Admin/Operator tidak lagi dihilangkan hanya karena status operasional atau prasyarat kosong. Formulir bersama memakai `disabledReason`; server tetap menolak tindakan yang tidak sah.
- **Dampak pada dokumen/tes:** `app/pengemudi`, `components/driver`, `components/guardian`, `components/admin/RecordForm`, halaman Admin/Operator terkait, serta unit test status siaran dan tindakan siswa. Verifikasi harus mencakup kondisi belum tersedia, siap, berjalan, dan selesai.

### DEC-029 — Peta rute pengemudi memakai Leaflet + OpenStreetMap, tampilan saja
- **Tanggal:** 2026-11-06
- **Status:** DISETUJUI UNTUK IMPLEMENTASI UI PENGEMUDI
- **Keputusan:** Halaman pengemudi menampilkan peta Leaflet dengan basemap OpenStreetMap di bawah kartu navigasi dan kartu tindakan siswa. Peta memakai koordinat `route_stops` yang tersimpan, menandai sekolah dan urutan titik, serta menampilkan atribusi OpenStreetMap. Peta bersifat tampilan saja: tidak ada posisi bus, geometri jalur jalan, navigasi belokan, atau perubahan urutan rute.
- **Batas:** GPS bus belum terintegrasi, sehingga lokasi bus ditandai jelas sebagai “Lokasi bus belum tersedia”. Garis peta hanya menghubungkan urutan titik dan diberi keterangan bahwa itu bukan jalur jalan. Koordinat rumah siswa (`students.home_latitude`/`home_longitude`) tidak dipakai sebagai titik peta; titik jemput yang ditampilkan adalah `route_stops` yang menjadi acuan rute. Peta tidak menambah API key, routing engine, atau layanan berbayar.
- **Dampak pada dokumen/tes:** `package.json`, `package-lock.json`, `components/driver/DriverRouteMap.tsx`, `components/driver/DriverMapPanel.tsx`, `app/pengemudi/page.tsx`, dan `app/globals.css`. Layout dua kartu lama dipertahankan; peta menjadi baris penuh di bawahnya. Verifikasi: 120 unit test lulus, typecheck lulus, build lulus, serta screenshot 360 px, 390 px, dan desktop 1280 px. **Belum terverifikasi:** pemuatan ubin di jaringan pengguna, penggunaan OSM pada produksi/volume tinggi, dan integrasi GPS/routing sebenarnya; HERE sebagai penyedia routing tetap belum disetujui.
- **Pihak yang menyetujui:** Pemilik produk melalui percakapan 2026-11-06.

### DEC-030 — Layout operasional satu layar, progres terpadu, dan pemberhentian berikutnya
- **Tanggal:** 2026-11-07
- **Status:** DISETUJUI UNTUK IMPLEMENTASI UI PENGEMUDI
- **Keputusan layout:** Navigasi dan peta berada di kolom kiri; daftar siswa di kolom kanan dengan gulir internal; kamera di bawah grid. Dua kolom dipertahankan pada semua lebar, termasuk 360 px. Header, progres, peta, dan panel siswa dipadatkan agar tidak ada gulir halaman pada 640×360 hingga 1440×900. Susunan peta baris penuh pada DEC-029 digantikan; komponen Leaflet/OSM dan perilaku tampilan-saja tetap dipertahankan.
- **Sumber progres tunggal:** `lib/driver/trip-progress.ts` menurunkan satu status terbaru per siswa dari `trip_student_events`, lalu menghitung total, selesai, belum, tidak ikut, di kendaraan, diproses, dan perlu tindakan. Papan progres, jumlah di kendaraan, dan pemberhentian berikutnya memakai hasil yang sama; tidak ada perhitungan kedua di komponen.
- **Aturan status:** `issue` adalah kendala, bukan status kehadiran. Pagi: `boarded` atau `dropped_off` dianggap sudah dijemput. Sore: hanya `dropped_off` yang dianggap sudah diantar; `boarded` tetap di kendaraan. `absent` tidak dihitung sudah dijemput/diantar dan dipisahkan menjadi tidak hadir vs tidak ikut bus berdasarkan catatan yang tersimpan. Tidak ada status baru, perubahan RLS, migration, atau perubahan arti status lama.
- **Pemberhentian berikutnya:** Memakai `route_stops.stop_order` tersimpan, tidak diurutkan ulang berdasarkan GPS/jarak, melewati siswa yang sudah final atau `absent`, melewati titik sekolah, dan hanya menggabungkan siswa dengan `stop_id` yang sama. Semua nama pada titik itu ditampilkan. Bila tidak ada siswa yang menunggu, UI menampilkan “Semua pemberhentian selesai”. Tidak ada jarak/ETA karena GPS dan routing belum tersedia.
- **Sinkronisasi:** Aksi siswa tetap memakai Server Action dan `revalidatePath`; halaman membaca ulang data server, bukan memperbarui angka secara optimistis. Selama perjalanan berlangsung, refresh server berkala 10 detik serta saat fokus/online/visibility digunakan karena belum ada channel realtime `trip_student_events`. Event berulang atau terlambat tidak menggandakan hitungan karena hasil akhirnya satu status terbaru per siswa.
- **Verifikasi 2026-11-07:** 138 unit test lulus, typecheck lulus, build produksi lulus. Tujuh viewport 360×640, 360×800, 390×844, 430×932, 768×1024, 1280×800, dan 1440×900 diukur tanpa overflow halaman; dua kolom sejajar, peta di kiri, kamera di bawah grid, dan hanya daftar siswa yang menggulir. Skenario sementara 30 siswa membuktikan penjemputan 18/8/4 dan pengantaran 18/12, aksi nyata mengubah progres menjadi 19/7/19 dan 19/11/11, next stop berpindah urutan 7→8, serta pesan selesai muncul saat 26 selesai dan 4 tidak ikut. Fixture 30 siswa dan probe layout bersifat sementara dan tidak disertakan dalam commit.
- **Belum terverifikasi:** channel realtime database (belum tersedia), posisi bus/GPS, jarak/ETA jalan, dan penggunaan kamera dengan data nyata. Layar penuh kamera adalah pratinjau UI; mekanisme siaran, izin, dan signaling tidak diubah.
- **Pihak yang menyetujui:** Pemilik produk melalui percakapan 2026-11-07.

### DEC-031 — Finalisasi `/pengemudi`: scroll daftar, urutan rute, sinkronisasi 2 detik, dan GPS HP
- **Tanggal:** 2026-11-07
- **Status:** DISETUJUI UNTUK IMPLEMENTASI FINALISASI PR #26; BELUM DI-MERGE/DEPLOY
- **Tampilan:** Layout dua kolom, peta kiri, daftar siswa kanan, dan kamera bawah dipertahankan. Tidak ada perubahan ukuran panel, tipografi, warna, atau susunan. Perubahan visual hanya pada informasi operasional: badge sumber GPS, marker posisi HP, progres, status siswa, dan Next Stop.
- **Scroll:** Scroll vertikal halaman, header, panel navigasi, peta, kamera, dan panel lain dihapus. Hanya `.ops-students-scroll` yang tetap `overflow-y:auto`. Panel navigasi diberi tinggi maksimum agar membuka detail titik tidak mendorong peta keluar layar. Konsekuensi aturan “panel navigasi tanpa scroll”: isi daftar titik yang melebihi tinggi panel dipotong (`overflow:clip`), bukan digulir.
- **Urutan siswa:** `lib/driver/student-order.ts` mengurutkan `route_stops.stop_order` lalu `admissions_number` secara numerik dan stabil di dalam `stop_id` yang sama. Roster terurut menjadi satu sumber untuk daftar siswa, papan progres, Next Stop, dan urutan peta. Status siswa dan GPS tidak mengubah urutan. Perubahan `stop_order` terbaca pada sinkronisasi server berikutnya tanpa reload manual.
- **Sinkronisasi:** Aksi siswa tetap Server Action dengan `revalidatePath` dan redirect, sehingga halaman membaca ulang server setelah berhasil dan tidak menampilkan angka optimistis. Polling fallback 2 detik hanya saat perjalanan `in_progress`, berhenti saat tidak aktif/background, segera menyegarkan saat tab terlihat, fokus, atau online, dan dijaga agar tidak ada refresh bersamaan/ganda. Tidak ada channel realtime `trip_student_events`; polling tidak disebut Realtime.
- **GPS:** `components/driver/useDriverLocation.ts` memakai satu `navigator.geolocation.watchPosition()` hanya selama perjalanan aktif dan `clearWatch()` saat berhenti. Validasi di `lib/driver/device-location.ts`: koordinat dalam rentang, akurasi ≤100 m, sampel ≤30 detik. Status yang ditampilkan: belum aktif, mencari, aktif, izin ditolak, tidak didukung, tidak tersedia, tidak valid, dan kedaluwarsa. Marker `HP` diperbarui tanpa membuat ulang peta; GPS tidak mengubah urutan rute. GPS bus belum tersedia karena repo tidak memiliki sumber koordinat perangkat bus; tidak ada GPS bus palsu.
- **Verifikasi 2026-11-07:** `npm test` 147/147 lulus; `npx tsc --noEmit` lulus; `npm run build` lulus. Probe layout sementara (dihapus sebelum commit) dengan 30 baris siswa mengukur: 360×640 dokumen 640/640, daftar 4063/261, `overflowY:auto` hanya pada daftar; 390×844 dokumen 844/844, daftar 3808/474; 1280×800 dokumen 800/800, daftar 4576/326. `scrollWidth` sama dengan `clientWidth` pada ketiga viewport. Posisi header, panel navigasi, peta, dan kamera identik sebelum/sesudah daftar digulir. Perbandingan piksel 1280×800: 99,93% identik; satu-satunya wilayah berubah adalah badge GPS (sekitar 112×18 px CSS), tanpa pergeseran komposisi. Screenshot final 360×640, 390×844, dan 1280×800 disimpan di `docs/review/pengemudi-finalization/`.
- **Belum terverifikasi:** izin dan koordinat GPS nyata pada perangkat pengemudi (tidak ada sensor/perangkat di lingkungan ini), GPS bus, dan kesamaan piksel 360/390 dengan screenshot sebelumnya karena screenshot acuan 360/390 memakai fixture 30 siswa sementara sedangkan tangkapan final memakai seed normal. Sinkronisasi eksternal hanya polling 2 detik; Realtime database memerlukan publication/channel yang belum ada dan tidak diubah.

### DEC-032 — Lokasi GPS HP pengemudi untuk wali dan interaksi peta
- **Tanggal:** 2026-11-07
- **Status:** DIPERSIAPKAN PADA BRANCH `feat/driver-integrated-ops`; MIGRATION BELUM DITERAPKAN, BELUM DI-MERGE/DEPLOY.
- **Sumber dan distribusi:** Satu watcher `navigator.geolocation.watchPosition()` yang sudah ada menjadi satu-satunya sumber. Sampel yang sama dipakai marker pengemudi dan dikirim melalui Server Action ke RPC `driver_publish_trip_location`. Wali membaca RPC `guardian_trip_location` melalui route `/api/wali/lokasi` setiap 2 detik; tidak ada broadcast, channel publik, atau publication baru. Pengiriman berhenti saat perjalanan tidak aktif, dan trigger menghapus baris lokasi saat perjalanan selesai/dibatalkan.
- **Penyimpanan:** Tabel baru `trip_live_locations` berisi satu baris per perjalanan, tanpa riwayat. RLS aktif dan tabel tidak memiliki grant langsung untuk `anon`/`authenticated`; hanya fungsi SECURITY DEFINER yang boleh membaca/menulis. Koordinat, akurasi, dan timestamp divalidasi; sampel lama tidak boleh menimpa sampel baru; penulisan dibatasi 1,5 detik di database dan 2 detik di klien. Sampel dianggap segar maksimal 30 detik, setelah itu koordinat tidak ditampilkan sebagai posisi terkini.
- **Otorisasi:** Pengemudi harus aktif dan perjalanan harus masih ditugaskan kepadanya serta `in_progress`. Wali harus terhubung ke siswa aktif pada rute dan arah perjalanan tersebut. Penolakan memakai `42501`; route wali mengubahnya menjadi 404 agar id perjalanan anak lain tidak dapat ditebak. Aturan akses kamera tidak diubah.
- **Peta pengemudi:** Leaflet yang sudah ada mengaktifkan pan satu jari, pinch dua jari, mouse drag, dan wheel zoom. Tombol Current Location memakai sampel `useDriverLocation` yang sama (tanpa watcher kedua), memusatkan peta hanya bila koordinat valid, dan menampilkan pesan untuk kondisi mencari/izin ditolak/tidak tersedia. Marker HP dibedakan dari marker sekolah dan titik rute.
- **Daftar titik:** Saat dibuka, daftar memakai overlay di dalam panel navigasi dengan scroll internal pada `.route-stops-scroll`; tinggi/posisi panel dan peta tidak berubah, halaman utama tidak diberi scroll, dan urutan `stop_order` tidak diubah. Ini menggantikan konsekuensi pemotongan pada DEC-031.
- **Verifikasi 2026-11-07:** 154 unit test lulus; `npx tsc --noEmit` lulus; production build lulus; PGlite `location-checks.mjs` lulus untuk tulis pengemudi, baca wali, penolakan pengemudi/wali lain, validasi koordinat/akurasi/timestamp, penolakan sampel lama, throttle, larangan akses tabel/RPC anon, penghapusan saat selesai/dibatalkan, dan penyembunyian koordinat stale. Preview dev diuji melalui Server Action pengemudi dan route wali: koordinat berubah 26.4311/50.0934 → 26.4358/50.0971 dengan timestamp baru; pengemudi yang sama ditolak untuk perjalanan yang bukan tugasnya; perjalanan selesai menolak pengiriman dan mengembalikan status `completed` tanpa koordinat. Screenshot 360×640, 390×844, dan 1280×800 disimpan di `docs/review/wali-lokasi-after/`; marker 26×26 terdeteksi pada tangkapan penuh 360 dan 390. Perbedaan piksel viewport 2,36–3,31% terhadap acuan (gambar acuan DPR 2 dinormalisasi), tanpa perubahan ukuran viewport.
- **Belum terverifikasi:** migration belum diterapkan ke Supabase, sehingga RPC belum ada di database nyata. Tidak ada perangkat sentuh/fisik atau sesi browser interaktif, jadi pan satu jari, pinch dua jari, scroll daftar sampai titik terakhir, dan interaksi Current Location dengan GPS nyata belum diuji secara fisik; hanya konfigurasi Leaflet/CSS, tangkapan layar, dan respons server yang diperiksa. Pengujian dua sesi memakai Server Action + route dalam preview simulasi, bukan dua perangkat. Polling bukan Realtime database.
- **Pihak yang menyetujui:** Pemilik produk melalui instruksi PR #26 tanggal 2026-11-07; penerapan migration menunggu persetujuan terpisah.

### DEC-033 — Satu Operator Utama global; Pengemudi dan Wali tetap scoped
- **Tanggal:** 2026-11-10
- **Status:** DISETUJUI UNTUK IMPLEMENTASI PADA BRANCH `feat/unified-operator-global-workspace` (PR #30, DRAFT); BELUM DI-MERGE DAN BELUM ADA MIGRASI/DEPLOY PRODUKSI.
- **Keputusan:** Platform memiliki tiga ekosistem. (1) **Operator Utama** adalah satu-satunya pemegang kendali global: satu profil dengan role `operator` (atau `admin` legacy selama transisi) mengelola seluruh sekolah, perusahaan, armada, pengemudi, siswa, wali, rute, penugasan, perjalanan, dan audit lintas perusahaan/sekolah. (2) **Pengemudi** hanya mengakses penugasan, siswa pada rute, perjalanan, dan pencatatan miliknya. (3) **Orang Tua/Wali** hanya mengakses anak aktif yang terhubung dan perjalanan/lokasi/kamera terkait. Perusahaan bus dan sekolah adalah data pemetaan/audit, bukan akun login atau batas hak akses.
- **Otorisasi database:** `private.is_admin()` menerima `operator` dan `admin`; unique index parsial menegakkan tepat satu identitas global; promosi hanya dilakukan jika data legacy tidak ambigu. `link_operator_account`/`unlink_operator_account`/`resolve_account_uid` dicabut dari `authenticated`. `link_driver_account` menolak akun Operator dan seluruh akun Wali (termasuk tautan wali nonaktif). `current_operator_id()` dan `current_driver_id()` kini mensyaratkan role yang sesuai, sehingga tautan baris `operators.profile_id`/`drivers.profile_id` lama tidak memberi akses lintas ekosistem; policy baca perusahaan sendiri dihapus.
- **UI dan URL:** `/operator` adalah beranda ruang kerja; modul bersama dilayani di `/admin/*`; URL modul lama `/operator/*` dialihkan ke `/admin/*`. Tujuan login (`next`) diterima untuk prefix `/operator` dan `/admin` hanya bagi role `operator`/`admin`; Pengemudi dan Wali tetap terbatas pada areanya. Penautan akun perusahaan dihapus dari UI; penautan akun pengemudi tetap di `/admin/pengemudi`.
- **Waktu layanan:** tanggal layanan untuk dashboard, penugasan, halaman pengemudi, portal wali, dan dataset simulasi memakai `Asia/Riyadh` melalui `serviceDateInTimeZone()`, bukan zona waktu server.
- **API:** `/api/wali/lokasi` memakai pemeriksaan wali tanpa redirect dan menjawab `401` (tanpa sesi), `403` (role salah), atau `503` (database belum dikonfigurasi) dalam JSON.
- **Verifikasi 2026-11-10 (lokal):** `npm test` 175/175 lulus; `npm run typecheck` lulus; `npm run test:operator:sql`, `test:camera:sql`, dan `test:location:sql` lulus pada PGlite setelah seluruh migrasi; `npm run build` lulus; `actionlint` menerima workflow. GitHub Actions belum menjalankan job: semua run berakhir `startup_failure` dengan workflow sintetis `BuildFailed` berstatus `deleted` (workflow_id 412371807), sehingga hasil CI remote belum tersedia.
- **Belum terverifikasi:** penerapan migrasi dan RLS pada Supabase hosted, alur browser/Server Action end-to-end, kamera pada perangkat nyata, dan job GitHub Actions. Tidak ada deployment produksi, merge, penghapusan data, atau perubahan database hosted pada pekerjaan ini.
- **Pihak yang menyetujui:** Pemilik produk melalui instruksi penyelesaian PR #30 tanggal 2026-11-10.

### DEC-034 — Project Area, dashboard Pengelola, status penumpang, dan siklus GPS
- **Tanggal:** 2026-11-10
- **Status:** DISETUJUI UNTUK IMPLEMENTASI PADA BRANCH `feat/unified-operator-global-workspace` (PR #30, DRAFT); MIGRATION BELUM DITERAPKAN, BELUM DI-MERGE/DEPLOY.
- **Project Area:** Entitas perusahaan bus diganti menjadi Project Area (contoh Dammam, Riyadh, Madinah). Migrasi `20261110000000_project_areas.sql` mengganti nama `operators` menjadi `project_areas` tanpa menghapus baris, mengubah `operators.profile_id` menjadi `legacy_profile_id`, dan mengganti `operator_id` pada sekolah, bus, serta pengemudi menjadi `project_area_id`. Rute memperoleh `school_id` dan `project_area_id` yang di-backfill dari sekolah. Project Area adalah data operasional, bukan akun, role, atau tingkatan otoritas baru; Operator Utama tetap global.
- **Isolasi data:** Trigger database menolak rute dengan sekolah/area tidak cocok, penugasan yang mencampur rute/bus/pengemudi dari area berbeda, siswa pada rute area lain, dan pemindahan siswa yang masih memiliki roster aktif di area lama. Policy area-scoped lama, `current_operator_id()`, dan helper `operator_*` dihapus; akses Pengelola memakai `private.is_admin()`. Kebijakan RLS Pengemudi dan Wali tidak dilonggarkan.
- **Dashboard Pengelola:** Tab **Semua Area** dan tab per area pada `/admin` (dan beranda `/operator`) menyimpan konteks di cookie `school_bus_project_area`. Pilihan area menyaring statistik, daftar sekolah/siswa/wali/bus/pengemudi/rute/penugasan/perjalanan, laporan, ekspor CSV, serta nilai awal formulir; area nonaktif atau cookie tidak valid kembali ke Semua Area. Pengelolaan area (tambah, ubah, aktif/nonaktif) ada di `/admin/area`; URL lama `/admin/operator` dialihkan ke sana.
- **Status penumpang:** Tombol Naik, Turun, dan Tidak Ikut memakai Server Action berbasis state. Status terbaru langsung ditampilkan untuk siswa terkait, tombol dinonaktifkan selama proses, error tampil inline, dan event tetap append-only pada `trip_student_events`. Kiriman ulang event yang sama dalam 10 detik dianggap satu tindakan agar klik ganda tidak menggandakan riwayat. Aturan bisnis `lib/driver/student-actions.ts` tidak diubah.
- **Siklus GPS:** Pelacakan hanya bergantung pada status perjalanan `in_progress`; jumlah siswa naik/tidak ikut dan status kamera tidak menghentikannya. Pengemudi yang ditugaskan tetap satu-satunya penulis lokasi; RPC menolak perjalanan selesai/dibatalkan, sampel lama, akurasi buruk, dan timestamp kedaluwarsa. Wali hanya melihat koordinat segar (≤30 detik) dan tidak menampilkan sampel lama sebagai posisi terkini. Kamera tetap mengikuti siklusnya sendiri.
- **Tombol perjalanan:** Tombol Mulai Perjalanan diperbesar dan diberi kelas `ops-start-action`; tombol akhir memakai teks persis **Akhiri Perjalanan dan Periksa Keselamatan** dengan kelas `ops-end-action`. CSS memakai lebar 100%, `white-space: normal`, `overflow-wrap: anywhere`, tinggi minimum 52–56 px, dan breakpoint 759/400 px agar tidak terpotong atau meluap pada 360/390/430 px; konfirmasi keselamatan yang ada dipertahankan.
- **Verifikasi 2026-11-10 (lokal):** `npm test` 192/192 lulus; `npm run typecheck` lulus; `npm run test:camera:sql` dan `test:location:sql` lulus dengan sembilan migrasi dan fixture RLS baru; `npm run build` lulus. Pengujian CSS memeriksa kontrak label/lebar, tetapi **belum ada render browser** pada 360/390/430/768/1024/1440 px.
- **Belum terverifikasi:** penerapan migrasi pada Supabase hosted, render tombol pada viewport nyata, GPS/perangkat fisik, dua sesi browser, dan job GitHub Actions (masih `startup_failure` karena workflow sintetis `BuildFailed`).
- **Pihak yang menyetujui:** Pemilik produk melalui instruksi implementasi PR #30 tanggal 2026-11-10.

### DEC-035 — Redesain workspace Pengelola dan satu alur tombol sesi Pengemudi
- **Tanggal:** 2026-11-10
- **Status:** DIIMPLEMENTASIKAN PADA BRANCH `feat/unified-operator-global-workspace` (PR #30, DRAFT). Tidak ada perubahan skema, migrasi, RLS, autentikasi, atau halaman Wali.
- **Layout Pengelola:** Seluruh halaman `/admin/*` dan `/operator/*` memakai `app/workspace-redesign.css` di atas kerangka `OperatorWorkspaceLayout`: topbar 54 px, sidebar 232 px, judul halaman ringkas, filter area berupa strip, metrik dalam satu permukaan, serta tabel/form yang lebih padat. Brand ganda di topbar dan kotak menu duplikat di dashboard dihapus; navigasi yang tidak berfungsi tidak ditambahkan.
- **Project Area:** Pemilih area dipadatkan menjadi strip `area-switch` horizontal yang tetap terlihat di dashboard dan daftar, tanpa blok penjelasan besar. Konteks cookie dan filter data tidak berubah.
- **Pengemudi (koreksi):** redesign layout Pengemudi dari implementasi awal dibatalkan. `app/pengemudi/page.tsx`, `DriverOpsHeader`, dan `TripClosePanel` dikembalikan ke susunan sebelum redesign. Tidak ada perubahan pada susunan header, kartu/progres, navigasi, daftar siswa, peta, maupun urutan konten.
- **Alur sesi:** Satu tombol berubah dari **Mulai Perjalanan** menjadi **Akhiri Perjalanan**. Tombol akhir membuka dialog checklist; tombol penyelesaian di dalam dialog bertuliskan **Akhiri** dan hanya mengirim jika seluruh checklist wajib serta syarat kedatangan/status siswa terpenuhi. Tidak ada tombol “Periksa Keselamatan” terpisah. DEC-034 bagian teks tombol akhir digantikan oleh keputusan ini.
- **Sesi:** Satu sesi tetap diwakili satu `trip_assignments` + `trips` (tanggal, arah pagi/sore, jenis penjemputan/pengantaran). Menekan **Akhiri** hanya menutup trip tersebut; aplikasi tidak membuat assignment/trip baru otomatis. Sesi berikutnya hanya muncul jika sudah ada penugasan.
- **Perbaikan pendukung:** Simulasi `trip_student_events` mengisi `occurred_at` seperti default database, dan pengurutan status tahan terhadap baris lama tanpa waktu. Ini mencegah halaman pengemudi gagal setelah status siswa dicatat di mode simulasi.
- **Pembaruan tombol siswa 2026-11-10:** Tombol Naik, Turun, dan Tidak Ikut memakai slot dan ukuran yang sama, tetapi menampilkan centang serta label `Naik — selesai`, `Turun — selesai`, atau `Tidak Ikut — selesai` setelah Server Action berhasil. Form yang sedang dikirim menampilkan `Menyimpan…`; status hanya berubah dari respons sukses atau baris tersimpan, sehingga kegagalan tidak meninggalkan tanda selesai palsu. Tidak ada navigasi ulang penuh; pembaruan dilakukan lewat Server Action React pada komponen siswa, bukan reload halaman.
- **Verifikasi 2026-11-10 (lokal):** `npm test` 197/197 lulus; typecheck lulus; build produksi lulus. Verifikasi lanjutan tombol siswa: 201/201 tes, 49 suite; ketiga status tersimpan dan tetap tampil setelah halaman dimuat ulang. Alur Server Action asli diuji lewat POST form: Mulai → catat dua siswa → konfirmasi tiba → checklist → Akhiri → status selesai, riwayat pengemudi dan daftar perjalanan Operator diperbarui; percobaan Akhiri tanpa checklist ditolak dan trip tetap berlangsung. Semua halaman utama merespons 200 pada preview.
- **Belum terverifikasi:** render visual/klik di browser pada 360/390/430/768/1024/1440 px (tidak ada Chromium/Playwright yang dapat dijalankan pada lingkungan ini), perangkat GPS/kamera nyata, Supabase hosted, dan GitHub Actions.
- **Pihak yang menyetujui:** Pemilik produk melalui instruksi redesain PR #30 tanggal 2026-11-10.


### DEC-036 — Kembalikan layout Pengemudi; batasi perubahan pada tombol
- **Tanggal:** 2026-11-10
- **Status:** DIIMPLEMENTASIKAN PADA BRANCH `feat/unified-operator-global-workspace` (PR #30, DRAFT).
- **Keputusan:** Layout halaman Pengemudi dikembalikan ke versi sebelum redesign terakhir. Perubahan visual besar pada halaman Pengemudi tidak dipertahankan karena instruksi hanya meminta penyesuaian tombol.
- **Tombol utama:** Pada posisi semula di header, label berubah dari **Mulai Perjalanan** sebelum sesi menjadi **Akhiri Perjalanan** ketika sesi berlangsung. Tombol akhir membuka panel pemeriksaan keselamatan yang sudah ada; tidak ada tombol utama kedua.
- **Checklist:** Panel keselamatan tetap memakai layout sebelumnya. Semua checklist wajib dipertahankan; tombol final di panel bertuliskan **Akhiri** dan tetap tunduk pada validasi kedatangan, pencatatan status siswa, serta validasi server.
- **Isolasi CSS:** `workspace-redesign.css` hanya dimuat melalui `OperatorWorkspaceLayout`, bukan lagi dari root layout, sehingga aturan redesign Pengelola tidak ikut memengaruhi halaman Pengemudi.
- **Cakupan yang tidak berubah:** Redesign Pengelola tetap dipertahankan. Tidak ada perubahan database, migration, RLS, GPS, kamera, hak akses, maupun halaman Wali.
- **Validasi:** Source dan branch sudah dibaca kembali setelah perubahan. Unit test, typecheck, dan build untuk commit koreksi ini belum dijalankan.

### DEC-037 — Penyelesaian tombol Pengemudi, indikator selesai siswa, dan identitas SchoolBus global
- **Tanggal:** 2026-11-11
- **Status:** DIIMPLEMENTASIKAN PADA BRANCH `feat/unified-operator-global-workspace` (PR #30, DRAFT). Tidak ada perubahan skema, migrasi, RLS, autentikasi, hak akses, atau konfigurasi produksi.
- **Tombol perjalanan:** Satu tombol pada slot yang sama tetap memakai kelas `btn ops-primary-action ops-start-action` baik saat **Mulai Perjalanan** maupun **Akhiri Perjalanan**, sehingga ukuran, padding, radius, dan posisi tidak berubah. Tautan **Akhiri Perjalanan** membuka panel checklist yang sudah ada; tidak ada tombol utama kedua dan tidak ada tombol “Periksa Keselamatan” terpisah.
- **Checklist akhir:** `TripClosePanel` menjadi komponen klien yang hanya memakai state untuk mengunci tombol. Tombol final **Akhiri** baru aktif setelah kedatangan dikonfirmasi, semua siswa tercatat, ketiga pemeriksaan wajib dicentang, dan (bila ada siswa berstatus naik) konfirmasi kabin dicentang. Server Action `endTrip` tetap memvalidasi ulang seluruh syarat, menolak pengakhiran kedua, dan tidak membuat trip baru.
- **Indikator selesai siswa:** Status hanya diambil dari respons Server Action yang sukses atau baris tersimpan; tidak ada optimistic update. Label `Naik — selesai`, `Turun — selesai`, dan `Tidak Ikut — selesai` disertai centang. Aturan `.is-done` dipindahkan ke `app/globals.css` dengan scope `.driver-app`, karena `workspace-redesign.css` hanya dimuat layout Operator dan tidak pernah sampai ke halaman Pengemudi.
- **Identitas visual (revisi mengikuti referensi pengguna):** `BrandLogo` digambar ulang sebagai bus sekolah gold menghadap depan dengan sedikit sisi, penanda lokasi gold di kanan atas, dan jalur perjalanan putih melengkung di bawahnya, di dalam bidang navy bersudut membulat. Palet resmi: Corporate Navy `#0F1B3D`, Gold `#F5C542`, putih `#FFFFFF`. Tidak ada monogram “S”, maskot, atau bayangan/gradien 3D. Aset: `components/brand-logo.tsx` (SVG inline), `public/assets/landing/logo-schoolbus.svg` (ikon 512), dan `public/assets/landing/favicon.svg`. Token landing `--lp-navy`/`--lp-yellow` diselaraskan ke palet resmi. Wordmark selalu `SchoolBus` navy; semua header peran memakai komponen `BrandLogo` yang sama.
- **Header global:** Ikon menu hamburger (`MobileMenu`) dan avatar bulat kuning di kiri tombol **Keluar** dihapus dari topbar Operator/Pengelola. Informasi peran dan Project Area tetap di topbar; logout tetap berupa form `signOutAction`.
- **Navigasi Operator di layar kecil:** Sidebar disembunyikan sampai 960 px, sehingga navigasi bawah (empat tujuan utama) kini juga tampil sampai 960 px. Tombol **Menu** kelima membuka drawer yang memuat seluruh 11 tujuan sidebar (`adminGroups`) dalam dua kelompok. Hamburger tidak dikembalikan; drawer dibuka dari navigasi bawah. Drawer memakai pola dan CSS menu yang sudah ada, menutup lewat Escape/backdrop/tombol tutup, memindahkan fokus ke tombol tutup, mengunci scroll latar, dan menutup otomatis saat rute berubah. Tidak ada tujuan yang hanya dapat diakses dari desktop.
- **Lebar tombol perjalanan:** Selisih 4 px antara label **Mulai Perjalanan** dan **Akhiri Perjalanan** dihapus dengan `min-width` pada `.ops-start-action`: 167 px (≥760), 158 px (≤759), 146 px (≤400). Tinggi, padding, font, radius, dan posisi tidak berubah; lebar terukur identik pada seluruh viewport uji.
- **Verifikasi 2026-11-11 (lokal):** `npm test` **203/203 lulus** (49 suite); `npx tsc --noEmit` lulus; `npm run build` produksi lulus. Alur Server Action diuji lewat browser: Mulai Perjalanan → Naik (siswa 1) → Tidak Ikut (siswa 2) → reload status tetap tampil dengan `is-done` → konfirmasi tiba → **Akhiri** terkunci sebelum syarat → checklist lengkap + konfirmasi kabin → perjalanan selesai dan riwayat tersimpan. Tombol **Turun di sekolah** juga diuji setelah kedatangan: tombol aktif, form yang sama (dikirim tanpa JavaScript karena browser headless sudah tidak tersedia di sandbox) menghasilkan status **Sudah turun** dan label **Turun — selesai**, tanpa pesan galat. Permintaan **Akhiri** yang sama diputar ulang setelah selesai: server membalas `303` dengan `x-action-redirect …jenis=error&pesan=Perjalanan ini belum berjalan atau sudah selesai.`; status perjalanan dan siswa tidak berubah.
- **Verifikasi browser (Chromium headless, 2026-11-11):** halaman Pengemudi diperiksa pada 360/390/430/768/1024/1440 px: tidak ada overflow horizontal; tombol utama terukur **146/146/158/167/167/167 px** untuk **Mulai** dan nilai yang sama untuk **Akhiri** pada viewport yang sama, tinggi 50–52 px, padding/font/radius sama, dan tinggi header tidak berubah saat label berganti. Tombol siswa tetap 74,8×29 px sebelum/sesudah selesai (latar hijau, centang hanya saat selesai). Checklist terkunci sebelum centang dan aktif setelah semua syarat. Header `/operator` (dan `/admin`) diperiksa pada 360/390/430/768/1024/1440 px: navigasi bawah + **Menu** tampil sampai 960 px, seluruh 11 tujuan dapat dibuka dan salah satunya dinavigasi dari drawer pada 360 px, Escape menutup drawer, tanpa hamburger/avatar, tombol Keluar terlihat, tanpa overflow. Logo baru diperiksa pada Landing, `/daftar`, `/pilih-peran`, `/wali`, `/pengemudi`, dan `/operator` (360/1440 px). Screenshot dan metrik ada di `docs/review/schoolbus-final/`.
- **Jalur gagal (UI, 1440 dan 390 px):** `student_id` pada form siswa pertama diubah terkontrol ke siswa di luar rute (`…603`), lalu tombol **Naik** ditekan. Server menolak dengan pesan "Siswa tersebut tidak terdaftar pada rute perjalanan ini." yang tampil sebagai `role="alert"`; tidak ada tombol berstatus selesai, kedua siswa tetap "Belum dicatat", penanda halaman tetap (tanpa reload), tanpa overflow. Setelah `student_id` dikembalikan, aksi yang sama berhasil dan menampilkan "Naik — selesai" hanya untuk siswa tersebut; status bertahan setelah reload dan tidak memengaruhi siswa kedua.
- **Belum terverifikasi:** perangkat GPS/kamera nyata, Supabase hosted, dan GitHub Actions. Posisi scroll tidak dapat diuji secara bermakna karena halaman Pengemudi setinggi viewport dan fixture hanya berisi dua siswa sehingga daftar belum dapat digulir; yang terbukti adalah tidak ada reload dokumen saat mencatat status. Halaman `/login`, `/akun/kata-sandi`, dan `/akses/*` mengalihkan ke `/operator` pada fixture akses-terbuka karena peninjau simulasi sudah terautentikasi; identitas halaman autentikasi diverifikasi pada `/daftar`/`/pilih-peran` yang memakai komponen dan gaya `auth-logo` yang sama. Screenshot tidak dapat ditampilkan oleh alat agen ini (berkas PNG dikembalikan sebagai biner), sehingga pemeriksaan visual dilakukan lewat analisis piksel/layout dan render SVG; peninjauan estetika manusia tetap disarankan.
- **Pihak yang menyetujui:** Pemilik produk melalui instruksi implementasi final tombol Pengemudi, logo referensi, header global, dan navigasi Operator tanggal 2026-11-11.

### DEC-038 — Halaman Pengemudi kembali normal setelah perjalanan selesai
- **Tanggal:** 2026-11-11
- **Status:** DIIMPLEMENTASIKAN PADA BRANCH `feat/unified-operator-global-workspace` (PR #30, DRAFT). Tidak ada perubahan database, migrasi, RLS, autentikasi, atau konfigurasi produksi.
- **Masalah:** Setelah Server Action `endTrip` sukses, redirect masih membawa `?tugas=<id>` dan halaman memilih tugas berstatus `completed`. Akibatnya header perjalanan, panel keselamatan, peta, dan daftar siswa perjalanan yang sudah selesai tetap tampil dan menutupi halaman normal.
- **Perbaikan:** `lib/driver/assignment-selection.ts` tidak pernah memilih tugas `completed`; tugas `in_progress` diutamakan, lalu `scheduled`, lalu tugas lain yang belum selesai. Redirect sukses `endTrip` kembali ke `/pengemudi` tanpa parameter `tugas`. Bila tidak ada tugas aktif/terjadwal, halaman menampilkan keadaan normal “Perjalanan hari ini selesai” beserta tautan riwayat, tanpa membuat perjalanan atau penugasan baru. Tujuan langsung setelah penutupan kemudian diubah menjadi halaman Review Perjalanan (DEC-039).
- **Riwayat:** Baris `trips`, `trip_student_events`, dan pemeriksaan keselamatan tidak dihapus atau diubah; semuanya tetap tampil di `/pengemudi/riwayat`.
- **Cakupan desain:** Layout, ukuran kartu, header, peta, daftar siswa, dan tampilan sebelum perjalanan selesai tidak berubah.
- **Verifikasi 2026-11-11 (lokal):** `npm test` **206/206 lulus** (50 suite, termasuk tes pemilihan tugas selesai); `npx tsc --noEmit` lulus; `npm run build` produksi lulus. Alur HTTP penuh Mulai → Naik → Tidak Ikut → Konfirmasi tiba → checklist → **Akhiri** berakhir di `/pengemudi?jenis=success…` tanpa `tugas`; halaman tidak lagi memuat `ops-workspace`, panel `ops-close`, atau tombol Mulai, menampilkan “Perjalanan hari ini selesai” dan tautan riwayat; `/pengemudi/riwayat` tetap memuat perjalanan tersebut dengan status Selesai.

### DEC-039 — Review perjalanan setelah penutupan dan kelanjutan tugas berikutnya
- **Tanggal:** 2026-11-11
- **Status:** DIIMPLEMENTASIKAN PADA BRANCH `feat/unified-operator-global-workspace` (PR #30, DRAFT). Tidak ada perubahan database, skema, migrasi, RLS, autentikasi, atau konfigurasi produksi.
- **Tujuan setelah `endTrip`:** Redirect sukses menuju `/pengemudi/review/<tripId>`, bukan dashboard atau riwayat. Halaman review membaca perjalanan yang benar-benar tersimpan: assignment, rute, arah, sekolah, bus, waktu mulai/tiba/selesai, event siswa terbaru, serta `safety_checked_at`, `student_count_confirmed`, dan `safety_check_notes`.
- **Batas akses:** Review hanya untuk perjalanan berstatus `completed` milik pengemudi yang sedang masuk. Perjalanan pengemudi lain tidak dirender; perjalanan yang belum selesai dikembalikan ke halaman tugasnya.
- **Isi review:** Ringkasan jenis perjalanan dan waktu, status terakhir setiap siswa (Naik/Turun/Tidak Ikut, waktu, catatan), dan ringkasan pemeriksaan keselamatan. Tombol utama **Kembali ke Halaman Utama Pengemudi** menuju `/pengemudi`; tautan riwayat tersedia sebagai aksi sekunder.
- **Kelanjutan tugas:** Dashboard tetap memakai `selectDriverAssignment` yang mengabaikan tugas `completed`. Tugas `in_progress` atau `scheduled` lain—termasuk penjemputan sore—tetap dipilih dan dapat dimulai; satu perjalanan selesai tidak menutup aktivitas hari itu. Tidak ada penugasan atau perjalanan baru yang dibuat otomatis, dan riwayat tidak dihapus.
- **Cakupan desain:** Layout, ukuran kartu, header, peta, daftar siswa, tombol, dan desain operasional sebelum perjalanan selesai tidak diubah. Halaman review adalah halaman baru setelah penutupan.
- **Verifikasi 2026-11-11 (lokal):** `npm test` **209/209 lulus** (51 suite); `npx tsc --noEmit` lulus; `npm run build` produksi lulus. Alur HTTP penuh berakhir di `/pengemudi/review/…b11?jenis=success…`; review menampilkan rute, arah Pagi, waktu, dua siswa dengan status Naik/Tidak Ikut, dan pemeriksaan keselamatan “Tercatat”. Setelah kembali, `/pengemudi` tidak memuat kartu aktif/panel penutupan. Review perjalanan selesai kemarin juga dapat dibuka; data perjalanan pengemudi lain tidak dirender. Fixture dev hanya memiliki satu tugas hari ini untuk pengemudi simulasi, sehingga skenario tugas terjadwal setelah tugas selesai diverifikasi lewat tes unit pemilihan tugas (completed + scheduled), bukan dua kartu nyata pada preview.

### DEC-040 — Review sebagai modal di atas halaman utama Pengemudi
- **Tanggal:** 2026-11-12
- **Status:** Implementasi terbatas PR #30, menggantikan perilaku halaman penuh DEC-039.
- **Perilaku:** URL review tetap sama dan redirect `endTrip` tidak diubah. Review mengomposisikan halaman operasional Pengemudi yang sama di belakang native modal dialog, termasuk akses URL langsung/reload. Tombol X selalu terlihat di kanan atas panel; X/Escape memakai tujuan eksplisit `/pengemudi` dengan replace dan refresh, bukan tombol kembali browser. Dialog mengunci scroll latar dan fokus melalui native modal.
- **Data:** Pemeriksaan server untuk pemilik perjalanan dan status `completed`, event siswa, serta pemeriksaan keselamatan tetap dipertahankan. Dashboard mengambil penugasan hari ini dan tetap mengabaikan perjalanan selesai; tugas terjadwal termasuk sore tetap tersedia. Tidak ada penghapusan riwayat atau pembuatan tugas otomatis.
- **Batas:** Tidak mengubah halaman dashboard, layout/header/peta/daftar siswa/tombol operasional, alur mulai/akhir, autentikasi, database, skema, migrasi, atau RLS. CSS baru hanya berlaku pada komponen modal.
- **Verifikasi:** 212/212 tes lulus; typecheck dan build produksi lokal lulus. Chromium pada 360/390/430/768/1024/1440 px: dashboard hadir di belakang modal, tidak ada overflow horizontal panel, X langsung membuka `/pengemudi` tanpa langkah kembali tambahan. Escape juga lulus. Review milik pengemudi lain dan perjalanan belum selesai tidak dirender. Kasus pagi selesai + sore terjadwal diuji unit tanpa mutasi daftar penugasan; fixture browser hanya memiliki satu penugasan hari ini bagi pengemudi contoh. Pengujian lokal menggunakan dataset simulasi, bukan database produksi.

### DEC-041 — Header Pengemudi dua baris
- **Tanggal:** 2026-11-12
- **Cakupan:** Permintaan pemilik untuk header kuning ringkas: logo/rute/tanggal/profil pada baris pertama, pill progres dan CTA pada baris kedua. Header layout lama hanya disembunyikan saat header operasional hadir; halaman riwayat/tanpa tugas tetap memiliki brand dan profil/logout.
- **Preservasi:** Sumber `TripProgress`, slot children CTA, Server Actions, pemicu checklist, serta validasi siswa tidak berubah. Informasi kendaraan, sekolah, waktu, status, dan rincian progres dipindahkan ke popover profil. Counter Di Bus tampil inline mulai 600 px dan selalu tersedia di profil. Target sentuh siswa minimal 44 px.
- **Verifikasi awal:** 212 tes existing dan dua tes kontrak baru lulus; typecheck dan diff check lulus. Tidak melakukan commit/push/deploy atau mengubah database.
- **Verifikasi final:** Build produksi salinan terisolasi lulus (peringatan autoprefixer existing pada deklarasi `end`). Chromium fixture lokal pada 360/375/390/414/430/768/1440 px: tidak ada overflow horizontal, pill sebaris, CTA 44 px, semua aksi siswa >=44 px, profil membuka data dan Escape menutup. Header 112 px vs baseline mobile gabungan 184,31 px (~39% lebih pendek); posisi workspace naik dari 226,31 ke 166 px. Ini pengurangan area header, bukan klaim 35% dari seluruh viewport. Pengujian memakai data simulasi, logout tidak dieksekusi dan integrasi GPS/kamera tidak diuji ulang.
- **Integrasi lanjutan:** Perubahan lokal dipertahankan dan diintegrasikan di atas remote `cc04a83` tanpa mengubah handler/status siswa, dialog keselamatan, atau seleksi tugas terbaru. Navigasi Dashboard/Riwayat tetap tersedia di menu profil header ringkas. Seluruh 219 tes dan TypeScript check lulus setelah integrasi. Verifikasi deployment Preview memerlukan sesi Vercel/GitHub yang terautentikasi; akses Git via SSH tersedia untuk push.
- **Validasi gabungan final:** Build produksi lokal lulus (peringatan autoprefixer existing saja). Chromium build gabungan lulus pada 360/375/390/414/430/768/1440 px: tidak ada overflow horizontal, pill sebaris, CTA dan target siswa >=44 px, profil/Escape berfungsi.

### DEC-042 — Tab Pengemudi, sesi berulang, dan identitas ringkas
- **Tanggal:** 2026-11-13
- **Cakupan:** Melanjutkan perubahan lokal di atas `995d971`; navigasi Data Pengemudi/Riwayat tampil horizontal memakai pola `portal-nav`, bukan dropdown/hamburger atau tab driver lama. Identitas operasional dibatasi nama, ID pengemudi, dan plat; siswa berikutnya menampilkan nama + Admission Number sesuai urutan rute.
- **Sesi:** Tombol Mulai diaktifkan kembali untuk perjalanan selesai/dibatalkan. Server hanya melanjutkan baris scheduled; sesi setelah selesai membuat baris trips baru pada assignment milik pengemudi. Riwayat/events lama tidak ditimpa. Indeks existing membatasi satu scheduled/in_progress per assignment. Dashboard mengurutkan embedded trips secara eksplisit: aktif, terjadwal, lalu riwayat terbaru. Kontrol siswa di-remount menurut sesi/status tersimpan agar state sesi lama tidak terbawa.
- **Sinkronisasi:** Setelah aksi siswa sukses, event lokal meminta pembacaan ulang server. Polling existing dua detik/focus/online dipertahankan sebagai fallback. Ini bukan subscription Supabase Realtime; tidak menambah publikasi atau mengubah schema/RLS. Tidak ada perubahan autentikasi atau migration.
- **Teks:** Informasi rute dipersingkat; ukuran teks operasional dan wrapping diperbaiki tanpa mengubah susunan workspace, peta, atau daftar siswa.
- **Bukti lokal:** 223/223 tes lulus, TypeScript check lulus, build produksi lulus (peringatan autoprefixer existing). Chromium dengan dataset simulasi: Mulai → konfirmasi penumpang turun → checklist → Akhiri → tutup review → Mulai sesi kedua → Akhiri; ID berbeda dan kedua baris tetap tampil pada tabel riwayat. Pemeriksaan sebelumnya gagal karena mencari tautan review yang memang tidak ada pada tabel; diperbaiki agar memeriksa row ID dan menunggu respons server konfirmasi sebelum checklist. Pada 360/390/430/768/1440 px, tab sebaris dan tidak ada overflow horizontal.
- **Batas verifikasi:** Database hosted, perangkat GPS/kamera, dan delivery Realtime tidak diuji. Vercel dashboard meminta login, GitHub API privat membalas 404 tanpa autentikasi API; akses SSH hanya dapat memverifikasi push, bukan status READY atau URL deployment.

### DEC-043 — Tindakan siswa langsung dan konsisten
- **Tanggal:** 2026-11-13
- **Aturan:** Selama sesi aktif, belum naik → Naik/Tidak Ikut; Naik → Turun/Tidak Ikut; Tidak Ikut → Naik; Turun terminal. Tombol Turun tidak lagi bergantung arah rute atau arrived_at. Server memvalidasi transisi yang sama dan mempertahankan pemeriksaan pemilik/roster/status sesi. Setiap transisi menambah event; tidak menghapus/mengubah riwayat.
- **Tidak Ikut:** Satu form submit langsung tanpa picker alasan, dialog, atau tahapan baru. Tampilan slot tombol/dashboard dipertahankan.
- **Massal:** Tetap melewati siswa Turun/Tidak Ikut, dengan status kehadiran diturunkan lewat resolver yang mengabaikan event kendala. arrived_at tidak lagi memblokir pengulangan massal setelah siswa Tidak Ikut kembali Naik. Tombol massal hanya terkunci bila tidak ada siswa tersisa dan konfirmasi tiba sudah tercatat; alur keselamatan/checklist tetap dipertahankan.
- **Bukti:** 229/229 tes, TypeScript check, dan build produksi lokal lulus. Chromium fixture simulasi: Naik langsung mengaktifkan Turun; Naik → Tidak Ikut sekali klik; Tidak Ikut → Naik → Turun dan Naik terkunci setelah Turun; siswa pertama Turun individual lalu siswa kedua Turun lewat massal. Tes unit memverifikasi append-only pada ketiga urutan, status terminal, dan massal melewati Turun/Tidak Ikut walau ada event kendala lebih baru. Tidak ada perubahan schema/RLS/migration/autentikasi atau desain.
- **Deployment:** Verifikasi Preview READY masih terblokir karena browser Vercel meminta login; akses SSH Git tidak memberi akses metadata deployment privat. Jangan menyatakan READY tanpa bukti.

### DEC-044 — Navigasi hanya selama sesi berlangsung
- **Tanggal:** 2026-11-13
- **Perubahan terbatas:** Link Buka Navigasi hanya dirender bila status perjalanan yang dibaca server adalah `in_progress` dan URL peta valid. Status scheduled/completed/cancelled/tidak dikenal merender tombol disabled. Mekanisme URL/peta, tata letak, susunan siswa, dan tindakan siswa tidak diubah.
- **Sumber kebenaran:** Prop tripStatus berasal dari perjalanan tersimpan yang dipilih server melalui orderDriverSessions; tidak memakai state klik, localStorage, atau flag frontend. Perjalanan baru memakai status baris sesi baru.
- **Validasi:** 232/232 tes, TypeScript check, build produksi lulus. Chromium fixture simulasi memverifikasi navigasi nonaktif awal → aktif setelah Mulai → tetap aktif saat reload sesi berjalan → nonaktif setelah Akhiri → tetap nonaktif setelah reload → aktif lagi pada sesi kedua → nonaktif setelah selesai. Dua sesi dengan ID berbeda tetap ada di riwayat. Percobaan awal browser perlu koreksi waitFor render setelah reload; uji ulang pada proses simulasi baru lulus lengkap.
- **Deployment:** Preview READY memerlukan akses Vercel yang terautentikasi; jangan menganggap push sebagai bukti deployment sukses.
