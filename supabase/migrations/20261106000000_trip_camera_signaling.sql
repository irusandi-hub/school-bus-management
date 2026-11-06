-- Apply only after review on a non-production Supabase project.
-- No media is stored. Browser broadcast writes are deliberately NOT granted.
create table public.camera_sessions (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  publisher_id uuid not null references public.profiles(id) on delete cascade,
  expires_at timestamptz not null default now() + interval '30 seconds',
  closed boolean not null default false
);
alter table public.camera_sessions enable row level security;
revoke all on public.camera_sessions from anon, authenticated;

create function private.camera_allowed(p_trip uuid, p_student uuid, p_viewer uuid, p_publisher uuid)
returns boolean language sql stable security definer set search_path = '' as $$
 select exists (
  select 1 from public.trips t
  join public.trip_assignments a on a.id = t.assignment_id
  join public.drivers d on d.id = a.driver_id
  join public.student_route_stops rs on rs.route_id = a.route_id and rs.active
  join public.routes r on r.id = a.route_id and r.direction = rs.direction
  join public.students s on s.id = rs.student_id
  join public.guardians g on g.id = s.guardian_id
  where t.id = p_trip and t.status = 'in_progress' and s.id = p_student
    and d.profile_id = p_publisher and d.active
    and g.profile_id = p_viewer and g.active and s.service_status = 'active'
    and (select e.event_type from public.trip_student_events e
         where e.trip_id = t.id and e.student_id = s.id and e.event_type <> 'issue'
         order by e.occurred_at desc, e.id desc limit 1) = 'boarded'
 );
$$;

create function private.camera_channel_allowed(topic text)
returns boolean language sql stable security definer set search_path = '' as $$
 select exists (select 1 from public.camera_sessions s
 where topic = 'camera:' || s.id::text and not s.closed and s.expires_at > now()
 and auth.uid() in (s.viewer_id, s.publisher_id)
 and private.camera_allowed(s.trip_id,s.student_id,s.viewer_id,s.publisher_id));
$$;
revoke all on function private.camera_allowed(uuid,uuid,uuid,uuid) from public, anon, authenticated;
revoke all on function private.camera_channel_allowed(text) from public, anon;
grant execute on function private.camera_channel_allowed(text) to authenticated;
create policy camera_private_receive on realtime.messages for select to authenticated
 using (extension = 'broadcast' and private.camera_channel_allowed(realtime.topic()));
-- No INSERT policy: signaling goes through camera_signal, with a fresh DB check.

create function public.camera_open(p_trip uuid, p_student uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare publisher uuid; result uuid;
begin
 select d.profile_id into publisher from public.trips t
 join public.trip_assignments a on a.id=t.assignment_id
 join public.drivers d on d.id=a.driver_id where t.id=p_trip;
 if auth.uid() is null or not private.camera_allowed(p_trip,p_student,auth.uid(),publisher) then
  raise exception 'Camera access denied' using errcode='42501';
 end if;
 -- One current session per viewer/student. Reopening cannot revive an old topic.
 update public.camera_sessions set closed=true where viewer_id=auth.uid() and student_id=p_student;
 insert into public.camera_sessions(trip_id,student_id,viewer_id,publisher_id)
 values(p_trip,p_student,auth.uid(),publisher) returning id into result;
 return result;
end $$;

create function public.camera_sessions_for_trip(p_trip uuid)
returns table(id uuid) language sql security definer set search_path = '' as $$
 select s.id from public.camera_sessions s where s.trip_id=p_trip
 and s.publisher_id=auth.uid() and not s.closed and s.expires_at>now()
 and private.camera_allowed(s.trip_id,s.student_id,s.viewer_id,s.publisher_id);
$$;

create function public.camera_heartbeat(p_session uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare s public.camera_sessions;
begin
 select * into s from public.camera_sessions where id=p_session for update;
 if s.id is null or auth.uid() is null or auth.uid() not in (s.viewer_id,s.publisher_id) then return false; end if;
 if s.closed or s.expires_at<=now() or not private.camera_allowed(s.trip_id,s.student_id,s.viewer_id,s.publisher_id) then
  update public.camera_sessions set closed=true where id=s.id;
  return false;
 end if;
 -- Only the publisher can renew a media lease. A viewer cannot keep it alive alone.
 if auth.uid()=s.publisher_id then
  update public.camera_sessions set expires_at=now()+interval '30 seconds' where id=s.id;
 end if;
 return true;
end $$;

create function public.camera_signal(p_session uuid, p_kind text, p_body jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare s public.camera_sessions;
begin
 select * into s from public.camera_sessions where id=p_session for update;
 if auth.uid() is null or s.id is null or auth.uid() not in(s.viewer_id,s.publisher_id)
 or s.closed or s.expires_at<=now()
 or not private.camera_allowed(s.trip_id,s.student_id,s.viewer_id,s.publisher_id) then
  raise exception 'Camera access ended' using errcode='42501';
 end if;
 if p_kind not in ('ready','offer','answer','ice','stop') or p_body is null
 or octet_length(p_body::text)>65536
 or (p_kind='offer' and auth.uid()<>s.publisher_id)
 or (p_kind in ('answer','ready') and auth.uid()<>s.viewer_id) then
  raise exception 'Invalid camera signal' using errcode='42501';
 end if;
 perform realtime.send(jsonb_build_object('kind',p_kind,'body',p_body,
   'sender',case when auth.uid()=s.publisher_id then 'publisher' else 'viewer' end),
   'signal','camera:'||s.id::text,true);
 if p_kind='stop' then update public.camera_sessions set closed=true where id=s.id; end if;
end $$;

-- Terminal events permanently invalidate existing topics, even if trip/event is edited later.
create function private.camera_revoke() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
 update public.camera_sessions s set closed=true where not s.closed and
 not private.camera_allowed(s.trip_id,s.student_id,s.viewer_id,s.publisher_id);
 return null;
end $$;
create trigger camera_trip_revoke after update or delete on public.trips for each statement execute function private.camera_revoke();
create trigger camera_event_revoke after insert or update or delete on public.trip_student_events for each statement execute function private.camera_revoke();
create trigger camera_assignment_revoke after update or delete on public.trip_assignments for each statement execute function private.camera_revoke();
create trigger camera_driver_revoke after update or delete on public.drivers for each statement execute function private.camera_revoke();
create trigger camera_guardian_revoke after update or delete on public.guardians for each statement execute function private.camera_revoke();
create trigger camera_student_revoke after update or delete on public.students for each statement execute function private.camera_revoke();
create trigger camera_placement_revoke after update or delete on public.student_route_stops for each statement execute function private.camera_revoke();
create trigger camera_route_revoke after update or delete on public.routes for each statement execute function private.camera_revoke();
revoke all on function private.camera_revoke() from public, anon, authenticated;
revoke all on function public.camera_open(uuid,uuid), public.camera_sessions_for_trip(uuid), public.camera_heartbeat(uuid), public.camera_signal(uuid,text,jsonb) from public, anon;
grant execute on function public.camera_open(uuid,uuid), public.camera_sessions_for_trip(uuid), public.camera_heartbeat(uuid), public.camera_signal(uuid,text,jsonb) to authenticated;
