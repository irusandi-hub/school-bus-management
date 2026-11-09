-- Unified Operator global authority.
--
-- This migration changes authorization only. It does not alter or delete user,
-- school, operator, student, guardian, bus, driver, route, trip, or audit data.
-- Apply only after review and explicit production-database approval.
--
-- Legacy profiles.role='admin' remain accepted during account transition.
-- Both legacy admin and operator profiles receive the same global Operator access.
-- Driver and parent policies remain unchanged.

-- Keep exactly one Operator account. If there is exactly one legacy Admin account,
-- promote it in place. If the existing data is ambiguous, stop the migration rather
-- than silently choosing an account or granting global access to multiple users.
do $
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
$;

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
