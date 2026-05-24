import type { MeleeType } from '../../types';

// Source: Lootbreaker_MeleeWeaponGeneration_Version0dot10.pdf — Step Seven.
// 1d6 per melee type → base name. Transcribed verbatim from the PDF.
export const MELEE_BASE_NAMES: Record<MeleeType, ReadonlyArray<string>> = {
  Dagger: ['Stiletto', 'Bootknife', 'Shiv', 'Dirk', 'Knife', 'Carver'],
  Sword: ['Sabre', 'Rapier', 'Estoc', 'Gladiolus', 'Bastard', 'Falchion'],
  Axe: ['Hatchet', 'Tomahawk', 'Executioner', 'Bearded', 'Greataxe', 'Battleaxe'],
  Warhammer: ['Maul', 'Crusher', 'Hammer', 'Forgehammer', 'Bec De Corbin', "Horseman’s Pick"],
  Gauntlet: ['Dusters', 'Cestus', 'Siegefist', 'Battlemitt', 'Powerglove', 'Claw'],
  Lance: ['Pike', 'Spear', 'Glaive', 'Trident', 'Dragoon', 'Javelin'],
};
