// Source: spec Step 6 (Offensive) — Determine Damage Type. 2d12 (sums 2..24).
// Indexed by sum − 2. `null` slots are Player Choice (22–24).
import type { SpellDamageType } from '../../types';

export const DAMAGE_TYPE_BY_2D12: ReadonlyArray<SpellDamageType | null> = [
  // 2–3
  'Kinetic', 'Kinetic',
  // 4–5
  'Slashing', 'Slashing',
  // 6–8
  'Acid', 'Acid', 'Acid',
  // 9–11
  'Cold', 'Cold', 'Cold',
  // 12–14
  'Fire', 'Fire', 'Fire',
  // 15–17
  'Volt', 'Volt', 'Volt',
  // 18
  'Light',
  // 19
  'Dark',
  // 20
  'Plasma',
  // 21
  'Entropy',
  // 22–24
  null, null, null,
];

export const DAMAGE_TYPE_PLAYER_CHOICE: ReadonlyArray<SpellDamageType> = [
  'Kinetic',
  'Slashing',
  'Acid',
  'Cold',
  'Fire',
  'Volt',
  'Light',
  'Dark',
  'Plasma',
  'Entropy',
];
