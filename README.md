# School Bus Management

Aplikasi manajemen transportasi bus sekolah untuk sekolah, operator bus, pengemudi, dan orang tua/wali. Pilot perencanaan: Dammam dan sekitarnya.

## Status saat ini

**Pratinjau antarmuka awal sedang dibangun.** Repo kini memiliki fondasi Next.js untuk dashboard responsif dengan tiga tampilan peran: Admin Pusat, Pengemudi, dan Orang Tua/Wali.

Dashboard awal masih menggunakan data simulasi. Cabang pengembangan ini menambahkan halaman masuk email, callback Supabase Auth, skema awal database, dan ruang navigasi pengemudi. Login belum dapat digunakan sampai proyek Supabase dibuat, environment Vercel diisi, URL callback diizinkan, serta kebijakan akses data disiapkan. GPS, routing langsung, notifikasi, dan integrasi kamera belum aktif. Jangan gunakan angka, peta, maupun status contoh untuk keputusan perjalanan nyata.

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

- Beranda publik di `/` dengan teks Indonesia, English, dan العربية (termasuk tata letak RTL).
- Pratinjau dashboard operasional di `/dashboard`.
- Dashboard responsif untuk desktop dan perangkat seluler.
- Pemilih tampilan Admin Pusat, Pengemudi, dan Orang Tua/Wali.
- Navigasi dasar: Ringkasan, Perjalanan, Rute & Titik Jemput, Data Siswa, Bus & Pengemudi, dan Laporan.
- Ilustrasi peta dan data perjalanan simulasi yang ditandai sebagai pratinjau.
- Struktur UI tidak memuat data anak, kontak, koordinat rumah, atau kredensial nyata.

## Status implementasi dan konfigurasi

- Login: `/login`, menggunakan tautan email melalui Supabase Auth.
- Callback: `/auth/callback`.
- Environment Vercel yang diperlukan: `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Skema database awal ada di `supabase/migrations/20261029000000_initial_school_bus_schema.sql`. Semua tabel mengaktifkan RLS dan belum memiliki policy permisif; data tetap tertutup sampai policy per peran ditinjau dan diterapkan.
- Petunjuk arah pengemudi ditempatkan pada menu **Perjalanan** saat tampilan peran Pengemudi dipilih. Navigasi nyata baru dapat diaktifkan setelah rute dan koordinat valid tersimpan.

## Langkah pengembangan berikutnya

1. Buat proyek Supabase khusus School Bus Management dan atur environment Vercel.
2. Terapkan migrasi, lalu tambahkan dan uji kebijakan RLS untuk admin, pengemudi yang ditugaskan, dan wali yang terhubung ke siswa.
3. Hubungkan login ke profil/role yang dibuat admin; jangan izinkan pengguna menentukan role sendiri.
4. Bangun pengelolaan data bus, pengemudi, siswa, rute, dan penugasan.
5. Integrasikan Google Maps/routing dan GPS setelah data rute nyata tersedia, kemudian uji alur lapangan.

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
