"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useConfirm } from "@/components/ui/DialogProvider";
import { useFormStatus } from "react-dom";
import { useLocale } from "@/components/i18n/LocaleProvider";

type Props = {
  children: ReactNode;
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  className?: string;
  pendingLabel?: string;
  disabled?: boolean;
};

export function ConfirmSubmit({
  children,
  message,
  title,
  confirmText,
  cancelText,
  className = "btn btn-danger",
  pendingLabel = "Memproses…",
  disabled = false,
}: Props) {
  const { t } = useLocale();
  const { pending } = useFormStatus();
  const confirm = useConfirm();
  const locked = useRef(false);
  useEffect(() => { if (!pending) locked.current = false; }, [pending]);

  return (
    <button
      type="submit"
      className={className}
      disabled={pending || disabled}
      onClick={async (event) => {
        event.preventDefault();
        if (locked.current || pending || disabled) return;
        const button = event.currentTarget;
        const form = button.form;
        if (!form) return;
        locked.current = true;
        const accepted = await confirm({ title: title ?? t("confirmAction"), message, confirmText: confirmText ?? t("continue"), cancelText: cancelText ?? t("cancelLabel") });
        if (!accepted || !button.isConnected || !form.isConnected) { locked.current = false; return; }
        if (!form.noValidate && !form.reportValidity()) { locked.current = false; return; }
        form.requestSubmit(button);
      }}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
