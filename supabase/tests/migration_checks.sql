-- PostgreSQL/PGlite integration checks for the three-ecosystem access model.
-- This file is run only against a fresh ephemeral test database by the SQL test
-- scripts. All fixtures below are synthetic and must never be copied to production.

insert into auth.users (id, email, email_confirmed_at) values
  ('00000000-0000-0000-0000-000000000001', 'operator@contoh.test', now()),
  ('00000000-0000-0000-0000-000000000002', 'unused.a@contoh.test', now()),
  ('00000000-0000-0000-0000-000000000003', 'unused.b@contoh.test', now()),
  ('00000000-0000-0000-0000-000000000004', 'pengemudi.a@contoh.test', now()),
  ('00000000-0000-0000-0000-000000000005', 'pengemudi.b@contoh.test', now()),
  ('00000000-0000-0000-0000-000000000006', 'wali.a@contoh.test', now()),
  ('00000000-0000-0000-0000-000000000007', 'wali.b@contoh.test', now()),
  ('00000000-0000-0000-0000-000000000008', 'pengguna@contoh.test', now());

-- One and only one global Operator. Company rows remain ordinary data and have
-- no login identity or authority boundary.
insert into public.profiles (id, full_name, role) values
  ('00000000-0000-0000-0000-000000000001', 'Operator Utama', 'operator'),
  ('00000000-0000-0000-0000-000000000004', 'Pengemudi A', 'driver'),
  ('00000000-0000-0000-0000-000000000005', 'Pengemudi B', 'driver'),
  ('00000000-0000-0000-0000-000000000006', 'Wali A', 'parent'),
  ('00000000-0000-0000-0000-000000000007', 'Wali B', 'parent'),
  ('00000000-0000-0000-0000-000000000008', 'Pengguna Baru', 'parent');

insert into public.operators (id, profile_id, name, code, city, active) values
  ('00000000-0000-0000-0000-000000000101', null, 'Perusahaan A', 'OPR-A', 'Dammam', true),
  ('00000000-0000-0000-0000-000000000102', null, 'Perusahaan B', 'OPR-B', 'Dammam', true);

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

-- Operator Utama sees and manages platform-wide records, regardless of the
-- company/school mapping. The mapping remains useful only for reporting/audit.
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
do $$
declare n int;
begin
  if not private.is_admin() then raise exception 'Operator tidak dikenali sebagai otoritas global'; end if;
  if private.current_operator_id() is not null then raise exception 'Akun Operator tidak boleh bergantung pada tautan perusahaan'; end if;
  select count(*) into n from public.schools; if n <> 2 then raise exception 'Operator tidak melihat seluruh sekolah: %', n; end if;
  select count(*) into n from public.operators; if n <> 2 then raise exception 'Operator tidak melihat seluruh perusahaan: %', n; end if;
  select count(*) into n from public.buses; if n <> 2 then raise exception 'Operator tidak melihat seluruh bus: %', n; end if;
  select count(*) into n from public.drivers; if n <> 2 then raise exception 'Operator tidak melihat seluruh pengemudi: %', n; end if;
  select count(*) into n from public.guardians; if n <> 2 then raise exception 'Operator tidak melihat seluruh wali: %', n; end if;
  select count(*) into n from public.students; if n <> 3 then raise exception 'Operator tidak melihat seluruh siswa: %', n; end if;
  select count(*) into n from public.routes; if n <> 2 then raise exception 'Operator tidak melihat seluruh rute: %', n; end if;
  select count(*) into n from public.route_stops; if n <> 3 then raise exception 'Operator tidak melihat seluruh titik: %', n; end if;
  select count(*) into n from public.student_route_stops; if n <> 1 then raise exception 'Operator tidak melihat seluruh roster: %', n; end if;
  select count(*) into n from public.trip_assignments; if n <> 2 then raise exception 'Operator tidak melihat seluruh penugasan: %', n; end if;
  select count(*) into n from public.trips; if n <> 2 then raise exception 'Operator tidak melihat seluruh perjalanan: %', n; end if;
  select count(*) into n from public.trip_student_events; if n <> 1 then raise exception 'Operator tidak melihat seluruh peristiwa perjalanan: %', n; end if;
  select count(*) into n from public.audit_logs; if n = 0 then raise exception 'Operator tidak dapat membaca audit platform'; end if;
end $$;
reset role;

-- A second legacy Admin or Operator must not coexist with the global Operator.
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
do $$
begin
  begin
    insert into public.profiles (id, full_name, role)
    values ('00000000-0000-0000-0000-000000000002', 'Global kedua', 'admin');
    raise exception 'Database menerima akun global kedua';
  exception when unique_violation then null;
  end;
end $$;
reset role;

-- Drivers see only their own assigned operational data.
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000004', false);
do $$
declare n int;
begin
  select count(*) into n from public.trip_assignments; if n <> 1 then raise exception 'Pengemudi A melihat penugasan lain: %', n; end if;
  select count(*) into n from public.trips; if n <> 1 then raise exception 'Pengemudi A melihat perjalanan lain: %', n; end if;
  select count(*) into n from public.student_route_stops; if n <> 1 then raise exception 'Pengemudi A melihat roster lain: %', n; end if;
  select count(*) into n from public.students; if n <> 1 then raise exception 'Pengemudi A melihat siswa lain: %', n; end if;
  select count(*) into n from public.trip_student_events; if n <> 1 then raise exception 'Pengemudi A melihat catatan lain: %', n; end if;
  select count(*) into n from public.schools; if n <> 0 then raise exception 'Pengemudi dapat membaca master sekolah'; end if;
  select count(*) into n from public.audit_logs; if n <> 0 then raise exception 'Pengemudi dapat membaca audit'; end if;
end $$;
reset role;

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000005', false);
do $$
declare n int;
begin
  select count(*) into n from public.trip_assignments; if n <> 1 then raise exception 'Pengemudi B tidak melihat penugasan sendiri'; end if;
  select count(*) into n from public.trips; if n <> 1 then raise exception 'Pengemudi B tidak melihat perjalanan sendiri'; end if;
  select count(*) into n from public.students; if n <> 0 then raise exception 'Pengemudi B melihat siswa tanpa roster'; end if;
end $$;
reset role;

-- Guardians see only their own active children and the corresponding trips.
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000006', false);
do $$
declare n int;
begin
  select count(*) into n from public.students; if n <> 1 then raise exception 'Wali A melihat anak tidak aktif atau bukan miliknya: %', n; end if;
  select count(*) into n from public.routes; if n <> 1 then raise exception 'Wali A melihat rute lain: %', n; end if;
  select count(*) into n from public.trip_assignments; if n <> 1 then raise exception 'Wali A melihat penugasan lain: %', n; end if;
  select count(*) into n from public.trips; if n <> 1 then raise exception 'Wali A melihat perjalanan lain: %', n; end if;
  select count(*) into n from public.trip_student_events; if n <> 1 then raise exception 'Wali A melihat peristiwa anak lain: %', n; end if;
  select count(*) into n from public.buses; if n <> 1 then raise exception 'Wali A melihat bus lain: %', n; end if;
  select count(*) into n from public.schools; if n <> 1 then raise exception 'Wali A melihat sekolah lain: %', n; end if;
end $$;
reset role;

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000007', false);
do $$
declare n int;
begin
  select count(*) into n from public.students; if n <> 1 then raise exception 'Wali B tidak melihat anak sendiri'; end if;
  select count(*) into n from public.trip_student_events; if n <> 0 then raise exception 'Wali B melihat peristiwa anak lain'; end if;
  select count(*) into n from public.trips; if n <> 0 then raise exception 'Wali B melihat perjalanan anak lain'; end if;
  select count(*) into n from public.buses; if n <> 0 then raise exception 'Wali B melihat bus anak lain'; end if;
end $$;
reset role;

-- No anonymous data access; parent/driver accounts cannot promote themselves.
set role anon;
do $$
begin
  begin
    perform count(*) from public.students;
    raise exception 'Anon dapat membaca data siswa';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000004', false);
do $$
begin
  begin
    perform public.link_driver_account('00000000-0000-0000-0000-000000000401', 'operator@contoh.test');
    raise exception 'Pengemudi dapat memanggil fungsi penautan akun';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

-- Operator cannot turn its global identity into a driver account. A guardian
-- identity cannot be converted either, even if the guardian row is inactive.
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
do $$
begin
  begin
    perform public.link_driver_account('00000000-0000-0000-0000-000000000402', 'operator@contoh.test');
    raise exception 'Akun Operator berhasil diubah menjadi Pengemudi';
  exception when others then
    if sqlerrm not like '%Operator Utama%' then raise; end if;
  end;
  begin
    perform public.link_driver_account('00000000-0000-0000-0000-000000000402', 'wali.a@contoh.test');
    raise exception 'Akun Wali berhasil diubah menjadi Pengemudi';
  exception when others then
    if sqlerrm not like '%orang tua/wali%' then raise; end if;
  end;
end $$;

-- Company account linking is disabled for authenticated users.
do $$
begin
  if has_function_privilege('authenticated', 'public.link_operator_account(uuid,text)', 'EXECUTE') then
    raise exception 'Fungsi link_operator_account masih dapat dipanggil client';
  end if;
  if has_function_privilege('authenticated', 'public.unlink_operator_account(uuid)', 'EXECUTE') then
    raise exception 'Fungsi unlink_operator_account masih dapat dipanggil client';
  end if;
  if has_function_privilege('authenticated', 'private.resolve_account_uid(text)', 'EXECUTE') then
    raise exception 'Resolver email internal masih dapat dipanggil client';
  end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub', '', false);

-- Verify only one profile has global authority.
do $$
declare n int;
begin
  select count(*) into n from public.profiles where role in ('admin', 'operator');
  if n <> 1 then raise exception 'Jumlah identitas global bukan satu: %', n; end if;
end $$;
