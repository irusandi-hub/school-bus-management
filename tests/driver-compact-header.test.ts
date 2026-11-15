import assert from 'node:assert/strict';
import fs from 'node:fs';
import { it } from 'node:test';
import { messages } from '../lib/i18n/messages.ts';
it('compact header retains derived counters, direction labels and existing CTA slot', () => {
  const header = fs.readFileSync('components/driver/DriverOpsHeader.tsx', 'utf8');
  assert.match(header, /compact-identity-row/);
  assert.match(header, /compact-action-row/);
  assert.match(header, /compact-driver-identity/);
  assert.doesNotMatch(header, /portal-nav compact-driver-tabs|<nav/);
  assert.doesNotMatch(header, /<DriverProfileMenu/);
  for (const field of ['total', 'done', 'waiting', 'onboard']) assert.ok(header.includes(`progress.${field}`));
  assert.match(header, /className="ops-head-action">{children}/);
  assert.match(header, /progress\.kind === "dropoff" \? <LocalizedText k="droppedOff" \/> : <LocalizedText k="pickedUp" \/>/);
  assert.equal(messages.id.droppedOff, 'Diantar');
  assert.equal(messages.id.pickedUp, 'Dijemput');
  assert.equal(messages.en.droppedOff, 'Dropped off');
  assert.equal(messages.ar.pickedUp, 'تم الصعود');
});
it('driver bottom navigation keeps Tugas and Riwayat after header tabs are removed', () => {
  const nav = fs.readFileSync('components/ui/nav-config.ts', 'utf8');
  const driverNav = nav.split('export const driverBottomNav: NavItem[] = [')[1]?.split('];')[0] ?? '';
  assert.match(driverNav, /label: "Tugas"/);
  assert.match(driverNav, /label: "Riwayat"/);
});
it('driver layout does not expose profile dropdown navigation', () => {
  const layout = fs.readFileSync('app/pengemudi/layout.tsx', 'utf8');
  assert.doesNotMatch(layout, /DriverProfileMenu|MobileMenu/);
  assert.match(layout, /action={signOutAction}/);
});
