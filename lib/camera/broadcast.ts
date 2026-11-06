export type BroadcastPhase = "unavailable" | "scheduled" | "active" | "completed";

export type BroadcastState = {
  phase: BroadcastPhase;
  title: string;
  detail: string;
  canPublish: boolean;
};

/**
 * Panel siaran selalu ditampilkan. Fungsi ini hanya menentukan status dan alasan
 * mengapa tombol siaran belum dapat dipakai, bukan menyembunyikan fiturnya.
 * Otorisasi dan validasi perjalanan tetap dilakukan server.
 */
export function resolveBroadcastState(input: {
  enabled: boolean;
  tripStatus?: string | null;
}): BroadcastState {
  if (!input.enabled) {
    return {
      phase: "unavailable",
      title: "Siaran kamera belum diaktifkan",
      detail:
        "Fitur siaran kamera belum tersedia untuk layanan ini. Hubungi pengelola sistem bila kamera perjalanan seharusnya sudah aktif.",
      canPublish: false,
    };
  }

  if (input.tripStatus === "in_progress") {
    return {
      phase: "active",
      title: "Perjalanan aktif",
      detail: "Siaran dapat dimulai setelah persetujuan pengemudi dan hanya berlangsung selama perjalanan ini.",
      canPublish: true,
    };
  }

  if (input.tripStatus === "completed") {
    return {
      phase: "completed",
      title: "Perjalanan sudah selesai",
      detail: "Siaran kamera hanya tersedia selama perjalanan berlangsung. Sesi baru dapat dibuka pada perjalanan berikutnya.",
      canPublish: false,
    };
  }

  if (input.tripStatus === "cancelled") {
    return {
      phase: "completed",
      title: "Perjalanan dibatalkan",
      detail: "Siaran kamera tidak dibuka karena perjalanan ini dibatalkan.",
      canPublish: false,
    };
  }

  return {
    phase: "scheduled",
    title: "Perjalanan belum dimulai",
    detail: "Mulai perjalanan terlebih dahulu. Siaran kamera baru dapat dipakai saat perjalanan berlangsung.",
    canPublish: false,
  };
}
