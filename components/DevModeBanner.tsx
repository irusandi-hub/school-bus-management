import {
  DEV_OPEN_ACCESS_NOTICE,
  devAccessEnvironmentLabel,
  isDevOpenAccess,
} from "@/lib/dev-open-access";

/**
 * Penanda kecil untuk pengembang. Tidak mengambil ruang layout dan dapat
 * dibuka bila detail mode simulasi perlu dibaca.
 */
export function DevModeBanner() {
  if (!isDevOpenAccess()) return null;

  return (
    <details className="dev-mode-banner">
      <summary aria-label="Informasi mode pengembangan">
        <span className="dev-mode-indicator" aria-hidden="true" />
        <strong>DEMO · {devAccessEnvironmentLabel()}</strong>
      </summary>
      <div className="dev-mode-details" role="status">
        <strong>Mode pengembangan aktif</strong>
        <p>{DEV_OPEN_ACCESS_NOTICE}</p>
      </div>
    </details>
  );
}
