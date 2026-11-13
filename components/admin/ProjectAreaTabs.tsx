import { setProjectArea } from "@/lib/project-areas/actions";
import { cookies } from "next/headers";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/messages";
import { Icon } from "@/components/ui/Icon";
import type { ProjectAreaRow } from "@/lib/types";

/**
 * Compact Area Operasional selector shared by the manager dashboard and scoped
 * lists. It stays a plain form so switching context works without JavaScript
 * and survives navigation through the server-side cookie.
 */
export async function ProjectAreaTabs({
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
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("sbm_locale")?.value;
  const locale = isLocale(savedLocale) ? savedLocale : defaultLocale;
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <section className={compact ? "area-switch area-switch-compact" : "area-switch"} aria-label={t("areaContext")}>
      <span className="area-switch-label" title={t("areaContextHelp")}>
        <Icon name="pin" size={14} />
        <span>{t("area")}</span>
      </span>
      <form action={setProjectArea} className="area-switch-tabs" role="group" aria-label={t("chooseArea")}>
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
        {areas.length === 0 && <span className="area-tabs-empty">{t("noActiveAreas")}</span>}
      </form>
    </section>
  );
}
