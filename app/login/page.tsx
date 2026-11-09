"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

/**
 * Magic-link entry point. `?mode=daftar` only changes the wording: accounts are
 * pre-registered by the school admin, so both paths use the same safe flow.
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [signup, setSignup] = useState(false);

  useEffect(() => {
    const mode = new URLSearchParams(window.location.search).get("mode");
    setSignup(mode === "daftar" || mode === "signup");
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin + "/auth/callback?next=/dashboard" },
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
        <Link className="auth-brand" href="/">
          {/* Same geometric bus mark as the landing header. */}
          <svg viewBox="0 0 40 40" width="38" height="38" aria-hidden focusable={false}>
            <rect x="2" y="5" width="36" height="28" rx="9" fill="#0F1B3D" />
            <rect x="8" y="12" width="9" height="8" rx="2" fill="#F7F9FC" />
            <rect x="20" y="12" width="9" height="8" rx="2" fill="#F7F9FC" />
            <rect x="8" y="24" width="21" height="3" rx="1.5" fill="#F5C518" />
            <rect x="31" y="12" width="3" height="15" rx="1.5" fill="#7E8CB2" />
          </svg>
          <span>SchoolBus</span>
        </Link>
        <p className="eyebrow">SCHOOL BUS MANAGEMENT</p>
        <h1>{signup ? "Daftar akun" : "Masuk ke akun"}</h1>
        <p className="auth-copy">
          {signup
            ? "Masukkan email yang sudah didaftarkan oleh Admin Pusat. Kami akan mengirim tautan untuk mengaktifkan akun tanpa kata sandi."
            : "Masukkan email yang sudah didaftarkan oleh Admin Pusat. Kami akan mengirim tautan masuk tanpa kata sandi."}
        </p>
        <form onSubmit={submit} className="auth-form">
          <label htmlFor="email">Alamat email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@contoh.com" />
          <button type="submit" disabled={busy}>{busy ? "Memproses..." : signup ? "Kirim tautan pendaftaran" : "Kirim tautan masuk"}</button>
        </form>
        {message && <p className="auth-message" role="status">{message}</p>}
        <Link className="auth-back" href="/">Kembali ke beranda</Link>
        <p className="auth-footnote">Akses peran dan data belum aktif sampai proyek Supabase serta kebijakan keamanan disiapkan.</p>
      </section>
    </main>
  );
}
