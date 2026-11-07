# PR #26 — perbaikan terbatas scroll titik rute

Acuan: `f935c2d`, branch `feat/driver-integrated-ops`.

## Perubahan aplikasi
Hanya `app/globals.css`: daftar dalam overlay yang sudah ada diposisikan absolut dengan inset di bawah summary dan di atas batas bawah overlay. Panel, peta, dua kolom, struktur React, urutan titik, GPS, autentikasi, dan database tidak diubah.

`overflow:clip` pada panel dan aturan dasar `overflow:visible` bukan keseluruhan cascade: selector `[open]` sebenarnya sudah menetapkan `overflow-y:auto`. Namun Chromium membungkus isi `<details>` di kotak internal sehingga flex pada `<details>` tidak membatasi anak daftar secara langsung. Daftar tumbuh setinggi konten (3891/3882 px), lalu dipotong induk; scrollTop tetap 0. Batas absolut membuat tinggi viewport daftar benar-benar terbatas (151/176 px), tetap memakai `overflow-y:auto`, `overflow-x:hidden`, `overscroll-behavior:contain`, dan `touch-action:pan-y`.

## Bukti browser
Chromium headless `/usr/bin/chromium`, viewport CSS 360×640, 390×844, 1280×800, DPR 1. Preview lokal development, dataset simulasi, tanpa akses database produksi. Fixture 32 titik disisipkan **hanya di DOM browser**, bukan aplikasi/dataset tersimpan: empat titik asli tetap dalam urutan relatif awal, 28 titik simulasi disisipkan sebelum sekolah terakhir. Badge ditandai SIMULASI.

`before-*` diambil dengan CSS asli commit acuan; `after-*` dengan perbaikan. `*-first.png` menampilkan awal, `*-last.png` menampilkan batas akhir setelah wheel, dan `*-expanded-last.png` menunjukkan akhir setelah detail titik terakhir dibuka. Pada layar kecil, satu titik yang diperluas lebih tinggi dari viewport daftar; seluruh bagian tetap dapat dicapai melalui scroll (tidak diklaim terlihat serentak).

| Viewport | Tinggi daftar | Tinggi konten | scrollTop akhir | Hasil |
|---|---:|---:|---:|---|
| 360×640 | 151 | 3891 | 3740 | lulus |
| 390×844 | 151 | 3882 | 3731 | lulus |
| 1280×800 | 176 | 3882 | 3706 | lulus |

Titik pertama terlihat; seluruh 32 baris dapat dibawa ke viewport; titik sekolah terakhir terlihat utuh saat detail tertutup. Bagian bawah detail terakhir yang diperluas juga dapat dicapai. Wheel tambahan di batas bawah tidak mengubah scrollTop; window.scrollY dan scrollTop panel tetap 0. Bounding box panel navigasi dan peta identik sebelum/sesudah scroll serta antara CSS acuan/perbaikan. Tinggi dokumen sama dengan viewport pada tiga ukuran. Pengukuran mentah ada di `before-measurements.json` dan `after-measurements.json` (toleransi subpiksel 1 px).

`pass` baseline false untuk ketiga viewport: titik terakhir tidak terlihat, allReachable false, scrollTop 0. Pemeriksaan expandedLastBottomReachable baseline sendirian tidak membuktikan visibilitas karena daftar baseline melampaui clipping ancestor; hasil keseluruhan tetap gagal.

Verifikasi ini memakai wheel/input browser dan pengukuran geometris, **bukan pemeriksaan CSS saja**. Gestur sentuh pada perangkat fisik belum diuji; `touch-action:pan-y` dipertahankan dan diperiksa pada computed style. Tidak mengklaim pengujian pan/pinch/GPS fisik.

## Reproduksi
Jalankan preview lokal port 3026 dengan NODE_ENV=development. Sediakan playwright-core di lingkungan pengujian (bukan dependensi aplikasi), kemudian `node docs/review/route-stops-scroll/verify.cjs after`. `SCROLL_TEST_URL` dapat mengganti URL. Untuk before, gunakan CSS commit acuan; script tidak mengubah CSS otomatis. Jangan menjalankan pada data produksi.

## Pengujian
- `npm test`: 154 lulus, 0 gagal.
- `npx tsc --noEmit`: exit 0.
- `npm run build` dengan NODE_ENV=production: lihat `build.log`.
- `git diff --check`: lulus.

Seluruh berkas di folder ini adalah bukti review, bukan perubahan aplikasi. Tidak ada migration diterapkan, merge, atau deploy manual.
