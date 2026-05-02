import { findDamageIcon, findDie, type PsdLayer } from '../assets/psdManifest';
import type { ElementResult } from './types';
import type { DamageRowName } from '../assets/psdManifest';
import { parseDamage } from './damage';

const MAX_COLUMNS = 7;

// Decide which dice/element layers to render for a single damage row.
// Layout (left → right): each damage block is dice followed by its type icon,
// matching the example cards.
//   cols 1..N    : kinetic dice (one per kinetic die in the formula)
//   col  N+1     : kinetic damage icon
//   then for each element:
//     next cols  : bonus dice (one per bonus die, may be zero)
//     next col   : element damage icon
//   columns are capped at MAX_COLUMNS.
export function damageRowLayers(
  row: DamageRowName,
  kineticFormula: string,
  elements: ElementResult[],
): PsdLayer[] {
  const out: PsdLayer[] = [];
  const slots: Array<
    | { kind: 'icon'; element: 'Kinetic' | string }
    | { kind: 'die'; sides: number }
  > = [];

  // Kinetic dice → kinetic icon.
  const kineticTerms = parseDamage(kineticFormula);
  for (const term of kineticTerms) {
    for (let i = 0; i < term.count; i += 1) {
      slots.push({ kind: 'die', sides: term.sides });
    }
  }
  slots.push({ kind: 'icon', element: 'Kinetic' });

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
        ? findDie(row, column, slot.sides)
        : findDamageIcon(row, column, slot.element as never);
    if (layer) out.push(layer);
  }

  return out;
}
