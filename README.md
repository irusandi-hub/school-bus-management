# School Bus Management

Aplikasi manajemen transportasi bus sekolah untuk sekolah, operator bus, pengemudi, dan orang tua/wali. Pilot perencanaan: Dammam dan sekitarnya.

## Status saat ini

**Pratinjau antarmuka awal sedang dibangun.** Repo kini memiliki fondasi Next.js untuk dashboard responsif dengan tiga tampilan peran: Admin Pusat, Pengemudi, dan Orang Tua/Wali.

Pratinjau ini menggunakan data simulasi. Ini belum merupakan sistem operasional dan belum menyediakan login, database, API, GPS langsung, routing, notifikasi, atau integrasi kamera. Jangan gunakan angka, peta, maupun status contoh untuk keputusan perjalanan nyata.

## Menjalankan secara lokal

Persyaratan: Node.js 20+ dan npm.

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

Untuk membuat build produksi lokal:

```bash
npm run build
npm run start
```

## Tampilan awal

- Dashboard responsif untuk desktop dan perangkat seluler.
- Pemilih tampilan Admin Pusat, Pengemudi, dan Orang Tua/Wali.
- Navigasi dasar: Ringkasan, Perjalanan, Rute & Titik Jemput, Data Siswa, Bus & Pengemudi, dan Laporan.
- Ilustrasi peta dan data perjalanan simulasi yang ditandai sebagai pratinjau.
- Struktur UI tidak memuat data anak, kontak, koordinat rumah, atau kredensial nyata.

## Langkah pengembangan berikutnya

1. Tinjau fondasi UI dan tetapkan alur utama yang perlu diimplementasikan terlebih dahulu.
2. Rancang autentikasi dan otorisasi server/database, termasuk pemisahan organisasi dan relasi wali-anak.
3. Tambahkan model data dan alur master data, rute yang disetujui, penugasan, perjalanan, status siswa, serta riwayat.
4. Integrasikan penyedia peta/routing dan sumber GPS melalui lapisan server-side; jangan menaruh API key rahasia di browser.
5. Uji keamanan, status GPS usang/offline, dan alur perjalanan sebelum penggunaan lapangan.

Kamera live merupakan fitur tambahan dan tidak menjadi prasyarat untuk menyelesaikan alur inti navigasi dan laporan orang tua.

## Dokumen acuan

- [Master specification](docs/MASTER_SPEC.md)
- [Tinjauan spesifikasi teknis](docs/TECHNICAL_SPEC_REVIEW.md)
- [Catatan keputusan](docs/DECISIONS_LOG.md)
- [Alur inti navigasi dan laporan orang tua](docs/CORE_WORKFLOWS_NAVIGATION_AND_PARENT_REPORTS.md)
- [Evaluasi penyedia routing](docs/ROUTING_PROVIDER_EVALUATION.md)
- [Draf pertanyaan vendor HERE](docs/HERE_VENDOR_INQUIRY.md)

## Keamanan dan batasan

Jangan masukkan data pribadi siswa/orang tua, kredensial, token, API key, atau data produksi ke Git. Otorisasi harus ditegakkan di server/database, bukan hanya dengan menyembunyikan menu. Persyaratan hukum, izin operasional, perlindungan data anak, routing bus besar di wilayah pilot, serta integrasi GPS/kamera masih perlu diverifikasi sebelum peluncuran.
