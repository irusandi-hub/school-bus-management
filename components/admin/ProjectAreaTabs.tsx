import { setProjectArea } from "@/lib/project-areas/actions";
import { Icon } from "@/components/ui/Icon";
import type { ProjectAreaRow } from "@/lib/types";

/**
 * Compact Project Area selector shared by the manager dashboard and scoped
 * lists. It stays a plain form so switching context works without JavaScript
 * and survives navigation through the server-side cookie.
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
    <section className={compact ? "area-switch area-switch-compact" : "area-switch"} aria-label="Konteks Project Area">
      <span className="area-switch-label" title="Konteks data dan formulir mengikuti area yang dipilih">
        <Icon name="pin" size={14} />
        <span>Area</span>
      </span>
      <form action={setProjectArea} className="area-switch-tabs" role="group" aria-label="Pilih Project Area">
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
        {areas.length === 0 && <span className="area-tabs-empty">Belum ada area aktif.</span>}
      </form>
    </section>
  );
}
