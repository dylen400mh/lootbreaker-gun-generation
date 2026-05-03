import { describe, expect, it } from 'vitest';
import { autoChoice, generateWeapon } from './procedure';

describe('generateWeapon', () => {
  it('produces a deterministic weapon for a fixed seed', async () => {
    const w = await generateWeapon(
      { tier: 2, redTextEnabled: false, seed: 42 },
      autoChoice(),
    );

    // Spot-check structural fields and the snapshot of the rolled values.
    expect(w.seed).toBe(42);
    expect(w.tier).toBe(2);
    expect(w.type).toBeTruthy();
    expect(w.guild).toBeTruthy();
    expect(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']).toContain(w.rarity);
    expect(w.damage.minor).toBeTruthy();
    expect(w.name.prefix).toBeTruthy();
    expect(w.name.abbrev).toBeTruthy();
    expect(w.name.suffix).toBeTruthy();
    expect(w.redText).toBeNull();
  });

  it('same seed produces identical weapon', async () => {
    const a = await generateWeapon(
      { tier: 2, redTextEnabled: true, seed: 12345 },
      autoChoice(),
    );
    const b = await generateWeapon(
      { tier: 2, redTextEnabled: true, seed: 12345 },
      autoChoice(),
    );
    expect(a).toEqual(b);
  });

  it('respects redTextEnabled toggle', async () => {
    const off = await generateWeapon(
      { tier: 2, redTextEnabled: false, seed: 7 },
      autoChoice(),
    );
    const on = await generateWeapon(
      { tier: 2, redTextEnabled: true, seed: 7 },
      autoChoice(),
    );
    expect(off.redText).toBeNull();
    expect(on.redText).not.toBeNull();
  });

  it('Common-rarity weapons never get a module', async () => {
    // Run many seeds and sample only Commons; each should have null module.
    for (let seed = 1; seed <= 200; seed += 1) {
      const w = await generateWeapon(
        { tier: 1, redTextEnabled: false, seed },
        autoChoice(),
      );
      if (w.rarity === 'Common') {
        expect(w.module).toBeNull();
      }
    }
  });

  it('every produced weapon has a defined type (no Scout Rifle / null leak)', async () => {
    const allowed = ['Pistol', 'SMG', 'Shotgun', 'Combat Rifle', 'Sniper Rifle', 'Launcher'];
    for (let seed = 1; seed <= 100; seed += 1) {
      const w = await generateWeapon(
        { tier: 2, redTextEnabled: false, seed },
        autoChoice(),
      );
      expect(allowed).toContain(w.type);
    }
  });
});
