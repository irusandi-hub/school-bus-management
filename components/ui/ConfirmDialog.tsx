"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./ConfirmDialog.module.css";

export type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: (value?: string) => void;
  onCancel: () => void;
  mode?: "confirm" | "alert" | "prompt";
  defaultValue?: string;
};

export function ConfirmDialog({ title, message, confirmText, cancelText, onConfirm, onCancel, mode = "confirm", defaultValue = "" }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const ok = useRef<HTMLButtonElement>(null);
  const settled = useRef(false);
  const [value, setValue] = useState(defaultValue);
  const id = useId();
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = ref.current!;
    dialog.showModal();
    (mode === "prompt" ? input.current : mode === "alert" ? ok.current : cancel.current)?.focus();
    return () => {
      dialog.close();
      queueMicrotask(() => { if (previous?.isConnected) previous.focus(); });
    };
  }, [mode]);
  function finish(confirmed: boolean) {
    if (settled.current) return;
    settled.current = true;
    if (confirmed) onConfirm(mode === "prompt" ? value : undefined);
    else onCancel();
  }
  return createPortal(
    <dialog ref={ref} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-message`}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])'));
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}
      onCancel={(event) => { event.preventDefault(); finish(false); }}
      onClick={(event) => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) finish(false); } }}>
      <form onSubmit={(event) => { event.preventDefault(); finish(true); }}>
        <h2 id={`${id}-title`}>{title}</h2>
        <p id={`${id}-message`}>{message}</p>
        {mode === "prompt" && <input ref={input} aria-label={title} value={value} onChange={(event) => setValue(event.target.value)} />}
        <div className={styles.actions}>
          {mode !== "alert" && <button ref={cancel} type="button" className="btn btn-secondary" onClick={() => finish(false)}>{cancelText}</button>}
          <button ref={ok} type="submit" className="btn btn-primary">{confirmText}</button>
        </div>
      </form>
    </dialog>, document.body,
  );
}
