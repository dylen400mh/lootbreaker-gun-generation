import type { GuildName, Rarity } from '../../types';

// Source: spec v0.12 "Determine Guild" (2d8). Sums 2..16. Sum 16 = Player
// Choice. Indexed [sum - 2] so the first entry is the 2d8 = 2 result.
export const SHIELD_GUILD_BY_2D8: ReadonlyArray<GuildName | 'PlayerChoice'> = [
  'Vandal',          // 2
  'Stormforged',     // 3
  'Noctra',          // 4
  'Dominion',        // 5
  'Ordis',           // 6
  'Ironwood Rangers',// 7
  'Wytchwyrd',       // 8
  'NecroTek',        // 9
  'Vow of Vending',  // 10
  'Arkana',          // 11
  'Flamekeepers',    // 12
  'Banshee',         // 13
  'Fortis',          // 14
  'Ressurecta',      // 15
  'PlayerChoice',    // 16
];

// The 14 named guilds (excludes PlayerChoice) — used to populate the Guild
// dropdown in the UI and to enumerate guild passives.
export const SHIELD_PLAYER_CHOICE_GUILDS: ReadonlyArray<GuildName> =
  SHIELD_GUILD_BY_2D8.filter((g): g is GuildName => g !== 'PlayerChoice');

export interface ShieldGuildDef {
  name: GuildName;
  passiveName: string;
  // Full passive description text with a `{value}` placeholder for the
  // per-rarity value. Transcribed verbatim from the v0.12 spec.
  description: string;
  // The value scales per rarity. "X" means no bonus at this rarity.
  valueByRarity: Record<Rarity, string>;
}

// Source: spec v0.12 "Determine Guild Bonuses". Transcribed verbatim per the
// CLAUDE.md spec-fidelity rule.
export const SHIELD_GUILDS: Record<GuildName, ShieldGuildDef> = {
  Vandal: {
    name: 'Vandal',
    passiveName: 'Unstable Construction',
    description:
      'Deals {value} Kinetic Damage to all Adjacent Targets when depleted for the first time in an encounter',
    valueByRarity: {
      Common: 'X',
      Uncommon: '1d4',
      Rare: '1d4',
      Epic: '1d6',
      Legendary: '2d6',
    },
  },
  Stormforged: {
    name: 'Stormforged',
    passiveName: 'Voltaic Core',
    description: 'Gain {value} Volt Damage Resistance',
    valueByRarity: {
      Common: '+1',
      Uncommon: '+1',
      Rare: '+2',
      Epic: '+3',
      Legendary: '+5',
    },
  },
  Noctra: {
    name: 'Noctra',
    passiveName: 'Vampiric Lattice',
    description:
      'When you slay an enemy, you regain {value} Shields. Additionally, shields created by Noctra grant protection for creatures who would take damage from sunlight/starlight/moonlight.',
    valueByRarity: {
      Common: 'X',
      Uncommon: '+1',
      Rare: '+1',
      Epic: '+2',
      Legendary: '+3',
    },
  },
  Dominion: {
    name: 'Dominion',
    passiveName: 'Shield Excel',
    description: '{value} Bonus to Capacity',
    valueByRarity: {
      Common: '+1',
      Uncommon: '+3',
      Rare: '+5',
      Epic: '+8',
      Legendary: '+10',
    },
  },
  Ordis: {
    name: 'Ordis',
    passiveName: 'Nanomesh Barrier',
    description: 'Gain {value} Kinetic Damage Resistance',
    valueByRarity: {
      Common: '+1',
      Uncommon: '+1',
      Rare: '+2',
      Epic: '+3',
      Legendary: '+5',
    },
  },
  'Ironwood Rangers': {
    name: 'Ironwood Rangers',
    passiveName: 'Shadow Steps',
    description: 'Gain Skills based on rarity: {value}',
    valueByRarity: {
      Common: 'X',
      Uncommon: 'Disguise',
      Rare: 'Disguise, Escape',
      Epic: 'Disguise, Escape, Sneaking',
      Legendary: 'Disguise, Escape, Sneaking, Lockpicking',
    },
  },
  Wytchwyrd: {
    name: 'Wytchwyrd',
    passiveName: 'Darkweave',
    description: 'Gain {value} Dark Damage Resistance',
    valueByRarity: {
      Common: '+1',
      Uncommon: '+1',
      Rare: '+2',
      Epic: '+3',
      Legendary: '+5',
    },
  },
  NecroTek: {
    name: 'NecroTek',
    passiveName: 'Osteopathic Barrier',
    description:
      'When Shields are depleted, gain {value} to all types of damage (Excluding True Damage) until the start of your next turn.',
    valueByRarity: {
      Common: 'X',
      Uncommon: '+1 Damage Resistance',
      Rare: '+2 Damage Resistance',
      Epic: '+2 Damage Resistance',
      Legendary: '+3 Damage Resistance',
    },
  },
  'Vow of Vending': {
    name: 'Vow of Vending',
    passiveName: "Paladin's Codex",
    description: 'Gain a {value} bonus to Regeneration Score',
    valueByRarity: {
      Common: 'X',
      Uncommon: '+1',
      Rare: '+1',
      Epic: '+2',
      Legendary: '+3',
    },
  },
  Arkana: {
    name: 'Arkana',
    passiveName: 'Arcane Overflow',
    description:
      'When casting a Spell, gain a {value} bonus to Damage (Matching Damage Type of Spell)',
    valueByRarity: {
      Common: 'X',
      Uncommon: '+1',
      Rare: '+2',
      Epic: '+3',
      Legendary: '+5',
    },
  },
  Flamekeepers: {
    name: 'Flamekeepers',
    passiveName: 'Blazing Aegis',
    description: 'When struck by a Melee Attack, deal {value} to Attacker',
    valueByRarity: {
      Common: 'X',
      Uncommon: '+1 Fire Damage',
      Rare: '+2 Fire Damage',
      Epic: '+2 Fire Damage',
      Legendary: '+3 Fire Damage',
    },
  },
  Banshee: {
    name: 'Banshee',
    passiveName: 'Spectral Infusion',
    description: 'Gain immunity to loud noises, gain {value} to Speed',
    valueByRarity: {
      Common: 'X',
      Uncommon: '+1',
      Rare: '+1',
      Epic: '+2',
      Legendary: '+3',
    },
  },
  Fortis: {
    name: 'Fortis',
    passiveName: 'Bulwark Frame',
    description: 'Bonus to Capacity, Penalty to Regeneration: {value}',
    valueByRarity: {
      Common: '+5 Capacity, -1 Regeneration',
      Uncommon: '+10 Capacity, -2 Regeneration',
      Rare: '+15 Capacity, -2 Regeneration',
      Epic: '+20 Capacity, -3 Regeneration',
      Legendary: '+30 Capacity, -4 Regeneration',
    },
  },
  Ressurecta: {
    name: 'Ressurecta',
    passiveName: 'Bulwark Barrier',
    description: 'Gain Damage Resistance and Vulnerability: {value}',
    valueByRarity: {
      Common: '+4 Fire Resistance, +4 Volt Vulnerability',
      Uncommon: '+4 Acid Resistance, +4 Entropy Vulnerability',
      Rare: '+4 Cold Resistance, +4 Dark Vulnerability',
      Epic: '+4 Volt Resistance, +4 Light Vulnerability',
      Legendary: '+4 Entropy Resistance, +4 Dark Vulnerability',
    },
  },
};
