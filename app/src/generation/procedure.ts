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
import type {
  BaseDamage,
  DamageRow,
  Element,
  ElementResult,
  GuildName,
  GunType,
  MeleeType,
  Rarity,
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
  /** When set, skips the d12 guild roll. */
  guild?: GuildName;
  /** When set, skips the 2d6 rarity cross-table. */
  rarity?: Rarity;
  /** Optional explicit seed; defaults to a fresh random seed. */
  seed?: number;
}

interface CategoryTables {
  guilds: typeof GUN_GUILDS;
  guildByD12: typeof GUN_GUILD_BY_D12;
  modules: typeof GUN_GUILD_MODULES;
  redText: typeof GUN_RED_TEXT;
}

const TABLES_BY_CATEGORY: Record<WeaponCategory, CategoryTables> = {
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
  const tables = TABLES_BY_CATEGORY[opts.category];

  // STEP 1 — Weapon Type (category-specific roll).
  const { type, baseDamage, range, special, damageMatrix } =
    opts.category === 'gun'
      ? await rollGunType(opts, rng, askChoice)
      : await rollMeleeType(opts, rng, askChoice);

  // STEP 2 — Guild (1d12). Skipped when opts.guild pins the value.
  const guildName: GuildName = opts.guild ?? tables.guildByD12[d(rng, 12) - 1];
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
  let moduleEntry: Weapon['module'] = null;
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
  let redText: Weapon['redText'] = null;
  if (opts.redTextEnabled) {
    const rtRoll = d(rng, 100);
    const rt = tables.redText[rtRoll - 1];
    redText = { roll: rtRoll, title: rt.title, effect: rt.effect };
  }

  // STEP 7 — Name (category-specific format).
  const name: WeaponName =
    opts.category === 'gun'
      ? rollGunName(type as GunType, rng)
      : rollMeleeName(type as MeleeType, rng);

  return {
    seed,
    category: opts.category,
    tier: opts.tier,
    type,
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
    name,
  };
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
