-- Pemeriksaan keselamatan sebelum perjalanan diakhiri (DEC-025).
--
-- Pengemudi wajib mengonfirmasi kondisi bus, kecocokan jumlah siswa, dan tidak ada
-- siswa tertinggal. Bukti pemeriksaan disimpan bersama perjalanan agar dapat ditelusuri
-- operator dan admin. Batasan di level database memastikan perjalanan berstatus
-- 'completed' selalu memiliki jejak pemeriksaan, bukan hanya dari sisi aplikasi.

alter table public.trips
  add column if not exists safety_checked_at timestamptz,
  add column if not exists safety_check_notes text,
  add column if not exists student_count_confirmed integer
    check (student_count_confirmed is null or student_count_confirmed >= 0);

alter table public.trips
  add constraint trips_completed_requires_safety_check
  check (status <> 'completed' or safety_checked_at is not null) not valid;

comment on column public.trips.safety_checked_at is
  'Waktu pengemudi menyelesaikan pemeriksaan keselamatan wajib sebelum menutup perjalanan.';
comment on column public.trips.safety_check_notes is
  'Catatan pemeriksaan keselamatan yang ditulis pengemudi (opsional).';
comment on column public.trips.student_count_confirmed is
  'Jumlah siswa aktif pada rute saat perjalanan ditutup, sesuai konfirmasi pengemudi.';
