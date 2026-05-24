import type { GuildName, Rarity } from '../../types';

export interface GuildDef {
  name: GuildName;
  passive: string;
  // Short label used to caption the per-rarity bonus on the card.
  bonusLabel: string;
  bonusByRarity: Record<Rarity, string>;
}

// Source: Lootbreaker_MeleeWeaponGeneration_Version0dot10.pdf — Step Two.
// 1d12 → guild. The 12 guild names match the gun spec, but passive
// descriptions and several bonus values differ; both transcribed verbatim
// from the melee PDF (do not copy from the gun tables).

export const GUILD_BY_D12: ReadonlyArray<GuildName> = [
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

export const GUILDS: Record<GuildName, GuildDef> = {
  Vandal: {
    name: 'Vandal',
    passive:
      'Overheat (All Melee Weapons deal damage to bearer in exchange for more damage output)',
    bonusLabel: 'Overheat Damage',
    bonusByRarity: {
      Common: 'X',
      Uncommon: '1d6',
      Rare: '1d8',
      Epic: '1d10',
      Legendary: '1d12',
    },
  },
  Stormforged: {
    name: 'Stormforged',
    passive: 'Might of Thunder (All Stormforged Weapons gain bonus Volt Damage)',
    bonusLabel: 'Added Volt Damage',
    bonusByRarity: {
      Common: 'X',
      Uncommon: '+1',
      Rare: '+2',
      Epic: '+3',
      Legendary: '+5',
    },
  },
  Noctra: {
    name: 'Noctra',
    passive:
      'Transfusion (All Melee Weapons heal for a certain amount of HP back to the wielder)',
    bonusLabel: 'Transfusion Amount',
    bonusByRarity: {
      Common: 'X',
      Uncommon: '1',
      Rare: '2',
      Epic: '3',
      Legendary: '5',
    },
  },
  Dominion: {
    name: 'Dominion',
    passive: 'Efficient Construction (Bonus to Accuracy)',
    bonusLabel: 'Acc Bonus Amount',
    bonusByRarity: {
      Common: 'X',
      Uncommon: '+1',
      Rare: '+1',
      Epic: '+2',
      Legendary: '+3',
    },
  },
  Ordis: {
    name: 'Ordis',
    passive:
      'Enhanced Ordinance (Passive bonus to Damage, matching the weapons type, or kinetic if not elemental)',
    // Spec labels Ordis' table "Transfusion Amount" — likely a copy/paste
    // leftover from Noctra. Transcribed as-written per the spec-fidelity rule.
    bonusLabel: 'Transfusion Amount',
    bonusByRarity: {
      Common: 'X',
      Uncommon: '+1',
      Rare: '+2',
      Epic: '+3',
      Legendary: '+5',
    },
  },
  'Ironwood Rangers': {
    name: 'Ironwood Rangers',
    passive:
      'Wind Enchantments (Passive bonus, either Kinetic or Slashing Damage based on weapon type)',
    bonusLabel: 'Bonus Damage',
    bonusByRarity: {
      Common: 'X',
      Uncommon: '+1',
      Rare: '+2',
      Epic: '+3',
      Legendary: '+5',
    },
  },
  Wytchwyrd: {
    name: 'Wytchwyrd',
    passive:
      'Cauldron-Made (Weapons made by Wytchwyrd are granted additional Dark Damage)',
    bonusLabel: 'Bonus Damage',
    bonusByRarity: {
      Common: 'X',
      Uncommon: '+1',
      Rare: '+2',
      Epic: '+3',
      Legendary: '+5',
    },
  },
  NecroTek: {
    name: 'NecroTek',
    passive:
      'Forged by Necromancers (Weapons made by NecroTek are granted additional Entropy Damage)',
    bonusLabel: 'Bonus Damage',
    bonusByRarity: {
      Common: 'X',
      Uncommon: '+1',
      Rare: '+2',
      Epic: '+3',
      Legendary: '+5',
    },
  },
  'Vow of Vending': {
    name: 'Vow of Vending',
    passive:
      'Forged by The Faithful (Weapons made by Vow of Vending are granted additional Light Damage)',
    bonusLabel: 'Bonus Damage',
    bonusByRarity: {
      Common: 'X',
      Uncommon: '+1',
      Rare: '+2',
      Epic: '+3',
      Legendary: '+5',
    },
  },
  Arkana: {
    name: 'Arkana',
    passive:
      'Elementalist Vibes (Weapons made by Arkana are granted additional Common Elemental Damage, randomly determined by rolling 1d4. 1 = Acid 2 = Cold 3 = Fire 4 = Volt)',
    bonusLabel: 'Bonus Damage',
    bonusByRarity: {
      Common: 'X',
      Uncommon: '+1',
      Rare: '+2',
      Epic: '+3',
      Legendary: '+5',
    },
  },
  Flamekeepers: {
    name: 'Flamekeepers',
    passive:
      'Borne by Fire (Weapons made by Flamekeepers are granted additional Fire Damage)',
    bonusLabel: 'Bonus Damage',
    bonusByRarity: {
      Common: 'X',
      Uncommon: '+1',
      Rare: '+2',
      Epic: '+3',
      Legendary: '+5',
    },
  },
  Banshee: {
    name: 'Banshee',
    passive:
      'Curse of the Banshee (Major Hits apply Dark Affliction 1, Grave hits apply Dark Affliction 3. Additionally, Banshee weapons grant bonus Damage to Targets that suffer from Afflictions [Any Affliction])',
    bonusLabel: 'Bonus Damage to Afflicted Targets (When the Condition is granted by this weapon)',
    bonusByRarity: {
      Common: 'X',
      Uncommon: '+1',
      Rare: '+2',
      Epic: '+3',
      Legendary: '+5',
    },
  },
};
