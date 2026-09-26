// Source: spec v0.12 Step 4 (Offensive) — Determine Base Damage. Per delivery
// type × tier. v0.12 change: base damage is a flat integer per hit band
// (Minimum→minor, Medium→major, Maximum→grave), stored as numeric strings.
// Every delivery now supplies all three values (AOE deliveries used to give one
// flat value). Multi-Target Missile carries a target count; the AOE shapes
// (Cube/Cylinder/Sphere) carry an area string. Note the AOE deliveries scale
// DOWN from minor→grave (higher hit threshold → less area damage) per spec.
import type { OffensiveSpellDamage, SpellDeliveryType, Tier } from '../../types';

type DamageByTier = Record<Tier, OffensiveSpellDamage>;

export const OFFENSIVE_BASE_DAMAGE: Record<SpellDeliveryType, DamageByTier> = {
  Missile: {
    1: { minor: '2', major: '4', grave: '6', range: 8 },
    2: { minor: '4', major: '6', grave: '8', range: 10 },
    3: { minor: '6', major: '8', grave: '10', range: 12 },
  },
  Beam: {
    1: { minor: '4', major: '6', grave: '8', range: 6 },
    2: { minor: '6', major: '8', grave: '10', range: 8 },
    3: { minor: '8', major: '10', grave: '12', range: 10 },
  },
  // Spec heading reads "Multi-Single Target"; delivery-type table calls it
  // "Multi-Target Missile". We use the delivery-type name everywhere.
  'Multi-Target Missile': {
    1: { minor: '1', major: '2', grave: '4', range: 6, targets: 3 },
    2: { minor: '2', major: '3', grave: '5', range: 8, targets: 4 },
    3: { minor: '4', major: '5', grave: '7', range: 10, targets: 5 },
  },
  Line: {
    1: { minor: '8', major: '6', grave: '4', range: 8 },
    2: { minor: '10', major: '8', grave: '6', range: 10 },
    3: { minor: '12', major: '10', grave: '8', range: 12 },
  },
  Cone: {
    1: { minor: '10', major: '8', grave: '6', range: 2 },
    2: { minor: '12', major: '6', grave: '4', range: 4 },
    3: { minor: '14', major: '12', grave: '6', range: 5 },
  },
  Cube: {
    1: { minor: '5', major: '3', grave: '1', range: 6, area: '3x3x3' },
    2: { minor: '7', major: '5', grave: '3', range: 8, area: '4x4x4' },
    3: { minor: '9', major: '7', grave: '5', range: 10, area: '5x5x5' },
  },
  Cylinder: {
    1: { minor: '8', major: '6', grave: '4', range: 8, area: '1x1x3' },
    2: { minor: '10', major: '8', grave: '6', range: 10, area: '2x2x4' },
    3: { minor: '12', major: '10', grave: '8', range: 12, area: '3x3x5' },
  },
  Sphere: {
    1: { minor: '6', major: '4', grave: '2', range: 6, area: '3x3x3' },
    2: { minor: '8', major: '6', grave: '2', range: 8, area: '4x4x4' },
    3: { minor: '10', major: '8', grave: '6', range: 10, area: '5x5x5' },
  },
};
