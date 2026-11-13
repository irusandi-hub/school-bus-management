import type { Metadata } from "next";
import { DialogProvider } from "@/components/ui/DialogProvider";
import { DevModeBanner } from "@/components/DevModeBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "School Bus | Manajemen Transportasi Sekolah",
  description: "Dasbor operasional bus sekolah untuk pengelola, pengemudi, dan orang tua/wali.",
  icons: {
    icon: "/assets/landing/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <DevModeBanner />
        <DialogProvider>{children}</DialogProvider>
      </body>
    </html>
  );
}
