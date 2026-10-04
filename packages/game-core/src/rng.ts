/**
 * Mulberry32: Gerador de números pseudo-aleatórios determinístico de 32 bits.
 * Garante que qualquer simulação seja 100% reproduzível a partir da mesma seed.
 */
export class DeterministicRNG {
  private state: number;

  constructor(seed: number = 1337) {
    this.state = seed >>> 0;
  }

  /**
   * Retorna um float determinístico entre [0, 1)
   */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Retorna um inteiro no intervalo [min, max]
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Escolhe um elemento aleatório de uma lista
   */
  pick<T>(items: T[]): T {
    const index = this.nextInt(0, items.length - 1);
    return items[index];
  }
}
