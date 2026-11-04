import { redirect } from "next/navigation";

/**
 * Tautan lama ke detail tugas diarahkan ke satu halaman operasional.
 * Halaman terpisah tidak lagi dipakai agar pengemudi tidak berpindah halaman
 * untuk mencatat status, memeriksa keselamatan, atau mengakhiri perjalanan.
 */
export default async function DriverTaskRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/pengemudi?tugas=${encodeURIComponent(id)}`);
}
