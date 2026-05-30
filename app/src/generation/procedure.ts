import { d, mulberry32 } from './rng';
import {
  COMMON_ELEMENTS,
  COMMON_OR_RARE_ELEMENTS,
  lookupElementCell,
} from './tables/shared/elements';
import { MODULE_CHANCE } from './tables/shared/moduleChance';
import { RARITY_TABLE } from './tables/shared/rarity';
import { PREFIXES, SUFFIXES } from './tables/shared/naming';
import {
  GUILDS as GUN_GUILDS,
  GUILD_BY_D12 as GUN_GUILD_BY_D12,
} from './tables/gun/guilds';
import { ABBREVIATIONS } from './tables/gun/naming';
import { GUILD_MODULES as GUN_GUILD_MODULES } from './tables/gun/modules';
import { RED_TEXT as GUN_RED_TEXT } from './tables/gun/redText';
import {
  GUN_BY_D8,
  GUN_PLAYER_CHOICE_TYPES,
  GUN_TYPES,
} from './tables/gun/weaponTypes';
import {
  GUILDS as MELEE_GUILDS,
  GUILD_BY_D12 as MELEE_GUILD_BY_D12,
} from './tables/melee/guilds';
import { GUILD_MODULES as MELEE_GUILD_MODULES } from './tables/melee/modules';
import { RED_TEXT as MELEE_RED_TEXT } from './tables/melee/redText';
import {
  MELEE_BY_2D4,
  MELEE_PLAYER_CHOICE_TYPES,
  MELEE_TYPES,
} from './tables/melee/weaponTypes';
import { MELEE_BASE_NAMES } from './tables/melee/naming';
import {
  SHIELD_GUILD_BY_2D8,
  SHIELD_GUILDS,
  SHIELD_PLAYER_CHOICE_GUILDS,
} from './tables/shield/guilds';
import { SHIELD_BASE_NAMES } from './tables/shield/naming';
import { CAPACITY_BY_TIER_RARITY } from './tables/shield/capacity';
import { REGEN_BASE_BY_RARITY } from './tables/shield/regeneration';
import { BASE_THRESHOLDS_BY_TIER } from './tables/shield/thresholds';
import {
  MOD_CHANCE_BY_RARITY,
  THRESHOLD_MODIFIER_TABLE,
} from './tables/shield/thresholdModifier';
import { SUB_TYPE_BY_D20, SUB_TYPE_PLAYER_CHOICE } from './tables/spell/subType';
import {
  OFFENSIVE_DELIVERY_BY_D20,
  OFFENSIVE_DELIVERY_PLAYER_CHOICE,
  SUPPORT_DELIVERY_BY_D20,
  SUPPORT_DELIVERY_PLAYER_CHOICE,
} from './tables/spell/deliveryTypes';
import { OFFENSIVE_BASE_DAMAGE } from './tables/spell/baseDamage';
import { SUPPORT_BASE_HEALING } from './tables/spell/baseHealing';
import {
  DAMAGE_TYPE_BY_2D12,
  DAMAGE_TYPE_PLAYER_CHOICE,
} from './tables/spell/damageTypes';
import {
  CONDITION_BY_2D8,
  CONDITION_DURATION,
  CONDITION_SLOT_CHANCE,
} from './tables/spell/conditions';
import { HEALING_TYPE_BY_D6 } from './tables/spell/healingTypes';
import {
  OFFENSIVE_GUILD_BY_D12,
  SUPPORT_GUILD_BY_D6,
  resolveOffensiveBonus,
  resolveSupportBonus,
} from './tables/spell/guilds';
import {
  OFFENSIVE_MP_RARITY_ADDER,
  SUPPORT_MP_RARITY_ADDER,
} from './tables/spell/mpCost';
import {
  OFFENSIVE_SPELL_PREFIXES_D100,
  SUPPORT_SPELL_PREFIXES_D20,
} from './tables/spell/naming';
import type {
  BaseDamage,
  DamageGuildName,
  DamageRow,
  Element,
  ElementResult,
  GunWeapon,
  GuildName,
  GunType,
  MeleeType,
  MeleeWeapon,
  OffensiveSpellWeapon,
  Rarity,
  ShieldWeapon,
  SpellCondition,
  SpellDamageType,
  SpellDeliveryType,
  SpellHealingType,
  SpellSubType,
  SpellWeapon,
  SupportSpellWeapon,
  Tier,
  Weapon,
  WeaponCategory,
  WeaponName,
} from './types';

export interface ChoicePrompt<T> {
  title: string;
  description?: string;
  options: ReadonlyArray<{ label: string; value: T }>;
}
export type AskChoice = <T>(prompt: ChoicePrompt<T>) => Promise<T>;

export interface GenerateOptions {
  category: WeaponCategory;
  tier: Tier;
  redTextEnabled: boolean;
  /** When set, skips the weapon-type roll. Must match the chosen category. */
  weaponType?: GunType | MeleeType;
  /** When set, skips the d12 (gun/melee) or 2d8 (shield) guild roll. */
  guild?: GuildName;
  /** When set, skips the 2d6 rarity cross-table. */
  rarity?: Rarity;
  /** Optional explicit seed; defaults to a fresh random seed. */
  seed?: number;
  /** Shields only: when true, append a 1–3 digit numeric tag to the name. */
  shieldDigits?: boolean;
}

interface CategoryTables {
  guilds: typeof GUN_GUILDS;
  guildByD12: typeof GUN_GUILD_BY_D12;
  modules: typeof GUN_GUILD_MODULES;
  redText: typeof GUN_RED_TEXT;
}

const TABLES_BY_DAMAGE_CATEGORY: Record<'gun' | 'melee', CategoryTables> = {
  gun: {
    guilds: GUN_GUILDS,
    guildByD12: GUN_GUILD_BY_D12,
    modules: GUN_GUILD_MODULES,
    redText: GUN_RED_TEXT,
  },
  melee: {
    guilds: MELEE_GUILDS,
    guildByD12: MELEE_GUILD_BY_D12,
    modules: MELEE_GUILD_MODULES,
    redText: MELEE_RED_TEXT,
  },
};

const MAX_TYPE_REROLLS = 16;

export async function generateWeapon(
  opts: GenerateOptions,
  askChoice: AskChoice,
): Promise<Weapon> {
  const seed = opts.seed ?? (Math.floor(Math.random() * 2 ** 32) >>> 0);
  const rng = mulberry32(seed);

  if (opts.category === 'shield') {
    return generateShield(opts, seed, rng, askChoice);
  }

  if (opts.category === 'spell') {
    return generateSpell(opts, seed, rng, askChoice);
  }

  const category: 'gun' | 'melee' = opts.category;
  const tables = TABLES_BY_DAMAGE_CATEGORY[category];

  // STEP 1 — Weapon Type (category-specific roll).
  const { type, baseDamage, range, special, damageMatrix } =
    category === 'gun'
      ? await rollGunType(opts, rng, askChoice)
      : await rollMeleeType(opts, rng, askChoice);

  // STEP 2 — Guild (1d12). Skipped when opts.guild pins the value. The UI
  // gates Fortis/Ressurecta to the shield tab, so a non-DamageGuildName
  // override here would be a programmer error rather than reachable input.
  const guildName: DamageGuildName =
    (opts.guild as DamageGuildName | undefined) ?? tables.guildByD12[d(rng, 12) - 1];
  const guild = tables.guilds[guildName];

  // STEP 3 — Rarity (2d6 cross-table). Skipped when opts.rarity pins the value.
  let rarity: Rarity;
  if (opts.rarity) {
    rarity = opts.rarity;
  } else {
    const row = d(rng, 6);
    const col = d(rng, 6);
    rarity = RARITY_TABLE[row - 1][col - 1];
  }

  // STEP 4 — Element (d100 indexed by rarity).
  const elementRoll = d(rng, 100);
  const cell = lookupElementCell(elementRoll, rarity);
  const elements: ElementResult[] = await resolveElementCell(cell, askChoice);

  // STEP 5 — Module: chance roll, then guild module 1d6.
  const modulePct = MODULE_CHANCE[rarity][opts.tier];
  let moduleEntry: GunWeapon['module'] = null;
  if (modulePct > 0 && d(rng, 100) <= modulePct) {
    const moduleRoll = d(rng, 6);
    const m = tables.modules[guildName][moduleRoll - 1];
    moduleEntry = {
      guild: guildName,
      roll: moduleRoll,
      name: m.name,
      text: m.text,
    };
  }

  // STEP 6 — Red Text (toggle).
  let redText: GunWeapon['redText'] = null;
  if (opts.redTextEnabled) {
    const rtRoll = d(rng, 100);
    const rt = tables.redText[rtRoll - 1];
    redText = { roll: rtRoll, title: rt.title, effect: rt.effect };
  }

  // STEP 7 — Name (category-specific format).
  const name: WeaponName =
    category === 'gun'
      ? rollGunName(type as GunType, rng)
      : rollMeleeName(type as MeleeType, rng);

  const common = {
    seed,
    tier: opts.tier,
    baseDamage,
    guild: guildName,
    guildPassive: guild.passive,
    guildBonus: guild.bonusByRarity[rarity],
    guildBonusLabel: guild.bonusLabel,
    rarity,
    damage: damageMatrix[opts.tier],
    range,
    special,
    elements,
    module: moduleEntry,
    redText,
  };

  if (category === 'gun') {
    return {
      ...common,
      category: 'gun',
      type: type as GunType,
      name: name as Extract<WeaponName, { kind: 'gun' }>,
    } satisfies GunWeapon;
  }
  return {
    ...common,
    category: 'melee',
    type: type as MeleeType,
    name: name as Extract<WeaponName, { kind: 'melee' }>,
  } satisfies MeleeWeapon;
}

async function generateShield(
  opts: GenerateOptions,
  seed: number,
  rng: () => number,
  askChoice: AskChoice,
): Promise<ShieldWeapon> {
  // STEP 1 — Guild (2d8: sums 2..16). Sum 16 = Player Choice.
  let guildName: GuildName;
  if (opts.guild) {
    guildName = opts.guild;
  } else {
    const sum = d(rng, 8) + d(rng, 8);
    const slot = SHIELD_GUILD_BY_2D8[sum - 2];
    if (slot === 'PlayerChoice') {
      guildName = await askChoice<GuildName>({
        title: 'Player Choice — Shield Guild',
        description: 'You rolled a 16. Choose the shield guild.',
        options: SHIELD_PLAYER_CHOICE_GUILDS.map((g) => ({ label: g, value: g })),
      });
    } else {
      guildName = slot;
    }
  }
  const guild = SHIELD_GUILDS[guildName];

  // STEP 2 — Rarity (shared 2d6 cross-table).
  let rarity: Rarity;
  if (opts.rarity) {
    rarity = opts.rarity;
  } else {
    const row = d(rng, 6);
    const col = d(rng, 6);
    rarity = RARITY_TABLE[row - 1][col - 1];
  }

  // STEP 3 — Capacity (tier × rarity).
  const capacity = CAPACITY_BY_TIER_RARITY[opts.tier][rarity];

  // STEP 4 — Regeneration base (rarity → integer; "+ MND" rendered literally).
  const regenerationBase = REGEN_BASE_BY_RARITY[rarity];

  // STEP 5 — Guild passive value scaled by rarity.
  const guildPassive = {
    name: guild.passiveName,
    description: guild.description,
    value: guild.valueByRarity[rarity],
  };

  // STEP 6 — Base thresholds (player-tier only) + optional rarity-gated modifier.
  const thresholds = BASE_THRESHOLDS_BY_TIER[opts.tier];
  let thresholdModifier: ShieldWeapon['thresholdModifier'] = null;
  if (d(rng, 100) <= MOD_CHANCE_BY_RARITY[rarity]) {
    const modRoll = d(rng, 12);
    thresholdModifier = THRESHOLD_MODIFIER_TABLE[modRoll - 1];
  }

  // STEP 7 — Name (1d100 split: 1–50 prefix, 51–100 suffix) + 1d10 base name.
  const placementRoll = d(rng, 100);
  const usePrefix = placementRoll <= 50;
  const modifier = usePrefix
    ? PREFIXES[d(rng, 100) - 1]
    : SUFFIXES[d(rng, 100) - 1];
  const baseName = SHIELD_BASE_NAMES[d(rng, 10) - 1];
  // Optional digits — controlled by the UI checkbox. When on, roll the length
  // (1..3) then a uniform integer with that many digits.
  let digits: string | undefined;
  if (opts.shieldDigits) {
    const len = d(rng, 3);
    const upper = 10 ** len;
    digits = String(d(rng, upper)).padStart(len, '0');
  }

  return {
    category: 'shield',
    seed,
    tier: opts.tier,
    guild: guildName,
    rarity,
    capacity,
    regenerationBase,
    thresholds: { ...thresholds },
    thresholdModifier,
    guildPassive,
    name: {
      kind: 'shield',
      placement: usePrefix ? 'prefix' : 'suffix',
      modifier,
      baseName,
      digits,
    },
  };
}

async function generateSpell(
  opts: GenerateOptions,
  seed: number,
  rng: () => number,
  askChoice: AskChoice,
): Promise<SpellWeapon> {
  // STEP 0 — Spell sub-type (1d20).
  let subType: SpellSubType;
  const subRoll = d(rng, 20);
  const subSlot = SUB_TYPE_BY_D20[subRoll - 1];
  if (subSlot != null) {
    subType = subSlot;
  } else {
    subType = await askChoice<SpellSubType>({
      title: 'Player Choice — Spell Type',
      description: 'You rolled a 20. Choose the spell type.',
      options: SUB_TYPE_PLAYER_CHOICE.map((s) => ({ label: s, value: s })),
    });
  }

  // Rarity (2d6 cross-table, shared with gun/melee/shield). Skipped when
  // opts.rarity pins the value.
  let rarity: Rarity;
  if (opts.rarity) {
    rarity = opts.rarity;
  } else {
    const row = d(rng, 6);
    const col = d(rng, 6);
    rarity = RARITY_TABLE[row - 1][col - 1];
  }

  if (subType === 'Offensive') {
    return generateOffensiveSpell(opts, seed, rng, askChoice, rarity);
  }
  return generateSupportSpell(opts, seed, rng, askChoice, rarity);
}

async function generateOffensiveSpell(
  opts: GenerateOptions,
  seed: number,
  rng: () => number,
  askChoice: AskChoice,
  rarity: Rarity,
): Promise<OffensiveSpellWeapon> {
  // STEP 3 — Delivery Type (1d20).
  const delivery = await rollDelivery(
    rng,
    askChoice,
    OFFENSIVE_DELIVERY_BY_D20,
    OFFENSIVE_DELIVERY_PLAYER_CHOICE,
  );

  // STEP 4 — Base Damage (per delivery × tier).
  const damage = OFFENSIVE_BASE_DAMAGE[delivery][opts.tier];

  // STEP 5 — Guild (1d12) + per-rarity bonus value.
  let guild: DamageGuildName;
  if (opts.guild && OFFENSIVE_GUILD_BY_D12.includes(opts.guild as DamageGuildName)) {
    guild = opts.guild as DamageGuildName;
  } else {
    guild = OFFENSIVE_GUILD_BY_D12[d(rng, 12) - 1];
  }
  const guildBonus = resolveOffensiveBonus(guild, rarity);

  // STEP 6 — Damage Type (2d12, Player Choice on 22–24).
  const dtRoll = d(rng, 12) + d(rng, 12);
  const dtSlot = DAMAGE_TYPE_BY_2D12[dtRoll - 2];
  let damageType: SpellDamageType;
  if (dtSlot != null) {
    damageType = dtSlot;
  } else {
    damageType = await askChoice<SpellDamageType>({
      title: 'Player Choice — Damage Type',
      description: `You rolled a ${dtRoll}. Choose the damage type.`,
      options: DAMAGE_TYPE_PLAYER_CHOICE.map((t) => ({ label: t, value: t })),
    });
  }

  // STEP 7 / 7a / 7b — Conditions and Keywords.
  //  • Per-slot chance from CONDITION_SLOT_CHANCE.
  //  • For each successful slot, roll 2d8 → condition; re-roll duplicates
  //    until we either pick a new condition or exhaust the table.
  const chances = CONDITION_SLOT_CHANCE[opts.tier][rarity];
  const durations = CONDITION_DURATION[opts.tier][rarity];
  const conditions: SpellCondition[] = [];
  for (let slot = 0; slot < 3; slot += 1) {
    if (chances[slot] === 0) continue;
    if (d(rng, 100) > chances[slot]) continue;
    const picked = rollUniqueCondition(rng, conditions, durations[slot]);
    if (picked == null) break;
    conditions.push(picked);
  }

  // STEP 8 — MP cost: 1 + rarity + sum(condition MP costs) + (guild adders
  // already baked into the guildBonus value string when present). Guild
  // entries that add MP (Vandal "+1 MP", Arkana "-1 MP Cost", etc.) are
  // surfaced via the bonus value text; we don't double-count them.
  const conditionMp = conditions.reduce((sum, c) => sum + c.mpCost, 0);
  const mpCost = 1 + OFFENSIVE_MP_RARITY_ADDER[rarity] + conditionMp;

  // STEP 9 — Name. "Prefix [Delivery] of [DamageType]" — Kinetic prepends
  // "Kinetic " and drops the "of …" clause (handled in weaponDisplayName).
  const prefix = OFFENSIVE_SPELL_PREFIXES_D100[d(rng, 100) - 1];

  return {
    category: 'spell',
    subType: 'Offensive',
    seed,
    tier: opts.tier,
    rarity,
    guild,
    guildBonus,
    deliveryType: delivery,
    damage,
    damageType,
    conditions,
    mpCost,
    name: {
      kind: 'spell-offensive',
      prefix,
      deliveryType: delivery,
      damageType,
    },
  };
}

async function generateSupportSpell(
  opts: GenerateOptions,
  seed: number,
  rng: () => number,
  askChoice: AskChoice,
  rarity: Rarity,
): Promise<SupportSpellWeapon> {
  // STEP 3 — Delivery Type (1d20, support subset).
  const delivery = await rollDelivery(
    rng,
    askChoice,
    SUPPORT_DELIVERY_BY_D20,
    SUPPORT_DELIVERY_PLAYER_CHOICE,
  );

  // STEP 4 — Base Healing.
  const healingByTier = SUPPORT_BASE_HEALING[delivery];
  if (!healingByTier) {
    throw new Error(`No support healing entry for delivery "${delivery}"`);
  }
  const healing = healingByTier[opts.tier];

  // STEP 5 — Guild (1d6) + per-rarity bonus value.
  let guild: GuildName;
  if (opts.guild && SUPPORT_GUILD_BY_D6.includes(opts.guild)) {
    guild = opts.guild;
  } else {
    guild = SUPPORT_GUILD_BY_D6[d(rng, 6) - 1];
  }
  const guildBonus = resolveSupportBonus(guild, rarity);

  // STEP 6 — Healing Type (1d6 → Shields/Health).
  const healingType: SpellHealingType = HEALING_TYPE_BY_D6[d(rng, 6) - 1];

  // STEP 7 — MP Cost: 1 + rarity adder.
  const mpCost = 1 + SUPPORT_MP_RARITY_ADDER[rarity];

  // STEP 8 — Name. "Prefix [Delivery] of [HealingType]".
  const prefix = SUPPORT_SPELL_PREFIXES_D20[d(rng, 20) - 1];

  return {
    category: 'spell',
    subType: 'Support',
    seed,
    tier: opts.tier,
    rarity,
    guild,
    guildBonus,
    deliveryType: delivery,
    healing,
    healingType,
    mpCost,
    name: {
      kind: 'spell-support',
      prefix,
      deliveryType: delivery,
      healingType,
    },
  };
}

async function rollDelivery(
  rng: () => number,
  askChoice: AskChoice,
  table: ReadonlyArray<SpellDeliveryType | null>,
  playerChoice: ReadonlyArray<SpellDeliveryType>,
): Promise<SpellDeliveryType> {
  const roll = d(rng, 20);
  const slot = table[roll - 1];
  if (slot != null) return slot;
  return askChoice<SpellDeliveryType>({
    title: 'Player Choice — Delivery Type',
    description: 'You rolled a 20. Choose the delivery type.',
    options: playerChoice.map((t) => ({ label: t, value: t })),
  });
}

// 2d8 condition roll with duplicate avoidance. Returns null when every entry
// in the 15-row table has already been picked (so a 3-condition spell can
// stop early instead of looping forever).
function rollUniqueCondition(
  rng: () => number,
  existing: SpellCondition[],
  duration: number,
): SpellCondition | null {
  const taken = new Set(existing.map((c) => c.name));
  for (let i = 0; i < 32; i += 1) {
    const sum = d(rng, 8) + d(rng, 8);
    const entry = CONDITION_BY_2D8[sum - 2];
    if (!taken.has(entry.name)) {
      return { roll: sum, name: entry.name, mpCost: entry.mpCost, duration };
    }
  }
  return null;
}

interface ResolvedType {
  type: GunType | MeleeType;
  baseDamage: BaseDamage;
  range: string;
  special?: string;
  damageMatrix: Record<Tier, DamageRow>;
}

async function rollGunType(
  opts: GenerateOptions,
  rng: () => number,
  askChoice: AskChoice,
): Promise<ResolvedType> {
  let type: GunType | null = (opts.weaponType as GunType | undefined) ?? null;
  if (type == null) {
    for (let i = 0; i < MAX_TYPE_REROLLS; i += 1) {
      const roll = d(rng, 8);
      const slot = GUN_BY_D8[roll - 1];
      if (slot != null) {
        type = slot;
        break;
      }
      if (roll === 8) {
        type = await askChoice({
          title: 'Player Choice — Weapon Type',
          description: 'You rolled an 8. Choose the weapon type.',
          options: GUN_PLAYER_CHOICE_TYPES.map((t) => ({ label: t, value: t })),
        });
        break;
      }
      // roll === 5: slot is null and not Player Choice → re-roll silently.
    }
    if (type == null) {
      throw new Error('Failed to resolve weapon type after re-rolls.');
    }
  }
  const def = GUN_TYPES[type];
  return {
    type,
    baseDamage: def.baseDamage,
    range: def.range,
    special: def.special,
    damageMatrix: def.damage,
  };
}

async function rollMeleeType(
  opts: GenerateOptions,
  rng: () => number,
  askChoice: AskChoice,
): Promise<ResolvedType> {
  let type: MeleeType | null = (opts.weaponType as MeleeType | undefined) ?? null;
  if (type == null) {
    // 2d4: sums 2-7 are weapon types, 8 is Player Choice.
    const sum = d(rng, 4) + d(rng, 4);
    const slot = MELEE_BY_2D4[sum];
    if (slot != null) {
      type = slot;
    } else {
      // sum === 8 → player choice
      type = await askChoice({
        title: 'Player Choice — Weapon Type',
        description: 'You rolled an 8. Choose the weapon type.',
        options: MELEE_PLAYER_CHOICE_TYPES.map((t) => ({ label: t, value: t })),
      });
    }
  }
  const def = MELEE_TYPES[type];
  return {
    type,
    baseDamage: def.baseDamage,
    range: def.range,
    special: def.special,
    damageMatrix: def.damage,
  };
}

function rollGunName(type: GunType, rng: () => number): WeaponName {
  const abbrevRoll = d(rng, 6);
  const abbrev = ABBREVIATIONS[type][abbrevRoll - 1].short;
  const number = String(d(rng, 999)).padStart(3, '0');
  const prefix = PREFIXES[d(rng, 100) - 1];
  const suffix = SUFFIXES[d(rng, 100) - 1];
  return { kind: 'gun', prefix, abbrev, number, suffix };
}

function rollMeleeName(type: MeleeType, rng: () => number): WeaponName {
  const baseRoll = d(rng, 6);
  const baseName = MELEE_BASE_NAMES[type][baseRoll - 1];
  // Coin flip between prefix and suffix (spec: "Coin flip ... not both").
  const usePrefix = d(rng, 2) === 1;
  const modifier = usePrefix
    ? PREFIXES[d(rng, 100) - 1]
    : SUFFIXES[d(rng, 100) - 1];
  return {
    kind: 'melee',
    placement: usePrefix ? 'prefix' : 'suffix',
    modifier,
    baseName,
  };
}

async function resolveElementCell(
  cell: ReturnType<typeof lookupElementCell>,
  askChoice: AskChoice,
): Promise<ElementResult[]> {
  if (cell == null) return [];
  if (cell.kind === 'fixed') return [...cell.elements];
  if (cell.kind === 'choose-common') {
    const chosen = await askChoice<Element>({
      title: 'Choose Common Elemental Type',
      description: 'You rolled in the player-choice band. Pick one common element.',
      options: COMMON_ELEMENTS.map((e) => ({ label: e, value: e })),
    });
    return [{ element: chosen }];
  }
  if (cell.kind === 'choose-bonus') {
    const chosen = await askChoice<Element>({
      title: 'Choose Common or Rare Elemental Type',
      description: `You rolled in the player-choice band. Pick one element (${cell.bonusDice}).`,
      options: COMMON_OR_RARE_ELEMENTS.map((e) => ({ label: e, value: e })),
    });
    return [{ element: chosen, bonusDice: cell.bonusDice }];
  }
  if (cell.kind === 'choose-bonus-pair') {
    const first = await askChoice<Element>({
      title: 'Choose First Elemental Type',
      description: `Pick one element (${cell.bonusDice}).`,
      options: COMMON_OR_RARE_ELEMENTS.map((e) => ({ label: e, value: e })),
    });
    const second = await askChoice<Element>({
      title: 'Choose Second Elemental Type',
      description: `Pick a second element (${cell.bonusDice}).`,
      options: COMMON_OR_RARE_ELEMENTS.map((e) => ({ label: e, value: e })),
    });
    return [
      { element: first, bonusDice: cell.bonusDice },
      { element: second, bonusDice: cell.bonusDice },
    ];
  }
  // Exhaustiveness — unreachable.
  return [];
}

// Convenience for tests / repl: deterministic generation without a UI.
export function autoChoice(): AskChoice {
  return async <T>(prompt: ChoicePrompt<T>) => prompt.options[0].value;
}
