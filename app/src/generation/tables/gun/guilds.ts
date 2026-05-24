import type { DamageGuildName, Rarity } from '../../types';

export interface GuildDef {
  name: DamageGuildName;
  passive: string;
  // Short label used to caption the per-rarity bonus on the card
  // (e.g. "+1d6 Overheat Damage", "+5 Fire Damage", "+2 Accuracy").
  bonusLabel: string;
  bonusByRarity: Record<Rarity, string>;
}

// Source: spec Step 2. "X" = no bonus (Common). Bonuses preserved as written
// (mix of dice notation and flat numbers).

export const GUILD_BY_D12: ReadonlyArray<DamageGuildName> = [
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

export const GUILDS: Record<DamageGuildName, GuildDef> = {
  Vandal: {
    name: 'Vandal',
    passive:
      'Overheat (All guns deal damage to bearer in exchange for more damage output)',
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
    bonusLabel: 'Volt Damage',
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
      'Transfusion (All guns heal for a certain amount of HP back to the shooter)',
    bonusLabel: 'Transfusion',
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
    passive:
      "Smart-Bullets (Tiny micro-jets in each bullet help increase the wielder's Accuracy)",
    bonusLabel: 'Accuracy',
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
    bonusLabel: 'Damage',
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
      "Ranger's Sights (Weapons made by Ironwood Rangers are granted bonus Range)",
    bonusLabel: 'Range',
    bonusByRarity: {
      Common: 'X',
      Uncommon: '+1',
      Rare: '+2',
      Epic: '+2',
      Legendary: '+3',
    },
  },
  Wytchwyrd: {
    name: 'Wytchwyrd',
    passive:
      'Cauldron-Made (Weapons made by Wytchwyrd are granted additional Dark Damage)',
    bonusLabel: 'Dark Damage',
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
    bonusLabel: 'Entropy Damage',
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
    bonusLabel: 'Light Damage',
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
    bonusLabel: 'Elemental Damage',
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
    bonusLabel: 'Fire Damage',
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
    bonusLabel: 'Damage to Afflicted Targets',
    bonusByRarity: {
      Common: 'X',
      Uncommon: '+1',
      Rare: '+2',
      Epic: '+3',
      Legendary: '+5',
    },
  },
};
