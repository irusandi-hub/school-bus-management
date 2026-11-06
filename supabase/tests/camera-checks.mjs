import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
const db = new PGlite();
await db.exec(`create role anon; create role authenticated; create schema auth;
create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;
create schema realtime; create table realtime.messages(topic text, extension text, payload jsonb);
alter table realtime.messages enable row level security; grant select on realtime.messages to authenticated;
create function realtime.topic() returns text language sql stable as $$ select current_setting('realtime.topic',true) $$;
create function realtime.send(payload jsonb,event text,topic text,private boolean) returns void language sql as $$ insert into realtime.messages values(topic,'broadcast',payload) $$;
`);
for (const f of fs.readdirSync('supabase/migrations').sort()) {
 await db.exec(fs.readFileSync('supabase/migrations/'+f,'utf8').replace('create extension if not exists pgcrypto;',''));
 console.log('MIGRATION OK', f);
}
// Reuse synthetic repository fixtures and baseline assertions.
await db.exec(fs.readFileSync('supabase/tests/migration_checks.sql','utf8').replace(/^\\.*$/gm,''));
console.log('BASELINE SQL PASS');
await db.exec(`reset role; select set_config('request.jwt.claim.sub','','false');
 update public.trips set status='in_progress' where id='00000000-0000-0000-0000-000000000b01';
 insert into public.trip_student_events(trip_id,student_id,event_type,recorded_by,occurred_at)
 values('00000000-0000-0000-0000-000000000b01','00000000-0000-0000-0000-000000000601','boarded','00000000-0000-0000-0000-000000000004',now()+interval '1 second');`);
const uid = n => '00000000-0000-0000-0000-'+n.padStart(12,'0');
const trip=uid('b01'), student=uid('601');
async function actor(n) { await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub','${uid(n)}',false)`); }
async function denied(sql) { let caught=false; try { await db.exec(sql); } catch(e) { if(e.code !== '42501') throw e; caught=true; } if(!caught) throw Error('Expected denial: '+sql); }
async function check(sql) { const result=await db.query(sql); if(result.rows[0].ok!==true) throw Error(sql); }
await actor('7'); await denied(`select public.camera_open('${trip}','${student}')`);
await actor('5'); await denied(`select public.camera_open('${trip}','${student}')`);
console.log('PASS unauthorized guardian and driver denied');
await actor('6');
const sid=(await db.query(`select public.camera_open('${trip}','${student}') id`)).rows[0].id;
await check(`select public.camera_heartbeat('${sid}') ok`);
await db.exec(`select set_config('realtime.topic','camera:${sid}',false)`);
await check(`select private.camera_channel_allowed('camera:${sid}') ok`);
await db.exec(`select public.camera_signal('${sid}','ready','{}')`);
await denied(`select public.camera_signal('${sid}','offer','{}')`);
await denied(`insert into realtime.messages values('camera:${sid}','broadcast','{}')`);
await actor('4');
await check(`select count(*)=1 ok from public.camera_sessions_for_trip('${trip}')`);
await db.exec(`select public.camera_signal('${sid}','offer','{"type":"offer","sdp":"synthetic"}')`);
console.log('PASS assigned publisher, linked on-board viewer, role-direction checks, no direct broadcast writes');
await db.exec(`reset role; insert into public.trip_student_events(trip_id,student_id,event_type,recorded_by,occurred_at)
 values('${trip}','${student}','dropped_off','${uid('4')}',now()+interval '2 seconds')`);
await actor('6'); await check(`select not public.camera_heartbeat('${sid}') ok`);
await check(`select not private.camera_channel_allowed('camera:${sid}') ok`);
await denied(`select public.camera_signal('${sid}','answer','{}')`);
await denied(`select public.camera_open('${trip}','${student}')`);
console.log('PASS drop-off revokes old topic, heartbeat, signaling, new access');
await db.exec(`reset role; delete from public.trip_student_events where event_type='dropped_off'`);
await actor('6'); await check(`select not public.camera_heartbeat('${sid}') ok`);
const sid2=(await db.query(`select public.camera_open('${trip}','${student}') id`)).rows[0].id;
await db.exec(`reset role; update public.trips set status='completed',safety_checked_at=now() where id='${trip}'`);
await actor('4'); await check(`select not public.camera_heartbeat('${sid2}') ok`);
await denied(`select public.camera_signal('${sid2}','offer','{}')`);
await db.exec(`reset role; update public.trips set status='in_progress' where id='${trip}'`);
await actor('6'); await check(`select not public.camera_heartbeat('${sid2}') ok`);
console.log('PASS trip completion revokes and reopening cannot revive stale session');
const sid3=(await db.query(`select public.camera_open('${trip}','${student}') id`)).rows[0].id;
await db.exec(`reset role; update public.camera_sessions set expires_at=now()-interval '1 second' where id='${sid3}'`);
await actor('4'); await check(`select not public.camera_heartbeat('${sid3}') ok`);
await denied(`select public.camera_signal('${sid3}','offer','{}')`);
console.log('PASS expired lease cannot renew or signal');
await actor('6');
const sid4=(await db.query(`select public.camera_open('${trip}','${student}') id`)).rows[0].id;
await db.exec(`reset role; update public.guardians set active=false where profile_id='${uid('6')}'`);
await actor('6'); await check(`select not public.camera_heartbeat('${sid4}') ok`);
await denied(`select public.camera_open('${trip}','${student}')`);
console.log('PASS guardian relationship revocation');
await db.close();
