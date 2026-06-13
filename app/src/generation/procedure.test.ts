import { describe, expect, it } from 'vitest';
import { autoChoice, generateWeapon } from './procedure';
import { MELEE_BASE_NAMES } from './tables/melee/naming';
import { MELEE_PLAYER_CHOICE_TYPES } from './tables/melee/weaponTypes';
import { PREFIXES, SUFFIXES } from './tables/shared/naming';
import { weaponDisplayName } from './types';
import type { GunWeapon, MeleeWeapon, SpellWeapon, Weapon } from './types';

// TS-level narrowing helper. All tests in this file pass category: 'gun' or
// 'melee', so this never throws at runtime; it just tells the compiler the
// returned Weapon is the damage-weapon variant, not ShieldWeapon.
function assertDamageWeapon(w: Weapon): asserts w is GunWeapon | MeleeWeapon {
  if (w.category === 'shield') {
    throw new Error(`expected gun or melee weapon, got shield`);
  }
}

describe('generateWeapon', () => {
  it('produces a deterministic weapon for a fixed seed', async () => {
    const w = await generateWeapon(
      { category: 'gun', tier: 2, redTextEnabled: false, seed: 42 },
      autoChoice(),
    );
    assertDamageWeapon(w);

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
    assertDamageWeapon(off);
    assertDamageWeapon(on);
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
      assertDamageWeapon(w);
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
      assertDamageWeapon(w);
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
    assertDamageWeapon(w);
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
      assertDamageWeapon(w);
      expect(MELEE_PLAYER_CHOICE_TYPES).toContain(w.type);
    }
  });

  it('Common-rarity melee weapons never get a module', async () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      const w = await generateWeapon(
        { category: 'melee', tier: 1, redTextEnabled: false, seed },
        autoChoice(),
      );
      assertDamageWeapon(w);
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
      assertDamageWeapon(w);
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
      assertDamageWeapon(w);
      expect(w.baseDamage).toBe(expected[w.type as string]);
    }
  });
});

function assertShieldWeapon(w: Weapon): asserts w is import('./types').ShieldWeapon {
  if (w.category !== 'shield') {
    throw new Error(`expected shield, got ${w.category}`);
  }
}

describe('generateWeapon(shield)', () => {
  it('produces a deterministic shield for a fixed seed', async () => {
    const w = await generateWeapon(
      { category: 'shield', tier: 2, redTextEnabled: false, seed: 42 },
      autoChoice(),
    );
    assertShieldWeapon(w);
    expect(w.seed).toBe(42);
    expect(w.tier).toBe(2);
    expect(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']).toContain(w.rarity);
    expect(w.guild).toBeTruthy();
    expect(typeof w.capacity).toBe('number');
    expect(typeof w.regenerationBase).toBe('number');
    expect(w.thresholds.minor).toBeGreaterThan(0);
    expect(w.thresholds.major).toBeGreaterThan(w.thresholds.minor);
    expect(w.thresholds.grave).toBeGreaterThan(w.thresholds.major);
    expect(w.guildPassive.name).toBeTruthy();
    expect(w.guildPassive.description).toBeTruthy();
    expect(w.name.kind).toBe('shield');
  });

  it('same seed produces identical shield', async () => {
    const a = await generateWeapon(
      { category: 'shield', tier: 3, redTextEnabled: false, seed: 12345 },
      autoChoice(),
    );
    const b = await generateWeapon(
      { category: 'shield', tier: 3, redTextEnabled: false, seed: 12345 },
      autoChoice(),
    );
    expect(a).toEqual(b);
  });

  it('Legendary rarity always rolls a threshold modifier (100% chance)', async () => {
    for (let seed = 1; seed <= 50; seed += 1) {
      const w = await generateWeapon(
        { category: 'shield', tier: 2, redTextEnabled: false, seed, rarity: 'Legendary' },
        autoChoice(),
      );
      assertShieldWeapon(w);
      expect(w.thresholdModifier).not.toBeNull();
    }
  });

  it('capacity matches the tier × rarity table exactly', async () => {
    // Capacity formula: 10 + 10*(tier-1) + 5*rarityIndex (Common=0..Legendary=4).
    const rarityIdx: Record<string, number> = {
      Common: 0,
      Uncommon: 1,
      Rare: 2,
      Epic: 3,
      Legendary: 4,
    };
    for (let seed = 1; seed <= 50; seed += 1) {
      for (const tier of [1, 2, 3] as const) {
        const w = await generateWeapon(
          { category: 'shield', tier, redTextEnabled: false, seed },
          autoChoice(),
        );
        assertShieldWeapon(w);
        const expected = 10 + 10 * (tier - 1) + 5 * rarityIdx[w.rarity];
        expect(w.capacity).toBe(expected);
      }
    }
  });

  it('name uses one prefix or one suffix and a base name', async () => {
    let prefixHits = 0;
    let suffixHits = 0;
    for (let seed = 1; seed <= 100; seed += 1) {
      const w = await generateWeapon(
        { category: 'shield', tier: 2, redTextEnabled: false, seed },
        autoChoice(),
      );
      assertShieldWeapon(w);
      if (w.name.placement === 'prefix') {
        expect(PREFIXES).toContain(w.name.modifier);
        prefixHits += 1;
      } else {
        expect(SUFFIXES).toContain(w.name.modifier);
        suffixHits += 1;
      }
      expect(w.name.baseName).toBeTruthy();
      // Digits suppressed by default (shieldDigits omitted).
      expect(w.name.digits).toBeUndefined();
    }
    expect(prefixHits).toBeGreaterThan(0);
    expect(suffixHits).toBeGreaterThan(0);
  });

  it('appends 1–3 digit suffix when shieldDigits is enabled', async () => {
    for (let seed = 1; seed <= 30; seed += 1) {
      const w = await generateWeapon(
        { category: 'shield', tier: 2, redTextEnabled: false, seed, shieldDigits: true },
        autoChoice(),
      );
      assertShieldWeapon(w);
      expect(w.name.digits).toBeTruthy();
      expect(w.name.digits!.length).toBeGreaterThanOrEqual(1);
      expect(w.name.digits!.length).toBeLessThanOrEqual(3);
      expect(/^\d+$/.test(w.name.digits!)).toBe(true);
    }
  });
});

function assertSpellWeapon(w: Weapon): asserts w is SpellWeapon {
  if (w.category !== 'spell') {
    throw new Error(`expected spell, got ${w.category}`);
  }
}

describe('generateWeapon(spell)', () => {
  it('produces a deterministic spell for a fixed seed', async () => {
    const a = await generateWeapon(
      { category: 'spell', tier: 2, redTextEnabled: false, seed: 99 },
      autoChoice(),
    );
    const b = await generateWeapon(
      { category: 'spell', tier: 2, redTextEnabled: false, seed: 99 },
      autoChoice(),
    );
    assertSpellWeapon(a);
    assertSpellWeapon(b);
    expect(a.seed).toBe(99);
    expect(a.subType).toBe(b.subType);
    expect(a.rarity).toBe(b.rarity);
    expect(a.deliveryType).toBe(b.deliveryType);
    expect(a.guild).toBe(b.guild);
    expect(a.mpCost).toBe(b.mpCost);
    expect(a.name).toEqual(b.name);
  });

  it('subType is always Offensive or Support', async () => {
    for (let seed = 1; seed <= 60; seed += 1) {
      const w = await generateWeapon(
        { category: 'spell', tier: 2, redTextEnabled: false, seed },
        autoChoice(),
      );
      assertSpellWeapon(w);
      expect(['Offensive', 'Support']).toContain(w.subType);
    }
  });

  it('offensive spells carry damage, damage type, and conditions list', async () => {
    let found = false;
    for (let seed = 1; seed <= 200 && !found; seed += 1) {
      const w = await generateWeapon(
        { category: 'spell', tier: 3, redTextEnabled: false, seed },
        autoChoice(),
      );
      assertSpellWeapon(w);
      if (w.subType !== 'Offensive') continue;
      found = true;
      expect(w.damageType).toBeTruthy();
      expect(Array.isArray(w.conditions)).toBe(true);
      // Damage discriminant is set; either kind is valid.
      expect(['single-target', 'aoe']).toContain(w.damage.kind);
      // MP cost includes 1 (base) + rarity adder + condition MP.
      expect(w.mpCost).toBeGreaterThanOrEqual(1);
      // Guild is one of the 12 damage guilds.
      expect(w.guild).toBeTruthy();
    }
    expect(found).toBe(true);
  });

  it('support spells carry healing, healingType, and a 6-guild subset', async () => {
    const SUPPORT_GUILDS = new Set([
      'Ressurecta', 'Fortis', 'Noctra', 'Dominion', 'Vow of Vending', 'Ironwood Rangers',
    ]);
    let found = false;
    for (let seed = 1; seed <= 400 && !found; seed += 1) {
      const w = await generateWeapon(
        { category: 'spell', tier: 1, redTextEnabled: false, seed },
        autoChoice(),
      );
      assertSpellWeapon(w);
      if (w.subType !== 'Support') continue;
      found = true;
      expect(w.healing.healing).toBeTruthy();
      expect(['Shields', 'Health']).toContain(w.healingType);
      expect(SUPPORT_GUILDS.has(w.guild)).toBe(true);
      expect(w.mpCost).toBeGreaterThanOrEqual(2); // 1 base + min +1 rarity adder
    }
    expect(found).toBe(true);
  });

  it('Kinetic offensive spell renames to "Kinetic Prefix Delivery"', async () => {
    let found = false;
    for (let seed = 1; seed <= 1000 && !found; seed += 1) {
      const w = await generateWeapon(
        { category: 'spell', tier: 3, redTextEnabled: false, seed },
        autoChoice(),
      );
      assertSpellWeapon(w);
      if (w.subType !== 'Offensive' || w.damageType !== 'Kinetic') continue;
      found = true;
      const display = weaponDisplayName(w);
      expect(display.startsWith('Kinetic ')).toBe(true);
      expect(display.endsWith(w.deliveryType)).toBe(true);
      // Should NOT contain "of Kinetic"
      expect(display.includes(' of ')).toBe(false);
    }
    expect(found).toBe(true);
  });

  it('condition count is bounded by the per-tier × rarity matrix', async () => {
    // Tier 1 / Common offensive: chances are [0, 0, 0] → 0 conditions.
    for (let seed = 1; seed <= 100; seed += 1) {
      const w = await generateWeapon(
        { category: 'spell', tier: 1, redTextEnabled: false, seed, rarity: 'Common' },
        autoChoice(),
      );
      assertSpellWeapon(w);
      if (w.subType !== 'Offensive') continue;
      expect(w.conditions.length).toBe(0);
    }
  });
});

import {
  COMMON_2D12_TABLE,
  UNCOMMON_1D20_TABLE,
  RARE_2D8_TABLE,
  EPIC_1D12_TABLE,
  LEGENDARY_1D10_TABLE,
} from './tables/potion';
import type { PotionWeapon, Rarity } from './types';

function assertPotionWeapon(w: Weapon): asserts w is PotionWeapon {
  if (w.category !== 'potion') {
    throw new Error(`expected potion, got ${w.category}`);
  }
}

describe('generateWeapon(potion)', () => {
  it('produces a deterministic potion for a fixed seed', async () => {
    const w = await generateWeapon(
      { category: 'potion', tier: 2, redTextEnabled: false, seed: 42 },
      autoChoice(),
    );
    assertPotionWeapon(w);
    expect(w.seed).toBe(42);
    expect(w.category).toBe('potion');
    expect(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']).toContain(w.rarity);
    expect(w.effect.name).toBeTruthy();
    expect(w.effect.description).toBeTruthy();
    expect(w.name.kind).toBe('potion');
    expect(weaponDisplayName(w)).toBe(w.effect.name);
  });

  it('same seed produces identical potion', async () => {
    const a = await generateWeapon(
      { category: 'potion', tier: 1, redTextEnabled: false, seed: 9999 },
      autoChoice(),
    );
    const b = await generateWeapon(
      { category: 'potion', tier: 1, redTextEnabled: false, seed: 9999 },
      autoChoice(),
    );
    expect(a).toEqual(b);
  });

  it('rarity pin always wins', async () => {
    const rarities: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
    for (const rarity of rarities) {
      for (let seed = 1; seed <= 20; seed += 1) {
        const w = await generateWeapon(
          { category: 'potion', tier: 2, redTextEnabled: false, seed, rarity },
          autoChoice(),
        );
        assertPotionWeapon(w);
        expect(w.rarity).toBe(rarity);
      }
    }
  });

  it('every rolled effect comes from the matching per-rarity table', async () => {
    const tables: Record<Rarity, Record<number, { name: string; description: string }>> = {
      Common: COMMON_2D12_TABLE,
      Uncommon: UNCOMMON_1D20_TABLE,
      Rare: RARE_2D8_TABLE,
      Epic: EPIC_1D12_TABLE,
      Legendary: LEGENDARY_1D10_TABLE,
    };
    for (let seed = 1; seed <= 300; seed += 1) {
      const w = await generateWeapon(
        { category: 'potion', tier: 1, redTextEnabled: false, seed },
        autoChoice(),
      );
      assertPotionWeapon(w);
      const row = tables[w.rarity][w.effect.roll];
      expect(row).toBeTruthy();
      expect(row.name).toBe(w.effect.name);
      expect(row.description).toBe(w.effect.description);
    }
  });

  // Spec-fidelity smoke check on one known entry per table — guards against
  // silent edits to the transcribed strings.
  it('preserves verbatim spec strings on known rows', () => {
    expect(COMMON_2D12_TABLE[3]?.name).toBe('Bottled Lightning');
    expect(COMMON_2D12_TABLE[3]?.description).toBe(
      'All Attacks gain +1 Volt Damage until the end of the current encounter',
    );
    expect(UNCOMMON_1D20_TABLE[8]?.name).toBe('Battery Acid Cola');
    // The duplicate-row-8 shift: Hot Sauce moved to slot 9.
    expect(UNCOMMON_1D20_TABLE[9]?.name).toBe('Hot Sauce');
    // Moose Juice was the original row 20; cut off by the shift.
    expect(UNCOMMON_1D20_TABLE[20]?.name).not.toBe('Moose Juice');
    expect(UNCOMMON_1D20_TABLE[20]?.name).toBe('Quick Concentrate');
    expect(RARE_2D8_TABLE[14]?.name).toBe('Venereal Vacator');
    expect(EPIC_1D12_TABLE[7]?.name).toBe('Lucky Potion');
    expect(LEGENDARY_1D10_TABLE[10]?.name).toBe('Moonmilk');
  });
});
