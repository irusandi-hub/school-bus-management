"use client";

import { AreaError } from "@/components/ui/AreaStates";

export default function OperatorError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <AreaError error={error} reset={reset} area="Area Operator" backHref="/operator" />;
}
