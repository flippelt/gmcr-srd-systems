/**
 * Multiataque, escala de dano por nível e benchmarks de CR.
 *
 * Convenção:
 * - "Marciais" (brute/soldier/skirmisher/archer/lurker) ganham ataques extras.
 * - Casters ficam em 1 ataque, mas escalam o dado de dano (estilo cantrip 5e).
 * - Leaders/minions seguem o ritmo 5e default (1, 2 a partir do nível 5 pra leader).
 *
 * Modelo `proficiency` (5e/PF2/SF2): todos os ataques do round usam o mesmo
 * bônus (mecânica de Extra Attack do 5e / Ações Multi-attack).
 *
 * Modelo `bab` (3.5/PF1/SF1): ataques iterativos com bônus decrescentes
 * (BAB / BAB−5 / BAB−10 / BAB−15), ganhando o próximo em BAB +6/+11/+16.
 */

import type { CRBenchmark, D20Model, NpcAttack, NpcRole } from './types'
import type { RoleDef } from './data'
import { clampLevel } from './d20'

const MARTIAL_ROLES: NpcRole[] = ['brute', 'soldier', 'skirmisher', 'archer', 'lurker']

/**
 * Número de ataques por turno pra um papel + modelo + nível.
 *
 * Marcial proficiency: 1 (1-4), 2 (5-10), 3 (11-19), 4 (20).
 * Marcial bab: 1 (1-5), 2 (6-10), 3 (11-15), 4 (16-20).
 * Caster: sempre 1 (dano escala pelos dados, não pelo nº de ataques).
 * Leader: 1 (1-4), 2 (5+).
 * Minion: sempre 1.
 */
export function attackCount(role: NpcRole, model: D20Model, level: number): number {
  const lvl = clampLevel(level)
  if (role === 'caster' || role === 'minion') return 1
  if (role === 'leader') return lvl < 5 ? 1 : 2
  if (!MARTIAL_ROLES.includes(role)) return 1

  if (model === 'proficiency') {
    if (lvl >= 20) return 4
    if (lvl >= 11) return 3
    if (lvl >= 5) return 2
    return 1
  }
  // BAB: a cada +5 BAB acima do limiar do iterativo, ganha um novo ataque.
  if (lvl >= 16) return 4
  if (lvl >= 11) return 3
  if (lvl >= 6) return 2
  return 1
}

/**
 * Quantidade de dados de dano por ataque, baseado no papel e nível.
 *
 * - Caster: cresce como cantrip 5e — 1 (1-4), 2 (5-10), 3 (11-16), 4 (17+).
 * - Brute: começa em 1, ganha um dado extra no nível 11 (representa golpes mais pesados).
 * - Outros marciais: 1 dado (a arma "escala" pela quantidade de ataques, não pelos dados).
 * - Leader/minion: 1 dado.
 */
export function damageDiceCount(role: NpcRole, level: number): number {
  const lvl = clampLevel(level)
  if (role === 'caster') {
    if (lvl >= 17) return 4
    if (lvl >= 11) return 3
    if (lvl >= 5) return 2
    return 1
  }
  if (role === 'brute') return lvl >= 11 ? 2 : 1
  return 1
}

/** Formata `N d S +/- M` numa string padrão. */
export function formatDamage(diceCount: number, sides: number, modifier: number): string {
  const dice = `${diceCount}d${sides}`
  if (modifier === 0) return dice
  return `${dice}${modifier > 0 ? '+' : ''}${modifier}`
}

/**
 * Constrói a lista de ataques pro NPC. Ataque assinatura vem primeiro;
 * iterativos (bab) ou multiattack repetidos (proficiency) seguem.
 */
export function buildAttacks(
  role: NpcRole,
  def: RoleDef,
  model: D20Model,
  level: number,
  abilityMod: number,
  attackProg: number,
): NpcAttack[] {
  const count = attackCount(role, model, level)
  const diceCount = damageDiceCount(role, level)
  const damage = formatDamage(diceCount, def.damageDie, abilityMod)
  const baseBonus = abilityMod + attackProg

  // Modelo proficiency: todos os ataques usam o mesmo bônus.
  if (model === 'proficiency') {
    return Array.from({ length: count }, () => ({
      name: def.attackName,
      bonus: baseBonus,
      damage,
    }))
  }

  // Modelo bab: iterativos decrescentes (−5 por ataque adicional).
  return Array.from({ length: count }, (_, i) => ({
    name: def.attackName,
    bonus: baseBonus - i * 5,
    damage,
  }))
}

/**
 * Tabela de benchmarks por nível/CR. Valores extraídos do estilo 5e DMG
 * "Monster Statistics by Challenge Rating", arredondados pra simplicidade.
 *
 * Uso: comparar HP/CA/ataque do NPC gerado com a expectativa do CR pra
 * detectar NPCs muito fracos/fortes. Não é enforcement — só referência.
 */
const BENCHMARK_TABLE: Record<number, Omit<CRBenchmark, 'level'>> = {
  1: { hp: 22, ac: 13, attackBonus: 3, damagePerRound: 5, saveDC: 13 },
  2: { hp: 38, ac: 13, attackBonus: 3, damagePerRound: 10, saveDC: 13 },
  3: { hp: 60, ac: 13, attackBonus: 4, damagePerRound: 17, saveDC: 13 },
  4: { hp: 85, ac: 14, attackBonus: 5, damagePerRound: 24, saveDC: 14 },
  5: { hp: 115, ac: 15, attackBonus: 6, damagePerRound: 33, saveDC: 15 },
  6: { hp: 140, ac: 15, attackBonus: 6, damagePerRound: 42, saveDC: 15 },
  7: { hp: 165, ac: 15, attackBonus: 6, damagePerRound: 50, saveDC: 15 },
  8: { hp: 195, ac: 16, attackBonus: 7, damagePerRound: 59, saveDC: 16 },
  9: { hp: 220, ac: 16, attackBonus: 7, damagePerRound: 68, saveDC: 16 },
  10: { hp: 250, ac: 17, attackBonus: 7, damagePerRound: 77, saveDC: 16 },
  11: { hp: 275, ac: 17, attackBonus: 8, damagePerRound: 86, saveDC: 17 },
  12: { hp: 305, ac: 17, attackBonus: 8, damagePerRound: 95, saveDC: 17 },
  13: { hp: 330, ac: 18, attackBonus: 8, damagePerRound: 104, saveDC: 18 },
  14: { hp: 360, ac: 18, attackBonus: 8, damagePerRound: 113, saveDC: 18 },
  15: { hp: 385, ac: 18, attackBonus: 8, damagePerRound: 122, saveDC: 18 },
  16: { hp: 415, ac: 18, attackBonus: 9, damagePerRound: 131, saveDC: 18 },
  17: { hp: 445, ac: 19, attackBonus: 10, damagePerRound: 140, saveDC: 19 },
  18: { hp: 475, ac: 19, attackBonus: 10, damagePerRound: 149, saveDC: 19 },
  19: { hp: 505, ac: 19, attackBonus: 10, damagePerRound: 158, saveDC: 19 },
  20: { hp: 535, ac: 19, attackBonus: 11, damagePerRound: 168, saveDC: 19 },
}

/**
 * Retorna o benchmark de stats pra um nível/CR (1..20). Clamping aplicado;
 * fora do range usa o valor mais próximo (nível 1 ou 20).
 */
export function getBenchmark(level: number): CRBenchmark {
  const lvl = clampLevel(level)
  return { level: lvl, ...BENCHMARK_TABLE[lvl]! }
}
