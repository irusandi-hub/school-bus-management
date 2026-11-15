import { DevModeTab } from "./DevModeTab";
import {
  devAccessEnvironmentLabel,
  isDevOpenAccess,
} from "@/lib/dev-open-access";

/**
 * Informasi demo tetap tersedia di landing page produksi.
 * Akses simulasi dan kode OTP hanya aktif di Preview/lokal.
 */
export function DevModeBanner() {
  const demoAccessEnabled = isDevOpenAccess();

  return (
    <DevModeTab
      environment={devAccessEnvironmentLabel()}
      demoAccessEnabled={demoAccessEnabled}
    />
  );
}
