import type { Metadata } from "next";
import { cookies } from "next/headers";
import { DialogProvider } from "@/components/ui/DialogProvider";
import { DevModeBanner } from "@/components/DevModeBanner";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { GlobalNavigationControls } from "@/components/i18n/GlobalNavigationControls";
import { defaultLocale, getDirection, isLocale } from "@/lib/i18n/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "School Bus | Manajemen Transportasi Sekolah",
  description: "Dasbor operasional bus sekolah untuk pengelola, pengemudi, dan orang tua/wali.",
  icons: {
    icon: "/assets/landing/favicon.svg",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("sbm_locale")?.value;
  const locale = isLocale(savedLocale) ? savedLocale : defaultLocale;

  return (
    <html lang={locale} dir={getDirection(locale)}>
      <body>
        <LocaleProvider initialLocale={locale}>
          <GlobalNavigationControls />
          <DevModeBanner />
          <DialogProvider>{children}</DialogProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
