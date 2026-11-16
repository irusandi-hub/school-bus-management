import { DevModeTab } from "./DevModeTab";
import {
  devAccessEnvironmentLabel,
  isDevOpenAccess,
} from "@/lib/dev-open-access";
import { isDemoOtpAvailable } from "@/lib/demo-session-token";

/**
 * Informasi demo tetap tersedia di landing page produksi.
 * Kode OTP demo ditampilkan bila sesi demo bertanda tangan sudah dikonfigurasi.
 */
export function DevModeBanner() {
  const demoAccessEnabled = isDevOpenAccess() || isDemoOtpAvailable();

  return (
    <DevModeTab
      environment={devAccessEnvironmentLabel()}
      demoAccessEnabled={demoAccessEnabled}
    />
  );
}
