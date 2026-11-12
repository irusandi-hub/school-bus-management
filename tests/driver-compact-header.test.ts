import assert from 'node:assert/strict';
import fs from 'node:fs';
import { it } from 'node:test';
it('compact header retains derived counters, direction labels and existing CTA slot', () => {
  const header = fs.readFileSync('components/driver/DriverOpsHeader.tsx', 'utf8');
  assert.match(header, /compact-identity-row/);
  assert.match(header, /compact-action-row/);
  assert.match(header, /<DriverProfileMenu name={driverName}>/);
  for (const field of ['total', 'done', 'waiting', 'onboard', 'absent']) assert.ok(header.includes(`progress.${field}`));
  assert.match(header, /className="ops-head-action">{children}/);
  assert.match(header, /progress.kind === "dropoff" \? "Diantar" : "Dijemput"/);
});
it('profile retains server logout and keyboard/outside dismissal', () => {
  const menu = fs.readFileSync('components/driver/DriverProfileMenu.tsx', 'utf8');
  assert.match(menu, /action={signOutAction}/);
  assert.match(menu, /aria-expanded={open}/);
  assert.match(menu, /pointerdown/);
  assert.match(menu, /Escape/);
  assert.match(menu, /onBlur/);
});
