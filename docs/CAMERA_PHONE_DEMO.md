# Demo kamera HP tanpa layanan berbayar

## Batas tahap ini

Implementasi di `/demo-kamera` adalah **uji perangkat terisolasi**, bukan integrasi kamera perjalanan/wali. Satu publisher, satu viewer, video saja, WebRTC langsung dengan STUN Cloudflare; tidak ada akun provider, SFU, TURN, upload video, atau rekaman aplikasi. Signaling manual menghindari server signaling publik yang belum memiliki autentikasi. Tidak ada layanan berbayar diaktifkan.

Demo mati secara default: `CAMERA_DEVICE_DEMO=1` hanya diterima bila `deploymentKind()` adalah development/preview. Production/lingkungan tak dikenal tetap 404. Halaman tugas pengemudi memiliki kontrol uji perangkat terpisah, hanya saat flag aktif dan perjalanan berstatus berlangsung. Kamera tidak dipetakan ke identitas simulasi atau dikirim ke wali. Tidak ada data anak atau database yang dipakai.

## Menjalankan

1. Set `CAMERA_DEVICE_DEMO=1`, jalankan `npm run dev`, buka `/demo-kamera`.
2. Untuk dua HP gunakan origin HTTPS yang disetujui; localhost hanya aman pada perangkat yang menjalankan server. Alamat LAN HTTP bukan konteks kamera aman. Publikasi/deployment tidak dilakukan oleh perubahan ini.
3. Pilih HP pengirim dan perangkat penonton. Arahkan kamera hanya ke objek uji yang tidak sensitif. Tekan Mulai pada pengirim.
4. Kirim offer secara privat, tempel di viewer, buat answer, lalu kembalikan answer ke pengirim dan tekan Sambungkan. Kode berisi metadata jaringan (SDP/ICE); jangan letakkan di log, tiket publik, atau repository. Gunakan kanal di perangkat lain karena menyembunyikan halaman menghentikan sesi.
5. Viewer menunjukkan LIVE setelah `playing`, menghapus indikator saat pause/waiting/stalled/error. Preview kamera lokal bukan bukti pengiriman berhasil.
6. Hentikan dari salah satu perangkat. Kamera lokal dilepas dan peer ditutup; sesi berakhir otomatis setelah 10 menit, saat halaman tersembunyi, pagehide, atau koneksi gagal/terputus. Tidak ada reconnect diam-diam.

STUN tidak meneruskan video tetapi memproses metadata koneksi. Peer bisa mengetahui metadata jaringan pihak lain. Tidak dijamin melewati NAT/operator seluler; mulai dengan Wi-Fi yang sama. Tanpa TURN, kegagalan koneksi antarjaringan adalah keterbatasan nyata, bukan alasan mengaktifkan layanan berbayar. Batas waktu deteksi peer terputus belum diukur pada perangkat nyata.

## Batas keamanan dan tahap berikutnya

Signaling privat bukan autentikasi akun dan bukan otorisasi wali. Jangan gunakan dengan anak nyata. Integrasi kamera operasional pengemudi–wali tetap diblokir hingga tersedia sesi terverifikasi, validasi server penugasan/perjalanan/relasi wali–anak, sumber status boarded yang otoritatif, serta signaling/relay terproteksi yang dapat mencabut subscription aktif dari server. Jangan menghubungkan kamera ke identitas simulasi pada preview.

Cloudflare SFU/TURN masih rekomendasi, bukan layanan aktif. Aktivasi memerlukan konfigurasi server dan verifikasi paket/batas biaya. Tidak mengasumsikan kuota gratis sebagai hard spending cap. Jangan mengaktifkan billing otomatis atau layanan berbayar tanpa persetujuan.

## Checklist pengujian fisik yang masih wajib

- Dua HP Android/iOS pada Wi-Fi sama lalu Wi-Fi–seluler/operator berbeda.
- Izin ditolak, kamera tidak tersedia/dicabut, pindah aplikasi, layar terkunci, stop, reload, timeout.
- Ukur startup, latensi, bitrate, dan waktu deteksi penghentian di penerima.
- Tahap integrasi: tolak akun tanpa hak, anak lain/perjalanan lain, cabut saat turun/selesai, tolak kode/token lama.

Tes unit/browser lokal tidak membuktikan konektivitas dua HP, keamanan RLS, ataupun pencabutan server. Tidak ada deployment, migrasi, commit, push, atau PR pada tahap perubahan lokal ini.

## Bukti verifikasi lokal (2026-11-05)

- `npm run typecheck`: lulus.
- `npm test`: 81/81 lulus, termasuk flag fail-closed dan validasi kode offer/answer.
- `npm run build`: lulus; route demo dinamis.
- Chromium headless, dua browser context terisolasi, kamera sintetis: offer/answer melalui UI, koneksi WebRTC nyata, video viewer memiliki dimensi dan waktu playback positif, LIVE muncul setelah playing. Stop pengirim membersihkan srcObject/kode dan LIVE viewer hilang. Viewport 390×844 tidak overflow horizontal; tidak ada pageerror.
- Build yang sama dijalankan sebagai `VERCEL_ENV=production` dengan flag demo tetap 1: `/demo-kamera` HTTP 404.
- Ini bukan uji dua perangkat fisik atau jaringan seluler. Screenshot lokal memakai pola video sintetis, bukan video anak.

## Kontrol halaman pengemudi (2026-11-05)

Di `/pengemudi/tugas/[id]`, flag yang sama membuka panel **Siaran kamera**. Mulai perjalanan dahulu, konfirmasi objek uji tanpa data pribadi, lalu tekan **Mulai siaran uji**. Izin kamera baru diminta setelah tombol ditekan. Panel memakai lifecycle demo yang sama dan hanya berperan sebagai publisher; penonton tetap di `/demo-kamera` dengan signaling kode privat manual. Tidak ada hubungan stream–trip di server atau siaran otomatis wali.

**Hentikan siaran**, menghapus konfirmasi, berpindah halaman, atau status tugas keluar dari berlangsung melepas kamera melalui unmount. Batas background/lock, timeout 10 menit, dan kegagalan jaringan tetap berlaku. Kontrol tidak dirender di produksi atau bila flag mati. Status perjalanan pada panel bukan otorisasi stream; jangan gunakan untuk operasional/anak nyata sebelum autentikasi dan pencabutan server tersedia.

### Verifikasi kontrol pengemudi
- Typecheck, 81 tes, dan build ulang lulus.
- Chromium dua context pada build preview: tugas terjadwal menahan kontrol; aksi mulai perjalanan membuka konfirmasi; konfirmasi saja tidak mengaktifkan kamera; tombol mulai menghasilkan offer; penonton menerima playback nyata; tombol stop membersihkan media/kode; menghapus konfirmasi menghentikan seluruh track. Tidak ada pageerror atau overflow pada 390×844.
- Izin kamera ditolak (mock getUserMedia): pesan gagal muncul, tidak ada media/kode, tombol mulai tersedia untuk coba ulang.
- Runtime production dengan flag 1: demo 404 dan tidak ada kontrol siaran pengemudi.
- Percobaan awal next dev gagal karena environment NODE_ENV nonstandar pada runtime pengujian; verifikasi browser dilakukan pada build/start dengan NODE_ENV=production dan VERCEL_ENV=preview yang eksplisit, tanpa melonggarkan middleware.
