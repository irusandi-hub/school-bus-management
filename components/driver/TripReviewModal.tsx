"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import styles from "./TripReviewModal.module.css";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";

/** Overlay juga berlaku untuk akses langsung/reload URL review, tanpa bergantung pada riwayat navigasi. */
export function TripReviewModal({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const copy = (value: string) => translateAdminCopy(value, locale) ?? value;
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  useEffect(() => {
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function closeReview() {
    // Tujuan eksplisit: tetap benar meskipun review dibuka dari riwayat atau URL langsung.
    router.replace("/pengemudi");
    router.refresh();
  }

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-label={copy("Ringkasan perjalanan")}
      onCancel={(event) => {
        event.preventDefault();
        closeReview();
      }}
    >
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.close}
          aria-label={copy("Tutup review dan kembali ke halaman utama Pengemudi")}
          onClick={closeReview}
          autoFocus
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div className={styles.content}>{children}</div>
    </dialog>
  );
}
