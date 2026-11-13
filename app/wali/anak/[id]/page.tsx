import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs, ConfigNotice, Notice, Pill, ServiceStatusPill } from "@/components/admin/ui";
import { ParentLiveVideo } from "@/components/guardian/ParentLiveVideo";
import { VideoAccessNotice } from "@/components/guardian/VideoAccessNotice";
import { requireGuardian } from "@/lib/auth";
import { isDevOpenAccess } from "@/lib/dev-open-access";
import { createServerSupabase } from "@/lib/supabase/server";
import { loadChildTrips, loadChildren, loadTodayStudentEvents, todayDate } from "@/lib/guardian/data";
import { resolveLivePlayback } from "@/lib/guardian/live";
import { buildChildLiveVideo } from "@/lib/guardian/live-view";
import type { TripEventRow } from "@/lib/types";
import {
  formatDate,
  formatDateTime,
  formatTime,
  routeDirectionLabel,
  tripEventLabel,
  tripStatusLabel,
} from "@/lib/validation";

export const metadata: Metadata = { title: "Detail Anak | Portal Wali" };

function tripTone(status: string) {
  if (status === "completed") return "success" as const;
  if (status === "in_progress") return "info" as const;
  if (status === "cancelled") return "danger" as const;
  if (status === "delayed") return "warning" as const;
  return "neutral" as const;
}

export default async function ChildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireGuardian();
  if (access.status === "unconfigured") return <ConfigNotice />;

  const supabase = await createServerSupabase();
  if (!supabase) return <ConfigNotice />;

  const children = await loadChildren(supabase);
  const child = children.find((entry) => entry.student.id === id);
  if (!child) notFound();

  const liveEvents = await loadTodayStudentEvents(supabase, [child]);
  const simulated = isDevOpenAccess();
  const liveVideo = buildChildLiveVideo(child, liveEvents, { simulated });
  const livePlayback = resolveLivePlayback({
    state: liveVideo.state,
    streamUrl: liveVideo.streamUrl,
    simulated,
  });

  const routeIds = child.placements.map((placement) => placement.routeId);
  const [trips, eventsResult] = await Promise.all([
    loadChildTrips(supabase, routeIds, 15),
    supabase
      .from("trip_student_events")
      .select("id, trip_id, student_id, event_type, occurred_at, notes")
      .eq("student_id", id)
      .order("occurred_at", { ascending: false })
      .limit(15),
  ]);

  const events = (eventsResult.data ?? []) as unknown as TripEventRow[];
  const student = child.student;

  return (
    <>
      <Breadcrumbs items={[{ href: "/wali", label: "Anak saya" }, { label: student.full_name }]} />

      <section className="child-detail-head">
        <span className="child-avatar child-avatar-lg" aria-hidden="true">
          {student.full_name.slice(0, 1).toUpperCase()}
        </span>
        <div>
          <p className="eyebrow">ADMISSIONS NUMBER {student.admissions_number}</p>
          <h1>{student.full_name}</h1>
          <p>{student.schools?.name ?? "Sekolah belum ditetapkan"}</p>
        </div>
        <ServiceStatusPill status={student.service_status} />
      </section>

      {eventsResult.error && <Notice kind="error">Riwayat kehadiran belum dapat dimuat.</Notice>}

      <section className="panel live-panel" aria-label={`Live video ${student.full_name}`}>
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Live video</h2>
            <div className="panel-subtitle">Kamera perjalanan · akses mengikuti status anak hari ini</div>
          </div>
        </header>
        <div className="live-panel-body">
          <ParentLiveVideo
            childName={student.full_name}
            tripId={liveVideo.tripId}
            studentId={student.id}
            state={livePlayback.state}
            tripLabel={liveVideo.tripLabel}
            busLabel={liveVideo.busLabel}
            streamUrl={liveVideo.streamUrl}
            streamMimeType={liveVideo.streamMimeType}
            updatedAt={liveVideo.updatedAt}
            simulated={simulated}
          />
          <VideoAccessNotice state={livePlayback.state} childName={student.full_name} />
        </div>
      </section>

      <div className="detail-grid">
        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Layanan &amp; sekolah</h2>
              <div className="panel-subtitle">Data yang tercatat untuk anak Anda</div>
            </div>
          </header>
          <dl className="detail-list">
            <div>
              <dt>Sekolah</dt>
              <dd>{student.schools?.name ?? "Belum ditetapkan"}</dd>
            </div>
            <div>
              <dt>Kota sekolah</dt>
              <dd>{student.schools?.city ?? "—"}</dd>
            </div>
            <div>
              <dt>Status diperbarui</dt>
              <dd>{formatDateTime(student.service_status_changed_at)}</dd>
            </div>
            <div>
              <dt>Wali terhubung</dt>
              <dd>{student.guardians?.full_name ?? "—"}</dd>
            </div>
            <div>
              <dt>Telepon wali</dt>
              <dd>{student.guardians?.phone ?? "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Penjemputan</h2>
              <div className="panel-subtitle">Titik dan catatan yang diberikan ke operasional</div>
            </div>
          </header>
          <div className="pickup-body">
            {child.placements.length === 0 ? (
              <p className="muted-hint">
                Rute dan titik jemput belum diatur Operator Utama. Hubungi Operator Utama bila anak Anda sudah menggunakan
                layanan.
              </p>
            ) : (
              <ul className="pickup-list">
                {child.placements.map((placement) => (
                  <li key={placement.id}>
                    <span>{routeDirectionLabel(placement.direction)}</span>
                    <div>
                      <strong>
                        {placement.stopOrder}. {placement.stopName}
                      </strong>
                      <small>{placement.routeName}</small>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <dl className="detail-list pickup-details">
              <div>
                <dt>Alamat rumah</dt>
                <dd>{student.home_address ?? "Belum diisi"}</dd>
              </div>
              <div>
                <dt>Catatan titik jemput</dt>
                <dd>{student.pickup_notes ?? "Belum diisi"}</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Perjalanan hari ini</h2>
            <div className="panel-subtitle">{formatDate(todayDate())}</div>
          </div>
        </header>
        {child.todayTrips.length === 0 ? (
          <div className="table-empty">
            <strong>Belum ada perjalanan hari ini</strong>
            <p>Perjalanan muncul setelah penugasan dibuat dan pengemudi memulai tugas.</p>
          </div>
        ) : (
          <ul className="today-trip-list">
            {child.todayTrips.map((trip) => (
              <li key={`${trip.routeId}-${trip.direction}`}>
                <div>
                  <strong>{routeDirectionLabel(trip.direction)}</strong>
                  <small>{trip.busCode ? `Bus ${trip.busCode}` : "Bus belum ditetapkan"}</small>
                </div>
                <Pill tone={trip.status === "in_progress" ? "info" : tripTone(trip.status)}>
                  {trip.status === "scheduled" ? "Belum dimulai" : tripStatusLabel(trip.status)}
                </Pill>
                <small>
                  Mulai {formatTime(trip.startedAt)} · Tiba {formatTime(trip.arrivedAt)}
                </small>
              </li>
            ))}
          </ul>
        )}
        <p className="detail-footnote">
          Lokasi perjalanan aktif mengikuti GPS HP pengemudi dan tersedia di kartu anak. Status perjalanan berasal dari
          catatan pengemudi, dan akses Live Video mengikuti status anak di bus — bukan posisi yang dilacak.
        </p>
      </section>

      <div className="detail-grid">
        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Riwayat perjalanan</h2>
              <div className="panel-subtitle">15 perjalanan terbaru pada rute anak Anda</div>
            </div>
          </header>
          <div className="admin-table-wrap">
            <table className="admin-table admin-table-compact table-stack">
              <thead>
                <tr>
                  <th scope="col">Tanggal</th>
                  <th scope="col">Rute</th>
                  <th scope="col">Status</th>
                  <th scope="col">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {trips.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="table-empty">
                        <strong>Belum ada riwayat perjalanan</strong>
                        <p>Riwayat tersimpan setelah pengemudi menyelesaikan perjalanan.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  trips.map((trip) => (
                    <tr key={trip.id}>
                      <td data-label="Tanggal">{formatDate(trip.serviceDate)}</td>
                      <td data-label="Rute">
                        <strong>{trip.routeName}</strong>
                        <small>{trip.direction === "morning" ? "Pagi" : "Sore"}</small>
                      </td>
                      <td data-label="Status">
                        <Pill tone={tripTone(trip.status)}>{tripStatusLabel(trip.status)}</Pill>
                      </td>
                      <td data-label="Waktu">
                        <small>Mulai {formatTime(trip.startedAt)}</small>
                        <small>Tiba {formatTime(trip.arrivedAt)}</small>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Riwayat kehadiran</h2>
              <div className="panel-subtitle">Catatan pengemudi untuk anak Anda</div>
            </div>
          </header>
          {events.length === 0 ? (
            <div className="table-empty">
              <strong>Belum ada catatan kehadiran</strong>
              <p>Catatan muncul setelah pengemudi menandai status siswa selama perjalanan.</p>
            </div>
          ) : (
            <ul className="event-list">
              {events.map((event) => (
                <li key={event.id}>
                  <Pill
                    tone={
                      event.event_type === "boarded"
                        ? "success"
                        : event.event_type === "dropped_off"
                          ? "info"
                          : event.event_type === "absent"
                            ? "warning"
                            : "danger"
                    }
                  >
                    {tripEventLabel(event.event_type)}
                  </Pill>
                  <div>
                    <small>{formatDateTime(event.occurred_at)}</small>
                    {event.notes && <p>{event.notes}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Notice kind="info">
        Akses ini hanya mencakup anak yang terhubung dengan akun Anda dan berstatus layanan aktif. Mengubah alamat
        halaman tidak membuka data anak lain.
      </Notice>
    </>
  );
}
