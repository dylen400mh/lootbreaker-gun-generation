export type Tier = 1 | 2 | 3;

export type WeaponCategory = 'gun' | 'melee' | 'shield' | 'spell' | 'potion';

// Chests are a separate procedure from the four weapon categories — they
// produce a text loot bundle, not a weapon card. ChestSize lives here so the
// types file remains the single export point for shared procedure types.
export type ChestSize = 'Small' | 'Medium' | 'Large' | 'Giga';

export interface ChestRoll {
  size: ChestSize;
  tier: Tier;
  rolls: number[];
  total: number;
  gold: number;
  items: string;
}

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

// Fortis and Ressurecta are the two guilds that exist outside the 12-guild d12
// damage table. They appear on the shield 2d8 table and in the support-spell
// 1d6 guild table.
export type ShieldOnlyGuildName = 'Fortis' | 'Ressurecta';

export type GuildName = DamageGuildName | ShieldOnlyGuildName;

// Spell-only types.

export type SpellSubType = 'Offensive' | 'Support';

// v0.12: every offensive delivery supplies Minor/Major/Grave damage values, so
// offensive spells all render on the Missile/Beam (3-row) PSD frame. Support
// spells render on the AOE PSD frame (single healing row).
export type SpellDeliveryType =
  | 'Missile'
  | 'Beam'
  | 'Multi-Target Missile'
  | 'Line'
  | 'Cone'
  | 'Cube'
  | 'Cylinder'
  | 'Sphere';

// Spec damage-type list (2d12). Wider than Element — includes Kinetic +
// Slashing (which Element excludes since guns/melee derive base damage from
// weapon type rather than rolling). Kept separate to avoid forcing gun/melee
// to widen their Element type.
export type SpellDamageType =
  | 'Kinetic'
  | 'Slashing'
  | 'Acid'
  | 'Cold'
  | 'Fire'
  | 'Volt'
  | 'Light'
  | 'Dark'
  | 'Plasma'
  | 'Entropy';

export type SpellHealingType = 'Shields' | 'Health';

// 2d8 condition slot. MP cost is the spec's per-condition adder (Step 7a);
// duration is the per-tier × rarity × slot value from Step 7b.
export interface SpellCondition {
  roll: number;
  name: string;
  mpCost: number;
  duration: number;
}

// v0.12 offensive base damage: a flat integer per hit band (Minimum→minor,
// Medium→major, Maximum→grave), stored as numeric strings. Every delivery
// carries a numeric range; AOE deliveries add an area string (spec format
// "LxWxH"); Multi-Target Missile carries a target count.
export interface OffensiveSpellDamage {
  minor: string;
  major: string;
  grave: string;
  range: number;
  area?: string;
  targets?: number;
}

export interface SupportSpellHealing {
  healing: string;
  range: number;
  vitalityCost: number;
  area?: string;
}

export interface SpellGuildBonus {
  name: string;
  description: string;
  // Value rendered on the card for the spell's rarity (spec uses literal "X"
  // for Common when the guild offers no bonus).
  value: string;
}

export interface OffensiveSpellWeapon {
  category: 'spell';
  subType: 'Offensive';
  seed: number;
  tier: Tier;
  rarity: Rarity;
  guild: DamageGuildName;
  guildBonus: SpellGuildBonus;
  deliveryType: SpellDeliveryType;
  damage: OffensiveSpellDamage;
  damageType: SpellDamageType;
  conditions: SpellCondition[];
  mpCost: number;
  name: Extract<WeaponName, { kind: 'spell-offensive' }>;
}

export interface SupportSpellWeapon {
  category: 'spell';
  subType: 'Support';
  seed: number;
  tier: Tier;
  rarity: Rarity;
  guild: GuildName;
  guildBonus: SpellGuildBonus;
  deliveryType: SpellDeliveryType;
  healing: SupportSpellHealing;
  healingType: SpellHealingType;
  mpCost: number;
  name: Extract<WeaponName, { kind: 'spell-support' }>;
}

export type SpellWeapon = OffensiveSpellWeapon | SupportSpellWeapon;

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
// appended when the UI toggle is on. Offensive spells: "Prefix [Delivery]
// of [DamageType]" — Kinetic damage uses "Kinetic Prefix [Delivery]" instead.
// Support spells: "Prefix [Delivery] of [HealingType]".
export type WeaponName =
  | { kind: 'gun'; prefix: string; abbrev: string; number: string; suffix: string }
  | { kind: 'melee'; placement: 'prefix' | 'suffix'; modifier: string; baseName: string }
  | {
      kind: 'shield';
      placement: 'prefix' | 'suffix';
      modifier: string;
      baseName: string;
      digits?: string;
    }
  | {
      kind: 'spell-offensive';
      prefix: string;
      deliveryType: SpellDeliveryType;
      damageType: SpellDamageType;
    }
  | {
      kind: 'spell-support';
      prefix: string;
      deliveryType: SpellDeliveryType;
      healingType: SpellHealingType;
    }
  | { kind: 'potion'; baseName: string };

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

// One per-guild passive scaled by rarity. Description text is constant across
// rarities; only the value (e.g. "+1", "1d6", "+5 Capacity, -1 Regeneration")
// changes. Spec uses literal "X" for Common when the guild has no bonus.
export interface ShieldGuildPassive {
  name: string;
  description: string;
  value: string;
}

// Potions roll the shared rarity table (2d6) then a per-rarity result table
// that produces a (name, description) pair. No weapon type, guild, damage
// dice, elements, or red text — the card just renders the name and the
// description.
export interface PotionEffect {
  roll: number;
  name: string;
  description: string;
}

export interface PotionWeapon {
  category: 'potion';
  seed: number;
  tier: Tier;
  rarity: Rarity;
  effect: PotionEffect;
  name: Extract<WeaponName, { kind: 'potion' }>;
}

export interface ShieldWeapon {
  category: 'shield';
  seed: number;
  tier: Tier;
  guild: GuildName;
  rarity: Rarity;
  // Capacity is tier × rarity (3×5 table). Stored as the resolved scalar.
  capacity: number;
  // v0.12 regeneration is "<base> + INT" where base depends on rarity (1..5)
  // and INT is a player stat we don't evaluate. Card renders the formula
  // literally. Does not change across tiers.
  regenerationBase: number;
  guildPassive: ShieldGuildPassive;
  name: Extract<WeaponName, { kind: 'shield' }>;
}

export type Weapon = GunWeapon | MeleeWeapon | ShieldWeapon | SpellWeapon | PotionWeapon;

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
  if (n.kind === 'spell-offensive') {
    // Spec: "Prefix [Delivery] of [DamageType]"; Kinetic damage uses
    // "Kinetic Prefix [Delivery]" with no trailing "of …" clause.
    if (n.damageType === 'Kinetic') {
      return `Kinetic ${n.prefix} ${n.deliveryType}`;
    }
    return `${n.prefix} ${n.deliveryType} of ${n.damageType}`;
  }
  if (n.kind === 'spell-support') {
    return `${n.prefix} ${n.deliveryType} of ${n.healingType}`;
  }
  if (n.kind === 'potion') {
    return n.baseName;
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
  } else if (n.kind === 'spell-offensive') {
    parts = n.damageType === 'Kinetic'
      ? ['Kinetic', n.prefix, n.deliveryType]
      : [n.prefix, n.deliveryType, n.damageType];
  } else if (n.kind === 'spell-support') {
    parts = [n.prefix, n.deliveryType, n.healingType];
  } else if (n.kind === 'potion') {
    parts = ['potion', n.baseName];
  } else {
    parts = n.placement === 'prefix' ? [n.modifier, n.baseName] : [n.baseName, n.modifier];
  }
  return `lootbreaker-${parts.join('-')}`.toLowerCase().replace(/\s+/g, '-');
}
