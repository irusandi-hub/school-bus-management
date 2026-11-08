import { DevModeTab } from "./DevModeTab";
import {
  devAccessEnvironmentLabel,
  isDevOpenAccess,
} from "@/lib/dev-open-access";

/**
 * Penanda kecil untuk pengembang. Tidak mengambil ruang layout dan dapat
 * dibuka bila detail mode simulasi perlu dibaca.
 */
export function DevModeBanner() {
  if (!isDevOpenAccess()) return null;

  return <DevModeTab environment={devAccessEnvironmentLabel()} sha={process.env.VERCEL_GIT_COMMIT_SHA} branch={process.env.VERCEL_GIT_COMMIT_REF} />;
}
