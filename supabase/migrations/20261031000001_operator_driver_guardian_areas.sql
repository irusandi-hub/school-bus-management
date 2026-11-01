-- Operator, driver and guardian workspaces.
--
-- Scope of this migration:
--   * a fourth account role (`operator`) that is distinct from Admin Pusat;
--   * an explicit operator <-> auth account link and operator <-> school link;
--   * a real student roster per route stop (needed for a driver manifest and for
--     guardian trip history) instead of inventing trip/GPS data in the UI;
--   * arrival timestamp for "confirm arrival at school";
--   * row level security for operator, driver and guardian access.
--
-- It is written to be reviewed and is NOT applied to any hosted database by this
-- repository. No table, column or history is deleted.

-- ---------------------------------------------------------------------------
-- Roles and organisation membership
-- ---------------------------------------------------------------------------
alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('admin', 'operator', 'driver', 'parent'));

alter table public.operators
  add column profile_id uuid unique references public.profiles(id) on delete set null;

comment on column public.operators.profile_id is
  'Auth account linked to this operator. Linked by a platform administrator (SQL/back office), never self-assigned.';

alter table public.schools
  add column operator_id uuid references public.operators(id) on delete set null;

create index schools_operator_idx on public.schools (operator_id);

comment on column public.schools.operator_id is
  'Transport operator responsible for this school. Operators only see data for their own schools.';

alter table public.trips add column arrived_at timestamptz;

comment on column public.trips.arrived_at is
  'Set by the assigned driver when the bus reaches the school.';

-- ---------------------------------------------------------------------------
-- Student roster per route stop
--
-- The initial schema linked students to guardians but not to a route, so a driver
-- had no legitimate way to know which students to expect. This table is the
-- authoritative roster for a route direction.
-- ---------------------------------------------------------------------------
create table public.student_route_stops (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  route_id uuid not null references public.routes(id) on delete restrict,
  stop_id uuid not null references public.route_stops(id) on delete restrict,
  direction text not null check (direction in ('morning', 'afternoon')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- One active stop per student per direction; history rows can remain inactive.
create unique index student_route_stops_active_idx
  on public.student_route_stops (student_id, direction)
  where active;

create index student_route_stops_route_idx on public.student_route_stops (route_id, stop_id);
create index student_route_stops_student_idx on public.student_route_stops (student_id);

create or replace function private.validate_student_route_stop()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.route_stops rs
    where rs.id = new.stop_id
      and rs.route_id = new.route_id
  ) then
    raise exception 'Titik jemput tidak termasuk dalam rute yang dipilih.'
      using errcode = '22023';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_student_route_stop() from public, anon;
grant execute on function private.validate_student_route_stop() to authenticated;

create trigger student_route_stops_validate
  before insert or update on public.student_route_stops
  for each row execute function private.validate_student_route_stop();

-- ---------------------------------------------------------------------------
-- Authorization helpers
-- ---------------------------------------------------------------------------
create or replace function private.current_operator_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select o.id
  from public.operators o
  where o.profile_id = auth.uid()
    and o.active
  limit 1;
$$;

create or replace function private.current_driver_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select d.id
  from public.drivers d
  where d.profile_id = auth.uid()
    and d.active
  limit 1;
$$;

revoke all on function private.current_operator_id() from public, anon;
revoke all on function private.current_driver_id() from public, anon;
grant execute on function private.current_operator_id() to authenticated;
grant execute on function private.current_driver_id() to authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.student_route_stops enable row level security;

-- Operators may read their own organisation row and nothing else here.
create policy operators_select_self on public.operators
  for select to authenticated
  using (profile_id = auth.uid());

-- Schools belong to an operator for viewing purposes only; master data stays with
-- Admin Pusat.
create policy schools_select_operator on public.schools
  for select to authenticated
  using (operator_id = private.current_operator_id());

-- Guardians read the school of their own active child so the portal can show it.
create policy schools_select_guardian on public.schools
  for select to authenticated
  using (
    exists (
      select 1
      from public.students s
      join public.guardians g on g.id = s.guardian_id
      where s.school_id = schools.id
        and g.profile_id = auth.uid()
        and g.active
        and s.service_status = 'active'
    )
  );

-- Students: operator scope is the schools it serves; driver scope is a route the
-- driver has been assigned to in the last 30 days.
create policy students_select_operator on public.students
  for select to authenticated
  using (
    exists (
      select 1
      from public.schools sc
      where sc.id = school_id
        and sc.operator_id = private.current_operator_id()
    )
  );

create policy students_select_driver on public.students
  for select to authenticated
  using (
    exists (
      select 1
      from public.student_route_stops srs
      join public.trip_assignments ta on ta.route_id = srs.route_id
      join public.drivers d on d.id = ta.driver_id
      where srs.student_id = students.id
        and srs.active
        and d.profile_id = auth.uid()
        and d.active
        and ta.service_date >= current_date - 30
    )
  );

create policy guardians_select_operator on public.guardians
  for select to authenticated
  using (
    exists (
      select 1
      from public.students s
      join public.schools sc on sc.id = s.school_id
      where s.guardian_id = guardians.id
        and sc.operator_id = private.current_operator_id()
    )
  );

-- Buses and drivers: an operator manages its own fleet and staff only. Admin Pusat
-- keeps the broader policies already defined in the previous migration.
create policy buses_select_operator on public.buses
  for select to authenticated
  using (operator_id = private.current_operator_id());
create policy buses_insert_operator on public.buses
  for insert to authenticated
  with check (operator_id = private.current_operator_id());
create policy buses_update_operator on public.buses
  for update to authenticated
  using (operator_id = private.current_operator_id())
  with check (operator_id = private.current_operator_id());

create policy drivers_select_self on public.drivers
  for select to authenticated
  using (profile_id = auth.uid());
create policy drivers_select_operator on public.drivers
  for select to authenticated
  using (operator_id = private.current_operator_id());
create policy drivers_insert_operator on public.drivers
  for insert to authenticated
  with check (operator_id = private.current_operator_id());
create policy drivers_update_operator on public.drivers
  for update to authenticated
  using (operator_id = private.current_operator_id())
  with check (operator_id = private.current_operator_id());

-- Routes and stops are operational reference data. Admin Pusat writes them; the
-- operator may read them to plan; drivers and guardians only see routes that are
-- actually assigned / attached to them.
create policy routes_select_admin on public.routes
  for select to authenticated using (private.is_admin());
create policy routes_insert_admin on public.routes
  for insert to authenticated with check (private.is_admin());
create policy routes_update_admin on public.routes
  for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy routes_select_operator on public.routes
  for select to authenticated using (private.current_operator_id() is not null);
create policy routes_select_driver on public.routes
  for select to authenticated
  using (
    exists (
      select 1
      from public.trip_assignments ta
      join public.drivers d on d.id = ta.driver_id
      where ta.route_id = routes.id
        and d.profile_id = auth.uid()
        and d.active
    )
  );
create policy routes_select_guardian on public.routes
  for select to authenticated
  using (
    exists (
      select 1
      from public.student_route_stops srs
      join public.students s on s.id = srs.student_id
      join public.guardians g on g.id = s.guardian_id
      where srs.route_id = routes.id
        and srs.active
        and g.profile_id = auth.uid()
        and g.active
        and s.service_status = 'active'
    )
  );

create policy route_stops_select_admin on public.route_stops
  for select to authenticated using (private.is_admin());
create policy route_stops_insert_admin on public.route_stops
  for insert to authenticated with check (private.is_admin());
create policy route_stops_update_admin on public.route_stops
  for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy route_stops_select_operator on public.route_stops
  for select to authenticated using (private.current_operator_id() is not null);
create policy route_stops_select_driver on public.route_stops
  for select to authenticated
  using (
    exists (
      select 1
      from public.trip_assignments ta
      join public.drivers d on d.id = ta.driver_id
      where ta.route_id = route_stops.route_id
        and d.profile_id = auth.uid()
        and d.active
    )
  );
create policy route_stops_select_guardian on public.route_stops
  for select to authenticated
  using (
    exists (
      select 1
      from public.student_route_stops srs
      join public.students s on s.id = srs.student_id
      join public.guardians g on g.id = s.guardian_id
      where srs.route_id = route_stops.route_id
        and srs.active
        and g.profile_id = auth.uid()
        and g.active
        and s.service_status = 'active'
    )
  );

-- Student roster: Admin Pusat assigns, operators may maintain the roster for their
-- own schools, drivers and guardians may only read.
create policy student_route_stops_admin on public.student_route_stops
  for all to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy student_route_stops_operator on public.student_route_stops
  for all to authenticated
  using (
    exists (
      select 1
      from public.students s
      join public.schools sc on sc.id = s.school_id
      where s.id = student_id
        and sc.operator_id = private.current_operator_id()
    )
  )
  with check (
    exists (
      select 1
      from public.students s
      join public.schools sc on sc.id = s.school_id
      where s.id = student_id
        and sc.operator_id = private.current_operator_id()
    )
  );

create policy student_route_stops_driver on public.student_route_stops
  for select to authenticated
  using (
    active
    and exists (
      select 1
      from public.trip_assignments ta
      join public.drivers d on d.id = ta.driver_id
      where ta.route_id = student_route_stops.route_id
        and d.profile_id = auth.uid()
        and d.active
    )
  );

create policy student_route_stops_guardian on public.student_route_stops
  for select to authenticated
  using (
    active
    and exists (
      select 1
      from public.students s
      join public.guardians g on g.id = s.guardian_id
      where s.id = student_id
        and g.profile_id = auth.uid()
        and g.active
        and s.service_status = 'active'
    )
  );

-- Assignments: drivers see their own schedule; operators see and create assignments
-- only with their own buses and drivers.
create policy trip_assignments_select_admin on public.trip_assignments
  for select to authenticated using (private.is_admin());
create policy trip_assignments_insert_admin on public.trip_assignments
  for insert to authenticated with check (private.is_admin());
create policy trip_assignments_update_admin on public.trip_assignments
  for update to authenticated using (private.is_admin()) with check (private.is_admin());

create policy trip_assignments_select_operator on public.trip_assignments
  for select to authenticated
  using (
    exists (
      select 1 from public.buses b
      where b.id = bus_id and b.operator_id = private.current_operator_id()
    )
    or exists (
      select 1 from public.drivers d
      where d.id = driver_id and d.operator_id = private.current_operator_id()
    )
  );

create policy trip_assignments_insert_operator on public.trip_assignments
  for insert to authenticated
  with check (
    exists (
      select 1 from public.buses b
      where b.id = bus_id and b.operator_id = private.current_operator_id()
    )
    and exists (
      select 1 from public.drivers d
      where d.id = driver_id and d.operator_id = private.current_operator_id()
    )
  );

create policy trip_assignments_select_driver on public.trip_assignments
  for select to authenticated
  using (driver_id = private.current_driver_id());

-- Trips: drivers operate their own assignment only; guardians read trips of their
-- children's routes; operators read trips of their own buses.
create policy trips_select_admin on public.trips
  for select to authenticated using (private.is_admin());
create policy trips_select_driver on public.trips
  for select to authenticated
  using (
    exists (
      select 1 from public.trip_assignments ta
      where ta.id = assignment_id
        and ta.driver_id = private.current_driver_id()
    )
  );
create policy trips_insert_driver on public.trips
  for insert to authenticated
  with check (
    status = 'in_progress'
    and exists (
      select 1 from public.trip_assignments ta
      where ta.id = assignment_id
        and ta.driver_id = private.current_driver_id()
    )
  );
create policy trips_update_driver on public.trips
  for update to authenticated
  using (
    exists (
      select 1 from public.trip_assignments ta
      where ta.id = assignment_id
        and ta.driver_id = private.current_driver_id()
    )
  )
  with check (
    exists (
      select 1 from public.trip_assignments ta
      where ta.id = assignment_id
        and ta.driver_id = private.current_driver_id()
    )
  );
create policy trips_select_operator on public.trips
  for select to authenticated
  using (
    exists (
      select 1
      from public.trip_assignments ta
      join public.buses b on b.id = ta.bus_id
      where ta.id = assignment_id
        and b.operator_id = private.current_operator_id()
    )
  );
-- Guardians must be able to read the assignment of their child's route so that the
-- trip and bus policies below (which reference this table) can resolve.
create policy trip_assignments_select_guardian on public.trip_assignments
  for select to authenticated
  using (
    exists (
      select 1
      from public.student_route_stops srs
      join public.students s on s.id = srs.student_id
      join public.guardians g on g.id = s.guardian_id
      where srs.route_id = trip_assignments.route_id
        and srs.active
        and g.profile_id = auth.uid()
        and g.active
        and s.service_status = 'active'
    )
  );

create policy trips_select_guardian on public.trips
  for select to authenticated
  using (
    exists (
      select 1
      from public.trip_assignments ta
      join public.student_route_stops srs on srs.route_id = ta.route_id
      join public.students s on s.id = srs.student_id
      join public.guardians g on g.id = s.guardian_id
      where ta.id = assignment_id
        and srs.active
        and g.profile_id = auth.uid()
        and g.active
        and s.service_status = 'active'
    )
  );

-- Trip events: parents see only events for their own children; operators read events
-- of their own buses; drivers record events for their own trips.
create policy trip_student_events_select_admin on public.trip_student_events
  for select to authenticated using (private.is_admin());
create policy trip_student_events_select_driver on public.trip_student_events
  for select to authenticated
  using (
    exists (
      select 1
      from public.trips t
      join public.trip_assignments ta on ta.id = t.assignment_id
      where t.id = trip_id
        and ta.driver_id = private.current_driver_id()
    )
  );
create policy trip_student_events_insert_driver on public.trip_student_events
  for insert to authenticated
  with check (
    recorded_by = auth.uid()
    and exists (
      select 1
      from public.trips t
      join public.trip_assignments ta on ta.id = t.assignment_id
      where t.id = trip_id
        and ta.driver_id = private.current_driver_id()
    )
  );
create policy trip_student_events_select_operator on public.trip_student_events
  for select to authenticated
  using (
    exists (
      select 1
      from public.trips t
      join public.trip_assignments ta on ta.id = t.assignment_id
      join public.buses b on b.id = ta.bus_id
      where t.id = trip_id
        and b.operator_id = private.current_operator_id()
    )
  );
create policy trip_student_events_select_guardian on public.trip_student_events
  for select to authenticated
  using (
    exists (
      select 1
      from public.students s
      join public.guardians g on g.id = s.guardian_id
      where s.id = student_id
        and g.profile_id = auth.uid()
        and g.active
        and s.service_status = 'active'
    )
  );

-- Guardians read the bus assigned to their child's trip (fleet code / plate only).
create policy buses_select_guardian on public.buses
  for select to authenticated
  using (
    exists (
      select 1
      from public.trip_assignments ta
      join public.student_route_stops srs on srs.route_id = ta.route_id
      join public.students s on s.id = srs.student_id
      join public.guardians g on g.id = s.guardian_id
      where ta.bus_id = buses.id
        and srs.active
        and g.profile_id = auth.uid()
        and g.active
        and s.service_status = 'active'
    )
  );

-- ---------------------------------------------------------------------------
-- Grants for the operational tables (RLS still decides which rows are reachable)
-- ---------------------------------------------------------------------------
revoke all on public.routes, public.route_stops, public.student_route_stops,
  public.trip_assignments, public.trips, public.trip_student_events
from anon;

revoke all on public.routes, public.route_stops, public.student_route_stops,
  public.trip_assignments, public.trips, public.trip_student_events
from authenticated;

grant select, insert, update on public.routes, public.route_stops to authenticated;
grant select, insert, update on public.student_route_stops to authenticated;
grant select, insert, update on public.trip_assignments to authenticated;
grant select, insert, update on public.trips to authenticated;
grant select, insert on public.trip_student_events to authenticated;

-- ---------------------------------------------------------------------------
-- Audit for operational planning data
-- ---------------------------------------------------------------------------
create trigger routes_audit
  after insert or update on public.routes
  for each row execute function private.audit_row_change();
create trigger route_stops_audit
  after insert or update on public.route_stops
  for each row execute function private.audit_row_change();
create trigger student_route_stops_audit
  after insert or update on public.student_route_stops
  for each row execute function private.audit_row_change();
create trigger trip_assignments_audit
  after insert or update on public.trip_assignments
  for each row execute function private.audit_row_change();
create trigger trips_audit
  after insert or update on public.trips
  for each row execute function private.audit_row_change();
