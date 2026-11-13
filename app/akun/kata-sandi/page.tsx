import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { PasswordForm } from "./password-form";
import { getViewerState } from "@/lib/auth";
import { homeForRole } from "@/lib/access";
import { signOutAction } from "@/lib/auth-actions";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/messages";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";

const notices: Record<string, string> = {
  "belum-aktivasi": "Akun Anda belum terhubung ke data wali. Selesaikan proses di bawah ini.",
  "profil-belum-aktif": "Akun ini belum memiliki profil aplikasi. Selesaikan aktivasi akun wali di bawah ini.",
};

// Activation reads the session from cookies; it must never be prerendered as a static page.
export const dynamic = "force-dynamic";

export default async function KataSandiPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getRequestLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const copy = (value: string) => translateAdminCopy(value, locale) ?? value;
  const state = await getViewerState();

  if (state.status === "anonymous") redirect("/login?alasan=sesi-berakhir");
  if (state.status === "unconfigured") {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <BrandLogo className="auth-logo" />
          <h1>{t("databaseNotConfigured")}</h1>
          <p className="auth-copy">
            {locale === "en" ? "Account activation is unavailable because the database connection has not been configured. Contact the Main Operator." : locale === "ar" ? "يتعذر تفعيل الحساب لأن اتصال قاعدة البيانات لم يتم إعداده. تواصل مع المشغّل الرئيسي." : "Aktivasi akun belum dapat dilakukan karena koneksi database belum diatur. Hubungi Operator Utama."}
          </p>
          <Link className="auth-back" href="/">
            {t("backHome")}
          </Link>
        </section>
      </main>
    );
  }

  const { viewer } = state;
  if (viewer.profile) redirect(homeForRole(viewer.profile.role));

  const params = await searchParams;
  const rawReason = typeof params.alasan === "string" ? params.alasan : null;
  const notice = rawReason ? notices[rawReason] : undefined;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <BrandLogo className="auth-logo" />
        <p className="eyebrow">{t("activationEyebrow")}</p>
        <h1>{t("activationTitle")}</h1>
        <p className="auth-copy">
          <strong>{viewer.email ?? (locale === "en" ? "Your email" : locale === "ar" ? "بريدك الإلكتروني" : "Email Anda")}</strong> · {t("passwordActivationIntro")}
        </p>

        {notice && (
          <p className="form-alert info" role="status">
            {notice ? copy(notice) : null}
          </p>
        )}

        <PasswordForm />

        <form action={signOutAction} className="auth-secondary">
          <button type="submit">{t("signOutAccount")}</button>
        </form>

        <p className="auth-footnote">
          {t("activationDeniedNote")}
        </p>
      </section>
    </main>
  );
}
