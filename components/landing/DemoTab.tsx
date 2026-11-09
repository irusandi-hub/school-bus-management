"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "./translations";

/** Keep in sync with package.json. */
const APP_VERSION = "0.1.0";

type Props = {
  copy: Dictionary["demo"];
  dir: "ltr" | "rtl";
};

/**
 * Edge tab that opens an informational demo panel.
 * - Tap or pull away from the edge to open, tap the backdrop / swipe / Esc to close.
 * - The first visit shows a short "peek" nudge (skipped for reduced motion).
 * - Contains no buttons or links: it only reports the demo environment, version,
 *   and that the data is not real.
 */
export default function DemoTab({ copy, dir }: Props) {
  const [open, setOpen] = useState(false);
  const [peeking, setPeeking] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [panelOffset, setPanelOffset] = useState(0);
  const [panelDragging, setPanelDragging] = useState(false);
  const tabRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);
  const drag = useRef<{ pointerId: number; startX: number; startY: number; moved: boolean } | null>(null);
  const panelDrag = useRef<{ pointerId: number; startX: number; startY: number; moved: boolean } | null>(null);

  // Short attention nudge when the page first opens.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const peekTimer = window.setTimeout(() => setPeeking(true), 700);
    const endTimer = window.setTimeout(() => setPeeking(false), 3200);
    return () => {
      window.clearTimeout(peekTimer);
      window.clearTimeout(endTimer);
    };
  }, []);

  // Modal behaviour: lock scroll, focus the panel, close on Escape.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      } else if (event.key === "Tab") {
        // The panel has no interactive children, so keep focus inside it.
        event.preventDefault();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  // Return focus to the tab once the panel is fully closed (never on first mount).
  useEffect(() => {
    if (!open && wasOpen.current) tabRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  function onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    drag.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, moved: false };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const state = drag.current;
    if (!state) return;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) state.moved = true;
    const outward = dir === "rtl" ? -dx : dx;
    setDragOffset(Math.max(0, Math.min(56, outward)));
  }

  function finishDrag(event: React.PointerEvent<HTMLButtonElement>) {
    const state = drag.current;
    if (!state) return;
    const dx = event.clientX - state.startX;
    const outward = dir === "rtl" ? -dx : dx;
    drag.current = null;
    setDragging(false);
    setDragOffset(0);
    // A pull past the threshold or a simple tap opens the panel.
    if (outward > 24 || !state.moved) setOpen(true);
  }

  function cancelDrag() {
    drag.current = null;
    setDragging(false);
    setDragOffset(0);
  }

  // Swipe the open panel back toward the edge to dismiss it.
  function onPanelPointerDown(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    panelDrag.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, moved: false };
    setPanelDragging(true);
    // Keep receiving the release even when the swipe leaves the panel bounds.
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPanelPointerMove(event: React.PointerEvent<HTMLElement>) {
    const state = panelDrag.current;
    if (!state) return;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    if (Math.abs(dy) > Math.abs(dx) && !state.moved) return;
    if (Math.abs(dx) > 6) state.moved = true;
    const outward = dir === "rtl" ? dx : -dx;
    setPanelOffset(Math.max(0, Math.min(120, outward)));
  }

  function finishPanelDrag() {
    const state = panelDrag.current;
    if (!state) return;
    panelDrag.current = null;
    setPanelDragging(false);
    if (panelOffset > 64) {
      setPanelOffset(0);
      close();
    } else {
      setPanelOffset(0);
    }
  }

  function cancelPanelDrag() {
    panelDrag.current = null;
    setPanelDragging(false);
    setPanelOffset(0);
  }

  const physicalOffset = dir === "rtl" ? -dragOffset : dragOffset;
  const panelPhysicalOffset = dir === "rtl" ? panelOffset : -panelOffset;

  return (
    <>
      <button
        ref={tabRef}
        type="button"
        className={`lp-demo-tab${peeking ? " is-peeking" : ""}${dragging ? " is-dragging" : ""}${open ? " is-hidden" : ""}`}
        style={{ transform: `translateX(${physicalOffset}px)` }}
        aria-label={copy.open}
        aria-expanded={open}
        aria-controls="lp-demo-panel"
        aria-hidden={open || undefined}
        tabIndex={open ? -1 : 0}
        onClick={() => setOpen(true)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={cancelDrag}
      >
        <span className="lp-demo-grip" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="lp-demo-tab-text">{copy.tab}</span>
        <span className="lp-demo-arrow" aria-hidden>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 5 7 7-7 7" />
          </svg>
        </span>
      </button>

      <div className={`lp-demo-layer${open ? " is-open" : ""}`}>
        <div className="lp-demo-backdrop" onClick={close} aria-hidden="true" />
        <aside
          id="lp-demo-panel"
          ref={panelRef}
          className={`lp-demo-panel${panelDragging ? " is-panel-dragging" : ""}`}
          style={panelOffset ? { transform: `translateX(${panelPhysicalOffset}px)` } : undefined}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lp-demo-title"
          aria-describedby="lp-demo-note"
          aria-hidden={!open}
          tabIndex={-1}
          onPointerDown={onPanelPointerDown}
          onPointerMove={onPanelPointerMove}
          onPointerUp={finishPanelDrag}
          onPointerCancel={cancelPanelDrag}
        >
          <div className="lp-demo-panel-grip" aria-hidden>
            <i />
          </div>
          <div>
            <p className="lp-demo-kicker">{copy.kicker}</p>
            <h2 id="lp-demo-title">{copy.title}</h2>
          </div>

          <dl className="lp-demo-facts">
            <div className="lp-demo-row">
              <dt>{copy.environmentLabel}</dt>
              <dd>
                <span className="lp-demo-status-dot" aria-hidden />
                {copy.environment}
              </dd>
            </div>
            <div className="lp-demo-row">
              <dt>{copy.versionLabel}</dt>
              <dd>{APP_VERSION}</dd>
            </div>
          </dl>

          <div className="lp-demo-note" id="lp-demo-note">
            <strong>{copy.noteTitle}</strong>
            <p>{copy.note}</p>
          </div>

          <p className="lp-demo-hint">{copy.hint}</p>
        </aside>
      </div>
    </>
  );
}
