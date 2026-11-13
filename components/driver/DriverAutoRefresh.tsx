"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

/**
 * Sinkronisasi data server untuk halaman pengemudi.
 *
 * Aplikasi belum memiliki channel realtime khusus `trip_student_events`.
 * Karena itu halaman memakai polling Server Component maksimal 2 detik selama
 * perjalanan aktif, plus sinkronisasi saat tab kembali aktif/koneksi pulih.
 * Ini bukan Realtime: tidak ada channel yang menerima event. Data tidak pernah
 * diubah secara optimistis di klien: angka baru hanya muncul setelah server
 * membaca catatan yang tersimpan.
 */
export function DriverAutoRefresh({
  active,
  intervalMs = 2_000,
}: {
  active: boolean;
  intervalMs?: number;
}) {
  const router = useRouter();
  const [online, setOnline] = useState(true);
  const [isPending, startTransition] = useTransition();
  const inFlight = useRef(false);
  const lastStarted = useRef(0);

  useEffect(() => {
    setOnline(navigator.onLine);
  }, []);

  useEffect(() => {
    if (!isPending) inFlight.current = false;
  }, [isPending]);

  useEffect(() => {
    if (!active) return;

    let timer: number | undefined;

    const refresh = () => {
      if (document.visibilityState === "hidden" || !navigator.onLine) return;
      const now = Date.now();
      if (inFlight.current || now - lastStarted.current < 750) return;

      inFlight.current = true;
      lastStarted.current = now;
      startTransition(() => router.refresh());
    };

    const schedule = () => {
      window.clearInterval(timer);
      timer = window.setInterval(refresh, intervalMs);
    };

    const onOnline = () => {
      setOnline(true);
      refresh();
      schedule();
    };
    const onOffline = () => setOnline(false);
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };

    schedule();
    window.addEventListener("schoolbus:student-saved", refresh);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("schoolbus:student-saved", refresh);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active, intervalMs, router]);

  return (
    <div className="ops-sync-status" role="status" aria-live="polite">
      {!online ? (
        <span className="is-offline">Koneksi terputus. Data terakhir tetap ditampilkan; menyambung ulang otomatis.</span>
      ) : active ? (
        <span className="is-online">Data server · sinkron otomatis</span>
      ) : null}
    </div>
  );
}
