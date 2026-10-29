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

## Hal yang belum diputuskan
Lihat `TECHNICAL_SPEC_REVIEW.md` dan bagian 19 pada `MASTER_SPEC.md`. Jangan mengubah pertanyaan terbuka menjadi keputusan tanpa persetujuan.
