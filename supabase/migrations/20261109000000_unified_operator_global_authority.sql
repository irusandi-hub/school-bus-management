-- Unified Operator global authority.
--
-- This migration changes authorization only. It does not alter or delete user,
-- school, operator, student, guardian, bus, driver, route, trip, or audit data.
-- Apply only after review and explicit production-database approval.
--
-- Legacy profiles.role='admin' remain accepted during account transition.
-- Both legacy admin and operator profiles receive the same global Operator access.
-- Driver and parent policies remain unchanged.

-- Fail early with an actionable message if prerequisite migrations have not run.
-- This file must follow admin_core_crud and operator_driver_account_linking.
do $operator_preflight$
begin
  if to_regnamespace('private') is null
     or to_regprocedure('private.is_admin()') is null
     or to_regprocedure('private.resolve_account_uid(text)') is null
     or to_regprocedure('public.link_operator_account(uuid,text)') is null
     or to_regprocedure('public.unlink_operator_account(uuid)') is null
     or to_regclass('public.operators') is null
     or not exists (
       select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'operators'
         and column_name = 'profile_id'
     )
     or not exists (
       select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'profiles'
         and column_name = 'updated_at'
     ) then
    raise exception 'Prasyarat migrasi belum lengkap. Jalankan migrasi admin_core_crud dan operator_driver_account_linking beserta migrasi sebelumnya secara berurutan sebelum migrasi Operator Utama.';
  end if;
end;
$operator_preflight$;

-- The initial schema only allowed admin/driver/parent. Extend the role constraint
-- before promoting a legacy Admin account or creating an Operator profile.
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'operator', 'driver', 'parent'));

-- Keep exactly one Operator account. If there is exactly one legacy Admin account,
-- promote it in place. If the existing data is ambiguous, stop the migration rather
-- than silently choosing an account or granting global access to multiple users.
do $operator_migration$
declare
  v_admin_count integer;
  v_operator_count integer;
begin
  select count(*) into v_admin_count from public.profiles where role = 'admin';
  select count(*) into v_operator_count from public.profiles where role = 'operator';

  if v_operator_count > 1 or (v_operator_count > 0 and v_admin_count > 0) then
    raise exception 'Migrasi Operator dibatalkan: ditemukan lebih dari satu akun dengan kewenangan global. Tinjau dan tentukan satu akun Operator secara manual.';
  elsif v_operator_count = 0 and v_admin_count = 1 then
    update public.profiles
      set role = 'operator', updated_at = now()
      where role = 'admin';
  elsif v_admin_count > 1 then
    raise exception 'Migrasi Operator dibatalkan: ditemukan beberapa akun Admin lama. Tentukan satu akun Operator sebelum melanjutkan.';
  end if;
end;
$operator_migration$;

create unique index if not exists profiles_single_operator_role_idx
  on public.profiles (role)
  where role = 'operator';


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
      and p.role in ('admin', 'operator')
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

comment on function private.is_admin() is
  'Compatibility authorization helper: grants global Operator authority to legacy admin and current operator profiles. Driver and parent roles are excluded.';


-- Company records are data for mapping and audit, not user workspaces.
-- Retain legacy operators.profile_id values for historical reference, but prevent
-- new Operator accounts from being created or detached through company CRUD.
revoke all on function public.link_operator_account(uuid, text) from public, anon, authenticated;
revoke all on function public.unlink_operator_account(uuid) from public, anon, authenticated;

comment on column public.operators.profile_id is
  'Legacy account link retained for historical compatibility only. Company records are data, not login identities or authorization boundaries.';


-- The account resolver is an internal SECURITY DEFINER dependency of the linking
-- functions. Callers must not be able to enumerate auth user IDs by email.
revoke all on function private.resolve_account_uid(text) from public, anon, authenticated;

-- Driver linking remains an Operator function, but it must never demote or reuse
-- the single global Operator identity as a driver account.
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
    raise exception 'Akses ditolak: hanya Operator yang dapat menautkan akun pengemudi.';
  end if;

  if p_driver_id is null or trim(coalesce(p_email, '')) = '' then
    raise exception 'Isian belum lengkap: pengemudi dan email akun wajib diisi.';
  end if;

  select full_name into v_name from public.drivers where id = p_driver_id;
  if not found then
    raise exception 'Pengemudi tidak ditemukan. Muat ulang halaman lalu coba lagi.';
  end if;

  v_uid := private.resolve_account_uid(p_email);
  if v_uid is null then
    raise exception 'Email belum terdaftar sebagai pengguna aplikasi. Buat pengguna terlebih dahulu, lalu ulangi penautan.';
  end if;

  if exists (select 1 from public.profiles p where p.id = v_uid and p.role in ('admin', 'operator')) then
    raise exception 'Akun Operator Utama tidak dapat diubah menjadi akun Pengemudi.';
  end if;

  if exists (select 1 from public.drivers d where d.profile_id = v_uid and d.id <> p_driver_id) then
    raise exception 'Akun tersebut sudah tertaut ke pengemudi lain. Lepas tautannya terlebih dahulu.';
  end if;

  if exists (select 1 from public.operators o where o.profile_id = v_uid) then
    raise exception 'Akun tersebut masih memiliki tautan perusahaan lama dan tidak dapat digunakan sebagai pengemudi.';
  end if;

  -- A parent identity must never be silently converted into a driver identity.
  -- Check both the profile role and every guardian link, including inactive legacy
  -- guardian rows, so deactivation cannot be used to bypass this role boundary.
  if exists (select 1 from public.profiles p where p.id = v_uid and p.role = 'parent')
     or exists (select 1 from public.guardians g where g.profile_id = v_uid) then
    raise exception 'Akun tersebut adalah akun orang tua/wali dan tidak dapat diubah menjadi akun Pengemudi.';
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
