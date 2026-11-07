-- Latest GPS position of the assigned driver's phone for one active trip.
--
-- This migration is prepared for review and is NOT applied to any hosted
-- database by this repository. Apply it only after explicit approval on a
-- non-production project.
--
-- There is deliberately no location history: one row per trip is replaced in
-- place and is deleted as soon as the trip is no longer in progress. The table
-- has RLS enabled with no direct grants; all reads and writes go through the
-- SECURITY DEFINER functions below, which check the signed-in relation first.

create table public.trip_live_locations (
  trip_id uuid primary key references public.trips(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete cascade,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  accuracy_meters double precision not null check (accuracy_meters between 0 and 100),
  recorded_at timestamptz not null,
  updated_at timestamptz not null default now()
);

comment on table public.trip_live_locations is
  'Latest driver-phone position for an in-progress trip only. No history; one row per trip, deleted when the trip ends.';

alter table public.trip_live_locations enable row level security;
revoke all on public.trip_live_locations from anon, authenticated;

-- Drivers write only for their own assignment. The trip must still be running,
-- coordinates must be valid, and the sample must be recent. A sample is never
-- allowed to replace a newer one, and writes closer than 1.5 seconds are folded
-- into the existing row to avoid unnecessary updates.
create or replace function public.driver_publish_trip_location(
  p_trip_id uuid,
  p_latitude double precision,
  p_longitude double precision,
  p_accuracy double precision,
  p_recorded_at timestamptz
)
returns table (published_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_driver_id uuid;
  v_trip_status text;
  v_existing public.trip_live_locations;
  v_saved timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Akses lokasi ditolak' using errcode = '42501';
  end if;

  v_driver_id := private.current_driver_id();
  if v_driver_id is null then
    raise exception 'Akun pengemudi tidak aktif' using errcode = '42501';
  end if;

  select t.status
    into v_trip_status
  from public.trips t
  join public.trip_assignments ta on ta.id = t.assignment_id
  where t.id = p_trip_id
    and ta.driver_id = v_driver_id;

  if v_trip_status is null then
    raise exception 'Perjalanan tidak ditemukan untuk pengemudi ini' using errcode = '42501';
  end if;

  if v_trip_status <> 'in_progress' then
    raise exception 'Perjalanan tidak aktif' using errcode = '42501';
  end if;

  if p_latitude is null or p_longitude is null
     or p_latitude not between -90 and 90
     or p_longitude not between -180 and 180 then
    raise exception 'Koordinat lokasi tidak valid' using errcode = '22023';
  end if;

  if p_accuracy is null or p_accuracy < 0 or p_accuracy > 100 then
    raise exception 'Akurasi lokasi tidak valid' using errcode = '22023';
  end if;

  if p_recorded_at is null
     or p_recorded_at > now() + interval '5 seconds'
     or p_recorded_at < now() - interval '30 seconds' then
    raise exception 'Waktu lokasi tidak valid' using errcode = '22023';
  end if;

  select *
    into v_existing
  from public.trip_live_locations
  where trip_id = p_trip_id
  for update;

  if found then
    if p_recorded_at <= v_existing.recorded_at then
      return query select v_existing.recorded_at as published_at;
      return;
    end if;

    if p_recorded_at - v_existing.recorded_at < interval '1500 milliseconds' then
      return query select v_existing.recorded_at as published_at;
      return;
    end if;
  end if;

  insert into public.trip_live_locations (
    trip_id, driver_id, latitude, longitude, accuracy_meters, recorded_at, updated_at
  )
  values (
    p_trip_id, v_driver_id, p_latitude, p_longitude, p_accuracy, p_recorded_at, now()
  )
  on conflict (trip_id) do update
    set driver_id = excluded.driver_id,
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        accuracy_meters = excluded.accuracy_meters,
        recorded_at = excluded.recorded_at,
        updated_at = now()
    where excluded.recorded_at > public.trip_live_locations.recorded_at
  returning recorded_at into v_saved;

  if v_saved is null then
    select recorded_at into v_saved
    from public.trip_live_locations
    where trip_id = p_trip_id;
  end if;

  return query select v_saved as published_at;
end;
$$;

revoke all on function public.driver_publish_trip_location(uuid, double precision, double precision, double precision, timestamptz)
  from public, anon;
grant execute on function public.driver_publish_trip_location(uuid, double precision, double precision, double precision, timestamptz)
  to authenticated;

-- Guardians read only a trip connected to their own active child. The trip can
-- be completed so the portal can show that sharing ended, but coordinates are
-- returned only while the trip is in progress and the sample is at most 30
-- seconds old. A stale timestamp remains visible as "last update" without
-- exposing stale coordinates as a current position.
create or replace function public.guardian_trip_location(p_trip_id uuid)
returns table (
  trip_id uuid,
  trip_status text,
  latitude double precision,
  longitude double precision,
  accuracy_meters double precision,
  recorded_at timestamptz,
  is_fresh boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_status text;
begin
  if auth.uid() is null then
    raise exception 'Akses lokasi ditolak' using errcode = '42501';
  end if;

  select t.status
    into v_status
  from public.trips t
  where t.id = p_trip_id
    and exists (
      select 1
      from public.trip_assignments ta
      join public.student_route_stops srs
        on srs.route_id = ta.route_id
       and srs.active
      join public.routes r
        on r.id = ta.route_id
       and r.direction = srs.direction
      join public.students s on s.id = srs.student_id
      join public.guardians g on g.id = s.guardian_id
      where ta.id = t.assignment_id
        and g.profile_id = auth.uid()
        and g.active
        and s.service_status = 'active'
    );

  if v_status is null then
    raise exception 'Akses lokasi ditolak' using errcode = '42501';
  end if;

  return query
  select
    t.id,
    t.status,
    case
      when t.status = 'in_progress'
       and l.recorded_at > now() - interval '30 seconds'
      then l.latitude
    end,
    case
      when t.status = 'in_progress'
       and l.recorded_at > now() - interval '30 seconds'
      then l.longitude
    end,
    case
      when t.status = 'in_progress'
       and l.recorded_at > now() - interval '30 seconds'
      then l.accuracy_meters
    end,
    l.recorded_at,
    (t.status = 'in_progress' and l.recorded_at > now() - interval '30 seconds') as is_fresh
  from public.trips t
  left join public.trip_live_locations l on l.trip_id = t.id
  where t.id = p_trip_id;
end;
$$;

revoke all on function public.guardian_trip_location(uuid) from public, anon;
grant execute on function public.guardian_trip_location(uuid) to authenticated;

-- Ending or cancelling a trip removes the latest location immediately. The
-- client also stops publishing because its active flag becomes false.
create or replace function private.clear_trip_live_location()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status <> 'in_progress' then
    delete from public.trip_live_locations where trip_id = new.id;
  end if;
  return null;
end;
$$;

revoke all on function private.clear_trip_live_location() from public, anon, authenticated;

create trigger trips_clear_live_location
  after update of status on public.trips
  for each row execute function private.clear_trip_live_location();
