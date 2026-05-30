// Source: spec Step 3 (Offensive) and Step 3 (Support) — Determine Delivery
// Type. Both roll 1d20 but their tables differ.
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
// the offensive spec (the support spec strips the conditions/accuracy details).
// Card overlay uses the offensive text for offensive spells and the support
// text for support spells.
export const OFFENSIVE_DELIVERY_DESCRIPTIONS: Record<SpellDeliveryType, string> = {
  Missile:
    'Does not require a clear path to target, but does require sight, Willpower Accuracy Roll Required. Conditions only apply on Major and Grave Hits',
  Beam:
    'Requires both sight of the target and a clear path to the target. Willpower Accuracy Roll required. Conditions only apply on Major and Grave Hits',
  'Multi-Target Missile':
    'Does not require a clear path to each individual target, but does require sight, Willpower Accuracy Roll Required. Conditions only apply on Grave Hits.',
  Line:
    'Area-Of-Effect, Attribute Check against your Willpower DC, Half Damage on Successful Check. Conditions only apply on Failure.',
  Cone:
    'Area-Of-Effect, Attribute Check against your Willpower DC, Half Damage on Successful Check. Conditions only apply on Failure.',
  Cube:
    'Area-Of-Effect, Attribute Check against your Willpower DC, Half Damage on Successful Check. Conditions only apply on Failure.',
  Cylinder:
    'Area-Of-Effect, Attribute Check against your Willpower DC, Half Damage on Successful Check. Conditions only apply on Failure.',
  Sphere:
    'Area-Of-Effect, Attribute Check against your Willpower DC, Half Damage on Successful Check. Conditions only apply on Failure.',
};

export const SUPPORT_DELIVERY_DESCRIPTIONS: Partial<Record<SpellDeliveryType, string>> = {
  Missile: 'Does not require a clear path to target, but does require sight.',
  Beam: 'Requires both sight of the target and a clear path to the target.',
  'Multi-Target Missile':
    'Does not require a clear path to each individual target, but does require sight.',
  Cube: 'AOE, Allied Targets Only',
};
