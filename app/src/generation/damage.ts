import type { DieSides } from '../assets/manifest';

export interface DiceTerm {
  count: number;
  sides: DieSides;
}

const VALID_SIDES = new Set<DieSides>([4, 6, 8, 10, 12, 20]);

// Parse strings like "1d4", "2d6", "1d20 + 1d12", "2d20 + 1d12".
// Whitespace tolerant. Ignores any term whose sides aren't a known die size.
export function parseDamage(formula: string): DiceTerm[] {
  const terms: DiceTerm[] = [];
  const re = /(\d+)\s*d\s*(\d+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(formula)) !== null) {
    const count = Number(m[1]);
    const sides = Number(m[2]) as DieSides;
    if (count > 0 && VALID_SIDES.has(sides)) {
      terms.push({ count, sides });
    }
  }
  return terms;
}
