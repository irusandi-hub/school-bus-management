-- ---------------------------------------------------------------------------
-- Pemeriksaan migrasi dan RLS untuk School Bus Management
--
-- Jalankan HANYA pada database pengembangan KOSONG (bukan produksi):
--
--   createdb schoolbus_dev            # + stub skema auth (lihat catatan di bawah)
--   psql -v ON_ERROR_STOP=1 -d schoolbus_dev -f supabase/migrations/20261029000000_initial_school_bus_schema.sql
--   psql -v ON_ERROR_STOP=1 -d schoolbus_dev -f supabase/migrations/20261031000000_admin_core_crud.sql
--   psql -v ON_ERROR_STOP=1 -d schoolbus_dev -f supabase/migrations/20261031000001_operator_driver_guardian_areas.sql
--   psql -v ON_ERROR_STOP=1 -d schoolbus_dev -f supabase/migrations/20261031000002_operator_driver_account_linking.sql
--   psql -v ON_ERROR_STOP=1 -d schoolbus_dev -f supabase/tests/migration_checks.sql
--
-- Berkas ini membuat data uji. Jangan dijalankan pada database yang berisi data
-- nyata. Setiap kegagalan memunculkan exception sehingga psql berhenti pada baris
-- pertama yang gagal (ON_ERROR_STOP).
--
-- Stub yang diperlukan sebelum migrasi (Supabase menyediakan ini di platformnya):
--   * role `anon` dan `authenticated` (nologin);
--   * schema `auth` berisi tabel `users (id uuid primary key, email text)` dan
--     fungsi `auth.uid()` yang membaca `current_setting('request.jwt.claim.sub')`.
-- ---------------------------------------------------------------------------

\set ON_ERROR_STOP on
\set QUIET on

-- ---------------------------------------------------------------------------
-- 1. Data uji (superuser, tanpa RLS)
-- ---------------------------------------------------------------------------

insert into auth.users (id, email, email_confirmed_at) values
  ('00000000-0000-0000-0000-000000000001', 'admin@contoh.test', now()),
  ('00000000-0000-0000-0000-000000000002', 'operator.a@contoh.test', now()),
  ('00000000-0000-0000-0000-000000000003', 'operator.b@contoh.test', now()),
  ('00000000-0000-0000-0000-000000000004', 'pengemudi.a@contoh.test', now()),
  ('00000000-0000-0000-0000-000000000005', 'pengemudi.b@contoh.test', now()),
  ('00000000-0000-0000-0000-000000000006', 'wali.a@contoh.test', now()),
  ('00000000-0000-0000-0000-000000000007', 'wali.b@contoh.test', now()),
  ('00000000-0000-0000-0000-000000000008', 'pengguna@contoh.test', now());

insert into public.profiles (id, full_name, role) values
  ('00000000-0000-0000-0000-000000000001', 'Admin Pusat', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'Operator A', 'operator'),
  ('00000000-0000-0000-0000-000000000003', 'Operator B', 'operator'),
  ('00000000-0000-0000-0000-000000000004', 'Pengemudi A', 'driver'),
  ('00000000-0000-0000-0000-000000000005', 'Pengemudi B', 'driver'),
  ('00000000-0000-0000-0000-000000000006', 'Wali A', 'parent'),
  ('00000000-0000-0000-0000-000000000007', 'Wali B', 'parent'),
  ('00000000-0000-0000-0000-000000000008', 'Pengguna Baru', 'parent');

insert into public.operators (id, profile_id, name, code, city, active) values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000002', 'Operator A', 'OPR-A', 'Dammam', true),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000003', 'Operator B', 'OPR-B', 'Dammam', true);

insert into public.schools (id, operator_id, name, code, city, active) values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'Sekolah A', 'SCH-A', 'Dammam', true),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000102', 'Sekolah B', 'SCH-B', 'Dammam', true);

insert into public.buses (id, operator_id, fleet_code, plate_number, capacity, active) values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000101', 'BUS-A', 'ABC-1001', 40, true),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000102', 'BUS-B', 'ABC-2002', 40, true);

insert into public.drivers (id, operator_id, profile_id, full_name, license_number, active) values
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000004', 'Pengemudi A', 'SIM-1001', true),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000005', 'Pengemudi B', 'SIM-2002', true);

insert into public.guardians (id, profile_id, email, full_name, active) values
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000006', 'wali.a@contoh.test', 'Wali A', true),
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000007', 'wali.b@contoh.test', 'Wali B', true);

insert into public.students (id, admissions_number, full_name, school_id, guardian_id, service_status) values
  ('00000000-0000-0000-0000-000000000601', 'ADM-A1', 'Siswa A Satu', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000501', 'active'),
  ('00000000-0000-0000-0000-000000000602', 'ADM-A2', 'Siswa A Dua', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000501', 'paused'),
  ('00000000-0000-0000-0000-000000000603', 'ADM-B1', 'Siswa B Satu', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000502', 'active');

insert into public.routes (id, route_name, school_name, direction, active) values
  ('00000000-0000-0000-0000-000000000701', 'Rute Sekolah A Pagi', 'Sekolah A', 'morning', true),
  ('00000000-0000-0000-0000-000000000702', 'Rute Sekolah B Pagi', 'Sekolah B', 'morning', true);

insert into public.route_stops (id, route_id, stop_order, stop_name, latitude, longitude, is_school) values
  ('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000701', 1, 'Titik Jemput A', 26.42, 50.08, false),
  ('00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000701', 2, 'Sekolah A', 26.43, 50.09, true),
  ('00000000-0000-0000-0000-000000000803', '00000000-0000-0000-0000-000000000702', 1, 'Titik Jemput B', 26.44, 50.10, false);

insert into public.student_route_stops (id, student_id, route_id, stop_id, direction, active) values
  ('00000000-0000-0000-0000-000000000901', '00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000801', 'morning', true);

insert into public.trip_assignments (id, route_id, driver_id, bus_id, service_date, assigned_by) values
  ('00000000-0000-0000-0000-000000000a01', '00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000301', current_date, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000a02', '00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000302', current_date, '00000000-0000-0000-0000-000000000001');

insert into public.trips (id, assignment_id, status, started_at) values
  ('00000000-0000-0000-0000-000000000b01', '00000000-0000-0000-0000-000000000a01', 'in_progress', now()),
  ('00000000-0000-0000-0000-000000000b02', '00000000-0000-0000-0000-000000000a02', 'in_progress', now());

insert into public.trip_student_events (id, trip_id, student_id, event_type, recorded_by) values
  ('00000000-0000-0000-0000-000000000c01', '00000000-0000-0000-0000-000000000b01', '00000000-0000-0000-0000-000000000601', 'boarded', '00000000-0000-0000-0000-000000000004');

-- ---------------------------------------------------------------------------
-- 2. Pemeriksaan per peran
-- ---------------------------------------------------------------------------

\echo '=== T1 Operator A hanya melihat organisasinya sendiri ==='
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
do $$
declare n int;
begin
  select count(*) into n from public.schools;
  if n <> 1 then raise exception 'GAGAL T1a: operator melihat % sekolah (diharapkan 1)', n; end if;
  select count(*) into n from public.buses;
  if n <> 1 then raise exception 'GAGAL T1b: operator melihat % bus (diharapkan 1)', n; end if;
  select count(*) into n from public.drivers;
  if n <> 1 then raise exception 'GAGAL T1c: operator melihat % pengemudi (diharapkan 1)', n; end if;
  select count(*) into n from public.students;
  if n <> 2 then raise exception 'GAGAL T1d: operator melihat % siswa (diharapkan 2, milik sekolahnya sendiri)', n; end if;
  select count(*) into n from public.operators;
  if n <> 1 then raise exception 'GAGAL T1e: operator melihat % baris operators (diharapkan 1)', n; end if;
  raise notice 'OK T1: cakupan data organisasi terbatas';
end $$;
reset role;

\echo '=== T2 Operator A tidak melihat rute/stop organisasi lain ==='
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
do $$
declare n int;
begin
  select count(*) into n from public.routes;
  if n <> 1 then raise exception 'GAGAL T2a: operator melihat % rute (diharapkan 1)', n; end if;
  select count(*) into n from public.route_stops;
  if n <> 2 then raise exception 'GAGAL T2b: operator melihat % titik jemput (diharapkan 2)', n; end if;
  select count(*) into n from public.student_route_stops;
  if n <> 1 then raise exception 'GAGAL T2c: operator melihat % baris roster (diharapkan 1)', n; end if;
  raise notice 'OK T2: rute, titik jemput, dan roster terbatas pada sekolah operator';
end $$;
reset role;

\echo '=== T3 Operator A tidak dapat menulis rute/stop/roster lintas organisasi ==='
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
do $$
declare n int;
begin
  begin
    insert into public.routes (route_name, school_name, direction)
    values ('Rute Ilegal', 'Sekolah B', 'morning');
    raise exception 'GAGAL T3a: operator dapat menyisipkan rute milik sekolah lain';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.route_stops (route_id, stop_order, stop_name, latitude, longitude)
    values ('00000000-0000-0000-0000-000000000702', 9, 'Titik Ilegal', 26, 50);
    raise exception 'GAGAL T3b: operator dapat menyisipkan titik jemput pada rute sekolah lain';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.routes set route_name = 'Rute Diubah' where id = '00000000-0000-0000-0000-000000000701';
    get diagnostics n = row_count;
    if n <> 0 then
      raise exception 'GAGAL T3c: operator dapat mengubah % rute (rute hanya dibaca)', n;
    end if;
  end;

  begin
    insert into public.student_route_stops (student_id, route_id, stop_id, direction)
    values ('00000000-0000-0000-0000-000000000603', '00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000803', 'morning');
    raise exception 'GAGAL T3d: operator dapat menyisipkan roster siswa sekolah lain';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.buses set capacity = 99 where id = '00000000-0000-0000-0000-000000000302';
    get diagnostics n = row_count;
    if n <> 0 then
      raise exception 'GAGAL T3e: operator dapat mengubah % bus milik organisasi lain', n;
    end if;
  end;
  raise notice 'OK T3: seluruh tulis lintas organisasi ditolak';
end $$;
reset role;

\echo '=== T4 Operator hanya dapat membuat penugasan untuk armada, pengemudi, dan rute miliknya ==='
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
do $$
begin
  begin
    insert into public.trip_assignments (route_id, driver_id, bus_id, service_date)
    values ('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000301', current_date + 1);
    raise exception 'GAGAL T4a: operator dapat menugaskan rute sekolah lain';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.trip_assignments (route_id, driver_id, bus_id, service_date)
    values ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000301', current_date + 1);
    raise exception 'GAGAL T4b: operator dapat menugaskan pengemudi organisasi lain';
  exception when insufficient_privilege then null;
  end;
  raise notice 'OK T4: penugasan dibatasi aset milik organisasi';
end $$;
reset role;

\echo '=== T5 Pengemudi hanya melihat penugasan, perjalanan, dan siswa miliknya ==='
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000004', false);
do $$
declare n int;
begin
  select count(*) into n from public.trip_assignments;
  if n <> 1 then raise exception 'GAGAL T5a: pengemudi melihat % penugasan (diharapkan 1)', n; end if;
  select count(*) into n from public.trips;
  if n <> 1 then raise exception 'GAGAL T5b: pengemudi melihat % perjalanan (diharapkan 1)', n; end if;
  select count(*) into n from public.student_route_stops;
  if n <> 1 then raise exception 'GAGAL T5c: pengemudi melihat % baris roster (diharapkan 1)', n; end if;
  select count(*) into n from public.students;
  if n <> 1 then raise exception 'GAGAL T5d: pengemudi melihat % siswa (diharapkan 1)', n; end if;
  select count(*) into n from public.trip_student_events;
  if n <> 1 then raise exception 'GAGAL T5e: pengemudi melihat % catatan kehadiran (diharapkan 1)', n; end if;
  select count(*) into n from public.schools;
  if n <> 0 then raise exception 'GAGAL T5f: pengemudi dapat membaca % sekolah', n; end if;
  raise notice 'OK T5: cakupan pengemudi terbatas pada tugasnya';
end $$;
reset role;

\echo '=== T6 Pengemudi tidak dapat mengubah perjalanan atau data orang lain ==='
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000004', false);
do $$
declare n int;
begin
  -- Perjalanan ganda untuk satu penugasan harus ditolak database.
  begin
    insert into public.trips (assignment_id, status, started_at)
    values ('00000000-0000-0000-0000-000000000a01', 'in_progress', now());
    raise exception 'GAGAL T6a: database menerima perjalanan aktif ganda untuk satu penugasan';
  exception when insufficient_privilege then null;
         when unique_violation then null;
  end;

  -- Perjalanan penugasan pengemudi lain tidak terjangkau sama sekali.
  begin
    insert into public.trips (assignment_id, status, started_at)
    values ('00000000-0000-0000-0000-000000000a02', 'in_progress', now());
    raise exception 'GAGAL T6b: pengemudi dapat memulai perjalanan penugasan orang lain';
  exception when insufficient_privilege then null;
  end;

  update public.trips set status = 'completed'
    where id = '00000000-0000-0000-0000-000000000b02';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'GAGAL T6c: pengemudi dapat mengubah perjalanan pengemudi lain (%)', n; end if;

  update public.students set full_name = 'Diubah'
    where id = '00000000-0000-0000-0000-000000000603';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'GAGAL T6d: pengemudi dapat mengubah siswa lain'; end if;

  select count(*) into n from public.audit_logs;
  if n <> 0 then raise exception 'GAGAL T6e: pengemudi dapat membaca % baris audit', n; end if;
  raise notice 'OK T6: pengemudi tidak dapat menulis di luar tugasnya';
end $$;
reset role;

\echo '=== T7 Wali hanya melihat anak aktif miliknya beserta riwayat ==='
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000006', false);
do $$
declare n int;
begin
  select count(*) into n from public.students;
  if n <> 1 then raise exception 'GAGAL T7a: wali melihat % anak (diharapkan 1 aktif saja)', n; end if;
  select count(*) into n from public.routes;
  if n <> 1 then raise exception 'GAGAL T7b: wali melihat % rute (diharapkan 1)', n; end if;
  select count(*) into n from public.trip_assignments;
  if n <> 1 then raise exception 'GAGAL T7c: wali melihat % penugasan (diharapkan 1)', n; end if;
  select count(*) into n from public.trips;
  if n <> 1 then raise exception 'GAGAL T7d: wali melihat % perjalanan (diharapkan 1)', n; end if;
  select count(*) into n from public.trip_student_events;
  if n <> 1 then raise exception 'GAGAL T7e: wali melihat % catatan kehadiran (diharapkan 1)', n; end if;
  select count(*) into n from public.buses;
  if n <> 1 then raise exception 'GAGAL T7f: wali melihat % bus (diharapkan 1, bus anaknya)', n; end if;
  select count(*) into n from public.schools;
  if n <> 1 then raise exception 'GAGAL T7g: wali melihat % sekolah (diharapkan 1)', n; end if;
  raise notice 'OK T7: portal wali terbatas pada anak aktif miliknya';
end $$;
reset role;

\echo '=== T8 Wali kedua tidak melihat data wali pertama ==='
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000007', false);
do $$
declare n int;
begin
  select count(*) into n from public.students;
  if n <> 1 then raise exception 'GAGAL T8a: wali B melihat % anak (diharapkan 1 miliknya)', n; end if;
  select count(*) into n from public.trip_student_events;
  if n <> 0 then raise exception 'GAGAL T8b: wali B melihat % catatan kehadiran anak lain', n; end if;
  select count(*) into n from public.trips;
  if n <> 0 then raise exception 'GAGAL T8c: wali B melihat % perjalanan anak lain', n; end if;
  raise notice 'OK T8: tidak ada kebocoran antar wali';
end $$;
reset role;

\echo '=== T9 Profil pengguna lain tidak terbaca lintas peran ==='
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
do $$
declare n int;
begin
  select count(*) into n from public.profiles;
  if n <> 1 then raise exception 'GAGAL T9a: operator membaca % profil (diharapkan 1, miliknya sendiri)', n; end if;
  select count(*) into n from public.audit_logs;
  if n <> 0 then raise exception 'GAGAL T9b: operator membaca % baris audit', n; end if;
  select count(*) into n from public.guardians;
  if n <> 1 then raise exception 'GAGAL T9c: operator membaca % wali (diharapkan 1, wali siswa sekolahnya)', n; end if;
  raise notice 'OK T9: profil dan audit terbatas';
end $$;
reset role;

\echo '=== T10 Admin Pusat tetap melihat seluruh data ==='
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
do $$
declare n int;
begin
  select count(*) into n from public.schools;
  if n <> 2 then raise exception 'GAGAL T10a: admin melihat % sekolah (diharapkan 2)', n; end if;
  select count(*) into n from public.routes;
  if n <> 2 then raise exception 'GAGAL T10b: admin melihat % rute (diharapkan 2)', n; end if;
  select count(*) into n from public.audit_logs;
  if n = 0 then raise exception 'GAGAL T10c: admin tidak dapat membaca audit'; end if;
  raise notice 'OK T10: kewenangan Admin Pusat utuh';
end $$;
reset role;

\echo '=== T11 Anonim tidak memiliki hak apa pun ==='
set role anon;
do $$
begin
  begin
    perform count(*) from public.students;
    raise exception 'GAGAL T11: role anon dapat membaca data siswa';
  exception when insufficient_privilege then null;
  end;
  begin
    perform count(*) from public.routes;
    raise exception 'GAGAL T11b: role anon dapat membaca rute';
  exception when insufficient_privilege then null;
  end;
  raise notice 'OK T11: role anon tanpa akses tabel';
end $$;
reset role;

\echo '=== T12 Penautan akun hanya untuk Admin Pusat ==='
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
do $$
begin
  begin
    perform public.link_operator_account('00000000-0000-0000-0000-000000000101', 'pengguna@contoh.test');
    raise exception 'GAGAL T12: operator dapat menautkan akun sendiri';
  exception when others then
    if sqlerrm not like 'Akses ditolak%' then
      raise exception 'GAGAL T12b: pesan penolakan tidak sesuai (%)', sqlerrm;
    end if;
  end;

  begin
    perform public.link_driver_account('00000000-0000-0000-0000-000000000401', 'pengguna@contoh.test');
    raise exception 'GAGAL T12c: operator dapat menautkan akun pengemudi';
  exception when others then
    if sqlerrm not like 'Akses ditolak%' then
      raise exception 'GAGAL T12d: pesan penolakan tidak sesuai (%)', sqlerrm;
    end if;
  end;
  raise notice 'OK T12: penautan akun ditolak untuk non-admin';
end $$;
reset role;

\echo '=== T13 Admin Pusat menautkan dan melepas akun operator ==='
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
do $$
declare v text;
begin
  -- Email yang tidak terdaftar harus ditolak dengan pesan yang jelas.
  begin
    perform public.link_operator_account('00000000-0000-0000-0000-000000000101', 'tidak.ada@contoh.test');
    raise exception 'GAGAL T13a: email tak terdaftar diterima';
  exception when others then
    if sqlerrm not like '%Email belum terdaftar%' then
      raise exception 'GAGAL T13b: pesan email tak terdaftar tidak sesuai (%)', sqlerrm;
    end if;
  end;

  select public.link_operator_account('00000000-0000-0000-0000-000000000101', 'pengguna@contoh.test') into v;
  if v not like '%berhasil ditautkan%' then
    raise exception 'GAGAL T13c: balasan penautan tidak sesuai (%)', v;
  end if;
end $$;

do $$
declare n int;
begin
  select count(*) into n from public.operators
   where id = '00000000-0000-0000-0000-000000000101'
     and profile_id = '00000000-0000-0000-0000-000000000008';
  if n <> 1 then raise exception 'GAGAL T13d: tautan operator tidak tersimpan'; end if;

  select count(*) into n from public.profiles
   where id = '00000000-0000-0000-0000-000000000008' and role = 'operator';
  if n <> 1 then raise exception 'GAGAL T13e: peran akun tidak menjadi operator'; end if;

  select count(*) into n from public.operators
   where profile_id = '00000000-0000-0000-0000-000000000004';
  if n <> 0 then raise exception 'GAGAL T13f: akun pengemudi ikut tertaut ke operator'; end if;
  raise notice 'OK T13: penautan oleh admin bekerja';
end $$;

-- Menautkan akun yang sudah dipakai operator lain harus ditolak.
do $$
begin
  begin
    perform public.link_driver_account('00000000-0000-0000-0000-000000000402', 'pengguna@contoh.test');
    raise exception 'GAGAL T13g: akun yang sudah tertaut dapat dipakai ganda';
  exception when others then
    if sqlerrm not like '%sudah tertaut%' then
      raise exception 'GAGAL T13h: pesan tautan ganda tidak sesuai (%)', sqlerrm;
    end if;
  end;
  raise notice 'OK T13i: tautan ganda ditolak';
end $$;

-- Pelepasan tautan mengembalikan akun ke status tanpa organisasi.
do $$
declare n int;
begin
  perform public.unlink_operator_account('00000000-0000-0000-0000-000000000101');
  select count(*) into n from public.operators where id = '00000000-0000-0000-0000-000000000101' and profile_id is null;
  if n <> 1 then raise exception 'GAGAL T13j: tautan tidak dilepas'; end if;
  raise notice 'OK T13k: pelepasan tautan bekerja';
end $$;
reset role;
select set_config('request.jwt.claim.sub', '', false);

\echo '=== T14 Email tautan hanya terbaca oleh Admin Pusat ==='
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
do $$
declare n int;
begin
  select count(*) into n from public.linked_account_emails(array['00000000-0000-0000-0000-000000000008']::uuid[]);
  if n <> 0 then raise exception 'GAGAL T14a: operator dapat membaca email akun (%)', n; end if;
  raise notice 'OK T14a: email akun tersembunyi untuk non-admin';
end $$;
reset role;

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
do $$
declare n int;
begin
  select count(*) into n from public.linked_account_emails(array['00000000-0000-0000-0000-000000000008']::uuid[]);
  if n <> 1 then raise exception 'GAGAL T14b: admin membaca % email (diharapkan 1)', n; end if;
  raise notice 'OK T14b: admin dapat memeriksa tautan akun';
end $$;
reset role;
select set_config('request.jwt.claim.sub', '', false);

\echo ''
\echo '=== SEMUA PEMERIKSAAN MIGRASI DAN RLS LULUS ==='
