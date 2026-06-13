import gunManifestJson from '../generated/gunPsdManifest.json';
import meleeManifestJson from '../generated/meleePsdManifest.json';
import shieldManifestJson from '../generated/shieldPsdManifest.json';
import spellAoeManifestJson from '../generated/spellAoePsdManifest.json';
import spellMissileBeamManifestJson from '../generated/spellMissileBeamPsdManifest.json';
import potionManifestJson from '../generated/potionPsdManifest.json';
import type {
  Element,
  Rarity,
  SpellDeliveryType,
  WeaponCategory,
} from '../generation/types';
import { SINGLE_TARGET_DELIVERIES } from '../generation/types';

// Spells ship two PSDs (delivery-type dependent), so the manifest key set is
// wider than WeaponCategory. Everything except spells uses the category as-is.
export type ManifestKey =
  | 'gun'
  | 'melee'
  | 'shield'
  | 'spell-aoe'
  | 'spell-missile-beam'
  | 'potion';

export function spellManifestKey(delivery: SpellDeliveryType): ManifestKey {
  return SINGLE_TARGET_DELIVERIES.includes(delivery)
    ? 'spell-missile-beam'
    : 'spell-aoe';
}

type DamageRowName = 'minor' | 'major' | 'grave';

type SemanticDescriptor =
  | { kind: 'background' }
  | { kind: 'gradientBg' }
  | { kind: 'paintstroke' }
  | { kind: 'weaponArtSlot' }
  | { kind: 'spellArt' }
  | { kind: 'potionArt' }
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
  | { kind: 'quoteTextbox' }
  // Shield-only stat tables, effects-box header, panel backings, and decor.
  | { kind: 'thresholdTable' }
  | { kind: 'regenTable' }
  | { kind: 'capacityTable' }
  | { kind: 'effectsBox' }
  | { kind: 'effectsPanel'; slot: 'threshold' | 'capacity' | 'regen' }
  | { kind: 'decorAccent'; side: 'left' | 'right' };

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

const MANIFESTS: Record<ManifestKey, PsdManifest> = {
  gun: gunManifestJson as PsdManifest,
  melee: meleeManifestJson as PsdManifest,
  shield: shieldManifestJson as PsdManifest,
  'spell-aoe': spellAoeManifestJson as PsdManifest,
  'spell-missile-beam': spellMissileBeamManifestJson as PsdManifest,
  potion: potionManifestJson as PsdManifest,
};

// Both PSDs use the same 1000×1363 canvas. The composite scaler treats the
// canvas as a fixed-size design surface independent of category.
export const PSD_CANVAS = MANIFESTS.gun.canvas;

export function psdCanvas(key: ManifestKey) {
  return MANIFESTS[key].canvas;
}

export function psdLayers(key: ManifestKey): PsdLayer[] {
  return MANIFESTS[key].layers;
}

export function findByKind(
  key: ManifestKey,
  kind: SemanticDescriptor['kind'],
): PsdLayer | undefined {
  return MANIFESTS[key].layers.find((l) => l.semantic?.kind === kind);
}

export function allByKind(
  key: ManifestKey,
  kind: SemanticDescriptor['kind'],
): PsdLayer[] {
  return MANIFESTS[key].layers.filter((l) => l.semantic?.kind === kind);
}

export function findRarityText(key: ManifestKey, rarity: Rarity): PsdLayer | undefined {
  return MANIFESTS[key].layers.find(
    (l) => l.semantic?.kind === 'rarityText' && l.semantic.rarity === rarity,
  );
}

export function findDie(
  key: ManifestKey,
  row: DamageRowName,
  column: number,
  sides: number,
): PsdLayer | undefined {
  return MANIFESTS[key].layers.find(
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
export function getGuildLayers(key: ManifestKey): PsdLayer[] {
  const layers = MANIFESTS[key].layers;
  const out: PsdLayer[] = [];
  const boxL = layers.find((l) => l.semantic?.kind === 'guildBox' && l.semantic.side === 'left');
  const boxR = layers.find((l) => l.semantic?.kind === 'guildBox' && l.semantic.side === 'right');
  if (boxL) out.push(boxL);
  if (boxR) out.push(boxR);
  return out;
}

// All PSD layers that make up a rarity strip — flanking boxes (left, right)
// followed by the centered text. Each rarity has its own rasterized PNGs with
// the right CMYK fill color baked in. Some rarities (e.g. Luminous) have only
// the text layer; missing layers are silently dropped.
export function getRarityLayers(key: ManifestKey, rarity: Rarity): PsdLayer[] {
  const layers = MANIFESTS[key].layers;
  const out: PsdLayer[] = [];
  const boxL = layers.find(
    (l) =>
      l.semantic?.kind === 'rarityBox' &&
      l.semantic.rarity === rarity &&
      l.semantic.side === 'left',
  );
  const boxR = layers.find(
    (l) =>
      l.semantic?.kind === 'rarityBox' &&
      l.semantic.rarity === rarity &&
      l.semantic.side === 'right',
  );
  if (boxL) out.push(boxL);
  if (boxR) out.push(boxR);
  const text = findRarityText(key, rarity);
  if (text) out.push(text);
  return out;
}

// The Statistics Table raster (4 dividers + Minor/Major/Grave/Lightweight row
// labels) and the thin quote rule. The Statistics Table is post-processed at
// extract time to strip the rasterized "Tier 1 WEAPONTYPE / Range" header and
// the trailing "Effects" word — see `postProcessRaster` in extract-psd.mjs.
// Live header text is overlaid as HTML by WeaponCard.
export function getStatisticsLayers(key: ManifestKey): PsdLayer[] {
  const out: PsdLayer[] = [];
  const push = (l?: PsdLayer) => l && out.push(l);
  push(findByKind(key, 'statisticsTable'));
  push(findByKind(key, 'quoteBottomRect'));
  return out;
}

// The card background, in PSD bottom-up stacking order. Gun/melee have a
// `paintstroke` layer that shield's PSD doesn't; shield contributes
// effectsPanel dark backings (under the stat tables) and two decorAccent
// slashes (flanking the title — must paint in front of the panels); spells
// contribute the `spellArt` book illustration (Layer 191 / 553 in the PSDs)
// which sits between the grunge and the rarity strip. Missing kinds are
// silently skipped.
export function getBackgroundLayers(key: ManifestKey): PsdLayer[] {
  const layers: PsdLayer[] = [];
  const push = (l?: PsdLayer) => l && layers.push(l);
  push(findByKind(key, 'background'));
  push(findByKind(key, 'gradientBg'));
  push(findByKind(key, 'paintstroke'));
  push(findByKind(key, 'topBacking'));
  allByKind(key, 'statsBacking').forEach(push);
  allByKind(key, 'grunge').forEach(push);
  push(findByKind(key, 'spellArt'));
  push(findByKind(key, 'potionArt'));
  allByKind(key, 'effectsPanel').forEach(push);
  allByKind(key, 'decorAccent').forEach(push);
  return layers;
}

// Shield "stats card" foreground layers — the threshold/capacity/regen
// labels, the effects-box header frame, and the quote rule. Panels are part
// of the background (see getBackgroundLayers) so the decor accents paint in
// front of them.
export function getShieldTableLayers(): PsdLayer[] {
  const out: PsdLayer[] = [];
  const push = (l?: PsdLayer) => l && out.push(l);
  push(findByKind('shield', 'thresholdTable'));
  push(findByKind('shield', 'capacityTable'));
  push(findByKind('shield', 'regenTable'));
  push(findByKind('shield', 'effectsBox'));
  push(findByKind('shield', 'quoteBottomRect'));
  return out;
}

export function findDamageIcon(
  key: ManifestKey,
  row: DamageRowName,
  column: number,
  element: Element | 'Kinetic' | 'Slashing',
): PsdLayer | undefined {
  return MANIFESTS[key].layers.find(
    (l) =>
      l.semantic?.kind === 'damageIcon' &&
      l.semantic.row === row &&
      l.semantic.column === column &&
      l.semantic.element === element,
  );
}

// Most callers still operate on `WeaponCategory` (gun/melee/shield/potion).
// For those the ManifestKey is identical to the category name; only spell
// rendering has to pick a variant first (AOE vs Missile/Beam).
export function categoryToManifestKey(category: Exclude<WeaponCategory, 'spell'>): ManifestKey {
  return category;
}

export type { DamageRowName };
