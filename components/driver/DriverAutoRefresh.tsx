"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Sinkronisasi data server untuk halaman pengemudi.
 *
 * Aplikasi belum memiliki channel realtime khusus `trip_student_events`.
 * Karena itu halaman memakai refresh Server Component berkala dan saat tab
 * kembali aktif/koneksi pulih. Data tidak pernah diubah secara optimistis di
 * klien: angka baru hanya muncul setelah server membaca catatan yang tersimpan.
 */
export function DriverAutoRefresh({
  active,
  intervalMs = 10_000,
}: {
  active: boolean;
  intervalMs?: number;
}) {
  const router = useRouter();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
  }, []);

  useEffect(() => {
    if (!active) return;

    let running = false;
    let timer: number | undefined;

    const refresh = () => {
      if (running || document.visibilityState === "hidden" || !navigator.onLine) return;
      running = true;
      router.refresh();
      window.setTimeout(() => {
        running = false;
      }, 1_500);
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
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(timer);
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
