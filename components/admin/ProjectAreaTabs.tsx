import { setProjectArea } from "@/lib/project-areas/actions";
import { Icon } from "@/components/ui/Icon";
import type { ProjectAreaRow } from "@/lib/types";

/**
 * Project Area selector shown on the manager dashboard and on area-scoped lists.
 * It is a form so switching context works without client JavaScript and the
 * selected area survives navigation through a server-side cookie.
 */
export function ProjectAreaTabs({
  areas,
  selectedId,
  nextPath,
  compact = false,
}: {
  areas: ProjectAreaRow[];
  selectedId: string | null;
  nextPath: string;
  compact?: boolean;
}) {
  return (
    <section className={compact ? "area-tabs-card area-tabs-compact" : "area-tabs-card"} aria-label="Konteks Project Area">
      <div className="area-tabs-copy">
        <span className="area-tabs-icon" aria-hidden="true"><Icon name="pin" size={15} /></span>
        <div>
          <strong>Konteks Project Area</strong>
          <small>
            {selectedId
              ? "Daftar, statistik, laporan, dan formulir mengikuti area yang dipilih."
              : "Semua Area menampilkan agregasi global. Pilih area untuk mempersempit konteks kerja."}
          </small>
        </div>
      </div>
      <form action={setProjectArea} className="area-tabs" role="group" aria-label="Pilih Project Area">
        <input type="hidden" name="next" value={nextPath} />
        <button type="submit" name="area" value="all" className={selectedId ? "area-tab" : "area-tab active"} aria-pressed={!selectedId}>
          Semua Area
        </button>
        {areas.map((area) => (
          <button
            key={area.id}
            type="submit"
            name="area"
            value={area.id}
            className={selectedId === area.id ? "area-tab active" : "area-tab"}
            aria-pressed={selectedId === area.id}
          >
            {area.name}
          </button>
        ))}
        {areas.length === 0 && <span className="area-tabs-empty">Belum ada Project Area aktif.</span>}
      </form>
    </section>
  );
}
