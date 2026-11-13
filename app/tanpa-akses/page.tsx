import Link from "next/link";
import type { Metadata } from "next";
import { signOutAction } from "@/lib/auth-actions";
import { getViewerState } from "@/lib/auth";
import { getRequestLocale } from "@/lib/i18n/server";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";

export const metadata: Metadata = { title: "Akses belum tersedia | School Bus" };

export const dynamic = "force-dynamic";

const reasons: Record<string, { title: string; detail: string }> = {
  "pengemudi-belum-tertaut": {
    title: "Akun pengemudi belum ditautkan",
    detail:
      "Akun Anda memiliki peran pengemudi, tetapi belum terhubung ke data pengemudi yang aktif. Operator Utama perlu menautkan akun ini ke data pengemudi sebelum tugas dan perjalanan dapat dibuka.",
  },
  "peran-tidak-dikenal": {
    title: "Peran akun tidak dikenali",
    detail:
      "Akun ini belum memiliki peran aplikasi yang sah. Hubungi Operator Utama untuk memeriksa data pengguna Anda.",
  },
};

export default async function NoAccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getRequestLocale();
  const copy = (value: string) => translateAdminCopy(value, locale) ?? value;
  const params = await searchParams;
  const raw = typeof params.alasan === "string" ? params.alasan : "";
  const reason = reasons[raw] ?? reasons["peran-tidak-dikenal"];
  const state = await getViewerState();
  const name =
    state.status === "authenticated"
      ? state.viewer.profile?.full_name || state.viewer.email || copy("Pengguna")
      : copy("Pengguna");

  return (
    <main className="auth-page">
      <section className="auth-card access-denied">
        <span className="gate-icon gate-icon-neutral" aria-hidden="true">!</span>
        <p className="eyebrow">{copy("AKSES TERBATAS")}</p>
        <h1>{copy(reason.title)}</h1>
        <p className="auth-copy">{copy(reason.detail)}</p>
        <p className="form-note">
          {copy("Masuk sebagai")} <strong>{name}</strong>. {copy("Tidak ada data organisasi, siswa, atau perjalanan yang ditampilkan pada halaman ini.")}
        </p>
        <form action={signOutAction}>
          <button className="btn btn-primary btn-lg" type="submit">
            {copy("Keluar dari akun")}
          </button>
        </form>
        <Link className="auth-back" href="/">
          {copy("Kembali ke gerbang akses")}
        </Link>
      </section>
    </main>
  );
}
