import type { Metadata } from "next";
import { LandingRedesign } from "@/components/landing-redesign";
import { isDevOpenAccess } from "@/lib/dev-open-access";
import "./landing.css";

export const metadata: Metadata = {
  title: "SchoolBus | Perjalanan Sekolah Terpantau",
  description: "Pantau perjalanan anak, bantu pengemudi, dan kelola bus sekolah dalam satu aplikasi.",
};
export default function LandingPage() {
  return <LandingRedesign roleEntryEnabled={isDevOpenAccess()} />;
}
