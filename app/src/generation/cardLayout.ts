import { findDamageIcon, findDie, type PsdLayer } from '../assets/psdManifest';
import type { BaseDamage, ElementResult, WeaponCategory } from './types';
import type { DamageRowName } from '../assets/psdManifest';
import { parseDamage } from './damage';

const MAX_COLUMNS = 7;

// Decide which dice/element layers to render for a single damage row.
// Layout (left → right): each damage block is dice followed by its type icon,
// matching the example cards.
//   cols 1..N    : base-type dice (one per die in the formula)
//   col  N+1     : base damage icon (Kinetic for guns / all melee Warhammer +
//                  Gauntlet; Slashing for melee Dagger, Sword, Lance, Axe)
//   then for each element:
//     next cols  : bonus dice (one per bonus die, may be zero)
//     next col   : element damage icon
//   columns are capped at MAX_COLUMNS.
export function damageRowLayers(
  category: WeaponCategory,
  row: DamageRowName,
  baseFormula: string,
  baseDamage: BaseDamage,
  elements: ElementResult[],
): PsdLayer[] {
  const out: PsdLayer[] = [];
  const slots: Array<
    | { kind: 'icon'; element: 'Kinetic' | 'Slashing' | string }
    | { kind: 'die'; sides: number }
  > = [];

  // Base-type dice → base damage icon.
  const baseTerms = parseDamage(baseFormula);
  for (const term of baseTerms) {
    for (let i = 0; i < term.count; i += 1) {
      slots.push({ kind: 'die', sides: term.sides });
    }
  }
  slots.push({ kind: 'icon', element: baseDamage });

  // Each elemental bonus: bonus dice (if any) → element icon.
  for (const el of elements) {
    if (el.bonusDice) {
      const bonusTerms = parseDamage(el.bonusDice);
      for (const term of bonusTerms) {
        for (let i = 0; i < term.count; i += 1) {
          slots.push({ kind: 'die', sides: term.sides });
        }
      }
    }
    slots.push({ kind: 'icon', element: el.element });
  }

  for (let i = 0; i < slots.length && i < MAX_COLUMNS; i += 1) {
    const column = i + 1;
    const slot = slots[i];
    const layer =
      slot.kind === 'die'
        ? findDie(category, row, column, slot.sides)
        : findDamageIcon(category, row, column, slot.element as never);
    if (layer) out.push(layer);
  }

  return out;
}
