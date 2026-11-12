"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import styles from "./TripReviewModal.module.css";

/** Overlay juga berlaku untuk akses langsung/reload URL review, tanpa bergantung pada riwayat navigasi. */
export function TripReviewModal({ children }: { children: ReactNode }) {
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
      aria-label="Review perjalanan"
      onCancel={(event) => {
        event.preventDefault();
        closeReview();
      }}
    >
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.close}
          aria-label="Tutup review dan kembali ke halaman utama Pengemudi"
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
