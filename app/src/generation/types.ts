export type Tier = 1 | 2 | 3;

export type WeaponCategory = 'gun' | 'melee';

export type GunType =
  | 'Pistol'
  | 'SMG'
  | 'Shotgun'
  | 'Combat Rifle'
  | 'Sniper Rifle'
  | 'Launcher';

export type MeleeType =
  | 'Warhammer'
  | 'Axe'
  | 'Lance'
  | 'Dagger'
  | 'Sword'
  | 'Gauntlet';

export type WeaponType = GunType | MeleeType;

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export const RARITIES: ReadonlyArray<Rarity> = [
  'Common',
  'Uncommon',
  'Rare',
  'Epic',
  'Legendary',
];

export type Element = 'Acid' | 'Cold' | 'Fire' | 'Volt' | 'Dark' | 'Entropy' | 'Light' | 'Plasma';

// Base damage icon shown on every row. Guns are all kinetic. Melee weapons are
// either slashing (Dagger, Sword, Lance, Axe) or kinetic (Warhammer, Gauntlet).
export type BaseDamage = 'Kinetic' | 'Slashing';

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

// Guns: "Crimson SBR-042 Wildfire". Melee: coin-flip yields either a prefix
// ("Crimson Knife") or a suffix ("Knife of Wildfire"); never both.
export type WeaponName =
  | { kind: 'gun'; prefix: string; abbrev: string; number: string; suffix: string }
  | { kind: 'melee'; placement: 'prefix' | 'suffix'; modifier: string; baseName: string };

export interface Weapon {
  seed: number;
  category: WeaponCategory;
  tier: Tier;
  type: WeaponType;
  baseDamage: BaseDamage;
  guild: GuildName;
  guildPassive: string;
  guildBonus: string;
  guildBonusLabel: string;
  rarity: Rarity;
  damage: DamageRow;
  // Free-form range string straight from the spec (e.g. "8", "1/5", "2/4").
  range: string;
  special?: string;
  elements: ElementResult[];
  module: Module | null;
  redText: RedText | null;
  name: WeaponName;
}

// Display + filename helpers — the only places that need to know about the
// per-category naming format.
export function weaponDisplayName(weapon: Weapon): string {
  const n = weapon.name;
  if (n.kind === 'gun') {
    return `${n.prefix} ${n.abbrev}-${n.number} ${n.suffix}`;
  }
  return n.placement === 'prefix'
    ? `${n.modifier} ${n.baseName}`
    : `${n.baseName} ${n.modifier}`;
}

export function weaponFilenameStem(weapon: Weapon): string {
  const n = weapon.name;
  const parts =
    n.kind === 'gun'
      ? [n.prefix, n.abbrev, n.number]
      : n.placement === 'prefix'
        ? [n.modifier, n.baseName]
        : [n.baseName, n.modifier];
  return `lootbreaker-${parts.join('-')}`.toLowerCase().replace(/\s+/g, '-');
}
