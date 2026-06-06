// RNG injetável (mesmo padrão dos pacotes de sistema): por padrão usa
// Math.random; testes e geração por seed injetam um gerador determinístico
// via setRng / seededRoller.

export type Roller = (sides: number) => number

const defaultRoller: Roller = (sides) => Math.floor(Math.random() * sides) + 1

let roller: Roller = defaultRoller

export function setRng(fn: Roller): void {
  roller = fn
}

export function resetRng(): void {
  roller = defaultRoller
}

/** Rola um dado de `sides` lados (1..sides). */
export function d(sides: number): number {
  return roller(sides)
}

/** Rola `count` dados de `sides` lados. */
export function rollDice(sides: number, count: number): number[] {
  const out: number[] = []
  for (let i = 0; i < count; i++) out.push(d(sides))
  return out
}

/** Escolhe um elemento do array usando o RNG corrente. */
export function pick<T>(arr: readonly T[]): T {
  return arr[d(arr.length) - 1]!
}

/** PRNG determinístico (mulberry32) exposto como Roller — para testes e
 *  geração reproduzível por seed. */
export function seededRoller(seed: number): Roller {
  let s = seed >>> 0
  return (sides: number) => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296
    return Math.floor(r * sides) + 1
  }
}
