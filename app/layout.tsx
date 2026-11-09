import type { Metadata } from "next";
import "./globals.css";
import "./landing.css";

export const metadata: Metadata = {
  title: "SchoolBus — Manajemen Transportasi Sekolah",
  description: "Aplikasi manajemen bus sekolah untuk sekolah, pengemudi, dan orang tua. Pantau perjalanan, terima notifikasi, dan kelola armada dengan aman.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
