# Kamera perjalanan: integrasi eksperimental (belum siap produksi)

## Ruang lingkup / file
- `lib/camera/trip-connection.ts`: WebRTC offer/answer/ICE otomatis; Supabase hanya signaling.
- `components/driver/TripCameraPublisher.tsx`, `DriverBroadcastPanel.tsx`, `app/pengemudi/page.tsx`: consent, kamera belakang tanpa audio, preview dan stop pada trip aktif.
- `ParentLiveVideo.tsx`, `ChildOverviewCard.tsx`, `lib/guardian/live-view.ts`: sambungkan wali tanpa desain ulang; simulasi tidak membuka kamera.
- `supabase/migrations/20261106000000_trip_camera_signaling.sql`: sesi, RPC, RLS channel privat dan trigger pencabutan.
- `supabase/tests/camera-checks.mjs`, `tests/trip-camera.test.ts`, `tests/camera-demo.test.ts`: pemeriksaan SQL dan lifecycle client.

## Aktivasi nonproduksi setelah review
1. Gunakan proyek Supabase **nonproduksi** dan akun uji sintetis yang benar-benar authenticated. Mode UI terbuka tidak memberikan hak database.
2. Review lalu terapkan migration lewat alur migration yang disetujui. Tidak ada migration produksi yang dijalankan oleh pekerjaan ini.
3. Atur URL/publishable key proyek uji dan `NEXT_PUBLIC_TRIP_CAMERA_ENABLED=1` saat build. Default flag mati. Jangan mengaktifkan produksi sebelum acceptance di bawah lulus.
4. Gunakan HTTPS atau localhost, izin kamera pengemudi, dan Realtime private channels. Jangan menambah kebijakan broadcast INSERT bagi browser.

## Otorisasi
Setiap RPC memeriksa identitas `auth.uid()`, pengemudi aktif pada assignment trip, wali aktif pemilik siswa, penempatan siswa aktif yang sesuai rute/direction, trip `in_progress`, dan event boarding terakhir (mengabaikan `issue`) harus `boarded`. ID dari browser bukan bukti izin. Channel privat ber-ID sesi acak; tidak ada akses tabel sesi langsung bagi anon/authenticated. Peran offer/answer dibatasi; payload maksimal 64 KiB. Trigger menutup sesi setelah perubahan yang mencabut hak. Sesi tertutup tidak bisa dihidupkan kembali.

## Pencabutan dan batas keamanan
- Client polling 2 detik; peer/channel ditutup jika heartbeat gagal. Watchdog independen 10 detik, interval 500 ms, menutup peer saat RPC menggantung. Lease database 30 detik hanya diperpanjang publisher.
- Pencabutan bukan seketika: ada latensi polling/jaringan, dan timer browser dapat tertunda ketika background. Tidak ada jaminan hard realtime 10 detik pada browser yang ditangguhkan.
- RLS/channel tidak memutus WebRTC secara langsung. Pemutusan media mengandalkan client publisher/viewer resmi mematuhi heartbeat. Publisher dan viewer yang keduanya dimodifikasi untuk mengabaikannya dapat mempertahankan koneksi peer yang sudah terbentuk. Jaminan adversarial mutlak membutuhkan media relay berotorisasi; tidak disediakan di sini.
- Tidak ada STUN/TURN eksternal: koneksi lintas NAT/operator seluler bisa gagal. Tidak ada rekaman/DVR, audio atau layanan berbayar. Browser penerima tetap dapat merekam layar; jangan menjanjikan pencegahan rekaman.
- Tidak ada reconnect viewer otomatis setelah peer ditutup; buka ulang halaman untuk sesi baru. Satu sesi per wali/siswa: tab baru menutup sesi lama.
- Tabel sesi memerlukan kebijakan retensi/pembersihan dan batas jumlah publisher viewers sebelum skala produksi. Trigger memindai sesi aktif; belum diuji beban.

## Bukti lokal dan batasnya
- `npm run test:camera:sql`: keenam migration dan baseline SQL di PostgreSQL PGlite terisolasi. Auth/Realtime di-stub; hanya menguji database/RPC, bukan hosted Supabase.
- Skenario SQL: wali/pengemudi salah ditolak, pihak berhak, arah sinyal, larangan write langsung, drop-off, trip selesai, sesi lama, lease kedaluwarsa, relasi wali dinonaktifkan.
- `npm test`: tes mock client membuktikan ready/offer/answer otomatis dan penutupan saat revoke/watchdog/dispose. Bukan bukti video nyata.
- Typecheck dan build harus diperiksa dari hasil perintah, bukan dari PR sebelumnya.

## Acceptance yang masih terblokir
Tidak tersedia konfigurasi/kredensial proyek Supabase nonproduksi dan akun uji pada workspace. Belum dibuktikan private-channel hosted, playback pengemudi→wali, penolakan browser pihak lain, atau pemutusan video browser nyata setelah turun/selesai.
Pada proyek uji: uji dua browser/ponsel terautentikasi, catat playback dan waktu revoke saat dropped_off/completed; coba topic lama dengan JWT wali lain dan setelah hak dicabut; putus jaringan/signaling, pastikan media berhenti; uji buka/tutup ulang kamera dan navigasi. Jangan mengklaim fitur tersedia sebelum bukti ini ada.

## Hasil verifikasi 2026-11-06
Typecheck dan production build lokal lulus. Audit dependency production melaporkan 1 moderate dan 1 high; tidak dilakukan upgrade di luar lingkup. CI/preview remote belum diverifikasi.
