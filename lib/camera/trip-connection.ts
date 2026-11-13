import { createClient } from "@/lib/supabase/client";

/** Media never enters Supabase. RPCs carry signaling only; lease loss closes peers. */
export function tripCamera(input: {
  tripId: string; studentId?: string; stream?: MediaStream;
  onStream?: (stream: MediaStream) => void; onStatus: (status: string) => void;
}) {
  const db = createClient();
  const publisher = Boolean(input.stream);
  let disposed = false;
  let polling = false;
  const status = (message: string) => { if (!disposed) input.onStatus(message); };
  const peers = new Map<string, { pc: RTCPeerConnection; channel: ReturnType<typeof db.channel>; ice: RTCIceCandidateInit[]; validUntil: number; busy: boolean }>();
  const close = (id: string) => {
    const entry = peers.get(id);
    if (!entry) return;
    peers.delete(id);
    entry.pc.onconnectionstatechange = null;
    entry.pc.ontrack = null;
    entry.pc.onicecandidate = null;
    entry.pc.close();
    void db.removeChannel(entry.channel);
  };
  const send = async (id: string, kind: string, body: unknown) => {
    const { error } = await db.rpc("camera_signal", { p_session: id, p_kind: kind, p_body: body });
    if (error && !disposed) { close(id); status("Akses kamera telah berakhir atau koneksi terputus"); throw error; }
  };
  const connect = async (id: string) => {
    if (disposed || peers.has(id)) return;
    // Cloudflare's public STUN endpoint helps peers discover their public network route.
    // No TURN relay is configured; symmetric/restricted NAT may still require a relay.
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }],
    });
    const channel = db.channel(`camera:${id}`, { config: { private: true } });
    const entry = { pc, channel, ice: [] as RTCIceCandidateInit[], validUntil: Date.now() + 10000, busy: false };
    peers.set(id, entry);
    input.stream?.getTracks().forEach(track => pc.addTrack(track, input.stream!));
    pc.ontrack = event => { if (!disposed) { input.onStream?.(event.streams[0] ?? new MediaStream([event.track])); status("Terhubung"); } };
    pc.onicecandidate = event => { if (event.candidate) void send(id, "ice", event.candidate.toJSON()).catch(() => {}); };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed" || pc.connectionState === "disconnected") { close(id); status("Koneksi kamera terputus"); }
      else status(pc.connectionState === "connected" ? "Terhubung" : "Menghubungkan kamera…");
    };
    channel.on("broadcast", { event: "signal" }, async ({ payload }) => {
      if (disposed || !peers.has(id) || payload.sender === (publisher ? "publisher" : "viewer")) return;
      try {
        if (payload.kind === "stop") { close(id); status("Akses kamera telah berakhir"); return; }
        if (payload.kind === "ready" && publisher && !entry.busy && !pc.remoteDescription) {
          entry.busy = true;
          if (!pc.localDescription) await pc.setLocalDescription(await pc.createOffer());
          await send(id, "offer", pc.localDescription!.toJSON());
          entry.busy = false;
        } else if (payload.kind === "offer" && !publisher && !entry.busy && !pc.remoteDescription) {
          entry.busy = true;
          await pc.setRemoteDescription(payload.body);
          for (const candidate of entry.ice.splice(0)) await pc.addIceCandidate(candidate);
          await pc.setLocalDescription(await pc.createAnswer());
          await send(id, "answer", pc.localDescription!.toJSON());
        } else if (payload.kind === "answer" && publisher && !pc.remoteDescription) {
          await pc.setRemoteDescription(payload.body);
          for (const candidate of entry.ice.splice(0)) await pc.addIceCandidate(candidate);
        } else if (payload.kind === "ice") {
          if (pc.remoteDescription) await pc.addIceCandidate(payload.body);
          else if (entry.ice.length < 256) entry.ice.push(payload.body);
        }
      } catch { close(id); status("Koneksi kamera gagal"); }
    }).subscribe(channelStatus => {
      if (channelStatus === "SUBSCRIBED" && !publisher) void send(id, "ready", {}).catch(() => {});
      if (disposed || !peers.has(id)) return;
      if (channelStatus === "CHANNEL_ERROR" || channelStatus === "TIMED_OUT" || channelStatus === "CLOSED") { close(id); status("Koneksi kamera terputus"); }
    });
  };
  const poll = async () => {
    if (disposed || polling) return;
    polling = true;
    try {
      if (publisher) {
        const { data, error } = await db.rpc("camera_sessions_for_trip", { p_trip: input.tripId });
        if (disposed) return;
        if (error) throw error;
        for (const row of data ?? []) await connect(row.id);
      }
      for (const [id, entry] of peers) {
        const { data, error } = await db.rpc("camera_heartbeat", { p_session: id });
        if (disposed) return;
        if (error || data !== true) { close(id); status("Akses kamera telah berakhir atau koneksi terputus"); }
        else {
          entry.validUntil = Date.now() + 10000;
          // Repeat ready until publisher joins; avoids lost first message.
          if (!publisher && !entry.pc.remoteDescription) await send(id, "ready", {});
        }
      }
    } catch { for (const id of peers.keys()) close(id); status("Koneksi kamera tidak tersedia"); }
    finally { polling = false; }
  };
  void (async () => {
    try {
      await db.realtime.setAuth();
      if (disposed) return;
      if (!publisher) {
        const { data, error } = await db.rpc("camera_open", { p_trip: input.tripId, p_student: input.studentId });
        if (error || !data) throw error;
        await connect(data);
      }
      status("Menghubungkan kamera…");
      await poll();
    } catch { status("Akses kamera ditolak atau belum tersedia"); }
  })();
  const timer = setInterval(() => { void poll(); }, 2000);
  // Independent watchdog: an RPC that hangs must never keep media alive indefinitely.
  const watchdog = setInterval(() => {
    for (const [id, entry] of peers) if (Date.now() >= entry.validUntil) { close(id); status("Akses kamera telah berakhir"); }
  }, 500);
  return () => {
    disposed = true; clearInterval(timer); clearInterval(watchdog);
    for (const id of peers.keys()) { void db.rpc("camera_signal", { p_session: id, p_kind: "stop", p_body: {} }); close(id); }
  };
}
