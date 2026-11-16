import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { LocalizedText } from "@/components/i18n/LocaleProvider";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { LoginForm } from "./login-form";
import { homeForRole } from "@/lib/access";
import { getViewerState } from "@/lib/auth";
import { isDevOpenAccess } from "@/lib/dev-open-access";
import { isDemoOtpRole, type DemoOtpRole } from "@/lib/demo-otp";
import { isDemoOtpAvailable } from "@/lib/demo-session-token";

export const metadata: Metadata = {
  title: "Verifikasi OTP | School Bus Management",
};

function resolveRole(peran: string | null, next: string | null): DemoOtpRole {
  if (peran === "admin") return "operator";
  if (isDemoOtpRole(peran)) return peran;
  if (next?.startsWith("/operator") || next?.startsWith("/admin")) return "operator";
  if (next?.startsWith("/pengemudi")) return "pengemudi";
  if (next?.startsWith("/wali")) return "wali";
  // Jalur lama /login dipertahankan untuk tautan aktivasi wali.
  return "wali";
}

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawNext = typeof params.next === "string" ? params.next : null;
  const rawRole = typeof params.peran === "string" ? params.peran : null;
  const role = resolveRole(rawRole, rawNext);
  const simulationEnabled = isDevOpenAccess() || isDemoOtpAvailable();

  // OTP demo never replaces an existing authenticated account in production.
  // Preview/local simulation skips Supabase entirely and uses the isolated demo data.
  if (!simulationEnabled) {
    const state = await getViewerState();
    if (state.status === "authenticated" && state.viewer.profile) {
      redirect(homeForRole(state.viewer.profile.role));
    }
  }

  return (
    <main className="auth-page otp-page relative">
      <div className="absolute right-5 top-5 z-50"><LocaleSwitcher /></div>
      <section className="auth-card otp-card">
        <BrandLogo href="/" ariaLabel="Kembali ke beranda" className="auth-logo" />
        <h1><LocalizedText k="otpTitle" /></h1>
        <LoginForm role={role} simulationEnabled={simulationEnabled} />
      </section>
    </main>
  );
}
