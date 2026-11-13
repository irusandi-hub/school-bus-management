import { redirect } from "next/navigation";

/** URL lama tetap kompatibel, tetapi riwayat sekarang merupakan tab dashboard. */
export default function DriverHistoryRedirect() {
  redirect("/pengemudi?tab=riwayat");
}
