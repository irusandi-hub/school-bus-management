"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ConfirmDialog } from "./ConfirmDialog";

type Options = { title: string; message: string; confirmText?: string; cancelText?: string; defaultValue?: string };
type Request = { options: Options; mode: "confirm" | "alert" | "prompt"; resolve: (value: boolean | string | null) => void; id: number };
type DialogAPI = {
  confirm: (options: Options) => Promise<boolean>;
  alert: (options: Options) => Promise<void>;
  prompt: (options: Options) => Promise<string | null>;
};
const Context = createContext<DialogAPI | null>(null);
export function DialogProvider({ children }: { children: ReactNode }) {
  const queue = useRef<Request[]>([]);
  const serial = useRef(0);
  const alive = useRef(true);
  const [active, setActive] = useState<Request | null>(null);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; for (const item of queue.current) item.resolve(item.mode === "confirm" ? false : null); queue.current = []; };
  }, []);
  const request = useCallback((options: Options, mode: Request["mode"]) => new Promise<boolean | string | null>((resolve) => {
    if (!alive.current) { resolve(mode === "confirm" ? false : null); return; }
    const item = { options, mode, resolve, id: ++serial.current };
    queue.current.push(item);
    if (queue.current.length === 1) setActive(item);
  }), []);
  function finish(value: boolean | string | null) {
    const item = queue.current.shift();
    if (!item) return;
    item.resolve(value);
    setActive(queue.current[0] ?? null);
  }
  const confirm = useCallback(async (options: Options) => (await request(options, "confirm")) === true, [request]);
  const alert = useCallback(async (options: Options) => { await request(options, "alert"); }, [request]);
  const prompt = useCallback(async (options: Options) => { const result = await request(options, "prompt"); return typeof result === "string" ? result : null; }, [request]);
  return <Context.Provider value={{ confirm, alert, prompt }}>{children}{active && <ConfirmDialog key={active.id} {...active.options} mode={active.mode} confirmText={active.options.confirmText ?? (active.mode === "alert" ? "Tutup" : "Lanjutkan")} cancelText={active.options.cancelText ?? "Batal"} onConfirm={(value) => finish(active.mode === "prompt" ? value ?? "" : true)} onCancel={() => finish(active.mode === "confirm" ? false : null)} />}</Context.Provider>;
}
function useDialogs() { const context = useContext(Context); if (!context) throw new Error("DialogProvider diperlukan."); return context; }
export function useConfirm() { return useDialogs().confirm; }
export function useAlert() { return useDialogs().alert; }
export function usePrompt() { return useDialogs().prompt; }
