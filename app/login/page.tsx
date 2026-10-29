"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin + "/auth/callback?next=/" },
      });
      if (error) throw error;
      setMessage("Tautan masuk sudah diminta. Periksa kotak masuk email Anda, termasuk folder spam.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Tidak dapat memulai proses masuk.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">S</div>
        <p className="eyebrow">SCHOOL BUS MANAGEMENT</p>
        <h1>Masuk ke akun</h1>
        <p className="auth-copy">Masukkan email yang sudah didaftarkan oleh Admin Pusat. Kami akan mengirim tautan masuk tanpa kata sandi.</p>
        <form onSubmit={submit} className="auth-form">
          <label htmlFor="email">Alamat email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@contoh.com" />
          <button type="submit" disabled={busy}>{busy ? "Memproses..." : "Kirim tautan masuk"}</button>
        </form>
        {message && <p className="auth-message" role="status">{message}</p>}
        <Link className="auth-back" href="/">Kembali ke pratinjau dashboard</Link>
        <p className="auth-footnote">Akses peran dan data belum aktif sampai proyek Supabase serta kebijakan keamanan disiapkan.</p>
      </section>
    </main>
  );
}
