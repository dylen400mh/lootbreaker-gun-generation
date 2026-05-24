import { describe, expect, it } from 'vitest';
import { ELEMENT_TABLE } from './tables/shared/elements';
import { MODULE_CHANCE } from './tables/shared/moduleChance';
import { PREFIXES, SUFFIXES } from './tables/shared/naming';
import { RARITY_TABLE } from './tables/shared/rarity';
import { GUILDS, GUILD_BY_D12 } from './tables/gun/guilds';
import { GUILD_MODULES } from './tables/gun/modules';
import { ABBREVIATIONS } from './tables/gun/naming';
import { RED_TEXT } from './tables/gun/redText';
import { GUN_BY_D8, GUN_TYPES } from './tables/gun/weaponTypes';
import {
  GUILDS as MELEE_GUILDS,
  GUILD_BY_D12 as MELEE_GUILD_BY_D12,
} from './tables/melee/guilds';
import { GUILD_MODULES as MELEE_GUILD_MODULES } from './tables/melee/modules';
import { RED_TEXT as MELEE_RED_TEXT } from './tables/melee/redText';
import { MELEE_BASE_NAMES } from './tables/melee/naming';
import {
  MELEE_BY_2D4,
  MELEE_PLAYER_CHOICE_TYPES,
  MELEE_TYPES,
} from './tables/melee/weaponTypes';
import type { GuildName, GunType, MeleeType, Rarity, Tier } from './types';

describe('weapon types', () => {
  it('has 6 defined weapon types', () => {
    expect(Object.keys(GUN_TYPES)).toHaveLength(6);
  });

  it('d8 lookup has 8 slots, with 2 nulls (Scout Rifle and Player Choice)', () => {
    expect(GUN_BY_D8).toHaveLength(8);
    expect(GUN_BY_D8.filter((x) => x === null)).toHaveLength(2);
  });

  it('every defined weapon type has tier 1/2/3 damage rows', () => {
    for (const def of Object.values(GUN_TYPES)) {
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
  it('every gun type has 6 abbreviations', () => {
    const types: GunType[] = ['Pistol', 'SMG', 'Shotgun', 'Combat Rifle', 'Sniper Rifle', 'Launcher'];
    for (const t of types) {
      expect(ABBREVIATIONS[t]).toHaveLength(6);
    }
  });

  it('has 100 prefixes and 100 suffixes', () => {
    expect(PREFIXES).toHaveLength(100);
    expect(SUFFIXES).toHaveLength(100);
  });
});

describe('melee tables', () => {
  it('has 6 defined melee weapon types', () => {
    expect(Object.keys(MELEE_TYPES)).toHaveLength(6);
    expect(MELEE_PLAYER_CHOICE_TYPES).toHaveLength(6);
  });

  it('2d4 lookup covers sums 2-7 plus null for 8 (Player Choice)', () => {
    for (let sum = 2; sum <= 7; sum += 1) {
      expect(MELEE_BY_2D4[sum]).toBeTruthy();
    }
    expect(MELEE_BY_2D4[8]).toBeNull();
  });

  it('every melee type has tier 1/2/3 damage rows', () => {
    for (const def of Object.values(MELEE_TYPES)) {
      ([1, 2, 3] as Tier[]).forEach((t) => {
        expect(def.damage[t].minor).toBeTruthy();
        expect(def.damage[t].major).toBeTruthy();
        expect(def.damage[t].grave).toBeTruthy();
      });
    }
  });

  it('has 12 melee guilds with passive + 5 rarity bonuses', () => {
    expect(MELEE_GUILD_BY_D12).toHaveLength(12);
    for (const name of MELEE_GUILD_BY_D12) {
      const g = MELEE_GUILDS[name];
      expect(g.passive).toBeTruthy();
      expect(Object.keys(g.bonusByRarity)).toHaveLength(5);
    }
  });

  it('every melee guild has exactly 6 modules', () => {
    for (const g of MELEE_GUILD_BY_D12) {
      expect(MELEE_GUILD_MODULES[g]).toHaveLength(6);
    }
  });

  it('melee red text has 100 entries', () => {
    expect(MELEE_RED_TEXT).toHaveLength(100);
  });

  it('every melee type has 6 base names', () => {
    const types: MeleeType[] = ['Warhammer', 'Axe', 'Lance', 'Dagger', 'Sword', 'Gauntlet'];
    for (const t of types) {
      expect(MELEE_BASE_NAMES[t]).toHaveLength(6);
    }
  });
});
