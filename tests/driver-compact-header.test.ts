import assert from 'node:assert/strict';
import fs from 'node:fs';
import { it } from 'node:test';
it('compact header retains derived counters, direction labels and existing CTA slot', () => {
  const header = fs.readFileSync('components/driver/DriverOpsHeader.tsx', 'utf8');
  assert.match(header, /compact-identity-row/);
  assert.match(header, /compact-action-row/);
  assert.match(header, /compact-driver-identity/);
  assert.match(header, /portal-nav compact-driver-tabs/);
  assert.doesNotMatch(header, /<DriverProfileMenu/);
  for (const field of ['total', 'done', 'waiting', 'onboard']) assert.ok(header.includes(`progress.${field}`));
  assert.match(header, /className="ops-head-action">{children}/);
  assert.match(header, /progress.kind === "dropoff" \? "Diantar" : "Dijemput"/);
});
it('driver layout does not expose profile dropdown navigation', () => {
  const layout = fs.readFileSync('app/pengemudi/layout.tsx', 'utf8');
  assert.doesNotMatch(layout, /DriverProfileMenu|MobileMenu/);
  assert.match(layout, /action={signOutAction}/);
});
