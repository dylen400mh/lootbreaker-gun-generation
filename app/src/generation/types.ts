export type Tier = 1 | 2 | 3;

export type WeaponCategory = 'gun' | 'melee' | 'shield';

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

// Guns and melee share the same 12-guild d12 table. Shields use a different
// 2d8 → 14-guild table that overlaps with these names plus two more (Fortis,
// Ressurecta). `DamageGuildName` is the 12-guild subset; `GuildName` is the
// full set across all categories.
export type DamageGuildName =
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

export type ShieldOnlyGuildName = 'Fortis' | 'Ressurecta';

export type GuildName = DamageGuildName | ShieldOnlyGuildName;

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
  guild: DamageGuildName;
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
// ("Crimson Knife") or a suffix ("Knife of Wildfire"); never both. Shields:
// like melee, prefix-or-suffix from a single 1d100 (1–50 prefix, 51–100
// suffix) plus a 1d10 base name (Aegis, Bulwark, …); a numeric suffix may be
// appended when the UI toggle is on.
export type WeaponName =
  | { kind: 'gun'; prefix: string; abbrev: string; number: string; suffix: string }
  | { kind: 'melee'; placement: 'prefix' | 'suffix'; modifier: string; baseName: string }
  | {
      kind: 'shield';
      placement: 'prefix' | 'suffix';
      modifier: string;
      baseName: string;
      digits?: string;
    };

// Fields shared by gun and melee weapons — the rolled damage card shape.
// Shield doesn't extend this; see ShieldWeapon below.
interface DamageWeaponCommon {
  seed: number;
  tier: Tier;
  baseDamage: BaseDamage;
  guild: DamageGuildName;
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
}

export interface GunWeapon extends DamageWeaponCommon {
  category: 'gun';
  type: GunType;
  name: Extract<WeaponName, { kind: 'gun' }>;
}

export interface MeleeWeapon extends DamageWeaponCommon {
  category: 'melee';
  type: MeleeType;
  name: Extract<WeaponName, { kind: 'melee' }>;
}

export interface ShieldThresholdModifier {
  name: string;
  minor: number;
  major: number;
  grave: number;
}

// One per-guild passive scaled by rarity. Description text is constant across
// rarities; only the value (e.g. "+1", "1d6", "+5 Capacity, -1 Regeneration")
// changes. Spec uses literal "X" for Common when the guild has no bonus.
export interface ShieldGuildPassive {
  name: string;
  description: string;
  value: string;
}

export interface ShieldWeapon {
  category: 'shield';
  seed: number;
  tier: Tier;
  guild: GuildName;
  rarity: Rarity;
  // Capacity is rarity × tier (3×5 table). Stored as the resolved scalar.
  capacity: number;
  // Spec writes regeneration as "<base> + MND" where base depends on rarity
  // (1..5) and MND is a player stat we don't evaluate. Card renders the
  // formula literally.
  regenerationBase: number;
  // Base thresholds determined by player tier alone (Minor/Major/Grave).
  thresholds: { minor: number; major: number; grave: number };
  // Optional bonus from Step 6 — present only when the rarity-gated percentile
  // check succeeded. Deltas may be positive, negative, or zero.
  thresholdModifier: ShieldThresholdModifier | null;
  guildPassive: ShieldGuildPassive;
  name: Extract<WeaponName, { kind: 'shield' }>;
}

export type Weapon = GunWeapon | MeleeWeapon | ShieldWeapon;

// Display + filename helpers — the only places that need to know about the
// per-category naming format.
export function weaponDisplayName(weapon: Weapon): string {
  const n = weapon.name;
  if (n.kind === 'gun') {
    return `${n.prefix} ${n.abbrev}-${n.number} ${n.suffix}`;
  }
  if (n.kind === 'shield') {
    const base = n.placement === 'prefix'
      ? `${n.modifier} ${n.baseName}`
      : `${n.baseName} ${n.modifier}`;
    return n.digits ? `${base} ${n.digits}` : base;
  }
  return n.placement === 'prefix'
    ? `${n.modifier} ${n.baseName}`
    : `${n.baseName} ${n.modifier}`;
}

export function weaponFilenameStem(weapon: Weapon): string {
  const n = weapon.name;
  let parts: string[];
  if (n.kind === 'gun') {
    parts = [n.prefix, n.abbrev, n.number];
  } else if (n.kind === 'shield') {
    parts = n.placement === 'prefix' ? [n.modifier, n.baseName] : [n.baseName, n.modifier];
    if (n.digits) parts.push(n.digits);
  } else {
    parts = n.placement === 'prefix' ? [n.modifier, n.baseName] : [n.baseName, n.modifier];
  }
  return `lootbreaker-${parts.join('-')}`.toLowerCase().replace(/\s+/g, '-');
}
