-- Admin Pusat core data module.
--
-- Scope: schools, operators, guardians, students (incl. service status history),
-- buses and drivers, plus audit log and least-privilege RLS.
--
-- Safety notes:
-- - This migration is written to be reviewed before being applied. It is NOT applied
--   to any hosted database by the repository.
-- - No table is dropped and no history table is deletable: deactivation replaces
--   deletion throughout the module.
-- - Legacy free-text school names and legacy guardian links are backfilled (never
--   silently discarded) before the superseded columns/relations stop being used.
-- - Existing permissive table grants from the initial schema are replaced with
--   explicit grants; every table below keeps RLS enabled and defaults to deny.

create schema if not exists private;

revoke all on schema private from anon;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------------
-- Shared timestamp maintenance
-- ---------------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon;
-- Trigger functions are never callable directly (they raise when there is no trigger
-- context), but the role causing the trigger still needs EXECUTE on them.
grant execute on function private.set_updated_at() to authenticated;

-- ---------------------------------------------------------------------------
-- Authorization helpers (security definer: they must not be recursed through RLS)
-- ---------------------------------------------------------------------------
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- private.current_guardian_id() is defined below, after the guardians table it
-- references exists, so that a fresh database can apply this file in order.

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Audit trail
-- ---------------------------------------------------------------------------
create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  summary text not null,
  created_at timestamptz not null default now()
);

create index audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);

comment on table public.audit_logs is 'Append-only administrative audit trail. No update/delete grants are issued.';

-- Audit rows are written by triggers, not by the client, so a UI change cannot skip them.
-- Only the entity, operation and actor are stored; no field values (and therefore no
-- personal data) are copied into the audit summary.
create or replace function private.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entity_id uuid;
  v_summary text;
begin
  if tg_op = 'DELETE' then
    v_entity_id := old.id;
  else
    v_entity_id := new.id;
  end if;

  v_summary := case tg_op
    when 'INSERT' then 'Data ' || tg_table_name || ' ditambahkan.'
    when 'UPDATE' then 'Data ' || tg_table_name || ' diperbarui.'
    else 'Data ' || tg_table_name || ' dihapus.'
  end;

  insert into public.audit_logs (actor_profile_id, action, entity_type, entity_id, summary)
  values (auth.uid(), tg_table_name || '.' || lower(tg_op), tg_table_name, v_entity_id, v_summary);

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function private.audit_row_change() from public, anon;
grant execute on function private.audit_row_change() to authenticated;

-- ---------------------------------------------------------------------------
-- Operators and schools
-- ---------------------------------------------------------------------------
create table public.operators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  city text,
  contact_name text,
  contact_email text,
  contact_phone text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint operators_name_not_blank check (length(btrim(name)) between 2 and 120),
  constraint operators_code_format check (code ~ '^[A-Z0-9][A-Z0-9-]{1,19}$')
);

create trigger operators_set_updated_at
  before update on public.operators
  for each row execute function private.set_updated_at();

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  city text not null default 'Dammam',
  address text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  contact_name text,
  contact_email text,
  contact_phone text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schools_name_not_blank check (length(btrim(name)) between 2 and 120),
  constraint schools_code_format check (code ~ '^[A-Z0-9][A-Z0-9-]{1,19}$'),
  constraint schools_coordinates_complete check ((latitude is null) = (longitude is null))
);

create index schools_name_idx on public.schools (lower(name));
create index schools_active_idx on public.schools (active);

create trigger schools_set_updated_at
  before update on public.schools
  for each row execute function private.set_updated_at();

comment on column public.schools.latitude is 'School location, used later for routing. Not home coordinates.';

-- ---------------------------------------------------------------------------
-- Guardians (pre-registered by Admin Pusat; profile_id is set only after the
-- guardian verifies the registered email and claims the account)
-- ---------------------------------------------------------------------------
create table public.guardians (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  email text not null,
  full_name text not null,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guardians_email_format check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint guardians_email_lowercase check (email = lower(email)),
  constraint guardians_full_name_not_blank check (length(btrim(full_name)) between 2 and 120)
);

create unique index guardians_email_unique_idx on public.guardians (email);
create index guardians_active_idx on public.guardians (active);

create trigger guardians_set_updated_at
  before update on public.guardians
  for each row execute function private.set_updated_at();

comment on column public.guardians.profile_id is 'Linked auth profile. Only claim_guardian_account() may set this value.';

-- ---------------------------------------------------------------------------
-- Students
-- ---------------------------------------------------------------------------
alter table public.students rename column student_code to admissions_number;
alter table public.students rename constraint students_student_code_key to students_admissions_number_key;

alter table public.students
  add column school_id uuid references public.schools(id) on delete restrict,
  add column guardian_id uuid references public.guardians(id) on delete restrict,
  add column date_of_birth date,
  add column home_address text,
  add column home_latitude double precision check (home_latitude between -90 and 90),
  add column home_longitude double precision check (home_longitude between -180 and 180),
  add column pickup_notes text,
  add column service_status text not null default 'active',
  add column service_status_changed_at timestamptz not null default now(),
  add column updated_at timestamptz not null default now();

alter table public.students
  add constraint students_service_status_check check (service_status in ('active', 'paused', 'ended')),
  add constraint students_home_coordinates_complete check ((home_latitude is null) = (home_longitude is null));

-- Format constraints on pre-existing data are added NOT VALID so the migration cannot
-- fail on legacy rows that were never validated. They still apply to every new write;
-- run `alter table public.students validate constraint ...` after reviewing legacy data.
alter table public.students
  add constraint students_admissions_number_format
    check (admissions_number ~ '^[A-Za-z0-9/-]{2,32}$') not valid,
  add constraint students_full_name_not_blank
    check (length(btrim(full_name)) between 2 and 120) not valid;

-- Preserve legacy status and school data before the superseded columns are removed.
update public.students
set service_status = case when active then 'active' else 'ended' end;

with legacy_schools as (
  select distinct btrim(school_name) as name
  from public.students
  where school_name is not null and btrim(school_name) <> ''
)
insert into public.schools (name, code, city)
select
  ls.name,
  'LEGACY-' || upper(substr(md5(ls.name), 1, 8)),
  'Dammam'
from legacy_schools ls
on conflict (code) do nothing;

update public.students s
set school_id = sc.id
from public.schools sc
where s.school_id is null
  and s.school_name is not null
  and sc.code = 'LEGACY-' || upper(substr(md5(btrim(s.school_name)), 1, 8));

alter table public.students drop column active;
alter table public.students drop column school_name;

-- Legacy guardian links are converted into the single-guardian model. Where the
-- legacy table allowed multiple guardians for one student, the oldest link wins so
-- the outcome is deterministic; the legacy table itself is retained for history.
insert into public.guardians (profile_id, email, full_name, phone)
select
  p.id,
  lower(u.email),
  coalesce(nullif(btrim(p.full_name), ''), split_part(u.email, '@', 1)),
  nullif(btrim(p.phone), '')
from public.profiles p
join auth.users u on u.id = p.id
where p.role = 'parent'
  and u.email is not null
on conflict (email) do nothing;

update public.students s
set guardian_id = pick.guardian_id
from (
  select distinct on (gs.student_id) gs.student_id, g.id as guardian_id
  from public.guardian_students gs
  join public.guardians g on g.profile_id = gs.guardian_profile_id
  order by gs.student_id, g.created_at
) pick
where s.id = pick.student_id
  and s.guardian_id is null;

comment on table public.guardian_students is
  'Legacy link table from the initial schema. Superseded by students.guardian_id; retained for history and denied by default.';

create index students_school_idx on public.students (school_id);
create index students_guardian_idx on public.students (guardian_id);

-- Defined here (not above) because it reads students.guardian_id, which is added
-- on the line above; a fresh database applies this file strictly in order.
create or replace function private.current_guardian_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select g.id
  from public.guardians g
  where g.profile_id = auth.uid()
    and g.active
    and exists (
      select 1
      from public.students s
      where s.guardian_id = g.id
        and s.service_status = 'active'
    )
  limit 1;
$$;

revoke all on function private.current_guardian_id() from public, anon;
grant execute on function private.current_guardian_id() to authenticated;
create index students_service_status_idx on public.students (service_status);
create index students_name_idx on public.students (lower(full_name));

-- ---------------------------------------------------------------------------
-- Student service status history (append-only)
-- ---------------------------------------------------------------------------
create table public.student_service_status_history (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.students(id) on delete restrict,
  previous_status text,
  new_status text not null check (new_status in ('active', 'paused', 'ended')),
  reason text not null,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now(),
  constraint student_status_history_reason_not_blank check (length(btrim(reason)) >= 5)
);

create index student_service_status_history_student_idx
  on public.student_service_status_history (student_id, changed_at desc);

comment on table public.student_service_status_history is
  'Append-only history of service status changes. Rows are never updated or deleted.';

-- The initial service status of a newly created student is recorded too, so the
-- history has no unexplained gaps.
create or replace function private.log_initial_service_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.student_service_status_history
    (student_id, previous_status, new_status, reason, changed_by)
  values
    (new.id, null, new.service_status, 'Status layanan awal saat data siswa dibuat.', auth.uid());
  return new;
end;
$$;

revoke all on function private.log_initial_service_status() from public, anon;
grant execute on function private.log_initial_service_status() to authenticated;

create trigger students_log_initial_service_status
  after insert on public.students
  for each row execute function private.log_initial_service_status();

-- Status changes must go through this function so history and audit rows are always written.
create or replace function public.set_student_service_status(
  p_student_id uuid,
  p_status text,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_previous text;
begin
  if v_actor is null or not private.is_admin() then
    raise exception 'Akses ditolak untuk mengubah status layanan siswa.'
      using errcode = '42501';
  end if;

  if p_status is null or p_status not in ('active', 'paused', 'ended') then
    raise exception 'Status layanan tidak dikenali.'
      using errcode = '22023';
  end if;

  if p_reason is null or length(btrim(p_reason)) < 5 then
    raise exception 'Alasan perubahan status wajib diisi minimal 5 karakter.'
      using errcode = '22023';
  end if;

  select s.service_status into v_previous
  from public.students s
  where s.id = p_student_id
  for update;

  if v_previous is null then
    raise exception 'Data siswa tidak ditemukan.'
      using errcode = 'P0002';
  end if;

  if v_previous = p_status then
    raise exception 'Status layanan siswa sudah bernilai tersebut.'
      using errcode = '22023';
  end if;

  update public.students
  set service_status = p_status,
      service_status_changed_at = now()
  where id = p_student_id;

  insert into public.student_service_status_history
    (student_id, previous_status, new_status, reason, changed_by)
  values
    (p_student_id, v_previous, p_status, btrim(p_reason), v_actor);

  insert into public.audit_logs (actor_profile_id, action, entity_type, entity_id, summary)
  values (v_actor, 'student.service_status_changed', 'student', p_student_id,
          'Status layanan siswa: ' || v_previous || ' menjadi ' || p_status);
end;
$$;

revoke all on function public.set_student_service_status(uuid, text, text) from public, anon;
grant execute on function public.set_student_service_status(uuid, text, text) to authenticated;

create trigger students_set_updated_at
  before update on public.students
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Guardian account claim
--
-- A guardian can only become an application user when all of the following hold:
--   * the email is verified in Supabase Auth;
--   * the email was pre-registered by Admin Pusat and is still active;
--   * the guardian is linked to at least one student with an active service status;
--   * the account is not already linked to a different auth user;
--   * the resulting profile role is 'parent' (never chosen by the client).
-- Admin rights are never granted by this function.
-- ---------------------------------------------------------------------------
create or replace function public.claim_guardian_account()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_confirmed timestamptz;
  v_guardian public.guardians%rowtype;
  v_active_students integer;
begin
  if v_uid is null then
    return 'unauthenticated';
  end if;

  select u.email, u.email_confirmed_at
    into v_email, v_confirmed
  from auth.users u
  where u.id = v_uid;

  if v_email is null or v_confirmed is null then
    return 'email_unverified';
  end if;

  select * into v_guardian
  from public.guardians g
  where g.email = lower(v_email)
  for update;

  if not found or not v_guardian.active then
    return 'not_registered';
  end if;

  if v_guardian.profile_id is not null and v_guardian.profile_id <> v_uid then
    return 'already_linked';
  end if;

  select count(*) into v_active_students
  from public.students s
  where s.guardian_id = v_guardian.id
    and s.service_status = 'active';

  if v_active_students = 0 then
    return 'no_active_service';
  end if;

  insert into public.profiles (id, full_name, role, phone)
  values (v_uid, v_guardian.full_name, 'parent', v_guardian.phone)
  on conflict (id) do nothing;

  if not exists (
    select 1 from public.profiles p where p.id = v_uid and p.role = 'parent'
  ) then
    return 'role_conflict';
  end if;

  update public.guardians
  set profile_id = v_uid
  where id = v_guardian.id;

  insert into public.audit_logs (actor_profile_id, action, entity_type, entity_id, summary)
  values (v_uid, 'guardian.account_claimed', 'guardian', v_guardian.id,
          'Akun wali terhubung setelah verifikasi email.');

  return 'linked';
end;
$$;

revoke all on function public.claim_guardian_account() from public, anon;
grant execute on function public.claim_guardian_account() to authenticated;

-- ---------------------------------------------------------------------------
-- Buses and drivers
-- ---------------------------------------------------------------------------
alter table public.buses
  add column operator_id uuid references public.operators(id) on delete set null,
  add column model text,
  add column notes text,
  add column updated_at timestamptz not null default now();

alter table public.buses
  add constraint buses_fleet_code_not_blank
    check (length(btrim(fleet_code)) between 2 and 32) not valid;

create index buses_operator_idx on public.buses (operator_id);

create trigger buses_set_updated_at
  before update on public.buses
  for each row execute function private.set_updated_at();

alter table public.drivers
  add column full_name text,
  add column phone text,
  add column operator_id uuid references public.operators(id) on delete set null,
  add column updated_at timestamptz not null default now(),
  alter column profile_id drop not null;

update public.drivers d
set full_name = nullif(btrim(p.full_name), '')
from public.profiles p
where p.id = d.profile_id
  and d.full_name is null;

update public.drivers
set full_name = 'Pengemudi'
where full_name is null;

alter table public.drivers
  alter column full_name set not null,
  add constraint drivers_full_name_not_blank
    check (length(btrim(full_name)) between 2 and 120) not valid,
  add constraint drivers_license_number_format
    check (license_number is null or length(btrim(license_number)) between 3 and 40) not valid;

create index drivers_operator_idx on public.drivers (operator_id);

create trigger drivers_set_updated_at
  before update on public.drivers
  for each row execute function private.set_updated_at();

-- Supporting indexes for foreign keys flagged as unindexed in the earlier audit.
create index if not exists guardian_students_student_idx on public.guardian_students (student_id);
create index if not exists trip_assignments_bus_idx on public.trip_assignments (bus_id);
create index if not exists trip_assignments_assigned_by_idx on public.trip_assignments (assigned_by);
create index if not exists trip_student_events_student_idx on public.trip_student_events (student_id);
create index if not exists trip_student_events_recorded_by_idx on public.trip_student_events (recorded_by);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.audit_logs enable row level security;
alter table public.operators enable row level security;
alter table public.schools enable row level security;
alter table public.guardians enable row level security;
alter table public.student_service_status_history enable row level security;

-- Profiles: a user may read their own row; admins may read all. Nobody can change
-- their own role through the API (no update policy is issued at all).
create policy profiles_select_self on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy profiles_select_admin on public.profiles
  for select to authenticated
  using (private.is_admin());

-- Admins manage master data.
create policy operators_select_admin on public.operators
  for select to authenticated using (private.is_admin());
create policy operators_insert_admin on public.operators
  for insert to authenticated with check (private.is_admin());
create policy operators_update_admin on public.operators
  for update to authenticated using (private.is_admin()) with check (private.is_admin());

create policy schools_select_admin on public.schools
  for select to authenticated using (private.is_admin());
create policy schools_insert_admin on public.schools
  for insert to authenticated with check (private.is_admin());
create policy schools_update_admin on public.schools
  for update to authenticated using (private.is_admin()) with check (private.is_admin());

create policy buses_select_admin on public.buses
  for select to authenticated using (private.is_admin());
create policy buses_insert_admin on public.buses
  for insert to authenticated with check (private.is_admin());
create policy buses_update_admin on public.buses
  for update to authenticated using (private.is_admin()) with check (private.is_admin());

create policy drivers_select_admin on public.drivers
  for select to authenticated using (private.is_admin());
create policy drivers_insert_admin on public.drivers
  for insert to authenticated with check (private.is_admin());
create policy drivers_update_admin on public.drivers
  for update to authenticated using (private.is_admin()) with check (private.is_admin());

-- Guardians: admins manage pre-registration; a guardian may read only their own row.
create policy guardians_select_admin on public.guardians
  for select to authenticated using (private.is_admin());
create policy guardians_select_self on public.guardians
  for select to authenticated using (profile_id = auth.uid());
create policy guardians_insert_admin on public.guardians
  for insert to authenticated with check (private.is_admin());
create policy guardians_update_admin on public.guardians
  for update to authenticated using (private.is_admin()) with check (private.is_admin());

-- Students: admins manage all rows. A guardian sees only their own linked students
-- that still have an active service status, and never another guardian's student.
create policy students_select_admin on public.students
  for select to authenticated using (private.is_admin());
create policy students_select_guardian on public.students
  for select to authenticated
  using (guardian_id = private.current_guardian_id() and service_status = 'active');
create policy students_insert_admin on public.students
  for insert to authenticated with check (private.is_admin());
create policy students_update_admin on public.students
  for update to authenticated using (private.is_admin()) with check (private.is_admin());

create policy student_status_history_select_admin on public.student_service_status_history
  for select to authenticated using (private.is_admin());
create policy student_status_history_select_guardian on public.student_service_status_history
  for select to authenticated
  using (
    exists (
      select 1
      from public.students s
      where s.id = student_id
        and s.guardian_id = private.current_guardian_id()
        and s.service_status = 'active'
    )
  );

create policy audit_logs_select_admin on public.audit_logs
  for select to authenticated using (private.is_admin());

-- ---------------------------------------------------------------------------
-- Grants: replace the broad initial-schema grants with explicit, least-privilege grants.
-- No DELETE grant is issued anywhere: records are deactivated, never erased.
-- ---------------------------------------------------------------------------
revoke all on public.audit_logs, public.operators, public.schools, public.guardians,
  public.student_service_status_history, public.students, public.buses, public.drivers,
  public.profiles, public.guardian_students
from anon;

revoke all on public.audit_logs, public.operators, public.schools, public.guardians,
  public.student_service_status_history, public.students, public.buses, public.drivers,
  public.profiles, public.guardian_students
from authenticated;

grant select, insert, update on public.operators, public.schools, public.buses, public.drivers
  to authenticated;

-- Guardians: admins may pre-register and edit contact data, but cannot attach an
-- auth profile directly. profile_id is written only by claim_guardian_account().
grant select on public.guardians to authenticated;
grant insert (email, full_name, phone, active) on public.guardians to authenticated;
grant update (email, full_name, phone, active) on public.guardians to authenticated;

grant select on public.audit_logs, public.student_service_status_history, public.profiles
  to authenticated;

-- Automatic audit triggers for every admin-managed table.
create trigger operators_audit
  after insert or update on public.operators
  for each row execute function private.audit_row_change();
create trigger schools_audit
  after insert or update on public.schools
  for each row execute function private.audit_row_change();
create trigger guardians_audit
  after insert or update on public.guardians
  for each row execute function private.audit_row_change();
create trigger students_audit
  after insert or update on public.students
  for each row execute function private.audit_row_change();
create trigger buses_audit
  after insert or update on public.buses
  for each row execute function private.audit_row_change();
create trigger drivers_audit
  after insert or update on public.drivers
  for each row execute function private.audit_row_change();

-- Students: service_status can only be changed through set_student_service_status(),
-- which writes the history and audit rows in the same transaction.
grant select, insert on public.students to authenticated;
grant update (admissions_number, full_name, date_of_birth, school_id, guardian_id,
              home_address, home_latitude, home_longitude, pickup_notes)
  on public.students to authenticated;
