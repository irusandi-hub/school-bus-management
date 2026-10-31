import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, Notice, Pill } from "@/components/admin/ui";
import { requireGuardian } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { loadChildren, todayDate } from "@/lib/guardian/data";
import { formatDate, formatTime, routeDirectionLabel, serviceStatusLabel, tripStatusLabel } from "@/lib/validation";

export const metadata: Metadata = { title: "Anak Saya | Portal Wali" };

export default async function GuardianHomePage() {
  const access = await requireGuardian();
  if (access.status === "unconfigured") return <ConfigNotice />;

  const supabase = await createServerSupabase();
  if (!supabase) return <ConfigNotice />;

  const children = await loadChildren(supabase);
  const name = access.viewer.profile?.full_name || access.viewer.email || "Wali";

  return (
    <>
      <section className="guardian-hero">
        <div>
          <p className="eyebrow">PORTAL ORANG TUA/WALI</p>
          <h1>Halo, {name}.</h1>
          <p>
            {children.length === 0
              ? "Belum ada anak dengan layanan aktif yang terhubung dengan akun ini."
              : `${children.length} anak dengan layanan aktif terhubung dengan akun ini.`}{" "}
            Data di bawah hanya berasal dari anak Anda.
          </p>
        </div>
        <div className="guardian-hero-date">
          <span>Hari ini</span>
          <strong>{formatDate(todayDate())}</strong>
        </div>
      </section>

      {children.length === 0 ? (
        <section className="panel access-panel">
          <h2>Layanan belum aktif untuk akun ini</h2>
          <p>
            Tidak ada siswa dengan status layanan aktif yang terhubung dengan akun Anda. Akses layanan dibuka setelah
            minimal satu siswa berstatus aktif. Hubungi Admin Pusat untuk memeriksa status layanan.
          </p>
          <p className="muted-hint">Halaman ini tidak menampilkan data siswa lain.</p>
        </section>
      ) : (
        <section className={`child-grid ${children.length === 1 ? "single" : ""}`} aria-label="Kartu anak">
          {children.map((child) => {
            const morning = child.placements.find((placement) => placement.direction === "morning");
            const afternoon = child.placements.find((placement) => placement.direction === "afternoon");
            const trips = child.todayTrips;
            const primaryTrip = trips.find((trip) => trip.status === "in_progress") ?? trips[0];
            const tripLabel = primaryTrip
              ? primaryTrip.status === "scheduled"
                ? "Belum dimulai"
                : tripStatusLabel(primaryTrip.status)
              : null;

            return (
              <article className="child-card" key={child.student.id}>
                <header className="child-card-head">
                  <span className="child-avatar" aria-hidden="true">
                    {child.student.full_name.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <h2>{child.student.full_name}</h2>
                    <small>{child.student.admissions_number}</small>
                  </div>
                  <Pill tone={child.student.service_status === "active" ? "success" : "warning"}>
                    {serviceStatusLabel(child.student.service_status)}
                  </Pill>
                </header>

                <dl className="child-facts">
                  <div>
                    <dt>Sekolah</dt>
                    <dd>{child.student.schools?.name ?? "Belum ditetapkan"}</dd>
                  </div>
                  <div>
                    <dt>Titik jemput</dt>
                    <dd>
                      {morning
                        ? `${morning.stopOrder}. ${morning.stopName}`
                        : afternoon
                          ? `${afternoon.stopOrder}. ${afternoon.stopName}`
                          : "Belum ditempatkan"}
                    </dd>
                  </div>
                </dl>

                <div className="child-trip">
                  <div className="child-trip-head">
                    <strong>Perjalanan hari ini</strong>
                    {trips.length === 0 ? (
                      <Pill tone="neutral">Belum ada penugasan</Pill>
                    ) : (
                      <Pill
                        tone={
                          primaryTrip?.status === "in_progress"
                            ? "info"
                            : primaryTrip?.status === "completed"
                              ? "success"
                              : "neutral"
                        }
                      >
                        {tripLabel}
                      </Pill>
                    )}
                  </div>

                  {trips.length === 0 ? (
                    <p className="muted-hint">
                      {child.placements.length === 0
                        ? "Rute dan titik jemput belum diatur. Hubungi Admin Pusat."
                        : "Belum ada perjalanan terjadwal untuk rute anak Anda hari ini."}
                    </p>
                  ) : (
                    <ul className="child-trip-list">
                      {trips.map((trip) => (
                        <li key={`${trip.routeId}-${trip.direction}`}>
                          <span>{routeDirectionLabel(trip.direction)}</span>
                          <div>
                            <strong>
                              {trip.status === "scheduled" ? "Belum dimulai" : tripStatusLabel(trip.status)}
                            </strong>
                            <small>
                              {trip.busCode ? `Bus ${trip.busCode}` : "Bus belum ditetapkan"}
                              {trip.startedAt ? ` · mulai ${formatTime(trip.startedAt)}` : ""}
                              {trip.arrivedAt ? ` · tiba ${formatTime(trip.arrivedAt)}` : ""}
                            </small>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <p className="child-gps-note">
                    Posisi bus langsung belum tersedia karena integrasi GPS belum aktif. Status di atas berasal dari
                    catatan perjalanan pengemudi.
                  </p>
                </div>

                <Link className="child-detail-link" href={`/wali/anak/${child.student.id}`}>
                  Lihat detail &amp; riwayat perjalanan
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            );
          })}
        </section>
      )}

      <Notice kind="info">
        Portal ini tidak menampilkan menu internal, data anak wali lain, atau informasi operasional yang tidak
        relevan. Tautan kamera tidak ditampilkan karena integrasi kamera belum tersedia.
      </Notice>
    </>
  );
}
