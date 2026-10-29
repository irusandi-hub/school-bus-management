# Matriks Tanggung Jawab Model Operasional

**Status:** DRAF UNTUK DIKONFIRMASI — bukan penetapan kewajiban hukum atau desain izin final  
**Wilayah:** Arab Saudi  
**Model yang harus didukung:** sekolah mengoperasikan bus sendiri dan sekolah menggunakan perusahaan transportasi  
**Kota pilot:** BELUM DIPUTUSKAN  
**Batas:** dokumentasi dan analisis saja; tidak ada coding fitur bisnis atau pemilihan provider.

## 1. Tujuan

Dokumen ini mengidentifikasi keputusan operasional dan batas akses yang harus dikonfirmasi sebelum arsitektur aplikasi disetujui. Dua model tidak diasumsikan berjalan bersamaan di setiap sekolah.

- **Model A — Bus sekolah sendiri:** sekolah mengoperasikan atau mengatur busnya sendiri. Status kepemilikan dan lisensi tetap harus diverifikasi.
- **Model B — Perusahaan transportasi:** sekolah menggunakan perusahaan transportasi yang memiliki izin relevan. Kontrak dan ruang lingkup layanan perlu diperiksa.
- **Model campuran:** apakah satu sekolah dapat memakai Model A dan B pada waktu yang sama, per rute, bus, atau periode masih BELUM DIPUTUSKAN.

## 2. Matriks aktor dan tanggung jawab — belum diisi sebagai keputusan

Legenda RACI: **R** = mengerjakan; **A** = penanggung jawab akhir; **C** = dimintai pertimbangan; **I** = diberi informasi. Seluruh sel bertanda **TBD** harus disepakati dengan pemilik produk dan pihak operasi; jangan menyimpulkan tanggung jawab hukum hanya dari matriks ini.

| Aktivitas / keputusan | Sekolah | Perusahaan transportasi | Pengemudi | Admin platform | Wali | TGA/MoE / penasihat berwenang |
|---|---|---|---|---|---|---|
| Memastikan izin sekolah/aktivitas yang diperlukan | TBD | TBD | — | — | — | C / verifikasi |
| Memastikan izin dan dokumen bus | TBD | TBD | TBD | — | — | C / verifikasi |
| Memastikan kelayakan/dokumen pengemudi | TBD | TBD | TBD | — | — | C / verifikasi |
| Memasukkan dan memperbarui data siswa | TBD | TBD | — | TBD | C | — |
| Memverifikasi hubungan wali–siswa | TBD | TBD | — | TBD | C | — |
| Menugaskan bus dan pengemudi | TBD | TBD | I | TBD | — | — |
| Menyusun, meninjau, dan menyetujui rute | TBD | TBD | C | TBD | I bila relevan | — |
| Menyediakan dan memelihara GPS/AVL | TBD | TBD | I | TBD | — | C / verifikasi |
| Menyediakan dan memelihara kamera/DVR | TBD | TBD | I | TBD | — | C / verifikasi |
| Menangani perjalanan, status siswa, dan insiden | TBD | TBD | TBD | TBD | I sesuai izin | C bila diwajibkan |
| Memberi/mencabut akses kamera per anak | TBD | TBD | TBD | TBD | I sesuai kebijakan | C / verifikasi |
| Menanggapi permintaan akses/koreksi data pribadi | TBD | TBD | — | TBD | C / subjek data | C / penasihat privasi |
| Menetapkan retensi dan penghapusan data | TBD | TBD | — | TBD | I sesuai ketentuan | C / penasihat privasi |
| Menangani insiden keamanan atau kebocoran data | TBD | TBD | I | TBD | I bila relevan | C / otoritas terkait |
| Mengekspor laporan operasional | TBD | TBD | — | TBD | Hanya data anak yang diizinkan | — |

**Catatan:** tanda “TBD” bukan berarti tanggung jawab dibagi rata. Penetapan akhir harus mengikuti kontrak, struktur organisasi, aturan yang berlaku, dan prinsip akses minimum.

## 3. Keputusan model multi-sekolah dan pemisahan data

Jawab sebelum desain tenant, database, dan otorisasi ditetapkan:

- [ ] Apakah satu perusahaan transportasi dapat melayani beberapa sekolah?
- [ ] Jika ya, apakah staf perusahaan hanya melihat sekolah, bus, perjalanan, dan siswa yang secara eksplisit ditugaskan kepadanya?
- [ ] Siapa yang dapat mengundang, menonaktifkan, atau mengganti staf perusahaan?
- [ ] Apakah sekolah dapat melihat perjalanan operator tanpa memperoleh akses ke data sekolah lain yang dilayani operator tersebut?
- [ ] Siapa yang menjadi pengendali data dan siapa yang bertindak sebagai pemroses untuk setiap jenis data? Konfirmasi dengan penasihat yang kompeten.
- [ ] Apakah satu sekolah boleh memakai bus sendiri sekaligus kontraktor, dan bagaimana penugasan per bus/rute/periode direpresentasikan?
- [ ] Bagaimana penggantian operator, pemutusan kontrak, atau pengalihan rute mengakhiri akses lama tanpa menghapus riwayat yang wajib disimpan?
- [ ] Apakah perusahaan diperbolehkan mengelola data wali/siswa secara langsung, atau hanya menerima data minimum yang dibutuhkan untuk tugas yang ditetapkan?

### Prinsip akses sementara untuk desain

Ini adalah prinsip keamanan yang disarankan, bukan pengganti keputusan bisnis atau legal:

1. Hak akses dibatasi berdasarkan sekolah, penugasan, perjalanan, dan tujuan kerja.
2. Hubungan kerja/kontrak berakhir atau penugasan dicabut → akses terkait ditinjau dan dicabut; riwayat audit tidak dihapus secara diam-diam.
3. Pengemudi hanya melihat data minimum yang dibutuhkan untuk perjalanan yang sedang ditugaskan.
4. Akses wali terhadap siswa harus berdasarkan hubungan yang telah diverifikasi dan disetujui, bukan hanya nomor telepon.
5. Akses kamera live harus diperiksa di server saat digunakan dan dibatasi pada periode serta anak yang diizinkan.
6. Admin platform tidak otomatis menjadi pihak yang berhak melihat seluruh data anak atau video; kebutuhan dukungan harus memiliki alasan, izin, dan audit.

## 4. Pertanyaan konfirmasi operasional

| ID | Pertanyaan | Status |
|---|---|---|
| OM-01 | Model campuran boleh berjalan per sekolah/rute/bus/periode? | BELUM DIPUTUSKAN |
| OM-02 | Satu perusahaan boleh melayani beberapa sekolah? | BELUM DIPUTUSKAN |
| OM-03 | Pihak mana yang menandatangani kontrak dan bertanggung jawab atas izin untuk setiap model? | PERLU VERIFIKASI |
| OM-04 | Siapa yang bertanggung jawab atas data siswa/wali dan video/GPS menurut kontrak dan hukum? | PERLU VERIFIKASI |
| OM-05 | Siapa yang menetapkan/menyetujui rute dan menerima peringatan rute tidak aman? | BELUM DIPUTUSKAN |
| OM-06 | Siapa yang mengelola perangkat, kredensial, pemeliharaan, dan respons saat GPS/DVR offline? | BELUM DIPUTUSKAN |
| OM-07 | Siapa yang dapat mengundang staf perusahaan dan mengatur ruang lingkup aksesnya? | BELUM DIPUTUSKAN |
| OM-08 | Proses apa yang berlaku saat kontrak berakhir, operator berganti, atau terjadi insiden? | BELUM DIPUTUSKAN |
| OM-09 | Apakah integrasi dengan Noor diinginkan dan diizinkan? API/izin integrasi belum terbukti. | BELUM DIPUTUSKAN |
| OM-10 | Kota pilot dan skala awal (sekolah, siswa, bus, pengemudi, perjalanan, stop maksimum)? | BELUM DIPUTUSKAN |

## 5. Bukti publik yang ditinjau

- Asharqia Chamber, 9 September 2026, menyampaikan surat TGA yang merujuk pada peraturan pelaksanaan aktivitas transportasi pendidikan dan menyebut sekolah swasta harus memenuhi perizinan terkait atau menggunakan penyedia transportasi pendidikan berizin. Sumber ini adalah pemberitahuan sekunder; konfirmasi aturan dan penerapan pada model tertentu tetap dibutuhkan: https://www.chamber.org.sa/en/information-center/memos/memo-4997/
- Keputusan TGA yang diterbitkan di Umm Al-Qura pada 10 April 2026 mengubah jadwal kewajiban tes kompetensi profesional untuk kartu pengemudi bus. Relevansi tepatnya terhadap kelas operator/pengemudi perlu diverifikasi: https://www.uqn.gov.sa/decisions-and-regulations/authorities/4000704
- Layanan transportasi sekolah Kementerian Pendidikan tersedia melalui alur digital Noor. Keberadaan halaman layanan bukan bukti adanya API publik atau izin integrasi: https://www.moe.gov.sa/en/knowledgecenter/eservices/Pages/studentransport.aspx
- Panduan SDAIA tentang PDPL menjelaskan data pribadi dan kerangka regulasi, termasuk transfer data ke luar Kerajaan. Panduan tidak menggantikan penilaian hukum spesifik: https://dgp.sdaia.gov.sa/wps/portal/pdp/knowledgecenter/details/PDPLCP

## 6. Kriteria keluar dari tinjauan operasional

Tinjauan model operasi hanya dapat ditandai **LULUS** setelah:
- pihak sekolah dan perusahaan (jika terlibat) mengonfirmasi matriks tanggung jawab;
- struktur akses multi-sekolah dan pemutusan akses disetujui;
- persyaratan izin terbaru dikonfirmasi oleh pihak berwenang/penasihat yang kompeten;
- peran pengendali/pemroses dan aliran data ditinjau;
- kota pilot dan skala awal cukup jelas untuk merencanakan uji teknis.

Hingga itu terpenuhi: **jangan memilih provider, jangan mengklaim patuh regulasi, dan jangan mulai coding fitur bisnis.**
