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
- **Verifikasi 2026-11-07:** `npm test` 147/147 lulus; `npx tsc --noEmit` lulus; `npm run build` lulus. Probe layout sementara (dihapus sebelum commit) dengan 30 baris siswa mengukur: 360×640 dokumen 640/640, daftar 4063/261, `overflowY:auto` hanya pada daftar; 390×844 dokumen 844/844, daftar 3808/474; 1280×800 dokumen 800/800, daftar 4576/326. `scrollWidth` sama dengan `clientWidth` pada ketiga viewport. Posisi header, panel navigasi, peta, dan kamera identik sebelum/sesudah daftar digulir. Perbandingan piksel 1280×800: 99,93% identik; satu-satunya wilayah berubah adalah badge GPS (sekitar 123×17 px), tanpa pergeseran komposisi. Screenshot final 360×640, 390×844, dan 1280×800 disimpan di `docs/review/pengemudi-finalization/`.
- **Belum terverifikasi:** izin dan koordinat GPS nyata pada perangkat pengemudi (tidak ada sensor/perangkat di lingkungan ini), GPS bus, dan kesamaan piksel 360/390 dengan screenshot sebelumnya karena screenshot acuan 360/390 memakai fixture 30 siswa sementara sedangkan tangkapan final memakai seed normal. Sinkronisasi eksternal hanya polling 2 detik; Realtime database memerlukan publication/channel yang belum ada dan tidak diubah.
