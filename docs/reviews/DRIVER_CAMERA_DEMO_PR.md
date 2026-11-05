# Review: demo siaran kamera HP pengemudi (bukan integrasi wali operasional)

Base: feature/driver-navigation-parent-live-video
Head: feat/driver-phone-live-20261105

## Lingkup
- Kontrol mulai/hentikan pada detail tugas pengemudi, dengan konfirmasi objek uji dan gate perjalanan.
- Pilihan kamera HP atau placeholder kamera bus yang membutuhkan setting operator.
- getUserMedia video-only, RTCPeerConnection, addTrack, pertukaran offer/answer privat secara manual, penerimaan ontrack pada /demo-kamera.
- Stop, unmount, pergantian sumber, background, kegagalan peer dan batas 10 menit melepas media.
- Default mati; development/preview saja. Production menolak walaupun flag diaktifkan.
- Label LIVE wali mengikuti playback; data simulasi tidak membuka video nyata.

## Bukti dan batasan
- Typecheck dan 81 tes lulus; browser dua context dengan kamera sintetis sebelumnya berhasil playback WebRTC, stop, izin ditolak, pergantian sumber dan viewport ponsel.
- Bukan hanya preview lokal: track diteruskan ke peer penonton setelah pertukaran SDP.
- Belum diuji dua HP fisik atau jaringan seluler. Tanpa TURN/SFU, koneksi tidak dijamin.
- Belum otomatis ke halaman wali. Tidak ada signaling otomatis, autentikasi publisher/viewer, pemetaan bus/trip/anak, otorisasi wali atau pencabutan server.
- Bukan izin menggunakan kamera anak/data pribadi. Tidak mengubah RLS, tidak merekam dan tidak mengaktifkan layanan berbayar.
- Belum deploy. Jangan merge sebelum review; PR ini hanya demo pengujian perangkat, bukan fitur produksi selesai.

## Cara uji lokal
Set CAMERA_DEVICE_DEMO=1 pada development yang menggunakan data simulasi. Buka detail tugas pengemudi, mulai perjalanan, pilih kamera seluler, konfirmasi objek uji, lalu Mulai siaran uji. Buka /demo-kamera pada browser lain dengan peran penonton. Tukar offer/answer secara privat dan tekan Sambungkan pada pengirim. Untuk HP gunakan HTTPS; jangan membuka kamera nyata melalui preview publik tanpa pengamanan akses. Produksi tetap tertutup.
