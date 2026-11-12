/**
 * Tindakan siswa yang relevan pada setiap tahap perjalanan.
 *
 * Aturan ini hanya menyaring tombol yang ditampilkan. Jenis catatan yang
 * disimpan tetap mengikuti kontrak database yang sudah ada
 * (boarded/dropped_off/absent/issue) — tidak ada status baru yang dikarang.
 * "Diantar orang tua" dicatat sebagai tidak ikut bus beserta alasan pada notes,
 * karena statusnya memang berarti siswa tidak berada di bus pada perjalanan ini.
 */

export type StudentActionInput = {
  direction: string;
  /** Status kehadiran terakhir (boarded/dropped_off/absent), bukan catatan kendala. */
  status: string | null;
  /** scheduled | in_progress | completed */
  tripStatus: string;
  /** Kedatangan di sekolah sudah dikonfirmasi. */
  arrived: boolean;
};

export type StudentActionSet = {
  canBoard: boolean;
  canDrop: boolean;
  canAbsent: boolean;
  dropLabel: string;
  hint: string | null;
};

export const ABSENCE_REASONS = [
  { label: "Tidak hadir", notes: "Tidak hadir pada perjalanan ini." },
  { label: "Tidak ikut bus", notes: "Tidak ikut bus pada perjalanan ini." },
  { label: "Diantar orang tua ke sekolah", notes: "Diantar orang tua ke sekolah." },
] as const;

export function studentActionSet(input: StudentActionInput): StudentActionSet {
  const afternoon = input.direction === "afternoon";
  const dropLabel = afternoon ? "Turun di titik" : "Turun di sekolah";

  if (input.tripStatus === "completed") {
    return { canBoard: false, canDrop: false, canAbsent: false, dropLabel, hint: "Perjalanan sudah selesai; status akhir tidak dapat diubah." };
  }

  if (input.tripStatus !== "in_progress") {
    return {
      canBoard: false,
      canDrop: false,
      canAbsent: false,
      dropLabel,
      hint: "Mulai perjalanan untuk mencatat status siswa.",
    };
  }

  if (input.status === "absent") {
    return { canBoard: false, canDrop: false, canAbsent: false, dropLabel, hint: "Siswa tercatat tidak ikut bus pada perjalanan ini." };
  }

  if (input.status === "dropped_off") {
    return { canBoard: false, canDrop: false, canAbsent: false, dropLabel, hint: "Siswa sudah tercatat turun." };
  }

  if (input.status === "boarded") {
    if (afternoon) {
      return { canBoard: false, canDrop: true, canAbsent: true, dropLabel, hint: null };
    }
    if (input.arrived) {
      return { canBoard: false, canDrop: true, canAbsent: false, dropLabel, hint: null };
    }
    return {
      canBoard: false,
      canDrop: false,
      canAbsent: true,
      dropLabel,
      hint: "Siswa sudah naik. Jika orang tua membatalkan sebelum tiba, catat Tidak Ikut untuk membatalkan keikutsertaan.",
    };
  }

  return {
    canBoard: true,
    canDrop: false,
    canAbsent: true,
    dropLabel,
    hint: afternoon ? "Catat naik saat siswa masuk bus di sekolah." : null,
  };
}
