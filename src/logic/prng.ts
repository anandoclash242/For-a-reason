/**
 * Mulberry32 seeded pseudo-random number generator
 */
export class PRNG {
  private s: number;

  constructor(seed: number = 1337) {
    this.s = seed >>> 0;
  }

  public next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  public int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  public pick<T>(array: T[]): T {
    return array[this.int(0, array.length - 1)];
  }

  public chance(probability: number): boolean {
    return this.next() < probability;
  }
}

export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
