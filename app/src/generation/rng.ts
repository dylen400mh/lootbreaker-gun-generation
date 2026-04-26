export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function d(rng: Rng, sides: number): number {
  return 1 + Math.floor(rng() * sides);
}

export function rollN(rng: Rng, count: number, sides: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i += 1) out.push(d(rng, sides));
  return out;
}

export function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}
