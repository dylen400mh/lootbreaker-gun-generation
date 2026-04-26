import type { Element, WeaponType } from '../generation/types';

export const WEAPON_WIDTHS = [512, 1024, 2048] as const;
export type WeaponWidth = (typeof WEAPON_WIDTHS)[number];

const weaponSlugs: Record<WeaponType, string> = {
  Pistol: 'handgun',
  SMG: 'smg',
  Shotgun: 'shotgun',
  'Combat Rifle': 'combat-rifle',
  'Sniper Rifle': 'sniper-rifle',
  'Plasma Caster': 'plasma-caster',
};

export function weaponArtUrl(type: WeaponType, width: WeaponWidth = 1024): string {
  return `/weapons/${weaponSlugs[type]}-${width}.webp`;
}

export function pickWeaponWidth(targetCssWidth: number, dpr = 1): WeaponWidth {
  const target = targetCssWidth * Math.min(dpr, 2);
  for (const w of WEAPON_WIDTHS) if (w >= target) return w;
  return WEAPON_WIDTHS[WEAPON_WIDTHS.length - 1];
}

const elementSlugs: Record<Element, string> = {
  Acid: 'acid',
  Cold: 'cold',
  Fire: 'fire',
  Volt: 'volt',
  Dark: 'dark',
  Entropy: 'entropy',
  Light: 'light',
  Plasma: 'plasma',
};

export function elementIconUrl(element: Element): string {
  return `/icons/${elementSlugs[element]}.webp`;
}

export const KINETIC_ICON_URL = '/icons/kinetic.webp';

export type DieSides = 4 | 6 | 8 | 10 | 12 | 20;
export const DIE_SIDES: ReadonlyArray<DieSides> = [4, 6, 8, 10, 12, 20];

export function dieIconUrl(sides: DieSides): string {
  return `/dice/d${sides}.png`;
}
