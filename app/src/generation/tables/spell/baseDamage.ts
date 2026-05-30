// Source: spec Step 4 (Offensive) — Determine Base Damage. Per delivery type
// × tier. Single-target deliveries (Missile/Beam/Multi-Target Missile) supply
// Minor/Major/Grave dice; AOE deliveries (Line/Cone/Cube/Cylinder/Sphere)
// supply one flat damage string. AOE entries also carry an area string
// (LxWxH, spec format) when the spec lists one.
import type { OffensiveSpellDamage, SpellDeliveryType, Tier } from '../../types';

type DamageByTier = Record<Tier, OffensiveSpellDamage>;

export const OFFENSIVE_BASE_DAMAGE: Record<SpellDeliveryType, DamageByTier> = {
  Missile: {
    1: { kind: 'single-target', minor: '1d4', major: '1d6', grave: '2d6', range: 8 },
    2: { kind: 'single-target', minor: '1d6', major: '1d8', grave: '2d8', range: 10 },
    3: { kind: 'single-target', minor: '1d8', major: '1d10', grave: '2d10', range: 12 },
  },
  Beam: {
    1: { kind: 'single-target', minor: '1d6', major: '1d8', grave: '2d8', range: 6 },
    2: { kind: 'single-target', minor: '1d8', major: '1d10', grave: '2d10', range: 8 },
    3: { kind: 'single-target', minor: '1d10', major: '1d12', grave: '2d12', range: 10 },
  },
  // Spec heading reads "Multi-Single Target"; delivery-type table calls it
  // "Multi-Target Missile". We use the delivery-type name everywhere.
  'Multi-Target Missile': {
    1: { kind: 'single-target', minor: '1d4', major: '1d4', grave: '2d4', range: 6, targets: 3 },
    2: { kind: 'single-target', minor: '1d4', major: '1d6', grave: '2d6', range: 8, targets: 4 },
    3: { kind: 'single-target', minor: '1d6', major: '1d8', grave: '2d8', range: 10, targets: 5 },
  },
  Line: {
    1: { kind: 'aoe', damage: '3d4', range: 8 },
    2: { kind: 'aoe', damage: '3d6', range: 10 },
    3: { kind: 'aoe', damage: '3d8', range: 12 },
  },
  Cone: {
    1: { kind: 'aoe', damage: '3d4', range: 2 },
    2: { kind: 'aoe', damage: '2d6 + 1d4', range: 4 },
    3: { kind: 'aoe', damage: '2d8 + 1d4', range: 5 },
  },
  Cube: {
    1: { kind: 'aoe', damage: '2d6', range: 6, area: '3x3x3' },
    2: { kind: 'aoe', damage: '2d8', range: 8, area: '4x4x4' },
    3: { kind: 'aoe', damage: '2d10', range: 10, area: '5x5x5' },
  },
  Cylinder: {
    1: { kind: 'aoe', damage: '3d4', range: 8, area: '1x1x3' },
    2: { kind: 'aoe', damage: '2d6 + 1d4', range: 10, area: '2x2x4' },
    3: { kind: 'aoe', damage: '2d8 + 1d4', range: 12, area: '3x3x5' },
  },
  Sphere: {
    1: { kind: 'aoe', damage: '2d4 + 1d6', range: 6, area: '3x3x3' },
    2: { kind: 'aoe', damage: '3d6', range: 8, area: '4x4x4' },
    3: { kind: 'aoe', damage: '2d8 + 1d6', range: 10, area: '5x5x5' },
  },
};
