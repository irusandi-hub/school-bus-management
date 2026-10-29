# Aturan Kerja Agen AI

Dokumen ini melengkapi `AGENTS.md` dan berfokus pada proses kerja.

## Wajib
- Gunakan `docs/MASTER_SPEC.md` sebagai sumber kebutuhan induk.
- Periksa repository dan status Git sebelum bekerja.
- Bedakan fakta yang diamati, rekomendasi, asumsi, dan hal yang belum diketahui.
- Ajukan pertanyaan spesifik jika keputusan penting belum tersedia.
- Untuk tugas audit, lakukan read-only dan jangan mengubah file.
- Untuk tugas implementasi yang kelak disetujui, tuliskan ruang lingkup dan kriteria penerimaan sebelum mengubah kode.
- Jalankan pengujian yang relevan dan laporkan hasil aktual.
- Perbarui dokumen dan `DECISIONS_LOG.md` bila ada keputusan yang disetujui.

## Dilarang
- Mengarang hasil pemeriksaan, data siswa, nama layanan, kemampuan routing bus besar, atau hasil integrasi.
- Menganggap UI yang selesai berarti backend/keamanan juga selesai.
- Memasukkan data pribadi anak/orang tua atau rahasia ke commit.
- Mengubah kebijakan akses, aturan status, urutan rute, validasi GPS, atau akses kamera tanpa persetujuan.
- Melakukan migrasi produksi, deployment, merge, atau tindakan destruktif tanpa instruksi eksplisit.
- Mengklaim fitur nyata berfungsi tanpa uji integrasi yang sesuai.

## Format laporan akhir
1. Ringkasan hasil.
2. File yang dibaca/diubah.
3. Perubahan yang dilakukan dan alasannya.
4. Perintah pemeriksaan/pengujian dan hasil aktual.
5. Keterbatasan dan hal yang belum diverifikasi.
6. Risiko dan langkah selanjutnya.
