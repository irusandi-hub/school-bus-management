import { DEV_OPEN_ACCESS_NOTICE, isDevOpenAccess } from "@/lib/dev-open-access";

/**
 * Pita peringatan global untuk mode akses terbuka pengembangan (DEC-024).
 * Muncul di setiap halaman selama mode aktif supaya tidak ada tampilan yang bisa
 * disalahartikan sebagai data nyata.
 */
export function DevModeBanner() {
  if (!isDevOpenAccess()) return null;

  return (
    <div className="dev-mode-banner" role="status">
      <strong>Mode pengembangan · data simulasi</strong>
      <span>{DEV_OPEN_ACCESS_NOTICE}</span>
    </div>
  );
}
