import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ConfigNotice, Notice, Pill } from "@/components/admin/ui";
import { requireGuardian } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { loadChildTrips, loadChildren, todayDate } from "@/lib/guardian/data";
import type { TripEventRow } from "@/lib/types";
import {
  formatDate,
  formatDateTime,
  formatTime,
  routeDirectionLabel,
  serviceStatusLabel,
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
      <div className="breadcrumb">
        <Link href="/wali">‹ Kembali ke anak saya</Link>
      </div>

      <section className="child-detail-head">
        <span className="child-avatar child-avatar-lg" aria-hidden="true">
          {student.full_name.slice(0, 1).toUpperCase()}
        </span>
        <div>
          <p className="eyebrow">ADMISSIONS NUMBER {student.admissions_number}</p>
          <h1>{student.full_name}</h1>
          <p>{student.schools?.name ?? "Sekolah belum ditetapkan"}</p>
        </div>
        <Pill tone={student.service_status === "active" ? "success" : "warning"}>
          {serviceStatusLabel(student.service_status)}
        </Pill>
      </section>

      {eventsResult.error && <Notice kind="error">Riwayat kehadiran belum dapat dimuat.</Notice>}

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
              <dt>Status layanan</dt>
              <dd>{serviceStatusLabel(student.service_status)}</dd>
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
                Rute dan titik jemput belum diatur Admin Pusat. Hubungi Admin Pusat bila anak Anda sudah menggunakan
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
          Posisi bus langsung belum tersedia. Tautan kamera tidak ditampilkan karena integrasi kamera belum aktif.
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
            <table className="admin-table admin-table-compact">
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
                      <td>{formatDate(trip.serviceDate)}</td>
                      <td>
                        <strong>{trip.routeName}</strong>
                        <small>{trip.direction === "morning" ? "Pagi" : "Sore"}</small>
                      </td>
                      <td>
                        <Pill tone={tripTone(trip.status)}>{tripStatusLabel(trip.status)}</Pill>
                      </td>
                      <td>
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
