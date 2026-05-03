export type Tier = 1 | 2 | 3;

export type WeaponType =
  | 'Pistol'
  | 'SMG'
  | 'Shotgun'
  | 'Combat Rifle'
  | 'Sniper Rifle'
  | 'Launcher';

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export const RARITIES: ReadonlyArray<Rarity> = [
  'Common',
  'Uncommon',
  'Rare',
  'Epic',
  'Legendary',
];

export type Element = 'Acid' | 'Cold' | 'Fire' | 'Volt' | 'Dark' | 'Entropy' | 'Light' | 'Plasma';

export type GuildName =
  | 'Vandal'
  | 'Stormforged'
  | 'Noctra'
  | 'Dominion'
  | 'Ordis'
  | 'Ironwood Rangers'
  | 'Wytchwyrd'
  | 'NecroTek'
  | 'Vow of Vending'
  | 'Arkana'
  | 'Flamekeepers'
  | 'Banshee';

export interface DamageRow {
  minor: string;
  major: string;
  grave: string;
}

export interface ElementResult {
  element: Element;
  bonusDice?: string;
}

export interface Module {
  guild: GuildName;
  roll: number;
  name: string;
  text: string;
}

export interface RedText {
  roll: number;
  title: string;
  effect: string;
}

export interface WeaponName {
  prefix: string;
  abbrev: string;
  number: string;
  suffix: string;
}

export interface Weapon {
  seed: number;
  tier: Tier;
  type: WeaponType;
  guild: GuildName;
  guildPassive: string;
  guildBonus: string;
  rarity: Rarity;
  damage: DamageRow;
  range: number;
  special?: string;
  elements: ElementResult[];
  module: Module | null;
  redText: RedText | null;
  name: WeaponName;
}
