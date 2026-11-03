"use client";

import { AreaError } from "@/components/ui/AreaStates";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <AreaError error={error} reset={reset} area="Area Admin Pusat" backHref="/admin" />;
}
