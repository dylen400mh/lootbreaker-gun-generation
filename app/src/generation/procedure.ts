import { d, mulberry32 } from './rng';
import {
  COMMON_ELEMENTS,
  COMMON_OR_RARE_ELEMENTS,
  lookupElementCell,
} from './tables/elements';
import { GUILDS, GUILD_BY_D12 } from './tables/guilds';
import { ABBREVIATIONS, PREFIXES, SUFFIXES } from './tables/naming';
import { MODULE_CHANCE } from './tables/moduleChance';
import { GUILD_MODULES } from './tables/modules';
import { RED_TEXT } from './tables/redText';
import { RARITY_TABLE } from './tables/rarity';
import {
  PLAYER_CHOICE_TYPES,
  WEAPON_BY_D8,
  WEAPON_TYPES,
} from './tables/weaponTypes';
import type { Element, ElementResult, GuildName, Rarity, Tier, Weapon, WeaponType } from './types';

export interface ChoicePrompt<T> {
  title: string;
  description?: string;
  options: ReadonlyArray<{ label: string; value: T }>;
}
export type AskChoice = <T>(prompt: ChoicePrompt<T>) => Promise<T>;

export interface GenerateOptions {
  tier: Tier;
  redTextEnabled: boolean;
  /** When set, skips the d8 weapon-type roll (and the player-choice path). */
  weaponType?: WeaponType;
  /** When set, skips the d12 guild roll. */
  guild?: GuildName;
  /** When set, skips the 2d6 rarity cross-table. */
  rarity?: Rarity;
  /** Optional explicit seed; defaults to a fresh random seed. */
  seed?: number;
}

const MAX_TYPE_REROLLS = 16;

export async function generateWeapon(
  opts: GenerateOptions,
  askChoice: AskChoice,
): Promise<Weapon> {
  const seed = opts.seed ?? (Math.floor(Math.random() * 2 ** 32) >>> 0);
  const rng = mulberry32(seed);

  // STEP 1 — Weapon Type (1d8). Slot 5 re-rolls; slot 8 prompts player choice.
  // Skipped entirely when opts.weaponType pins the value.
  let type: WeaponType | null = opts.weaponType ?? null;
  if (type == null) {
    for (let i = 0; i < MAX_TYPE_REROLLS; i += 1) {
      const roll = d(rng, 8);
      const slot = WEAPON_BY_D8[roll - 1];
      if (slot != null) {
        type = slot;
        break;
      }
      if (roll === 8) {
        type = await askChoice({
          title: 'Player Choice — Weapon Type',
          description: 'You rolled an 8. Choose the weapon type.',
          options: PLAYER_CHOICE_TYPES.map((t) => ({ label: t, value: t })),
        });
        break;
      }
      // roll === 5: slot is null and not Player Choice → re-roll silently.
    }
    if (type == null) {
      throw new Error('Failed to resolve weapon type after re-rolls.');
    }
  }
  const typeDef = WEAPON_TYPES[type];

  // STEP 2 — Guild (1d12). Skipped when opts.guild pins the value.
  const guildName: GuildName = opts.guild ?? GUILD_BY_D12[d(rng, 12) - 1];
  const guild = GUILDS[guildName];

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
    const m = GUILD_MODULES[guildName][moduleRoll - 1];
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
    const rt = RED_TEXT[rtRoll - 1];
    redText = { roll: rtRoll, title: rt.title, effect: rt.effect };
  }

  // STEP 7 — Name.
  const abbrevRoll = d(rng, 6);
  const abbrev = ABBREVIATIONS[type][abbrevRoll - 1].short;
  const number = String(d(rng, 999)).padStart(3, '0');
  const prefix = PREFIXES[d(rng, 100) - 1];
  const suffix = SUFFIXES[d(rng, 100) - 1];

  return {
    seed,
    tier: opts.tier,
    type,
    guild: guildName,
    guildPassive: guild.passive,
    guildBonus: guild.bonusByRarity[rarity],
    rarity,
    damage: typeDef.damage[opts.tier],
    range: typeDef.range,
    special: typeDef.special,
    elements,
    module: moduleEntry,
    redText,
    name: { prefix, abbrev, number, suffix },
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
