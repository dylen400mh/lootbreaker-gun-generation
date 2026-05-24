import type { GuildName, Rarity } from '../../types';

// Source: spec Step 1 (2d8 guild table). Sums 2..16. Sum 16 = Player Choice.
// Indexed [sum - 2] so the first entry is the 2d8 = 2 result.
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
  // Full passive description text — transcribed verbatim per the spec. Two
  // entries (Stormforged, Banshee) are truncated in the source PDF; preserve
  // as-is rather than guessing.
  description: string;
  // The numeric value scales per rarity. "X" means no bonus at this rarity.
  valueByRarity: Record<Rarity, string>;
}

// Source: spec Step 5 (Guild Bonuses). Transcribed verbatim per
// CLAUDE.md spec-fidelity rule. Stormforged ("Voltaic Core: Decreases
// incoming Volt") and Banshee ("Scream of Despair…") descriptions are cut
// off in the PDF — preserved as-is.
export const SHIELD_GUILDS: Record<GuildName, ShieldGuildDef> = {
  Vandal: {
    name: 'Vandal',
    passiveName: 'Unstable Construction',
    description:
      'Deals Kinetic Damage to all Adjacent Targets when depleted for the first time in an encounter',
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
    description: 'Decreases incoming Volt',
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
      'When you slay an enemy, you regain Shields. Additionally, shields created by Noctra grant protection for creatures who would take damage from sunlight/starlight/moonlight.',
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
    description: 'Bonus to Capacity',
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
    passiveName: 'Automatic Targeting',
    description:
      'Gain a bonus to Accuracy Rolls against the last target that damaged you.',
    valueByRarity: {
      Common: 'X',
      Uncommon: '+1',
      Rare: '+1',
      Epic: '+2',
      Legendary: '+3',
    },
  },
  'Ironwood Rangers': {
    name: 'Ironwood Rangers',
    passiveName: 'Passive Sound Dampeners',
    description: 'Gain a bonus to Shadow Checks',
    valueByRarity: {
      Common: '+1',
      Uncommon: '+2',
      Rare: '+2',
      Epic: '+3',
      Legendary: '+5',
    },
  },
  Wytchwyrd: {
    name: 'Wytchwyrd',
    passiveName: 'Hexfield',
    description:
      'Bonus to Checks against Spells, or other effects that would apply a Condition on you',
    valueByRarity: {
      Common: '+1',
      Uncommon: '+1',
      Rare: '+2',
      Epic: '+2',
      Legendary: '+3',
    },
  },
  NecroTek: {
    name: 'NecroTek',
    passiveName: 'Osteopathic Barrier',
    description:
      'When Shields are depleted, gain damage resistance to all types of damage (Excluding True Damage) until the start of your next turn.',
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
    description: 'Gain a bonus to Regeneration Score',
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
      'When casting a Spell, gain a bonus to Damage (Matching Damage Type of Spell)',
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
    description: 'When struck by a Melee Attack, deal Damage to Attacker',
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
    passiveName: 'Scream of Despair',
    description:
      'The first time your Shields are depleted in an encounter, they release a scream psychic energy, granting enemies within 8 Squares a penalty to Willpower and Mind Checks until the end of their next turn.',
    valueByRarity: {
      Common: 'X',
      Uncommon: '-1',
      Rare: '-2',
      Epic: '-3',
      Legendary: '-5',
    },
  },
  Fortis: {
    name: 'Fortis',
    passiveName: 'Bulwark Frame',
    description: 'Bonus to Capacity, Penalty to Regeneration',
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
    passiveName: 'Increase Thresholds by Bonus Score',
    description: 'Increase Thresholds by Bonus Score',
    valueByRarity: {
      Common: 'X',
      Uncommon: '+1 Grave Hit Threshold',
      Rare: '+2 Grave Hit Threshold',
      Epic: '+1 Major Hit Threshold, +2 Grave Hit Threshold',
      Legendary:
        '+1 Minor Hit, +2 Major Hit and +3 to Grave Hit Thresholds',
    },
  },
};
