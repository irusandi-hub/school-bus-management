# Matriks Tanggung Jawab Model Operasional — Satu Operator

**Status:** Diperbarui berdasarkan DEC-033 (2026-11-08)
**Wilayah:** Arab Saudi (wilayah lain dapat mengikuti aturan lokal yang berlaku)  
**Kota pilot:** Dammam dan sekitarnya  
**Batas:** dokumentasi dan analisis; tidak ada coding fitur bisnis atau pemilihan provider.

## 1. Model final yang disetujui

Aplikasi hanya memiliki **tiga ekosistem pengguna**:

- **Operator** — satu Operator Utama yang mengelola seluruh aplikasi dan data operasional.
- **Pengemudi** — hanya mengakses tugas yang ditugaskan Operator.
- **Orang Tua/Wali** — hanya mengakses anak dan perjalanan yang menjadi haknya.

**Sekolah dan perusahaan bus adalah data/entitas yang dikelola Operator**, bukan akun, role, atau tenant terpisah. Tidak ada akun Sekolah, Admin Pusat, atau operator kedua. Operator Utama memiliki kendali penuh atas seluruh sekolah, siswa, wali, bus, pengemudi, wilayah, rute, penugasan, perjalanan, laporan, dan audit.

**Wilayah operasi hanyalah data** untuk pemetaan area, pengelompokan siswa, pencatatan penanggung jawab, dan audit pembagian tugas. Wilayah/`operator_id` tidak membentuk tenant, organisasi, hierarki, atau batas akses Operator. Operator selalu dapat melihat dan mengelola seluruh wilayah.

## 2. Tanggung jawab pengguna dan penyedia

| Area | Operator | Pengemudi | Orang Tua/Wali | Penyedia aplikasi |
|---|---|---|---|---|
| Izin dan kewenangan operasional | Memastikan izin, kewenangan, kendaraan, pengemudi, dan kegiatan yang dijalankannya sah | Memenuhi syarat dan prosedur yang berlaku untuk tugasnya | Menggunakan fitur sesuai hak akses | Menyediakan T&C dan mekanisme akun; tidak menyatakan aplikasi menggantikan izin |
| Kebenaran dan pengelolaan data | Mengelola data sekolah, siswa, wali, bus, pengemudi, wilayah, rute, dan penugasan | Hanya melaporkan/memperbarui data operasional yang menjadi tugasnya | Memberi informasi yang benar dan mengajukan koreksi | Menyediakan kontrol akses, audit, dan mekanisme koreksi |
| Penugasan dan perjalanan | Menetapkan pengemudi, bus, rute, dan perjalanan | Mengikuti penugasan sah dan melaporkan kendala | Memantau perjalanan anak yang berhak | Menyediakan fungsi sesuai lingkup dan batasan yang jelas |
| Relasi wali–siswa | Menetapkan dan memverifikasi relasi sesuai prosedur | Tidak mengelola relasi | Memberi informasi pendukung | Menyediakan mekanisme akses yang aman |
| Rute dan keselamatan lapangan | Meninjau dan menyetujui rute serta pengecualian | Mengikuti rute yang disetujui dan prosedur keselamatan | Mengikuti informasi yang tersedia | Menyajikan rute/peringatan tanpa menjamin keselamatan |
| GPS dan kamera | Menetapkan perangkat, penugasan, dan dasar penggunaan | Mengaktifkan GPS/kamera hanya selama tugas sah | Melihat lokasi/kamera hanya untuk anak yang berhak | Mengikat sesi ke penugasan, membatasi akses, menampilkan kesegaran, dan mencatat audit |
| Insiden dan data pribadi | Menangani insiden operasional dan memenuhi kewajiban hukumnya | Melaporkan sesuai prosedur | Melapor melalui kanal yang tersedia | Menangani insiden platform sesuai kewajiban dan kontrak |
| Audit dan koreksi | Menjaga jejak audit, alasan koreksi, dan retensi | Tidak mengubah histori | Hanya melihat data yang berhak | Menyediakan pencatatan yang tahan manipulasi dan kontrol akses |

Tabel ini adalah pembagian konseptual untuk desain produk, bukan penetapan hukum final atau pengganti kontrak.

## 3. Batas akses yang wajib diterapkan

- **Operator:** akses global ke seluruh data aplikasi. Jangan memfilter RLS Operator berdasarkan wilayah, sekolah, `operator_id`, atau organisasi.
- **Pengemudi:** hanya identitas, penugasan, perjalanan, roster, siswa, dan data operasional yang ditugaskan kepadanya.
- **Orang Tua/Wali:** hanya anak yang terhubung secara sah dan perjalanan/riwayat yang boleh dilihat.
- **Wilayah:** data pemetaan, pembagian tugas, dan audit; bukan security boundary.
- **Sekolah/perusahaan:** data master yang dikelola Operator; bukan akun atau tenant.
- Otorisasi wajib ditegakkan di server dan database/RLS, bukan hanya dengan menyembunyikan menu.
- Berakhirnya penugasan atau relasi wali harus mencabut akses terkait, tanpa menghapus histori secara diam-diam.

## 4. T&C dan onboarding

- Aplikasi adalah alat bantu perangkat lunak, bukan lisensi atau izin menjalankan transportasi.
- Operator menyatakan memiliki izin, kewenangan, dan hak yang diperlukan untuk kegiatan serta data yang dikelolanya.
- Operator bertanggung jawab memastikan kegiatan transportasi, kendaraan, pengemudi, penugasan, dan data yang berada di bawah kendalinya memenuhi ketentuan yang berlaku.
- Onboarding hanya membuat/menautkan akun dalam tiga ekosistem: Operator, Pengemudi, dan Orang Tua/Wali. Sekolah dan perusahaan dicatat sebagai data, bukan akun.
- Pengemudi dan Orang Tua/Wali tidak boleh menaikkan role sendiri; relasi dan penugasan ditentukan dari data yang sah.
- Prosedur pembuktian kewenangan Operator, verifikasi dokumen/izin, dan pencabutan akses masih **BELUM DIPUTUSKAN** dan memerlukan tinjauan hukum.
- T&C dan pemberitahuan privasi harus ditinjau oleh penasihat hukum yang kompeten. Dokumen ini bukan pendapat hukum dan tidak menghapus kewajiban penyedia aplikasi.

## 5. Kepatuhan dan data pribadi

- Operator bertanggung jawab atas dasar pemrosesan data siswa, wali, lokasi, dan video yang dikelolanya.
- Penyedia aplikasi menyediakan perlindungan teknis dan informasi privasi sesuai peran hukumnya; pembagian peran legal final perlu ditinjau.
- Data anak, lokasi, dan kamera memerlukan tinjauan PDPL dan kewajiban Saudi yang berlaku.
- Jangan menggunakan data produksi nyata untuk pengujian tanpa izin dan perlindungan.
- Retensi, penghapusan, transfer lintas negara, dan penanganan insiden masih memerlukan keputusan dan tinjauan hukum.

## 6. Pertanyaan yang masih terbuka

| ID | Pertanyaan | Status |
|---|---|---|
| OM-01 | Kota pilot dan skala awal? | Dammam dan sekitarnya; perencanaan sekitar 100 bus |
| OM-02 | Proses onboarding dan bukti kewenangan Operator seperti apa yang realistis? | PERLU DISESUAIKAN DENGAN T&C DAN TINJAUAN HUKUM |
| OM-03 | Apakah Operator wajib memasukkan nomor/jenis izin atau cukup menyatakan kewenangan? | BELUM DIPUTUSKAN |
| OM-04 | Siapa yang mengelola akun staf Operator dan mencabut aksesnya? | BELUM DIPUTUSKAN; tetap dalam ekosistem Operator, bukan role baru |
| OM-05 | Siapa yang mengelola perangkat, kredensial, pemeliharaan, dan respons saat GPS/DVR offline? | BELUM DIPUTUSKAN |
| OM-06 | Apakah integrasi Noor diinginkan dan diizinkan? API/izin integrasi belum terbukti. | BELUM DIPUTUSKAN |

Pertanyaan lama tentang pembagian akses antar-sekolah/antar-organisasi tidak lagi menjadi model produk. Jika operator staf internal memerlukan pembatasan per tindakan, itu memerlukan keputusan tersendiri dan tidak boleh membentuk tenant/role baru.

## 7. Kriteria keluar dari tinjauan operasional

- ruang lingkup penyedia aplikasi versus Operator terdokumentasi;
- model satu Operator dan tiga ekosistem disetujui serta tercermin di T&C;
- batas akses Operator/Pengemudi/Wali disetujui dan dapat ditegakkan di server/RLS;
- proses onboarding dan pencabutan akses diputuskan;
- kota pilot dan skala cukup jelas untuk merencanakan uji teknis.

**Status akhir:** model satu Operator telah disetujui melalui DEC-033. T&C, pembuktian kewenangan, retensi, dan kewajiban hukum masih memerlukan perumusan dan tinjauan. Belum ada provider, arsitektur final, atau fitur bisnis yang diimplementasikan berdasarkan dokumen ini.
