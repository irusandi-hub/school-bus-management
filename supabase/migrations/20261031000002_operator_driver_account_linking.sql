-- ---------------------------------------------------------------------------
-- Linking an authenticated account (auth.users) to an operator or driver row.
--
-- There is no UI for creating Supabase users, so Admin Pusat first creates the
-- user in Supabase Dashboard -> Authentication -> Users, then links it here.
-- Every function is SECURITY DEFINER (owned by the migration role), refuses to
-- run for anyone but Admin Pusat, and never exposes whether an email exists to
-- anyone who is not an admin.
-- ---------------------------------------------------------------------------

create or replace function private.resolve_account_uid(p_email text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select u.id
  from auth.users u
  where lower(u.email) = lower(trim(p_email))
  limit 1;
$$;

revoke all on function private.resolve_account_uid(text) from public, anon;
grant execute on function private.resolve_account_uid(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Operator
-- ---------------------------------------------------------------------------

create or replace function public.link_operator_account(p_operator_id uuid, p_email text)
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
    raise exception 'Akses ditolak: hanya Admin Pusat yang dapat menautkan akun operator.';
  end if;

  if p_operator_id is null or trim(coalesce(p_email, '')) = '' then
    raise exception 'Isian belum lengkap: operator dan email akun wajib diisi.';
  end if;

  select name into v_name from public.operators where id = p_operator_id;
  if not found then
    raise exception 'Operator tidak ditemukan. Muat ulang halaman lalu coba lagi.';
  end if;

  v_uid := private.resolve_account_uid(p_email);
  if v_uid is null then
    raise exception 'Email belum terdaftar sebagai pengguna aplikasi. Buat pengguna terlebih dahulu pada Supabase Dashboard (Authentication - Users), lalu ulangi penautan.';
  end if;

  if exists (select 1 from public.profiles p where p.id = v_uid and p.role = 'admin') then
    raise exception 'Akun tersebut adalah Admin Pusat dan tidak dapat diubah perannya.';
  end if;

  if exists (select 1 from public.operators o where o.profile_id = v_uid and o.id <> p_operator_id) then
    raise exception 'Akun tersebut sudah tertaut ke operator lain. Lepas tautannya terlebih dahulu.';
  end if;

  if exists (select 1 from public.drivers d where d.profile_id = v_uid) then
    raise exception 'Akun tersebut sudah tertaut ke pengemudi. Lepas tautan pengemudi terlebih dahulu.';
  end if;

  if exists (
    select 1 from public.guardians g
    where g.profile_id = v_uid and g.active
  ) then
    raise exception 'Akun tersebut adalah akun orang tua/wali yang aktif dan tidak dapat diubah perannya.';
  end if;

  insert into public.profiles (id, full_name, role)
  select v_uid, v_name, 'operator'
  where not exists (select 1 from public.profiles p where p.id = v_uid);

  update public.profiles
    set role = 'operator', updated_at = now()
    where id = v_uid;

  update public.operators set profile_id = v_uid where id = p_operator_id;

  return 'Akun berhasil ditautkan ke operator ' || v_name || '.';
end;
$$;

create or replace function public.unlink_operator_account(p_operator_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
begin
  if not private.is_admin() then
    raise exception 'Akses ditolak: hanya Admin Pusat yang dapat melepas tautan akun operator.';
  end if;

  if p_operator_id is null then
    raise exception 'Operator belum dipilih.';
  end if;

  select name into v_name from public.operators where id = p_operator_id;
  if not found then
    raise exception 'Operator tidak ditemukan. Muat ulang halaman lalu coba lagi.';
  end if;

  update public.operators set profile_id = null where id = p_operator_id;

  return 'Tautan akun operator ' || v_name || ' dilepas. Akun tersebut tidak lagi masuk area Operator.';
end;
$$;

-- ---------------------------------------------------------------------------
-- Driver
-- ---------------------------------------------------------------------------

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
    raise exception 'Akses ditolak: hanya Admin Pusat yang dapat menautkan akun pengemudi.';
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
    raise exception 'Email belum terdaftar sebagai pengguna aplikasi. Buat pengguna terlebih dahulu pada Supabase Dashboard (Authentication - Users), lalu ulangi penautan.';
  end if;

  if exists (select 1 from public.profiles p where p.id = v_uid and p.role = 'admin') then
    raise exception 'Akun tersebut adalah Admin Pusat dan tidak dapat diubah perannya.';
  end if;

  if exists (select 1 from public.drivers d where d.profile_id = v_uid and d.id <> p_driver_id) then
    raise exception 'Akun tersebut sudah tertaut ke pengemudi lain. Lepas tautannya terlebih dahulu.';
  end if;

  if exists (select 1 from public.operators o where o.profile_id = v_uid) then
    raise exception 'Akun tersebut sudah tertaut ke operator. Lepas tautan operator terlebih dahulu.';
  end if;

  if exists (
    select 1 from public.guardians g
    where g.profile_id = v_uid and g.active
  ) then
    raise exception 'Akun tersebut adalah akun orang tua/wali yang aktif dan tidak dapat diubah perannya.';
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

create or replace function public.unlink_driver_account(p_driver_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
begin
  if not private.is_admin() then
    raise exception 'Akses ditolak: hanya Admin Pusat yang dapat melepas tautan akun pengemudi.';
  end if;

  if p_driver_id is null then
    raise exception 'Pengemudi belum dipilih.';
  end if;

  select full_name into v_name from public.drivers where id = p_driver_id;
  if not found then
    raise exception 'Pengemudi tidak ditemukan. Muat ulang halaman lalu coba lagi.';
  end if;

  update public.drivers set profile_id = null where id = p_driver_id;

  return 'Tautan akun pengemudi ' || v_name || ' dilepas. Akun tersebut tidak lagi masuk area Pengemudi.';
end;
$$;

-- ---------------------------------------------------------------------------
-- Read back which account is linked (admin only; returns nothing otherwise).
-- ---------------------------------------------------------------------------

create or replace function public.linked_account_emails(p_profile_ids uuid[])
returns table (profile_id uuid, email text)
language sql
stable
security definer
set search_path = ''
as $$
  select u.id, lower(u.email)
  from auth.users u
  where private.is_admin()
    and u.id = any (p_profile_ids);
$$;

-- ---------------------------------------------------------------------------
-- Grants: authenticated may call, but each function re-checks Admin Pusat.
-- ---------------------------------------------------------------------------

revoke all on function public.link_operator_account(uuid, text) from public, anon;
revoke all on function public.unlink_operator_account(uuid) from public, anon;
revoke all on function public.link_driver_account(uuid, text) from public, anon;
revoke all on function public.unlink_driver_account(uuid) from public, anon;
revoke all on function public.linked_account_emails(uuid[]) from public, anon;

grant execute on function public.link_operator_account(uuid, text) to authenticated;
grant execute on function public.unlink_operator_account(uuid) to authenticated;
grant execute on function public.link_driver_account(uuid, text) to authenticated;
grant execute on function public.unlink_driver_account(uuid) to authenticated;
grant execute on function public.linked_account_emails(uuid[]) to authenticated;
