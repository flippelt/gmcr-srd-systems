/**
 * Tuning específico por sistema d20.
 *
 * - Magia para casters (CD/ataque de magia + dano de cantrip)
 * - Starfinder (1e/2e): Stamina, KAC/EAC, Resolve
 * - PF2e/SF2e: patente de proficiência por nível
 *
 * Observação sobre PF2e/SF2e: a matemática real é `level + rank bonus`
 * (rank 2/4/6/8 pra trained/expert/master/legendary). Os pacotes pathfinder-2e
 * e starfinder-2e passam isso via `System.npc.attackProgression`, que o gerador
 * aplica; a `proficiencyRank` aqui é só a etiqueta legível correspondente.
 */

import type {
  Ability,
  D20Model,
  NpcMagic,
  NpcStarfinderTuning,
  ProficiencyRank,
} from './types'
import { clampLevel } from './d20'
import { damageDiceCount, formatDamage } from './combat'

/**
 * Calcula CD e bônus de ataque mágico no estilo 5e SRD:
 *   spellSaveDC      = 8 + prof + mod
 *   spellAttackBonus = prof + mod
 *
 * Para o modelo `bab`, usamos o BAB no lugar de prof (aproximação razoável
 * pra NPCs casters de 3.5/PF1 — bardo/feiticeiro etc. fazem ataques mágicos
 * com BAB do nível de classe).
 */
export function getMagicStats(
  spellAbility: Ability,
  abilityMod: number,
  attackProg: number,
  model: D20Model,
  level: number,
  /** Hook opcional do sistema pra override do nº de dados de cantrip. */
  cantripDamageDiceHook?: (level: number) => number,
): NpcMagic {
  // prof do 5e quando proficiency; senão BAB direto do PR 1 (já vem em prog).
  const prof = attackProg
  const cantripDieCount =
    cantripDamageDiceHook?.(level) ?? damageDiceCount('caster', level)
  // d8 padrão como dado de cantrip (similar ao Fire Bolt do 5e).
  const cantripDamage = formatDamage(cantripDieCount, 8, abilityMod)
  return {
    spellAbility,
    spellSaveDC: 8 + prof + abilityMod,
    spellAttackBonus: prof + abilityMod,
    cantripDamage,
  }
}

/**
 * Stats específicos do Starfinder. Heurísticas conservadoras:
 *
 * - **Stamina** (SF1: ~5 + CON_mod por nível; SF2: ~2 + CON_mod por nível).
 * - **KAC** (Kinetic AC) ≈ CA base do papel.
 * - **EAC** (Energy AC) = KAC − 1 (energia geralmente atinge mais fácil).
 * - **Resolve** = ⌊level / 2⌋ + 1, mín 1.
 *
 * Reconhece SF1 vs SF2 pelo `model` (bab vs proficiency, respectivamente).
 */
export function getStarfinderTuning(
  ac: number,
  conMod: number,
  level: number,
  model: D20Model,
): NpcStarfinderTuning {
  const lvl = clampLevel(level)
  const stamPerLevel = model === 'bab' ? 5 : 2 // SF1 mais generoso que SF2
  const stamina = Math.max(0, (stamPerLevel + conMod) * lvl)
  const kac = ac
  const eac = Math.max(0, ac - 1)
  const resolve = Math.max(1, Math.floor(lvl / 2) + 1)
  return { stamina, kac, eac, resolve }
}

/**
 * Patente de proficiência (PF2/SF2) pra um NPC desse nível.
 *
 * - 1-4   → trained
 * - 5-10  → expert
 * - 11-16 → master
 * - 17+   → legendary
 *
 * NPCs no PF2 sempre têm pelo menos trained; untrained não é gerado.
 */
export function getProficiencyRank(level: number): ProficiencyRank {
  const lvl = clampLevel(level)
  if (lvl >= 17) return 'legendary'
  if (lvl >= 11) return 'master'
  if (lvl >= 5) return 'expert'
  return 'trained'
}

/** IDs de sistemas Starfinder reconhecidos pra tuning específico. */
export const STARFINDER_SYSTEMS = new Set(['starfinder-1e', 'starfinder-2e'])

/** IDs de sistemas com patente de proficiência PF2-style. */
export const PROFICIENCY_RANK_SYSTEMS = new Set(['pathfinder-2e', 'starfinder-2e'])
