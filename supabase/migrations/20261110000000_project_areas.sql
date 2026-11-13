-- Project Area replaces the legacy transport-company entity.
--
-- A Project Area is operational data (for example Dammam, Riyadh, Madinah). It is
-- not an account, a role, or an authority boundary. The single global Operator
-- keeps platform-wide access; area selection in the dashboard only narrows the
-- working context and every write is checked against the same area.
--
-- This migration preserves existing rows:
--   * public.operators is renamed (data kept), profile_id becomes legacy_profile_id;
--   * operator_id columns on schools, buses and drivers are renamed;
--   * routes gain school_id and project_area_id, backfilled from school_name.
--
-- It is prepared for review and is NOT applied to any hosted database by this
-- repository. No row is deleted. Apply only after explicit approval.

do $project_area_preflight$
begin
  if to_regclass('public.operators') is null then
    raise exception 'Prasyarat migrasi Project Area belum lengkap: tabel operators tidak ditemukan.';
  end if;
  if to_regclass('public.project_areas') is not null then
    raise exception 'Migrasi Project Area sudah pernah diterapkan.';
  end if;
end;
$project_area_preflight$;

-- ---------------------------------------------------------------------------
-- Rename the legacy entity and its foreign keys. Rows, indexes and constraints
-- follow the rename automatically.
-- ---------------------------------------------------------------------------
alter table public.operators rename to project_areas;
alter table public.project_areas rename column profile_id to legacy_profile_id;

comment on table public.project_areas is
  'Operational Project Area (for example Dammam, Riyadh, Madinah). Not a company account, role or authority boundary.';
comment on column public.project_areas.legacy_profile_id is
  'Historical account link retained for reference only. A link never grants access to an area.';

alter table public.schools rename column operator_id to project_area_id;
alter table public.buses rename column operator_id to project_area_id;
alter table public.drivers rename column operator_id to project_area_id;

alter index if exists public.schools_operator_idx rename to schools_project_area_idx;
alter index if exists public.buses_operator_idx rename to buses_project_area_idx;
alter index if exists public.drivers_operator_idx rename to drivers_project_area_idx;

-- Routes must belong to one school and one area. school_name is retained for
-- display and for older reports, but school_id becomes the authority.
alter table public.routes
  add column school_id uuid references public.schools(id) on delete restrict,
  add column project_area_id uuid references public.project_areas(id) on delete restrict;

update public.routes r
set school_id = s.id
from public.schools s
where r.school_id is null
  and s.name = r.school_name;

update public.routes r
set project_area_id = s.project_area_id
from public.schools s
where r.project_area_id is null
  and s.id = r.school_id;

create index routes_school_idx on public.routes (school_id);
create index routes_project_area_idx on public.routes (project_area_id);

-- New or edited routes must resolve to a real school inside the chosen area.
create or replace function private.validate_route_project_area()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_school_name text;
  v_school_area uuid;
begin
  if new.school_id is null or new.project_area_id is null then
    raise exception 'Pilih sekolah dan Project Area untuk rute ini.' using errcode = '23514';
  end if;

  select s.name, s.project_area_id
    into v_school_name, v_school_area
  from public.schools s
  where s.id = new.school_id;

  if v_school_name is null then
    raise exception 'Sekolah rute tidak ditemukan.' using errcode = '23503';
  end if;

  if v_school_area is null or v_school_area <> new.project_area_id then
    raise exception 'Sekolah rute tidak berada pada Project Area yang dipilih.' using errcode = '23514';
  end if;

  -- Keep the legacy display column consistent with the authoritative school.
  new.school_name := v_school_name;
  return new;
end;
$$;

revoke all on function private.validate_route_project_area() from public, anon;
grant execute on function private.validate_route_project_area() to authenticated;

create trigger routes_validate_project_area
  before insert or update on public.routes
  for each row execute function private.validate_route_project_area();

-- An assignment may only combine a route, bus and driver from the same area.
create or replace function private.validate_assignment_project_area()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_route_area uuid;
  v_bus_area uuid;
  v_driver_area uuid;
begin
  select r.project_area_id into v_route_area from public.routes r where r.id = new.route_id;
  select b.project_area_id into v_bus_area from public.buses b where b.id = new.bus_id;
  select d.project_area_id into v_driver_area from public.drivers d where d.id = new.driver_id;

  if v_route_area is null or v_bus_area is null or v_driver_area is null then
    raise exception 'Rute, bus, dan pengemudi harus memiliki Project Area sebelum ditugaskan.' using errcode = '23514';
  end if;

  if v_route_area <> v_bus_area or v_route_area <> v_driver_area then
    raise exception 'Rute, bus, dan pengemudi berasal dari Project Area berbeda.' using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_assignment_project_area() from public, anon;
grant execute on function private.validate_assignment_project_area() to authenticated;

create trigger trip_assignments_validate_project_area
  before insert or update on public.trip_assignments
  for each row execute function private.validate_assignment_project_area();

-- A student may only be placed on a route that serves the student's own area.
create or replace function private.validate_student_route_stop_project_area()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_area uuid;
  v_route_area uuid;
begin
  select sc.project_area_id into v_student_area
  from public.students st
  join public.schools sc on sc.id = st.school_id
  where st.id = new.student_id;

  select r.project_area_id into v_route_area from public.routes r where r.id = new.route_id;

  if v_student_area is null or v_route_area is null or v_student_area <> v_route_area then
    raise exception 'Siswa dan rute berasal dari Project Area berbeda.' using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_student_route_stop_project_area() from public, anon;
grant execute on function private.validate_student_route_stop_project_area() to authenticated;

create trigger student_route_stops_validate_project_area
  before insert or update on public.student_route_stops
  for each row execute function private.validate_student_route_stop_project_area();

-- Moving a student to a school in another area must not leave an active roster
-- placement behind in the old area.
create or replace function private.validate_student_school_project_area()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_new_area uuid;
begin
  if new.school_id is null then
    return new;
  end if;

  select sc.project_area_id into v_new_area from public.schools sc where sc.id = new.school_id;
  if v_new_area is null then
    return new;
  end if;

  if exists (
    select 1
    from public.student_route_stops srs
    join public.routes r on r.id = srs.route_id
    where srs.student_id = new.id
      and srs.active
      and r.project_area_id is distinct from v_new_area
  ) then
    raise exception 'Siswa masih memiliki penempatan rute aktif di Project Area lain. Lepaskan penempatan lama terlebih dahulu.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_student_school_project_area() from public, anon;
grant execute on function private.validate_student_school_project_area() to authenticated;

create trigger students_validate_school_project_area
  before update of school_id on public.students
  for each row execute function private.validate_student_school_project_area();

-- ---------------------------------------------------------------------------
-- Authorization: areas are data. Global Operator authority comes from
-- private.is_admin(); the old area/company-scoped policies are removed.
-- ---------------------------------------------------------------------------
drop policy if exists operators_select_self on public.project_areas;
drop policy if exists operators_select_admin on public.project_areas;
drop policy if exists operators_insert_admin on public.project_areas;
drop policy if exists operators_update_admin on public.project_areas;

create policy project_areas_select_operator on public.project_areas
  for select to authenticated using (private.is_admin());
create policy project_areas_insert_operator on public.project_areas
  for insert to authenticated with check (private.is_admin());
create policy project_areas_update_operator on public.project_areas
  for update to authenticated using (private.is_admin()) with check (private.is_admin());

drop policy if exists schools_select_operator on public.schools;
drop policy if exists students_select_operator on public.students;
drop policy if exists guardians_select_operator on public.guardians;

drop policy if exists buses_select_operator on public.buses;
drop policy if exists buses_insert_operator on public.buses;
drop policy if exists buses_update_operator on public.buses;

drop policy if exists drivers_select_operator on public.drivers;
drop policy if exists drivers_insert_operator on public.drivers;
drop policy if exists drivers_update_operator on public.drivers;

drop policy if exists routes_select_operator on public.routes;
drop policy if exists route_stops_select_operator on public.route_stops;
drop policy if exists student_route_stops_operator on public.student_route_stops;
drop policy if exists trip_assignments_select_operator on public.trip_assignments;
drop policy if exists trip_assignments_insert_operator on public.trip_assignments;
drop policy if exists trips_select_operator on public.trips;
drop policy if exists trip_student_events_select_operator on public.trip_student_events;

drop function if exists private.operator_school_ids();
drop function if exists private.operator_student_ids();
drop function if exists private.operator_route_ids();
drop function if exists private.operator_bus_ids();
drop function if exists private.operator_driver_ids();
drop function if exists private.operator_guardian_ids();
drop function if exists private.current_operator_id();

-- Company/account linking no longer exists. Area records are not login identities.
drop function if exists public.link_operator_account(uuid, text);
drop function if exists public.unlink_operator_account(uuid);

-- Driver linking remains, without the removed company-link check.
create or replace function public.link_driver_account(p_driver_id uuid, p_email text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid;
  v_name text;
begin
  if not private.is_admin() then
    raise exception 'Akses ditolak: hanya Operator Utama yang dapat menautkan akun pengemudi.'
      using errcode = '42501';
  end if;

  if p_driver_id is null or trim(coalesce(p_email, '')) = '' then
    raise exception 'Isian belum lengkap: pengemudi dan email akun wajib diisi.'
      using errcode = '22023';
  end if;

  select full_name into v_name from public.drivers where id = p_driver_id;
  if not found then
    raise exception 'Pengemudi tidak ditemukan. Muat ulang halaman lalu coba lagi.'
      using errcode = 'P0002';
  end if;

  v_uid := private.resolve_account_uid(p_email);
  if v_uid is null then
    raise exception 'Email belum terdaftar sebagai pengguna aplikasi. Buat pengguna terlebih dahulu, lalu ulangi penautan.'
      using errcode = 'P0002';
  end if;

  if exists (select 1 from public.profiles p where p.id = v_uid and p.role in ('admin', 'operator')) then
    raise exception 'Akun Operator Utama tidak dapat diubah menjadi akun Pengemudi.' using errcode = '42501';
  end if;

  if exists (select 1 from public.drivers d where d.profile_id = v_uid and d.id <> p_driver_id) then
    raise exception 'Akun tersebut sudah tertaut ke pengemudi lain. Lepas tautannya terlebih dahulu.'
      using errcode = '23505';
  end if;

  if exists (select 1 from public.profiles p where p.id = v_uid and p.role = 'parent')
     or exists (select 1 from public.guardians g where g.profile_id = v_uid) then
    raise exception 'Akun tersebut adalah akun orang tua/wali dan tidak dapat diubah menjadi akun Pengemudi.'
      using errcode = '42501';
  end if;

  insert into public.profiles (id, full_name, role)
  select v_uid, v_name, 'driver'
  where not exists (select 1 from public.profiles p where p.id = v_uid);

  update public.profiles
    set role = 'driver', updated_at = now()
    where id = v_uid;

  update public.drivers set profile_id = v_uid where id = p_driver_id;

  return 'Akun berhasil ditautkan ke pengemudi ' || v_name || '.';
end;
$$;

revoke all on function public.link_driver_account(uuid, text) from public, anon;
grant execute on function public.link_driver_account(uuid, text) to authenticated;

comment on function private.is_admin() is
  'Global Operator authority for legacy admin and current operator profiles. Project Area membership is not authorization.';
