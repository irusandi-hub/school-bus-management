import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function harness(publisher = false) {
  const intervals: Array<() => void> = [];
  const peers: any[] = [], peerConfigs: any[] = [], channels: any[] = [], calls: string[] = [], statuses: string[] = [];
  let allowed = true, now = 0, pendingHeartbeat = false;
  const db = {
    realtime: { setAuth: async () => {} },
    rpc: async (name: string) => {
      calls.push(name);
      if (name === 'camera_open') return { data: 'session' };
      if (name === 'camera_sessions_for_trip') return { data: [{ id: 'session' }] };
      if (name === 'camera_heartbeat' && pendingHeartbeat) return new Promise(() => {});
      return { data: allowed };
    },
    channel: () => {
      const channel: any = { on: (_: any, __: any, handler: any) => { channel.handler = handler; return channel; }, subscribe: (handler: any) => { channel.subscription = handler; handler('SUBSCRIBED'); return channel; } };
      channels.push(channel); return channel;
    },
    removeChannel: async (channel: any) => { channel.removed = true; channel.subscription('CLOSED'); },
  };
  class Peer {
    closed = false; localDescription: any; remoteDescription: any;
    constructor(config: any) { peers.push(this); peerConfigs.push(config); }
    addTrack() {}
    close() { this.closed = true; }
    async createOffer() { return { type: 'offer' }; }
    async createAnswer() { return { type: 'answer' }; }
    async setLocalDescription(value: any) { this.localDescription = { ...value, toJSON: () => value }; }
    async setRemoteDescription(value: any) { this.remoteDescription = value; }
    async addIceCandidate() {}
  }
  const source = fs.readFileSync('lib/camera/trip-connection.ts', 'utf8').replace(/import .*;\n/, '');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context: any = { exports: {}, createClient: () => db, RTCPeerConnection: Peer, Date: { now: () => now }, setInterval: (fn: () => void) => { intervals.push(fn); return intervals.length; }, clearInterval: () => {}, MediaStream: class {} };
  vm.runInNewContext(js, context);
  const stop = context.exports.tripCamera({ tripId: 'trip', studentId: 'student', stream: publisher ? { getTracks: () => [] } : undefined, onStatus: (s: string) => statuses.push(s) });
  return { peers, peerConfigs, channels, calls, statuses, intervals, stop, revoke: () => { allowed = false; }, hang: () => { pendingHeartbeat = true; }, advance: () => { now = 11000; } };
}
const flush = async () => { for (let i = 0; i < 25; i++) await Promise.resolve(); };

test('viewer sends ready and automatically answers offer; revoke closes peer/channel', async () => {
  const h = harness(); await flush();
  assert.ok(h.calls.includes('camera_open'));
  assert.equal(h.peerConfigs[0].iceServers[0].urls, 'stun:stun.cloudflare.com:3478');
  assert.ok(h.calls.includes('camera_signal'));
  await h.channels[0].handler({ payload: { sender: 'publisher', kind: 'offer', body: { type: 'offer' } } });
  assert.equal(h.peers[0].localDescription.type, 'answer');
  h.revoke(); h.intervals[0](); await flush();
  assert.equal(h.peers[0].closed, true); assert.equal(h.channels[0].removed, true);
  h.stop();
});
test('publisher discovers sessions and automatically offers on viewer ready', async () => {
  const h = harness(true); await flush();
  await h.channels[0].handler({ payload: { sender: 'viewer', kind: 'ready', body: {} } });
  assert.equal(h.peers[0].localDescription.type, 'offer');
  h.stop(); assert.equal(h.peers[0].closed, true);
});
test('independent watchdog closes media even when heartbeat RPC never resolves', async () => {
  const h = harness(); await flush(); h.hang(); h.intervals[0](); await flush();
  h.advance(); h.intervals[1]();
  assert.equal(h.peers[0].closed, true); assert.equal(h.channels[0].removed, true);
  h.stop();
});
test('dispose during async initialization does not create late peers or UI callbacks', async () => {
  const h = harness(); h.stop(); await flush(); assert.equal(h.peers.length, 0); assert.equal(h.statuses.length, 0);
});
