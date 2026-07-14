import type { Ability, AbilityMethod, AbilityScores, AbilityMap, D20Model, NpcRole } from './types'
import { ROLES, type RoleDef } from './data'
import { rollDice } from './rng'

export function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function clampLevel(level: number): number {
  return Math.max(1, Math.min(20, Math.trunc(level)))
}

/** Bônus de proficiência (5e/PF2/SF2): 2 + ⌊(nível−1)/4⌋ (2..6). */
export function proficiencyBonus(level: number): number {
  return 2 + Math.floor((clampLevel(level) - 1) / 4)
}

/** BAB cheio aproximado para NPCs marciais (3.5/PF1/SF1): = nível. */
export function fullBab(level: number): number {
  return clampLevel(level)
}

export function attackProgression(model: D20Model, level: number): number {
  return model === 'proficiency' ? proficiencyBonus(level) : fullBab(level)
}

const STANDARD = [15, 14, 13, 12, 10, 8]
const ELITE = [17, 15, 14, 12, 11, 10]
const AVERAGE = [12, 11, 11, 10, 10, 10]

/** 6 valores via 4d6 descartando o menor, em ordem decrescente. */
function rolled4d6(): number[] {
  return Array.from({ length: 6 }, () => {
    const dice = rollDice(6, 4).sort((a, b) => b - a)
    return dice[0]! + dice[1]! + dice[2]!
  }).sort((a, b) => b - a)
}

export function generateAbilityScores(
  method: AbilityMethod,
  role: NpcRole,
  defOverride?: RoleDef,
): AbilityScores {
  const def = defOverride ?? ROLES[role]
  const pool =
    method === 'rolled'
      ? rolled4d6()
      : method === 'elite'
        ? ELITE
        : method === 'average'
          ? AVERAGE
          : STANDARD

  // Começa em 10/0 e distribui os maiores valores pelas prioridades do papel.
  const scores: AbilityScores = {
    str: { score: 10, mod: 0 },
    dex: { score: 10, mod: 0 },
    con: { score: 10, mod: 0 },
    int: { score: 10, mod: 0 },
    wis: { score: 10, mod: 0 },
    cha: { score: 10, mod: 0 },
  }
  def.priority.forEach((ab, i) => {
    const score = pool[i] ?? 10
    scores[ab] = { score, mod: abilityMod(score) }
  })
  return scores
}

export function deriveHp(role: RoleDef, level: number, conMod: number): number {
  const lvl = clampLevel(level)
  const avgPerDie = role.hitDie / 2 + 0.5
  return Math.max(1, Math.round((avgPerDie + conMod) * lvl))
}

export function deriveAc(role: RoleDef, dexMod: number): number {
  return 10 + role.armor + Math.min(dexMod, role.maxDex)
}

export function deriveSaves(
  abilities: AbilityScores,
  role: RoleDef,
  model: D20Model,
  level: number,
): AbilityMap<number> {
  const lvl = clampLevel(level)
  const prof = proficiencyBonus(lvl)
  const goodSave = Math.floor(lvl / 2) + 2
  const poorSave = Math.floor(lvl / 3)

  const save = (ab: Ability): number => {
    const mod = abilities[ab].mod
    const proficient = role.saveProfs.includes(ab)
    if (model === 'proficiency') return mod + (proficient ? prof : 0)
    return mod + (proficient ? goodSave : poorSave)
  }

  return {
    str: save('str'),
    dex: save('dex'),
    con: save('con'),
    int: save('int'),
    wis: save('wis'),
    cha: save('cha'),
  }
}
