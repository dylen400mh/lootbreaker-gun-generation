import { describe, expect, it } from 'vitest';
import { ELEMENT_TABLE } from './tables/elements';
import { GUILDS, GUILD_BY_D12 } from './tables/guilds';
import { MODULE_CHANCE } from './tables/moduleChance';
import { GUILD_MODULES } from './tables/modules';
import { ABBREVIATIONS, PREFIXES, SUFFIXES } from './tables/naming';
import { RARITY_TABLE } from './tables/rarity';
import { RED_TEXT } from './tables/redText';
import { WEAPON_BY_D8, WEAPON_TYPES } from './tables/weaponTypes';
import type { GuildName, Tier, Rarity, WeaponType } from './types';

describe('weapon types', () => {
  it('has 6 defined weapon types', () => {
    expect(Object.keys(WEAPON_TYPES)).toHaveLength(6);
  });

  it('d8 lookup has 8 slots, with 2 nulls (Scout Rifle and Player Choice)', () => {
    expect(WEAPON_BY_D8).toHaveLength(8);
    expect(WEAPON_BY_D8.filter((x) => x === null)).toHaveLength(2);
  });

  it('every defined weapon type has tier 1/2/3 damage rows', () => {
    for (const def of Object.values(WEAPON_TYPES)) {
      ([1, 2, 3] as Tier[]).forEach((t) => {
        expect(def.damage[t].minor).toBeTruthy();
        expect(def.damage[t].major).toBeTruthy();
        expect(def.damage[t].grave).toBeTruthy();
      });
    }
  });
});

describe('guilds', () => {
  it('has 12 guilds in the d12 lookup', () => {
    expect(GUILD_BY_D12).toHaveLength(12);
  });

  it('every guild has a passive and 5 rarity bonus entries', () => {
    for (const name of GUILD_BY_D12) {
      const g = GUILDS[name];
      expect(g.passive).toBeTruthy();
      expect(Object.keys(g.bonusByRarity)).toHaveLength(5);
    }
  });
});

describe('rarity table', () => {
  it('is a 6x6 grid', () => {
    expect(RARITY_TABLE).toHaveLength(6);
    for (const row of RARITY_TABLE) expect(row).toHaveLength(6);
  });
});

describe('elements', () => {
  it('has rows covering 1-100 with no gaps', () => {
    const covered: boolean[] = Array(101).fill(false);
    for (const row of ELEMENT_TABLE) {
      for (let r = row.range[0]; r <= row.range[1]; r += 1) covered[r] = true;
    }
    for (let r = 1; r <= 100; r += 1) expect(covered[r]).toBe(true);
  });
});

describe('module chance', () => {
  it('has all 5 rarities and 3 tiers', () => {
    const rarities: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
    for (const r of rarities) {
      ([1, 2, 3] as Tier[]).forEach((t) => {
        expect(typeof MODULE_CHANCE[r][t]).toBe('number');
      });
    }
  });

  it('Common is always 0%', () => {
    expect(MODULE_CHANCE.Common[1]).toBe(0);
    expect(MODULE_CHANCE.Common[2]).toBe(0);
    expect(MODULE_CHANCE.Common[3]).toBe(0);
  });
});

describe('guild modules', () => {
  it('every guild has exactly 6 modules', () => {
    const guildNames: GuildName[] = [...GUILD_BY_D12];
    for (const g of guildNames) {
      expect(GUILD_MODULES[g]).toHaveLength(6);
    }
  });
});

describe('red text', () => {
  it('has 100 entries', () => {
    expect(RED_TEXT).toHaveLength(100);
  });
});

describe('naming', () => {
  it('every weapon type has 6 abbreviations', () => {
    const types: WeaponType[] = ['Pistol', 'SMG', 'Shotgun', 'Combat Rifle', 'Sniper Rifle', 'Plasma Caster'];
    for (const t of types) {
      expect(ABBREVIATIONS[t]).toHaveLength(6);
    }
  });

  it('has 100 prefixes and 100 suffixes', () => {
    expect(PREFIXES).toHaveLength(100);
    expect(SUFFIXES).toHaveLength(100);
  });
});
