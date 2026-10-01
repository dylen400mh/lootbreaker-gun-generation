import {
  findDamageIcon,
  findDie,
  type ManifestKey,
  type PsdLayer,
} from '../assets/psdManifest';
import type { BaseDamage, ElementResult } from './types';
import type { DamageRowName } from '../assets/psdManifest';
import { parseDamage } from './damage';

const MAX_COLUMNS = 7;

interface RowBand {
  top: number;
  bottom: number;
}

// Interior of each damage row in the v0.12 "Statistics Tables NEW" rasters —
// the band between two dividers, in PSD canvas px. Gun and melee bake identical
// geometry (dividers at 619/709/794/880) so they share one table; the offensive
// spell frame is taller and has its own (dividers at 736/826/911/997).
const GUN_MELEE_ROW_BANDS: Record<DamageRowName, RowBand> = {
  minor: { top: 623, bottom: 708 },
  major: { top: 713, bottom: 793 },
  grave: { top: 798, bottom: 879 },
};

const SPELL_ROW_BANDS: Record<DamageRowName, RowBand> = {
  minor: { top: 740, bottom: 825 },
  major: { top: 831, bottom: 910 },
  grave: { top: 916, bottom: 996 },
};

// Frames that have damage rows. The AOE/support spell frame and the shield and
// potion cards have none.
const ROW_BANDS: Partial<Record<ManifestKey, Record<DamageRowName, RowBand>>> = {
  gun: GUN_MELEE_ROW_BANDS,
  melee: GUN_MELEE_ROW_BANDS,
  'spell-missile-beam': SPELL_ROW_BANDS,
};

// Breathing room between a slot glyph and the divider above/below it.
const ROW_PADDING = 4;

// One height cap for every dice/icon slot on every frame, taken from the
// tightest row across all of them (the spell major row, 80px). Capping globally
// rather than per row keeps an icon the same size in all three rows and across
// gun / melee / spell, which is what a stats table wants.
export const SLOT_MAX_HEIGHT =
  Math.min(
    ...Object.values(ROW_BANDS).flatMap((bands) =>
      Object.values(bands).map((b) => b.bottom - b.top + 1),
    ),
  ) - ROW_PADDING * 2;

// The PSDs' dice and damage-icon slots still sit at the pre-v0.12 row y and are
// sized for the taller old table, so every one of them overlaps a divider in the
// v0.12 rasters. Refit a slot into its row: scale down to the shared height cap
// (preserving aspect) and centre it on the row band, keeping the glyph's
// horizontal centre so column alignment is unchanged. Returns the layer
// unchanged for frames without damage rows.
export function fitSlotToRow(
  layer: PsdLayer,
  manifestKey: ManifestKey,
  row: DamageRowName,
): PsdLayer {
  const band = ROW_BANDS[manifestKey]?.[row];
  if (!band) return layer;
  const scale = Math.min(1, SLOT_MAX_HEIGHT / layer.height);
  const width = layer.width * scale;
  const height = layer.height * scale;
  return {
    ...layer,
    x: layer.x + (layer.width - width) / 2,
    y: (band.top + band.bottom + 1) / 2 - height / 2,
    width,
    height,
  };
}

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
  manifestKey: ManifestKey,
  row: DamageRowName,
  baseFormula: string,
  baseDamage: BaseDamage,
  elements: ElementResult[],
): PsdLayer[] {
  const out: PsdLayer[] = [];
  const slots: Array<
    | { kind: 'icon'; element: 'Kinetic' | 'Slashing' | string }
    | { kind: 'die'; sides: number }
    | { kind: 'number' }
  > = [];

  // Base damage → base damage icon. v0.12 base damage is a flat integer (no
  // dice terms); it occupies a single leading slot rendered as an HTML number
  // overlay by the card, so reserve column 1 for it here without a PSD layer.
  // Dice-based base formulas (melee/spell, pre-v0.12) still emit die layers.
  const baseTerms = parseDamage(baseFormula);
  if (baseTerms.length > 0) {
    for (const term of baseTerms) {
      for (let i = 0; i < term.count; i += 1) {
        slots.push({ kind: 'die', sides: term.sides });
      }
    }
  } else if (/\d/.test(baseFormula)) {
    slots.push({ kind: 'number' });
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
    // 'number' slots reserve a column but carry no PSD layer — the flat
    // base-damage number is drawn as an HTML overlay by the card.
    if (slot.kind === 'number') continue;
    const layer =
      slot.kind === 'die'
        ? findDie(manifestKey, row, column, slot.sides)
        : findDamageIcon(manifestKey, row, column, slot.element as never);
    if (layer) out.push(fitSlotToRow(layer, manifestKey, row));
  }

  return out;
}
