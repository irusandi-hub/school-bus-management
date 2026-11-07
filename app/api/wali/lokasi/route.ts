import { NextResponse } from "next/server";
import { requireGuardian } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type LocationRow = {
  trip_id: string;
  trip_status: string;
  latitude: number | null;
  longitude: number | null;
  accuracy_meters: number | null;
  recorded_at: string | null;
  is_fresh: boolean;
};

function noStore(payload: unknown, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

/**
 * Membaca lokasi terbaru untuk satu perjalanan.
 *
 * Halaman hanya mengirim id perjalanan. Keputusan boleh/tidaknya membaca
 * dilakukan oleh RPC `guardian_trip_location` di database berdasarkan akun wali
 * yang sedang masuk; route ini tidak menerima id wali atau id siswa dari browser.
 */
export async function GET(request: Request) {
  const tripId = new URL(request.url).searchParams.get("trip_id")?.trim() ?? "";
  if (!UUID_PATTERN.test(tripId)) {
    return noStore({ error: "Perjalanan tidak valid." }, 400);
  }

  const access = await requireGuardian();
  if (access.status === "unconfigured") {
    return noStore({ error: "Koneksi database belum dikonfigurasi." }, 503);
  }
  if (access.status !== "ready") {
    return noStore({ error: "Akses wali tidak tersedia." }, 403);
  }

  const supabase = await createServerSupabase();
  if (!supabase) return noStore({ error: "Koneksi database belum dikonfigurasi." }, 503);

  const { data, error } = await supabase.rpc("guardian_trip_location", { p_trip_id: tripId });
  if (error) {
    // Semua penolakan relasi memakai status yang sama agar id perjalanan anak
    // lain tidak dapat ditebak dari perbedaan respons.
    if (error.code === "42501") return noStore({ error: "Lokasi tidak tersedia." }, 404);
    return noStore({ error: "Lokasi belum dapat dimuat." }, 503);
  }

  const row = (Array.isArray(data) ? data[0] : data) as LocationRow | null | undefined;
  if (!row) return noStore({ error: "Lokasi tidak tersedia." }, 404);

  return noStore({
    tripStatus: row.trip_status,
    latitude: row.is_fresh ? row.latitude : null,
    longitude: row.is_fresh ? row.longitude : null,
    accuracyMeters: row.is_fresh ? row.accuracy_meters : null,
    recordedAt: row.recorded_at,
    isFresh: Boolean(row.is_fresh),
  });
}
