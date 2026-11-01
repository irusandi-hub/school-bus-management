"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  children: ReactNode;
  message: string;
  className?: string;
  pendingLabel?: string;
};

export function ConfirmSubmit({ children, message, className = "btn btn-danger", pendingLabel = "Memproses…" }: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
