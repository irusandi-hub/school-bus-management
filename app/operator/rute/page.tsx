import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, EmptyRow, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { operatorReadContext } from "@/lib/operator/read";
import type { RouteRow } from "@/lib/types";
import { routeDirectionLabel } from "@/lib/validation";

export const metadata: Metadata = { title: "Rute | Operator" };

export default async function OperatorRoutesPage() {
  const supabase = await operatorReadContext();
  if (!supabase) return <ConfigNotice />;

  const { data, error } = await supabase
    .from("routes")
    .select("id, route_name, school_name, direction, active, route_stops(id)")
    .order("route_name", { ascending: true });

  const routes = (data ?? []) as unknown as RouteRow[];

  return (
    <>
      <PageHeader
        title="Rute yang tersedia"
        description="Rute dan titik jemput dikelola Admin Pusat. Operator menggunakan rute ini saat membuat penugasan."
      />

      {error && <Notice kind="error">Daftar rute belum dapat dimuat.</Notice>}

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Daftar rute</h2>
            <div className="panel-subtitle">{routes.length} rute terdaftar</div>
          </div>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table table-stack">
            <thead>
              <tr>
                <th scope="col">Rute</th>
                <th scope="col">Sekolah</th>
                <th scope="col">Arah</th>
                <th scope="col">Titik</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {routes.length === 0 ? (
                <EmptyRow
                  colSpan={5}
                  title="Belum ada rute"
                  detail="Admin Pusat belum membuat rute. Penugasan memerlukan minimal satu rute aktif."
                />
              ) : (
                routes.map((route) => (
                  <tr key={route.id}>
                    <td data-label="Rute">
                      <strong>{route.route_name}</strong>
                      <div className="row-actions">
                        <Link className="row-link" href={`/operator/rute/${route.id}`}>
                          Lihat titik jemput
                        </Link>
                      </div>
                    </td>
                    <td data-label="Sekolah">{route.school_name}</td>
                    <td data-label="Arah">{routeDirectionLabel(route.direction)}</td>
                    <td data-label="Titik">{route.route_stops?.length ?? 0}</td>
                    <td data-label="Status">
                      <Pill tone={route.active ? "success" : "neutral"}>{route.active ? "Aktif" : "Nonaktif"}</Pill>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Notice kind="info">
        Perubahan rute, titik jemput, dan penempatan siswa dilakukan Admin Pusat. Area operator tidak menyediakan
        tombol yang tidak berfungsi untuk tindakan tersebut.
      </Notice>
    </>
  );
}
