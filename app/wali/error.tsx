"use client";

import { AreaError } from "@/components/ui/AreaStates";

export default function WaliError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <AreaError error={error} reset={reset} area="Portal Wali" backHref="/wali" />;
}
