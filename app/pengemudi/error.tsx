"use client";

import { AreaError } from "@/components/ui/AreaStates";

export default function PengemudiError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <AreaError error={error} reset={reset} area="Area Pengemudi" backHref="/pengemudi" />;
}
