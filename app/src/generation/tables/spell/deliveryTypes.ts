// Source: spec v0.12 Step 3 (Offensive) and Step 3 (Support) — Determine
// Delivery Type. Both roll 1d20 but their tables differ.
import type { SpellDeliveryType } from '../../types';

// Offensive 1d20. `null` slot is Player Choice (20).
export const OFFENSIVE_DELIVERY_BY_D20: ReadonlyArray<SpellDeliveryType | null> = [
  // 1–7 Missile
  'Missile', 'Missile', 'Missile', 'Missile', 'Missile', 'Missile', 'Missile',
  // 8–13 Beam
  'Beam', 'Beam', 'Beam', 'Beam', 'Beam', 'Beam',
  // 14 Multi-Target Missile
  'Multi-Target Missile',
  // 15 Line, 16 Cone, 17 Cube, 18 Cylinder, 19 Sphere
  'Line', 'Cone', 'Cube', 'Cylinder', 'Sphere',
  // 20 Player Choice
  null,
];

export const OFFENSIVE_DELIVERY_PLAYER_CHOICE: ReadonlyArray<SpellDeliveryType> = [
  'Missile',
  'Beam',
  'Multi-Target Missile',
  'Line',
  'Cone',
  'Cube',
  'Cylinder',
  'Sphere',
];

// Support 1d20. `null` slot is Player Choice (20).
export const SUPPORT_DELIVERY_BY_D20: ReadonlyArray<SpellDeliveryType | null> = [
  // 1–8 Missile
  'Missile', 'Missile', 'Missile', 'Missile',
  'Missile', 'Missile', 'Missile', 'Missile',
  // 9–15 Beam
  'Beam', 'Beam', 'Beam', 'Beam', 'Beam', 'Beam', 'Beam',
  // 16–17 Multi-Target Missile
  'Multi-Target Missile', 'Multi-Target Missile',
  // 18–19 Cube
  'Cube', 'Cube',
  // 20 Player Choice
  null,
];

export const SUPPORT_DELIVERY_PLAYER_CHOICE: ReadonlyArray<SpellDeliveryType> = [
  'Missile',
  'Beam',
  'Multi-Target Missile',
  'Cube',
];

// Free-form description text for each delivery type, transcribed verbatim from
// the v0.12 offensive spec's delivery-type table. Card overlay uses the
// offensive text for offensive spells and the support text for support spells.
export const OFFENSIVE_DELIVERY_DESCRIPTIONS: Record<SpellDeliveryType, string> = {
  Missile: 'Does not require a clear path to target, but does require sight',
  Beam: 'Requires both sight of the target and a clear path to the target.',
  'Multi-Target Missile':
    'Does not require a clear path to each individual target, but does require sight',
  Line: 'Area-Of-Effect, Make an Impact Roll using the provided damage chart',
  Cone: 'Area-Of-Effect, Make an Impact Roll using the provided damage chart',
  Cube: 'Area-Of-Effect, Make an Impact Roll using the provided damage chart',
  Cylinder: 'Area-Of-Effect, Make an Impact Roll using the provided damage chart',
  Sphere: 'Area-Of-Effect, Make an Impact Roll using the provided damage chart',
};

export const SUPPORT_DELIVERY_DESCRIPTIONS: Partial<Record<SpellDeliveryType, string>> = {
  Missile: 'Does not require a clear path to target, but does require sight.',
  Beam: 'Requires both sight of the target and a clear path to the target.',
  'Multi-Target Missile':
    'Does not require a clear path to each individual target, but does require sight.',
  Cube: 'AOE, Allied Targets Only',
};
