import manifestJson from '../generated/psdManifest.json';
import type { Element, Rarity } from '../generation/types';

type DamageRowName = 'minor' | 'major' | 'grave';

type SemanticDescriptor =
  | { kind: 'background' }
  | { kind: 'gradientBg' }
  | { kind: 'paintstroke' }
  | { kind: 'weaponArtSlot' }
  | { kind: 'statisticsTable' }
  | { kind: 'topBacking' }
  | { kind: 'statsBacking' }
  | { kind: 'grunge' }
  | { kind: 'guildBox'; side: 'left' | 'right' }
  | { kind: 'quoteBottomRect' }
  | { kind: 'rarityText'; rarity: string }
  | { kind: 'rarityBox'; rarity: string; side: 'left' | 'right' }
  | { kind: 'die'; row: DamageRowName; column: number; sides: number }
  | { kind: 'damageIcon'; row: DamageRowName; column: number; element: string }
  | { kind: 'additionalEffectTextbox'; row: DamageRowName }
  | { kind: 'nameTextbox' }
  | { kind: 'guildTextbox' }
  | { kind: 'quoteTextbox' };

export interface PsdLayer {
  id: string;
  name: string;
  path: string[];
  file: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hidden: boolean;
  opacity: number;
  semantic: SemanticDescriptor | null;
}

export interface PsdManifest {
  canvas: { width: number; height: number };
  layers: PsdLayer[];
}

const manifest = manifestJson as PsdManifest;

export const PSD_CANVAS = manifest.canvas;
export const PSD_LAYERS = manifest.layers;

export function findLayer<T extends SemanticDescriptor>(
  predicate: (s: SemanticDescriptor) => s is T,
): PsdLayer | undefined {
  return manifest.layers.find((l) => l.semantic != null && predicate(l.semantic));
}

export function findByKind(kind: SemanticDescriptor['kind']): PsdLayer | undefined {
  return manifest.layers.find((l) => l.semantic?.kind === kind);
}

export function allByKind(kind: SemanticDescriptor['kind']): PsdLayer[] {
  return manifest.layers.filter((l) => l.semantic?.kind === kind);
}

export function findRarityText(rarity: Rarity): PsdLayer | undefined {
  return manifest.layers.find(
    (l) => l.semantic?.kind === 'rarityText' && l.semantic.rarity === rarity,
  );
}

export function findDie(row: DamageRowName, column: number, sides: number): PsdLayer | undefined {
  return manifest.layers.find(
    (l) =>
      l.semantic?.kind === 'die' &&
      l.semantic.row === row &&
      l.semantic.column === column &&
      l.semantic.sides === sides,
  );
}

// The two flanking lines of the guild strip. The guild name itself varies per
// roll (not in the PSD), so it's rendered as an HTML overlay in matching
// typography rather than coming from a layer here.
export function getGuildLayers(): PsdLayer[] {
  const out: PsdLayer[] = [];
  const boxL = manifest.layers.find(
    (l) => l.semantic?.kind === 'guildBox' && l.semantic.side === 'left',
  );
  const boxR = manifest.layers.find(
    (l) => l.semantic?.kind === 'guildBox' && l.semantic.side === 'right',
  );
  if (boxL) out.push(boxL);
  if (boxR) out.push(boxR);
  return out;
}

// All PSD layers that make up a rarity strip — flanking boxes (left, right)
// followed by the centered text. Each rarity has its own rasterized PNGs with
// the right CMYK fill color baked in. Some rarities (e.g. Luminous) have only
// the text layer; missing layers are silently dropped.
export function getRarityLayers(rarity: Rarity): PsdLayer[] {
  const out: PsdLayer[] = [];
  const boxL = manifest.layers.find(
    (l) =>
      l.semantic?.kind === 'rarityBox' &&
      l.semantic.rarity === rarity &&
      l.semantic.side === 'left',
  );
  const boxR = manifest.layers.find(
    (l) =>
      l.semantic?.kind === 'rarityBox' &&
      l.semantic.rarity === rarity &&
      l.semantic.side === 'right',
  );
  if (boxL) out.push(boxL);
  if (boxR) out.push(boxR);
  const text = findRarityText(rarity);
  if (text) out.push(text);
  return out;
}

// The Statistics Table raster (4 dividers + Minor/Major/Grave/Lightweight row
// labels) and the thin quote rule. The Statistics Table is post-processed at
// extract time to strip the rasterized "Tier 1 WEAPONTYPE / Range" header and
// the trailing "Effects" word — see `postProcessRaster` in extract-psd.mjs.
// Live header text is overlaid as HTML by WeaponCard.
export function getStatisticsLayers(): PsdLayer[] {
  const out: PsdLayer[] = [];
  const push = (l?: PsdLayer) => l && out.push(l);
  push(findByKind('statisticsTable'));
  push(findByKind('quoteBottomRect'));
  return out;
}

// The 8-layer card background, in PSD bottom-up stacking order.
export function getBackgroundLayers(): PsdLayer[] {
  const layers: PsdLayer[] = [];
  const push = (l?: PsdLayer) => l && layers.push(l);
  push(findByKind('background'));
  push(findByKind('gradientBg'));
  push(findByKind('paintstroke'));
  push(findByKind('topBacking'));
  allByKind('statsBacking').forEach(push);
  allByKind('grunge').forEach(push);
  return layers;
}

export function findDamageIcon(
  row: DamageRowName,
  column: number,
  element: Element | 'Kinetic' | 'Slashing',
): PsdLayer | undefined {
  return manifest.layers.find(
    (l) =>
      l.semantic?.kind === 'damageIcon' &&
      l.semantic.row === row &&
      l.semantic.column === column &&
      l.semantic.element === element,
  );
}

export type { DamageRowName };
