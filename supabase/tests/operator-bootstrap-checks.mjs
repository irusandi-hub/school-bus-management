import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";

async function createDatabase() {
  const db = new PGlite();
  await db.exec(`
    create role anon;
    create role authenticated;
    create schema auth;
    create table auth.users (
      id uuid primary key,
      email text,
      email_confirmed_at timestamptz
    );
    create function auth.uid() returns uuid
    language sql stable
    as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated;
    grant execute on function auth.uid() to authenticated;
    create schema realtime;
    create table realtime.messages(topic text, extension text, payload jsonb);
    alter table realtime.messages enable row level security;
    grant select on realtime.messages to authenticated;
    create function realtime.topic() returns text
    language sql stable
    as $$ select current_setting('realtime.topic', true) $$;
    create function realtime.send(payload jsonb,event text,topic text,private boolean)
    returns void language sql
    as $$ insert into realtime.messages values(topic,'broadcast',payload) $$;
  `);
  return db;
}

const files = fs.readdirSync("supabase/migrations").filter((file) => file.endsWith(".sql")).sort();
const finalName = files.find((file) => file.endsWith("_unified_operator_global_authority.sql"));
assert.ok(finalName, "Unified Operator migration must exist");
const finalSql = fs.readFileSync(`supabase/migrations/${finalName}`, "utf8").replace(
  "create extension if not exists pgcrypto;",
  "",
);
const baseFiles = files.slice(0, files.indexOf(finalName));

async function applyBase(db) {
  for (const file of baseFiles) {
    const sql = fs.readFileSync(`supabase/migrations/${file}`, "utf8").replace(
      "create extension if not exists pgcrypto;",
      "",
    );
    await db.exec(sql);
    process.stdout.write(`BASE MIGRATION OK ${file}\n`);
  }
}

// Existing single legacy Admin must be promoted in place without creating a
// second identity, and the resulting profile must have global Operator access.
{
  const db = await createDatabase();
  await applyBase(db);
  await db.exec(`
    insert into auth.users(id,email,email_confirmed_at)
    values('00000000-0000-0000-0000-000000000001','legacy-admin@contoh.test',now());
    insert into public.profiles(id,full_name,role)
    values('00000000-0000-0000-0000-000000000001','Legacy Admin','admin');
  `);
  await db.exec(finalSql);
  const profile = await db.query(
    "select role from public.profiles where id='00000000-0000-0000-0000-000000000001'",
  );
  assert.equal(profile.rows[0]?.role, "operator");
  await db.exec(`
    set role authenticated;
    select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
  `);
  const access = await db.query("select private.is_admin() as allowed");
  assert.equal(access.rows[0]?.allowed, true);
  await db.exec("reset role");
  let deniedSecondGlobal = false;
  try {
    await db.exec(`
      insert into auth.users(id,email,email_confirmed_at)
      values('00000000-0000-0000-0000-000000000002','second@contoh.test',now());
      insert into public.profiles(id,full_name,role)
      values('00000000-0000-0000-0000-000000000002','Second Admin','admin');
    `);
  } catch (error) {
    deniedSecondGlobal = error.code === "23505";
  }
  assert.equal(deniedSecondGlobal, true, "a second legacy Admin must be blocked");
  await db.close();
  process.stdout.write("PASS one legacy Admin is promoted and remains the sole global Operator\n");
}

// Ambiguous legacy global accounts must stop the migration rather than selecting
// an arbitrary identity. The migration is run transactionally as a deployment
// migration would be.
{
  const db = await createDatabase();
  await applyBase(db);
  await db.exec(`
    insert into auth.users(id,email,email_confirmed_at) values
      ('00000000-0000-0000-0000-000000000011','admin-a@contoh.test',now()),
      ('00000000-0000-0000-0000-000000000012','admin-b@contoh.test',now());
    insert into public.profiles(id,full_name,role) values
      ('00000000-0000-0000-0000-000000000011','Admin A','admin'),
      ('00000000-0000-0000-0000-000000000012','Admin B','admin');
  `);
  await db.exec("begin");
  let rejected = false;
  try {
    await db.exec(finalSql);
    await db.exec("commit");
  } catch (error) {
    rejected = /beberapa akun Admin lama|kewenangan global/.test(error.message);
    await db.exec("rollback");
  }
  assert.equal(rejected, true, "ambiguous legacy global accounts must abort migration");
  const count = await db.query("select count(*)::int as n from public.profiles where role='admin'");
  assert.equal(count.rows[0]?.n, 2, "failed migration must not promote or delete legacy accounts");
  await db.close();
  process.stdout.write("PASS ambiguous legacy global accounts are rejected without changing them\n");
}


 // An already-provisioned Operator remains the same global identity.
{
  const db = await createDatabase();
  await applyBase(db);
  await db.exec(`
    insert into auth.users(id,email,email_confirmed_at)
    values('00000000-0000-0000-0000-000000000021','operator@contoh.test',now());
    insert into public.profiles(id,full_name,role)
    values('00000000-0000-0000-0000-000000000021','Operator Existing','operator');
  `);
  await db.exec(finalSql);
  const profile = await db.query(
    "select full_name, role from public.profiles where id='00000000-0000-0000-0000-000000000021'",
  );
  assert.equal(profile.rows[0]?.role, "operator");
  assert.equal(profile.rows[0]?.full_name, "Operator Existing");
  await db.close();
  process.stdout.write("PASS an existing global Operator is preserved without replacement\n");
}

// A legacy Admin and a current Operator together are also ambiguous. The
// migration must stop before modifying either identity.
{
  const db = await createDatabase();
  await applyBase(db);
  await db.exec(`
    insert into auth.users(id,email,email_confirmed_at) values
      ('00000000-0000-0000-0000-000000000031','legacy@contoh.test',now()),
      ('00000000-0000-0000-0000-000000000032','operator@contoh.test',now());
    insert into public.profiles(id,full_name,role) values
      ('00000000-0000-0000-0000-000000000031','Legacy Admin','admin'),
      ('00000000-0000-0000-0000-000000000032','Current Operator','operator');
  `);
  await db.exec("begin");
  let rejected = false;
  try {
    await db.exec(finalSql);
    await db.exec("commit");
  } catch (error) {
    rejected = /lebih dari satu akun dengan kewenangan global/.test(error.message);
    await db.exec("rollback");
  }
  assert.equal(rejected, true, "mixed legacy/current global accounts must abort migration");
  const count = await db.query(
    "select count(*)::int as n from public.profiles where role in ('admin','operator')",
  );
  assert.equal(count.rows[0]?.n, 2);
  await db.close();
  process.stdout.write("PASS mixed legacy Admin and current Operator are rejected without mutation\n");
}

process.stdout.write("ALL OPERATOR BOOTSTRAP CHECKS PASS\n");
