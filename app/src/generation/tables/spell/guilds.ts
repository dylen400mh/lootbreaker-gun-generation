// Source: spec Step 5 (Offensive — 1d12) and Step 5 (Support — 1d6).
// Each guild ships a flavor name, a verbatim passive description, and a
// per-rarity value string. Spec uses literal "X" in the Common column when the
// guild offers no bonus at that rarity.
import type { DamageGuildName, GuildName, Rarity, SpellGuildBonus } from '../../types';

type ValueByRarity = Record<Rarity, string>;

interface OffensiveGuildSpellEntry {
  passiveName: string;
  description: string;
  valueByRarity: ValueByRarity;
}

// 1d12 → guild for offensive spells. Indexed by roll − 1. Order matches the
// damage-guild d12 table from gun/melee.
export const OFFENSIVE_GUILD_BY_D12: ReadonlyArray<DamageGuildName> = [
  'Vandal',
  'Stormforged',
  'Noctra',
  'Dominion',
  'Ordis',
  'Ironwood Rangers',
  'Wytchwyrd',
  'NecroTek',
  'Vow of Vending',
  'Arkana',
  'Flamekeepers',
  'Banshee',
];

export const OFFENSIVE_SPELL_GUILDS: Record<DamageGuildName, OffensiveGuildSpellEntry> = {
  Vandal: {
    passiveName: 'Explosive Ordinance',
    description: 'Spells gain {value}',
    valueByRarity: {
      Common:    'X',
      Uncommon:  'Splash 1 (+1 MP)',
      Rare:      'Splash 1 (+1 MP)',
      Epic:      'Splash 2 (+2 MP)',
      Legendary: 'Splash 3 (+3 MP)',
    },
  },
  Stormforged: {
    passiveName: 'Cloak of Storms',
    description:
      'When you reduce a Target to 0 HP, you gain {value}, dealing Volt Damage instead of Kinetic, until the end of your next turn.',
    valueByRarity: {
      Common:    'X',
      Uncommon:  'Thorns 1 (+1 MP)',
      Rare:      'Thorns 1 (+1 MP)',
      Epic:      'Thorns 2 (+2 MP)',
      Legendary: 'Thorns 3 (+3 MP)',
    },
  },
  Noctra: {
    passiveName: "Dead Man's Blessing",
    description: 'Gain {value} bonus Entropy Damage',
    valueByRarity: {
      Common:    'X',
      Uncommon:  '+1d6',
      Rare:      '+1d8',
      Epic:      '+1d10',
      Legendary: '+1d12',
    },
  },
  Dominion: {
    passiveName: 'Refined Spellcraft',
    description:
      'ReAction (1 AP, 0 MP): You may re-roll {value} damage dice.',
    valueByRarity: {
      Common:    'X',
      Uncommon:  '1',
      Rare:      '2',
      Epic:      '3',
      Legendary: '5',
    },
  },
  Ordis: {
    passiveName: 'Tactical Spell-Scope',
    description:
      'Gain {value} to Accuracy Rolls, or to your Spell DC',
    valueByRarity: {
      Common:    'X',
      Uncommon:  '+1',
      Rare:      '+1',
      Epic:      '+2',
      Legendary: '+3',
    },
  },
  'Ironwood Rangers': {
    passiveName: 'Spirit Shelter',
    description:
      'Allied Targets gain Overshield equal to your Willpower Score (Minimum 1) after you cast this spell. Range for this effect is {value}.',
    valueByRarity: {
      Common:    'X',
      Uncommon:  '1',
      Rare:      '2',
      Epic:      '3',
      Legendary: '4',
    },
  },
  Wytchwyrd: {
    passiveName: 'Hex of Eternal Suffering',
    description:
      'Targets suffering from negative Conditions take {value} additional Dark Damage',
    valueByRarity: {
      Common:    'X',
      Uncommon:  '+1d4',
      Rare:      '+1d4',
      Epic:      '+2d4',
      Legendary: '+2d6',
    },
  },
  NecroTek: {
    passiveName: 'Soul Harvester',
    description: 'Killing Non-Minions with this Spell grants {value} Overshield',
    valueByRarity: {
      Common:    'X',
      Uncommon:  '+1',
      Rare:      '+2',
      Epic:      '+3',
      Legendary: '+5',
    },
  },
  'Vow of Vending': {
    passiveName: 'Variable Spells',
    description:
      'You can spend additional MP to add more Damage Dice, matching {value}',
    valueByRarity: {
      Common:    'X',
      Uncommon:  '+1d4 Per additional MP Spent',
      Rare:      '+1d6 Per additional MP Spent',
      Epic:      '+1d8 Per additional MP Spent',
      Legendary: '+1d10 Per additional MP Spent',
    },
  },
  Arkana: {
    passiveName: 'Spellweaver',
    description:
      'Your final MP cost for spells is reduced ({value}). (Minimum 1 MP)',
    valueByRarity: {
      Common:    'X',
      Uncommon:  '-1 MP Cost',
      Rare:      '-1 MP Cost',
      Epic:      '-2 MP Cost',
      Legendary: '-3 MP Cost',
    },
  },
  Flamekeepers: {
    passiveName: 'Affinity for Fire',
    description:
      'After casting a Flamekeepers Spell, you gain {value} Fire Damage Resistance, and your next Gun or Melee Weapon Attack gains Fire Damage equal to the Damage Resistance.',
    valueByRarity: {
      Common:    'X',
      Uncommon:  '+2',
      Rare:      '+3',
      Epic:      '+5',
      Legendary: '+8',
    },
  },
  Banshee: {
    passiveName: 'Spirit Sap',
    description: 'Enemies Damaged by this Spell gain {value}',
    valueByRarity: {
      Common:    'X',
      Uncommon:  'Broken 1 (+1 MP)',
      Rare:      'Broken 1 (+1 MP)',
      Epic:      'Broken 2 (+2 MP)',
      Legendary: 'Broken 3 (+3 MP)',
    },
  },
};

// 1d6 → guild for support spells. Indexed by roll − 1.
export const SUPPORT_GUILD_BY_D6: ReadonlyArray<GuildName> = [
  'Ressurecta',
  'Fortis',
  'Noctra',
  'Dominion',
  'Vow of Vending',
  'Ironwood Rangers',
];

interface SupportGuildSpellEntry {
  passiveName: string;
  description: string;
  valueByRarity: ValueByRarity;
}

// Support spells pull 4 guilds from the 12-guild damage table plus the two
// non-damage guilds (Fortis, Ressurecta). Keyed by the GuildName union so
// either source resolves.
export const SUPPORT_SPELL_GUILDS: Partial<Record<GuildName, SupportGuildSpellEntry>> = {
  Ressurecta: {
    passiveName: 'Cleric-Coded',
    description:
      'After a target(s) is healed by this spell, at the start of their next turn they gain {value} additional Health',
    valueByRarity: {
      Common:    'X',
      Uncommon:  '1d4',
      Rare:      '1d6',
      Epic:      '1d8',
      Legendary: '1d10',
    },
  },
  Fortis: {
    passiveName: "Spellweaver's Embrace",
    description:
      'When you cast a healing Spell, the target(s) of your spell gains {value} Overshield.',
    valueByRarity: {
      Common:    'X',
      Uncommon:  '+2',
      Rare:      '+4',
      Epic:      '+6',
      Legendary: '+10',
    },
  },
  Noctra: {
    passiveName: 'Offensive Rejuvenation',
    description:
      'Hostile targets adjacent to the target of this spell take {value} Dark Damage',
    valueByRarity: {
      Common:    'X',
      Uncommon:  '1d4',
      Rare:      '1d6',
      Epic:      '1d8',
      Legendary: '1d10',
    },
  },
  Dominion: {
    passiveName: 'Firmware Update',
    description:
      "Gain {value} to the target(s) of this spell's Impact Threshold until the end of their next turn.",
    valueByRarity: {
      Common:    'X',
      Uncommon:  '+1 Major Threshold',
      Rare:      '+1 Major Threshold',
      Epic:      '+2 Major Threshold',
      Legendary: '+3 Major Threshold, +3 Grave Threshold',
    },
  },
  'Vow of Vending': {
    passiveName: "Paladin's Shieldwork",
    description:
      "Gain {value} Damage Resistance until the end of the target's next turn.",
    valueByRarity: {
      Common:    'X',
      Uncommon:  '+1',
      Rare:      '+2',
      Epic:      '+3',
      Legendary: '+5',
    },
  },
  'Ironwood Rangers': {
    passiveName: 'Blooming Flowers',
    description:
      'Allies adjacent to the target(s) of this spell gain {value} Shields',
    valueByRarity: {
      Common:    'X',
      Uncommon:  '+1',
      Rare:      '+2',
      Epic:      '+3',
      Legendary: '+5',
    },
  },
};

// Lift a spell-guild entry into the runtime SpellGuildBonus shape (single
// value for the spell's rarity), used by both procedure and card overlay.
export function resolveOffensiveBonus(
  guild: DamageGuildName,
  rarity: Rarity,
): SpellGuildBonus {
  const e = OFFENSIVE_SPELL_GUILDS[guild];
  return {
    name: e.passiveName,
    description: e.description,
    value: e.valueByRarity[rarity],
  };
}

export function resolveSupportBonus(
  guild: GuildName,
  rarity: Rarity,
): SpellGuildBonus {
  const e = SUPPORT_SPELL_GUILDS[guild];
  if (!e) {
    throw new Error(`No support-spell bonus for guild "${guild}"`);
  }
  return {
    name: e.passiveName,
    description: e.description,
    value: e.valueByRarity[rarity],
  };
}
