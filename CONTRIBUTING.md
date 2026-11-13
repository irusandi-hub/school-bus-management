# Kontribusi dan perubahan dokumen

## Prinsip
Perubahan harus menjaga kesesuaian dengan `docs/PRODUCT_ARCHITECTURE_THREE_ECOSYSTEMS.md`, DEC-033, dan `docs/MASTER_SPEC.md`. Jika usulan mengubah keputusan produk, perubahan tidak boleh langsung dianggap disetujui hanya karena sudah dibuat dalam dokumen atau kode.

Aturan tiga ekosistem mengikat: hanya Operator, Pengemudi, dan Orang Tua/Wali. Admin Pusat dan Sekolah bukan role/akun terpisah; wilayah/organisasi bukan batas akses Operator. Dokumen lama yang bertentangan harus ditandai legacy atau diperbarui, bukan dijadikan dasar perubahan baru.

## Alur yang disarankan
1. Jelaskan masalah atau kebutuhan.
2. Tunjukkan bagian master specification yang terdampak.
3. Catat apakah usulan merupakan koreksi fakta, keputusan produk baru, atau pertanyaan yang belum diputuskan.
4. Usulkan perubahan dokumentasi terlebih dahulu.
5. Minta persetujuan pemilik produk untuk perubahan yang mengubah perilaku aplikasi, keamanan, privasi, tarif, atau alur operasional.
6. Perbarui `docs/DECISIONS_LOG.md` setelah keputusan disetujui.
7. Jangan mulai implementasi fitur bisnis sampai tinjauan spesifikasi teknis dinyatakan selesai.

## Checklist sebelum mengajukan perubahan
- [ ] Ruang lingkup dan alasan perubahan jelas.
- [ ] Tidak ada rahasia atau data pribadi nyata yang ditambahkan.
- [ ] Dokumen terkait diperbarui secara konsisten dan tidak membangkitkan Admin Pusat/empat area/multi-operator tenant.
- [ ] Dampak pada hak akses, keselamatan, riwayat, dan QA ditinjau.
- [ ] Hal yang belum diketahui diberi label yang tepat.
