import { describe, expect, it } from 'vitest';
import { autoChoice, generateWeapon } from './procedure';
import { MELEE_BASE_NAMES } from './tables/melee/naming';
import { MELEE_PLAYER_CHOICE_TYPES } from './tables/melee/weaponTypes';
import { PREFIXES, SUFFIXES } from './tables/shared/naming';

describe('generateWeapon', () => {
  it('produces a deterministic weapon for a fixed seed', async () => {
    const w = await generateWeapon(
      { category: 'gun', tier: 2, redTextEnabled: false, seed: 42 },
      autoChoice(),
    );

    // Spot-check structural fields and the snapshot of the rolled values.
    expect(w.seed).toBe(42);
    expect(w.tier).toBe(2);
    expect(w.category).toBe('gun');
    expect(w.type).toBeTruthy();
    expect(w.guild).toBeTruthy();
    expect(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']).toContain(w.rarity);
    expect(w.damage.minor).toBeTruthy();
    expect(w.name.kind).toBe('gun');
    if (w.name.kind === 'gun') {
      expect(w.name.prefix).toBeTruthy();
      expect(w.name.abbrev).toBeTruthy();
      expect(w.name.suffix).toBeTruthy();
    }
    expect(w.redText).toBeNull();
  });

  it('same seed produces identical weapon', async () => {
    const a = await generateWeapon(
      { category: 'gun', tier: 2, redTextEnabled: true, seed: 12345 },
      autoChoice(),
    );
    const b = await generateWeapon(
      { category: 'gun', tier: 2, redTextEnabled: true, seed: 12345 },
      autoChoice(),
    );
    expect(a).toEqual(b);
  });

  it('respects redTextEnabled toggle', async () => {
    const off = await generateWeapon(
      { category: 'gun', tier: 2, redTextEnabled: false, seed: 7 },
      autoChoice(),
    );
    const on = await generateWeapon(
      { category: 'gun', tier: 2, redTextEnabled: true, seed: 7 },
      autoChoice(),
    );
    expect(off.redText).toBeNull();
    expect(on.redText).not.toBeNull();
  });

  it('Common-rarity weapons never get a module', async () => {
    // Run many seeds and sample only Commons; each should have null module.
    for (let seed = 1; seed <= 200; seed += 1) {
      const w = await generateWeapon(
        { category: 'gun', tier: 1, redTextEnabled: false, seed },
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
        { category: 'gun', tier: 2, redTextEnabled: false, seed },
        autoChoice(),
      );
      expect(allowed).toContain(w.type);
    }
  });
});

describe('generateWeapon(melee)', () => {
  it('produces a deterministic melee weapon for a fixed seed', async () => {
    const w = await generateWeapon(
      { category: 'melee', tier: 2, redTextEnabled: false, seed: 42 },
      autoChoice(),
    );
    expect(w.category).toBe('melee');
    expect(w.seed).toBe(42);
    expect(MELEE_PLAYER_CHOICE_TYPES).toContain(w.type);
    expect(w.guild).toBeTruthy();
    expect(w.damage.minor).toBeTruthy();
    expect(['Kinetic', 'Slashing']).toContain(w.baseDamage);
    // Range is a free-form string like "1/5", "1", "2/4".
    expect(typeof w.range).toBe('string');
    expect(w.range.length).toBeGreaterThan(0);
    expect(w.name.kind).toBe('melee');
  });

  it('same seed produces identical melee weapon', async () => {
    const a = await generateWeapon(
      { category: 'melee', tier: 2, redTextEnabled: true, seed: 12345 },
      autoChoice(),
    );
    const b = await generateWeapon(
      { category: 'melee', tier: 2, redTextEnabled: true, seed: 12345 },
      autoChoice(),
    );
    expect(a).toEqual(b);
  });

  it('every produced melee weapon has a valid type', async () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const w = await generateWeapon(
        { category: 'melee', tier: 2, redTextEnabled: false, seed },
        autoChoice(),
      );
      expect(MELEE_PLAYER_CHOICE_TYPES).toContain(w.type);
    }
  });

  it('Common-rarity melee weapons never get a module', async () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const w = await generateWeapon(
        { category: 'melee', tier: 1, redTextEnabled: false, seed },
        autoChoice(),
      );
      if (w.rarity === 'Common') {
        expect(w.module).toBeNull();
      }
    }
  });

  it('melee names use a coin-flip prefix or suffix, never both', async () => {
    let prefixHits = 0;
    let suffixHits = 0;
    for (let seed = 1; seed <= 100; seed += 1) {
      const w = await generateWeapon(
        { category: 'melee', tier: 2, redTextEnabled: false, seed },
        autoChoice(),
      );
      expect(w.name.kind).toBe('melee');
      if (w.name.kind !== 'melee') continue;
      // baseName must come from the per-type table.
      expect(MELEE_BASE_NAMES[w.type as keyof typeof MELEE_BASE_NAMES]).toContain(
        w.name.baseName,
      );
      if (w.name.placement === 'prefix') {
        expect(PREFIXES).toContain(w.name.modifier);
        prefixHits += 1;
      } else {
        expect(SUFFIXES).toContain(w.name.modifier);
        suffixHits += 1;
      }
    }
    // Both placements should appear across 100 seeds (coin flip).
    expect(prefixHits).toBeGreaterThan(0);
    expect(suffixHits).toBeGreaterThan(0);
  });

  it('baseDamage matches the weapon-type spec', async () => {
    const expected: Record<string, 'Kinetic' | 'Slashing'> = {
      Dagger: 'Slashing',
      Sword: 'Slashing',
      Lance: 'Slashing',
      Axe: 'Slashing',
      Warhammer: 'Kinetic',
      Gauntlet: 'Kinetic',
    };
    for (let seed = 1; seed <= 100; seed += 1) {
      const w = await generateWeapon(
        { category: 'melee', tier: 2, redTextEnabled: false, seed },
        autoChoice(),
      );
      expect(w.baseDamage).toBe(expected[w.type as string]);
    }
  });
});
