# Bootstrap akun Operator Utama

Dokumen ini menjelaskan provisioning akun global pertama pada instalasi baru. Tidak ada akun Operator yang dibuat otomatis oleh signup publik.

> **Peringatan:** jangan jalankan SQL ini pada database produksi tanpa persetujuan eksplisit pemilik proyek. Skrip ini mengubah satu baris `public.profiles`. Tidak ada kredensial atau password yang disimpan di SQL.

## Prasyarat

1. Semua migrasi fondasi sudah diterapkan berurutan, termasuk `20261031000000_admin_core_crud` dan `20261109000000_unified_operator_global_authority`.
2. Pastikan hanya ada satu akun Auth yang ditetapkan sebagai Operator Utama.
3. Buat pengguna Auth melalui Supabase Dashboard → Authentication → Users, gunakan email yang dikuasai Operator, dan pastikan email terverifikasi.
4. Jangan gunakan akun Pengemudi atau Orang Tua/Wali yang sudah berjalan.

## SQL provisioning terkontrol

Ganti nilai `operator@example.com` dan `Operator Utama` dengan email serta nama akun yang telah disetujui. Jalankan hanya setelah prasyarat di atas terpenuhi.

```sql
do $bootstrap_operator$
declare
  v_uid uuid;
  v_existing_role text;
  v_other_global_count integer;
  v_driver_link_count integer;
  v_guardian_link_count integer;
begin
  select u.id
    into v_uid
  from auth.users u
  where lower(u.email) = lower(trim('operator@example.com'))
    and u.email_confirmed_at is not null;

  if v_uid is null then
    raise exception 'Akun Auth tidak ditemukan atau email belum terverifikasi.';
  end if;

  select p.role
    into v_existing_role
  from public.profiles p
  where p.id = v_uid;

  if v_existing_role is not null
     and v_existing_role not in ('admin', 'operator') then
    raise exception 'Akun target sudah memiliki role non-Operator; provisioning dibatalkan.';
  end if;

  select count(*) into v_driver_link_count
  from public.drivers d where d.profile_id = v_uid;

  select count(*) into v_guardian_link_count
  from public.guardians g where g.profile_id = v_uid;

  if v_driver_link_count > 0 or v_guardian_link_count > 0 then
    raise exception 'Akun target masih tertaut sebagai Pengemudi atau Orang Tua/Wali; provisioning dibatalkan.';
  end if;

  select count(*)
    into v_other_global_count
  from public.profiles p
  where p.role in ('admin', 'operator')
    and p.id <> v_uid;

  if v_other_global_count > 0 then
    raise exception 'Sudah ada akun global lain. Tinjau secara manual; tidak ada perubahan dilakukan.';
  end if;

  insert into public.profiles (id, full_name, role)
  values (v_uid, 'Operator Utama', 'operator')
  on conflict (id) do update
    set full_name = excluded.full_name,
        role = 'operator',
        updated_at = now();
end;
$bootstrap_operator$;
```

## Verifikasi setelah provisioning

Jalankan query baca-saja:

```sql
select p.id, p.full_name, p.role, u.email, u.email_confirmed_at
from public.profiles p
join auth.users u on u.id = p.id
where p.role = 'operator';
```

Hasil yang diharapkan: tepat satu baris, dengan email terverifikasi milik Operator Utama.

## Catatan implementasi

- Operator Utama tidak memerlukan baris `project_areas` atau `schools`. Project Area dan sekolah adalah data operasional, bukan identitas login atau batas hak akses.
- Setelah migrasi Project Area, tabel `operators` menjadi `project_areas` dan kolom `profile_id` menjadi `legacy_profile_id`. Kolom itu hanya referensi historis dan tidak memberi akses; helper `current_operator_id()` sudah dihapus. `current_driver_id()` tetap mensyaratkan role `driver`.
- Project Area tidak memiliki akun. Jangan menambahkan UI atau RPC penautan akun area; kolom lama `project_areas.legacy_profile_id` hanya referensi historis.
- Jalankan `npm run test:operator:sql` untuk memverifikasi promosi/penolakan bootstrap pada database PGlite terisolasi. Skrip uji tersebut membuat data dan **tidak boleh** diarahkan ke database hosted/produksi.

## Batas keamanan

- Jangan menambahkan tombol signup publik yang mengizinkan pemilihan role `operator`.
- Jangan menaruh service-role key atau password dalam aplikasi/browser.
- Jangan menjalankan skrip ini sebelum migrasi role dan unique index Operator tersedia.
- Jika ada lebih dari satu akun Admin/Operator lama, hentikan dan selesaikan rekonsiliasi identitas secara manual terlebih dahulu.
- Jangan menjalankan fixture SQL pada database yang berisi data nyata; fixture tersebut membuat profil, siswa, dan perjalanan sintetis.
