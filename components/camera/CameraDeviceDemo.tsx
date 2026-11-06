"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEMO_SESSION_MS, MAX_SIGNAL_LENGTH, parseDemoDescription } from "@/lib/camera/demo-policy";

/** Satu pengirim + satu penonton, signaling manual. Tidak ada upload/penyimpanan SDP di server. */
export function CameraDeviceDemo({ publisherOnly = false }: { publisherOnly?: boolean }) {
  const peer = useRef<RTCPeerConnection | null>(null);
  const media = useRef<MediaStream | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generation = useRef(0);
  const [role, setRole] = useState<"publisher" | "viewer">("publisher");
  const [phase, setPhase] = useState("idle");
  const [status, setStatus] = useState("Kamera belum aktif.");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(false);
  const [playing, setPlaying] = useState(false);

  const stop = useCallback((reason = "Sesi dihentikan. Kamera dilepas; buat kode baru untuk menyambung kembali.") => {
    generation.current++;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const current = peer.current;
    peer.current = null;
    if (current) {
      current.onconnectionstatechange = null;
      current.ontrack = null;
      current.close();
    }
    media.current?.getTracks().forEach((track) => track.stop());
    media.current = null;
    if (video.current) {
      const remote = video.current.srcObject as MediaStream | null;
      remote?.getTracks().forEach((track) => track.stop());
      video.current.srcObject = null;
    }
    setActive(false); setPlaying(false); setBusy(false); setPhase("idle");
    setInput(""); setOutput(""); setStatus(reason);
  }, []);

  useEffect(() => {
    const hidden = () => { if (document.hidden) stop("Sesi ditutup karena halaman tidak aktif. Mulai ulang setelah kembali."); };
    const leave = () => stop();
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("pagehide", leave);
    return () => {
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("pagehide", leave);
      stop();
    };
  }, [stop]);

  const createPeer = () => {
    if (!window.isSecureContext || !window.RTCPeerConnection) throw new Error("Gunakan koneksi aman (HTTPS) dan browser yang mendukung panggilan video.");
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }] });
    peer.current = pc;
    setActive(true);
    timer.current = setTimeout(() => stop("Batas demo 10 menit tercapai. Sesi dan kamera dihentikan."), DEMO_SESSION_MS);
    pc.onconnectionstatechange = () => {
      if (peer.current !== pc) return;
      if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
        stop("Koneksi terputus. Kamera dihentikan. Buat kode baru; sebagian jaringan seluler belum mendukung koneksi ini.");
      } else if (pc.connectionState === "connected") {
        setStatus("Koneksi perangkat tersambung. LIVE hanya muncul setelah video diputar.");
      }
    };
    pc.ontrack = (event) => {
      if (peer.current !== pc || !video.current) return;
      video.current.srcObject = event.streams[0] ?? new MediaStream([event.track]);
      event.track.onended = () => stop("Sumber video berakhir.");
      void video.current.play().catch(() => setStatus("Tekan putar pada video untuk memulai playback."));
    };
    return pc;
  };

  const exportDescription = async (pc: RTCPeerConnection) => {
    // Non-trickle: pengguna cukup menukar satu paket SDP per arah.
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => { cleanup(); reject(new Error("Penyiapan koneksi melebihi 15 detik. Coba lagi.")); }, 15000);
      const changed = () => {
        if (pc.signalingState === "closed") { cleanup(); reject(new Error("Sesi sudah ditutup.")); }
        else if (pc.iceGatheringState === "complete") { cleanup(); resolve(); }
      };
      const cleanup = () => {
        clearTimeout(timeout);
        pc.removeEventListener("icegatheringstatechange", changed);
        pc.removeEventListener("signalingstatechange", changed);
      };
      pc.addEventListener("icegatheringstatechange", changed);
      pc.addEventListener("signalingstatechange", changed);
      changed();
    });
    if (peer.current !== pc || !pc.localDescription) throw new Error("Sesi sudah ditutup.");
    setOutput(JSON.stringify(pc.localDescription.toJSON()));
  };

  const run = async (action: "offer" | "answer" | "connect") => {
    if (busy) return;
    setBusy(true);
    const version = generation.current;
    try {
      if (action === "offer") {
        const pc = createPeer();
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("Kamera tidak tersedia. Gunakan koneksi aman (HTTPS) dan izinkan akses kamera.");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: "environment" }, width: { ideal: 640 }, height: { ideal: 360 }, frameRate: { ideal: 15, max: 15 } } });
        if (generation.current !== version || peer.current !== pc) { stream.getTracks().forEach((track) => track.stop()); return; }
        media.current = stream;
        stream.getTracks().forEach((track) => { pc.addTrack(track, stream); track.onended = () => stop("Kamera dihentikan oleh perangkat."); });
        if (video.current) { video.current.srcObject = stream; void video.current.play().catch(() => {}); }
        await pc.setLocalDescription(await pc.createOffer());
        await exportDescription(pc);
        setPhase("offered"); setStatus("Kamera lokal aktif, belum tersambung. Kirim kode koneksi secara privat ke penguji penonton.");
      } else if (action === "answer") {
        const description = parseDemoDescription(input, "offer");
        const pc = createPeer();
        await pc.setRemoteDescription(description);
        await pc.setLocalDescription(await pc.createAnswer());
        await exportDescription(pc);
        setPhase("answered"); setStatus("Kirim kode balasan secara privat kembali ke pengirim kamera.");
      } else {
        const description = parseDemoDescription(input, "answer");
        const pc = peer.current;
        if (!pc || pc.signalingState !== "have-local-offer") throw new Error("Mulai kamera dan buat kode koneksi baru terlebih dahulu.");
        await pc.setRemoteDescription(description);
        setPhase("connected"); setStatus("Menghubungkan perangkat…"); setInput(""); setOutput("");
      }
    } catch (error) {
      if (generation.current === version) stop(error instanceof Error ? error.message : "Kamera atau koneksi gagal. Periksa izin kamera dan coba ulang.");
    } finally { if (generation.current === version) setBusy(false); }
  };

  return <section aria-label={publisherOnly ? "Siaran uji pengemudi" : "Demo kamera perangkat"} style={{ maxWidth: 760, margin: "auto", padding: publisherOnly ? 16 : 24, minWidth: 0 }}>
    {publisherOnly ? <h3>Kamera HP · siaran uji</h3> : <h1>Demo kamera HP · satu sumber</h1>}
    <p><strong>Khusus pengujian perangkat, bukan kamera perjalanan atau akses wali.</strong> Gunakan objek uji; jangan arahkan kamera ke anak atau data pribadi.</p>
    <p>Video langsung antarperangkat tanpa akun layanan tambahan dan tanpa rekaman. Koneksi tidak dijamin pada semua jaringan. Kedua halaman harus tetap terbuka; pindah aplikasi atau mengunci layar menghentikan sesi. Batas sesi 10 menit.</p>
    {!publisherOnly && <label>Peran perangkat <select value={role} disabled={active || busy} onChange={(event) => { stop(); setRole(event.target.value as typeof role); }}>
      <option value="publisher">HP pengirim kamera</option><option value="viewer">Perangkat penonton</option>
    </select></label>}
    <p role="status">{status}</p>
    <p>{active && role === "publisher" ? "● Sesi kamera aktif — hentikan setelah pengujian." : ""} {playing && role === "viewer" ? "● LIVE · video sedang diputar" : ""}</p>
    <video ref={video} style={{ width: "100%", background: "#111", aspectRatio: "16/9" }} controls autoPlay muted playsInline
      onPlaying={() => setPlaying(true)} onWaiting={() => setPlaying(false)} onStalled={() => setPlaying(false)} onPause={() => setPlaying(false)} onEnded={() => stop("Video berakhir.")} onError={() => stop("Pemutaran video gagal.")} />
    <p>1. Pengirim menekan Mulai, lalu menyalin kode koneksi. 2. Penonton menempel kode koneksi dan membuat kode balasan. 3. Pengirim menempel kode balasan dan menekan Sambungkan. Tukarkan kode lewat kanal privat pada perangkat lain agar halaman kamera tetap aktif.</p>
    {role === "publisher" && phase === "idle" && <button disabled={busy} onClick={() => void run("offer")}>{publisherOnly ? "Mulai siaran uji" : "Mulai kamera & buat kode"}</button>}
    {(role === "viewer" && phase === "idle" || role === "publisher" && phase === "offered") && <div>
      <label htmlFor="signal-input">Kode {role === "viewer" ? "koneksi dari pengirim" : "balasan dari penonton"}</label>
      <textarea id="signal-input" value={input} maxLength={MAX_SIGNAL_LENGTH} rows={4} style={{ width: "100%" }} autoComplete="off" spellCheck={false} onChange={(event) => setInput(event.target.value)} />
      <button disabled={busy || !input.trim()} onClick={() => void run(role === "viewer" ? "answer" : "connect")}>{role === "viewer" ? "Buat kode balasan" : "Sambungkan"}</button>
    </div>}
    {output && <div><label htmlFor="signal-output">Kode {role === "publisher" ? "koneksi" : "balasan"} — rahasiakan, hanya untuk penguji</label>
      <textarea id="signal-output" readOnly autoComplete="off" spellCheck={false} value={output} rows={5} style={{ width: "100%" }} onFocus={(event) => event.target.select()} />
      <button onClick={() => void navigator.clipboard?.writeText(output).then(() => setStatus("Kode disalin. Bagikan hanya kepada penguji yang diizinkan.")).catch(() => setStatus("Pilih dan salin kode secara manual."))}>Salin kode</button>
    </div>}
    <p><button disabled={!active && !busy} onClick={() => stop()}>{publisherOnly ? "Hentikan siaran" : "Hentikan / cabut koneksi"}</button></p>
    <p>Hentikan menutup koneksi dan melepas kamera lokal. Perangkat penonton akan kehilangan koneksi saat siaran dihentikan. Ini bukan bukti pencabutan akses wali oleh server. Tidak ada kode koneksi yang dikirim ke server aplikasi atau disimpan aplikasi.</p>
  </section>;
}
