import Link from "next/link";
import type { Metadata } from "next";
import { signOutAction } from "@/lib/auth-actions";
import { getViewerState } from "@/lib/auth";

export const metadata: Metadata = { title: "Akses belum tersedia | School Bus" };

export const dynamic = "force-dynamic";

const reasons: Record<string, { title: string; detail: string }> = {
  "operator-belum-tertaut": {
    title: "Akun pengelola belum ditautkan",
    detail:
      "Akun Anda memiliki peran pengelola, tetapi belum terhubung ke organisasi transportasi yang aktif. Pengelola perlu menautkan akun ini ke data pengelola sebelum area pengelola dapat dibuka.",
  },
  "pengemudi-belum-tertaut": {
    title: "Akun pengemudi belum ditautkan",
    detail:
      "Akun Anda memiliki peran pengemudi, tetapi belum terhubung ke data pengemudi yang aktif. Pengelola perlu menautkan akun ini ke data pengemudi sebelum tugas dan perjalanan dapat dibuka.",
  },
  "peran-tidak-dikenal": {
    title: "Peran akun tidak dikenali",
    detail:
      "Akun ini belum memiliki peran aplikasi yang sah. Hubungi Pengelola untuk memeriksa data pengguna Anda.",
  },
};

export default async function NoAccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = typeof params.alasan === "string" ? params.alasan : "";
  const reason = reasons[raw] ?? reasons["peran-tidak-dikenal"];
  const state = await getViewerState();
  const name =
    state.status === "authenticated"
      ? state.viewer.profile?.full_name || state.viewer.email || "Pengguna"
      : "Pengguna";

  return (
    <main className="auth-page">
      <section className="auth-card access-denied">
        <span className="gate-icon gate-icon-neutral" aria-hidden="true">!</span>
        <p className="eyebrow">AKSES TERBATAS</p>
        <h1>{reason.title}</h1>
        <p className="auth-copy">{reason.detail}</p>
        <p className="form-note">
          Masuk sebagai <strong>{name}</strong>. Tidak ada data organisasi, siswa, atau perjalanan yang ditampilkan
          pada halaman ini.
        </p>
        <form action={signOutAction}>
          <button className="btn btn-primary btn-lg" type="submit">
            Keluar dari akun
          </button>
        </form>
        <Link className="auth-back" href="/">
          Kembali ke gerbang akses
        </Link>
      </section>
    </main>
  );
}
