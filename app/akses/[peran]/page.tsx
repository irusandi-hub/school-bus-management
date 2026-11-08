import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Membuka Area Pengguna | School Bus Management" };

const destinations: Record<string, string> = {
  wali: "/wali",
  pengemudi: "/pengemudi",
  operator: "/operator",
};

export default async function RoleAccessRedirect({
  params,
}: {
  params: Promise<{ peran: string }>;
}) {
  const { peran } = await params;
  const destination = destinations[peran];
  if (!destination) notFound();
  redirect(destination);
}
