import { findDamageIcon, findDie, type PsdLayer } from '../assets/psdManifest';
import type { ElementResult } from './types';
import type { DamageRowName } from '../assets/psdManifest';
import { parseDamage } from './damage';

const MAX_COLUMNS = 7;

// Decide which dice/element layers to render for a single damage row.
// Layout (left → right):
//   col 1                : kinetic damage icon
//   col 2..(1+kineticN)  : kinetic dice (one per kinetic die in the formula)
//   then for each element:
//     next col           : element damage icon
//     following cols     : bonus dice (one per bonus die)
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

  // Kinetic icon + kinetic dice.
  slots.push({ kind: 'icon', element: 'Kinetic' });
  const kineticTerms = parseDamage(kineticFormula);
  for (const term of kineticTerms) {
    for (let i = 0; i < term.count; i += 1) {
      slots.push({ kind: 'die', sides: term.sides });
    }
  }

  // Each elemental bonus: icon + bonus dice.
  for (const el of elements) {
    slots.push({ kind: 'icon', element: el.element });
    if (el.bonusDice) {
      const bonusTerms = parseDamage(el.bonusDice);
      for (const term of bonusTerms) {
        for (let i = 0; i < term.count; i += 1) {
          slots.push({ kind: 'die', sides: term.sides });
        }
      }
    }
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
