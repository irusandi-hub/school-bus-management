-- Initial School Bus Management schema.
-- RLS is enabled on every application table. Policies are intentionally not permissive:
-- access remains denied until role-aware policies are reviewed and added.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'parent' check (role in ('admin', 'driver', 'parent')),
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.buses (
  id uuid primary key default gen_random_uuid(),
  fleet_code text not null unique,
  plate_number text unique,
  capacity integer not null check (capacity > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete restrict,
  license_number text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  student_code text not null unique,
  full_name text not null,
  school_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.guardian_students (
  guardian_profile_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  relationship text,
  primary key (guardian_profile_id, student_id)
);

create table public.routes (
  id uuid primary key default gen_random_uuid(),
  route_name text not null,
  school_name text not null,
  direction text not null check (direction in ('morning', 'afternoon')),
  active boolean not null default true,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.route_stops (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes(id) on delete cascade,
  stop_order integer not null check (stop_order > 0),
  stop_name text not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  is_school boolean not null default false,
  created_at timestamptz not null default now(),
  unique (route_id, stop_order)
);

create table public.trip_assignments (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes(id) on delete restrict,
  driver_id uuid not null references public.drivers(id) on delete restrict,
  bus_id uuid not null references public.buses(id) on delete restrict,
  service_date date not null,
  assigned_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (route_id, service_date, driver_id)
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.trip_assignments(id) on delete restrict,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'in_progress', 'completed', 'cancelled', 'delayed')),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.trip_student_events (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete restrict,
  event_type text not null check (event_type in ('boarded', 'dropped_off', 'absent', 'issue')),
  recorded_by uuid not null references public.profiles(id) on delete restrict,
  occurred_at timestamptz not null default now(),
  notes text
);

create table public.bus_locations (
  id bigint generated always as identity primary key,
  trip_id uuid not null references public.trips(id) on delete cascade,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  accuracy_meters double precision check (accuracy_meters is null or accuracy_meters >= 0),
  recorded_at timestamptz not null default now()
);

create index route_stops_route_order_idx on public.route_stops(route_id, stop_order);
create index trip_assignments_driver_date_idx on public.trip_assignments(driver_id, service_date);
create index trips_assignment_idx on public.trips(assignment_id, created_at desc);
create index trip_student_events_trip_time_idx on public.trip_student_events(trip_id, occurred_at desc);
create index bus_locations_trip_time_idx on public.bus_locations(trip_id, recorded_at desc);

alter table public.profiles enable row level security;
alter table public.buses enable row level security;
alter table public.drivers enable row level security;
alter table public.students enable row level security;
alter table public.guardian_students enable row level security;
alter table public.routes enable row level security;
alter table public.route_stops enable row level security;
alter table public.trip_assignments enable row level security;
alter table public.trips enable row level security;
alter table public.trip_student_events enable row level security;
alter table public.bus_locations enable row level security;

comment on table public.bus_locations is 'GPS history; retention and guardian visibility policies must be defined before live use.';
comment on table public.students is 'Child personal data; do not expose until guardian/driver/admin RLS policies are reviewed.';
