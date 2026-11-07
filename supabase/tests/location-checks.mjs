import { PGlite } from "@electric-sql/pglite";
import assert from "node:assert/strict";
import fs from "node:fs";

const db = new PGlite();

await db.exec(`
create role anon;
create role authenticated;
create schema auth;
create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant usage on schema auth to authenticated;
grant execute on function auth.uid() to authenticated;
create schema realtime;
create table realtime.messages(topic text, extension text, payload jsonb);
alter table realtime.messages enable row level security;
grant select on realtime.messages to authenticated;
create function realtime.topic() returns text language sql stable as $$
  select current_setting('realtime.topic', true)
$$;
create function realtime.send(payload jsonb,event text,topic text,private boolean) returns void language sql as $$
  insert into realtime.messages values(topic,'broadcast',payload)
$$;
`);

for (const file of fs.readdirSync("supabase/migrations").sort()) {
  await db.exec(fs.readFileSync(`supabase/migrations/${file}`, "utf8").replace("create extension if not exists pgcrypto;", ""));
  console.log("MIGRATION OK", file);
}

// Synthetic baseline fixtures (not production data).
await db.exec(fs.readFileSync("supabase/tests/migration_checks.sql", "utf8").replace(/^\\..*$/gm, ""));
console.log("BASELINE SQL PASS");

const uid = (suffix) => `00000000-0000-0000-0000-${suffix.padStart(12, "0")}`;
const tripA = uid("b01");
const tripB = uid("b02");

async function actor(suffix) {
  await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub','${uid(suffix)}',false)`);
}
async function expectDenied(sql, code = "42501") {
  let caught = null;
  try {
    await db.exec(sql);
  } catch (error) {
    caught = error;
  }
  assert.ok(caught, `Expected denial: ${sql}`);
  assert.equal(caught.code, code, `Expected ${code}, got ${caught.code}: ${caught.message}`);
}
async function one(sql) {
  const result = await db.query(sql);
  return result.rows[0];
}

await actor("4");
const first = await one(
  `select published_at from public.driver_publish_trip_location('${tripA}',26.421,50.082,12,now())`,
);
assert.ok(first.published_at);
console.log("PASS assigned driver A publishes an in-progress trip");

await actor("6");
let guardian = await one(`select * from public.guardian_trip_location('${tripA}')`);
assert.equal(guardian.trip_status, "in_progress");
assert.equal(guardian.is_fresh, true);
assert.equal(guardian.latitude, 26.421);
assert.equal(guardian.longitude, 50.082);
console.log("PASS guardian A reads only the fresh latest location");

await expectDenied(`select * from public.guardian_trip_location('${tripB}')`);
console.log("PASS guardian A cannot read another guardian's trip");

await actor("7");
await expectDenied(`select * from public.guardian_trip_location('${tripA}')`);
console.log("PASS guardian B cannot read guardian A's child");

await actor("5");
await expectDenied(
  `select * from public.driver_publish_trip_location('${tripA}',26.42,50.08,10,now())`,
);
console.log("PASS unassigned driver B cannot publish for trip A");

await actor("4");
await expectDenied(
  `select * from public.driver_publish_trip_location('${tripA}',91,50.08,10,now())`,
  "22023",
);
await expectDenied(
  `select * from public.driver_publish_trip_location('${tripA}',26.42,50.08,101,now())`,
  "22023",
);
await expectDenied(
  `select * from public.driver_publish_trip_location('${tripA}',26.42,50.08,10,now()-interval '31 seconds')`,
  "22023",
);
console.log("PASS invalid coordinates, accuracy, and stale samples are rejected");

let old = await one(`select * from public.driver_publish_trip_location('${tripA}',26.422,50.083,11,now()-interval '5 seconds')`);
assert.ok(old.published_at);
await db.exec("reset role");
let afterOld = await one(`select latitude, longitude, recorded_at from public.trip_live_locations where trip_id='${tripA}'`);
assert.equal(afterOld.latitude, 26.421);
assert.equal(afterOld.longitude, 50.082);
console.log("PASS an older sample cannot replace a newer location");

await actor("4");
const throttle = await one(
  `select * from public.driver_publish_trip_location('${tripA}',26.5,50.5,9,now()+interval '1 second')`,
);
assert.ok(throttle.published_at);
await db.exec("reset role");
let afterThrottle = await one(`select latitude from public.trip_live_locations where trip_id='${tripA}'`);
assert.equal(afterThrottle.latitude, 26.421);
await actor("4");
const newest = await one(
  `select * from public.driver_publish_trip_location('${tripA}',26.43,50.09,9,now()+interval '3 seconds')`,
);
assert.ok(newest.published_at);
await db.exec("reset role");
let afterNew = await one(`select latitude, longitude, recorded_at from public.trip_live_locations where trip_id='${tripA}'`);
assert.equal(afterNew.latitude, 26.43);
assert.equal(afterNew.longitude, 50.09);
assert.ok(new Date(afterNew.recorded_at) > new Date(afterOld.recorded_at));
console.log("PASS newer timestamps update the row; sub-1.5s writes are throttled");

await actor("6");
await expectDenied(`select * from public.trip_live_locations`);
await actor("4");
await expectDenied(`select * from public.trip_live_locations`);
await db.exec("reset role; set role anon");
await expectDenied(`select * from public.guardian_trip_location('${tripA}')`);
console.log("PASS the location table and anonymous RPC are not directly accessible");

await db.exec(`reset role; update public.trips set status='completed', completed_at=now(), safety_checked_at=now() where id='${tripA}'`);
let remaining = await one(`select count(*)::int as n from public.trip_live_locations where trip_id='${tripA}'`);
assert.equal(remaining.n, 0);
console.log("PASS completing a trip clears the latest location");

await actor("4");
await expectDenied(
  `select * from public.driver_publish_trip_location('${tripA}',26.43,50.09,9,now())`,
);
console.log("PASS a completed trip rejects further location writes");

await actor("6");
guardian = await one(`select * from public.guardian_trip_location('${tripA}')`);
assert.equal(guardian.trip_status, "completed");
assert.equal(guardian.latitude, null);
assert.equal(guardian.recorded_at, null);
console.log("PASS guardian sees the trip ended without a current location");

// Prepare a stale row directly as superuser. The read RPC must keep the time
// but must not expose old coordinates as a current position.
await db.exec(`reset role;
  update public.trips set status='in_progress', completed_at=null where id='${tripA}';
  insert into public.trip_live_locations(trip_id,driver_id,latitude,longitude,accuracy_meters,recorded_at,updated_at)
  values('${tripA}','${uid("401")}',26.44,50.10,10,now()-interval '60 seconds',now())
  on conflict(trip_id) do update set recorded_at=excluded.recorded_at, latitude=excluded.latitude, longitude=excluded.longitude`);
await actor("6");
guardian = await one(`select * from public.guardian_trip_location('${tripA}')`);
assert.equal(guardian.trip_status, "in_progress");
assert.equal(guardian.is_fresh, false);
assert.equal(guardian.latitude, null);
assert.equal(guardian.longitude, null);
assert.ok(guardian.recorded_at);
console.log("PASS stale coordinates are hidden while the last update time remains visible");

await db.exec(`reset role; update public.trips set status='cancelled' where id='${tripA}'`);
remaining = await one(`select count(*)::int as n from public.trip_live_locations where trip_id='${tripA}'`);
assert.equal(remaining.n, 0);
console.log("PASS cancelling a trip clears the latest location");

await db.close();
console.log("ALL LOCATION AUTHORIZATION CHECKS PASS");
