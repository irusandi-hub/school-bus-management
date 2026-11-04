import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, Notice, Pill, ServiceStatusPill } from "@/components/admin/ui";
import { ParentLiveVideo } from "@/components/guardian/ParentLiveVideo";
import { requireGuardian } from "@/lib/auth";
import { isDevOpenAccess } from "@/lib/dev-open-access";
import { createServerSupabase } from "@/lib/supabase/server";
import { loadChildren, loadTodayStudentEvents, todayDate } from "@/lib/guardian/data";
import { buildChildLiveVideo } from "@/lib/guardian/live-view";
import { formatDate, formatTime, routeDirectionLabel, tripStatusLabel } from "@/lib/validation";

export const metadata: Metadata = { title: "Anak Saya | Portal Wali" };

export default async function GuardianHomePage() {
  const access = await requireGuardian();
  if (access.status === "unconfigured") return <ConfigNotice />;

  const supabase = await createServerSupabase();
  if (!supabase) return <ConfigNotice />;

  const children = await loadChildren(supabase);
  const liveEvents = await loadTodayStudentEvents(supabase, children);
  const simulated = isDevOpenAccess();
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

            const liveVideo = buildChildLiveVideo(child, liveEvents);

            const directionState = (direction: string) => {
              const trip = trips.find((entry) => entry.direction === direction);
              if (!trip) return "Belum dijadwalkan";
              return trip.status === "scheduled" ? "Belum dimulai" : tripStatusLabel(trip.status);
            };

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
                  <ServiceStatusPill status={child.student.service_status} />
                </header>

                <ParentLiveVideo
                  childName={child.student.full_name}
                  state={liveVideo.state}
                  tripLabel={liveVideo.tripLabel}
                  busLabel={liveVideo.busLabel}
                  streamUrl={liveVideo.streamUrl}
                  streamMimeType={liveVideo.streamMimeType}
                  updatedAt={liveVideo.updatedAt}
                  simulated={simulated}
                  compact
                />

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

                <div className="child-status-strip" aria-label="Status perjalanan per arah">
                  <div>
                    <span>Perjalanan pagi</span>
                    <strong>{directionState("morning")}</strong>
                  </div>
                  <div>
                    <span>Perjalanan sore</span>
                    <strong>{directionState("afternoon")}</strong>
                  </div>
                </div>

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
        Live Video mengikuti status anak di bus: akses dibuka setelah anak tercatat naik dan berakhir saat anak turun.
        Kamera kabin belum terintegrasi, sehingga area video menampilkan status kamera — bukan siaran atau rekaman.
      </Notice>
    </>
  );
}
