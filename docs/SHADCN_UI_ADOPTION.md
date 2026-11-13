# shadcn/ui adoption — School Bus Management

## Prinsip

shadcn/ui adalah sumber komponen lokal, bukan template untuk mengganti aplikasi. Migrasi dilakukan per lapisan dan per halaman. Pertahankan alur data, validasi server, otorisasi, route, teks produk, layout yang telah disetujui, dan perilaku responsif.

- Jangan mengubah struktur halaman atau urutan tindakan hanya untuk menyesuaikan komponen.
- Jangan mengganti aset/gambar atau identitas warna yang telah disetujui.
- Jangan mengaktifkan Tailwind Preflight secara global selama CSS lama masih dipakai.
- Gunakan token semantik yang sudah dipetakan ke palet hijau School Bus.
- Jangan mengubah kontrak server action, Supabase, RLS, atau skema database dalam pekerjaan UI.
- Setiap tahap wajib lulus `npm test`, `npm run typecheck`, dan `npm run build` sebelum lanjut.

## Tahapan

### Tahap 1 — Fondasi (branch Preview ini)

- Konfigurasi shadcn/ui dan Tailwind CSS v4.
- Utilitas `cn()` untuk penggabungan class.
- Token warna dan radius yang mengikuti palet aplikasi saat ini.
- Komponen dasar lokal: Button, Card, Input, Label, Badge, Table, Textarea, dan Separator.
- Tailwind utilities diaktifkan tanpa reset Preflight agar CSS lama tidak berubah massal.

### Tahap 2 — Ruang kerja Operator

Migrasikan komponen bersama terlebih dahulu: tombol aksi, filter, field formulir, badge status, tabel, dan dialog konfirmasi. Pertahankan kolom, filter URL, paginasi, validasi, serta konteks Project Area.

### Tahap 3 — Orang Tua/Wali

Migrasikan komponen presentasi pada dashboard satu halaman. Pertahankan susunan kartu anak, area video, peta, status perjalanan, dan akses data yang hanya sah untuk wali tersebut.

### Tahap 4 — Pengemudi

Migrasikan kontrol tindakan dan elemen pendukung secara terisolasi. Layout operasional, posisi tombol utama, urutan stop, navigasi, dan checklist keselamatan tidak boleh berubah.

### Tahap 5 — Akses dan landing page

Migrasikan field, label, tombol, dan dialog akses tanpa menambah jalur login kedua atau mengubah alur OTP yang disepakati. Landing page hanya menerima retouch ringan; jangan mengganti layout maupun gambar.

### Tahap 6 — Konsolidasi

Hapus aturan CSS lama hanya setelah semua pemakaian pada halaman terkait telah dimigrasikan dan pengujian visual/responsif membuktikan tidak ada regresi.

## Status

Tahap 1 sedang diuji di Vercel Preview. Tahap berikutnya belum dianggap selesai hanya karena fondasi komponen sudah tersedia.
