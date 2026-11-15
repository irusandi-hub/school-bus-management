# shadcn/ui adoption — School Bus Management

## Prinsip

shadcn/ui adalah sumber komponen lokal, bukan template untuk mengganti aplikasi. Migrasi dilakukan per lapisan dan per halaman. Pertahankan alur data, validasi server, otorisasi, route, teks produk, layout yang telah disetujui, dan perilaku responsif.

- Jangan mengubah struktur halaman atau urutan tindakan hanya untuk menyesuaikan komponen.
- Jangan mengganti aset/gambar atau identitas warna yang telah disetujui.
- Jangan aktifkan Tailwind Preflight secara global selama CSS lama masih dipakai.
- Gunakan token semantik yang dipetakan ke palet hijau aplikasi.
- Jangan ubah kontrak server action, Supabase, RLS, atau skema database dalam pekerjaan UI.
- Setiap tahap wajib lulus npm test, npm run typecheck, dan npm run build sebelum lanjut.

## Tahapan

1. Fondasi: konfigurasi shadcn/ui, Tailwind CSS v4, cn(), token warna, Button, Card, Input, Label, Badge, Table, Textarea, dan Separator.
2. Operator: migrasi tombol, filter, field, badge, tabel, dan dialog; pertahankan kolom, filter URL, paginasi, validasi, serta konteks Project Area.
3. Wali: migrasi presentasi dashboard satu halaman; pertahankan kartu anak, video, peta, status, dan akses data wali.
4. Pengemudi: migrasi kontrol secara terisolasi; layout operasional, tombol utama, urutan stop, navigasi, dan checklist keselamatan tidak boleh berubah.
5. Akses dan landing page: migrasi field, label, tombol, dialog; jangan tambah jalur login kedua atau mengubah alur OTP. Landing page hanya retouch ringan, tanpa mengganti layout/gambar.
6. Konsolidasi: hapus CSS lama hanya setelah seluruh halaman terkait dimigrasikan dan pengujian membuktikan tidak ada regresi.

## Status

Tahap fondasi tersedia di branch Preview. Migrasi halaman berikutnya belum dianggap selesai hanya karena komponen dasar tersedia.
