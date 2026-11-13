import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { LocalizedText } from "@/components/i18n/LocaleProvider";
import { LoginForm } from "./login-form";
import { homeForRole } from "@/lib/access";
import { getViewerState } from "@/lib/auth";
import { safeNextPath } from "@/lib/paths";

const reasons: Record<string, string> = {
  "sesi-berakhir": "Sesi Anda sudah berakhir. Silakan masuk kembali untuk melanjutkan.",
  "belum-aktivasi": "Akun Anda belum diaktifkan. Selesaikan verifikasi email dan pembuatan kata sandi terlebih dahulu.",
  auth_callback: "Tautan verifikasi tidak dapat diproses. Minta tautan baru dari halaman Aktivasi Akun.",
};

const doors: Record<string, { label: string; detail: string }> = {
  operator: {
    label: "Operator Utama",
    detail: "Gunakan akun Operator Utama untuk mengelola seluruh data dan operasional platform.",
  },
  pengemudi: {
    label: "Pengemudi",
    detail:
      "Gunakan akun pengemudi yang sudah ditautkan Operator. Setelah masuk, Anda diarahkan ke tugas hari ini.",
  },
  wali: {
    label: "Orang Tua/Wali",
    detail:
      "Gunakan email dan kata sandi akun wali. Akun harus didaftarkan Operator dan memiliki siswa dengan layanan aktif.",
  },
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawNext = typeof params.next === "string" ? params.next : null;
  const rawReason = typeof params.alasan === "string" ? params.alasan : null;
  const peran = typeof params.peran === "string" ? params.peran : null;
  const reason = rawReason ? reasons[rawReason] : undefined;
  const door = peran ? doors[peran === "admin" ? "operator" : peran] : undefined;

  // A signed-in user is never shown the login form again; they are sent to the area of
  // their database role instead of the area whose card they clicked earlier.
  const state = await getViewerState();
  if (state.status === "authenticated" && state.viewer.profile) {
    redirect(homeForRole(state.viewer.profile.role));
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-locale"><LocaleSwitcher compact /></div>
        <BrandLogo href="/" ariaLabel="Kembali ke gerbang akses" className="auth-logo" />
        <p className="eyebrow">SCHOOL BUS MANAGEMENT</p>
        <h1><LocalizedText k="loginTitle" /></h1>
        {door ? (
          <p className="auth-door">
            <strong>{door.label}</strong>
            <span>{door.detail}</span>
          </p>
        ) : (
          <p className="auth-copy"><LocalizedText k="loginCopy" /></p>
        )}

        <LoginForm next={safeNextPath(rawNext, "")} reason={reason} />

        <p className="auth-footnote"><LocalizedText k="loginFootnote" /></p>

        <div className="auth-links">
          <Link className="auth-back" href="/daftar">
            <LocalizedText k="activateGuardian" />
          </Link>
        </div>
      </section>
    </main>
  );
}
