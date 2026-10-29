import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "School Bus | Manajemen Transportasi Sekolah",
  description: "Dasbor operasional bus sekolah untuk admin, pengemudi, dan orang tua/wali.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
