-- Unified Operator global authority.
--
-- This migration changes authorization only. It does not alter or delete user,
-- school, operator, student, guardian, bus, driver, route, trip, or audit data.
-- Apply only after review and explicit production-database approval.
--
-- Legacy profiles.role='admin' remain accepted during account transition.
-- Both legacy admin and operator profiles receive the same global Operator access.
-- Driver and parent policies remain unchanged.

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
