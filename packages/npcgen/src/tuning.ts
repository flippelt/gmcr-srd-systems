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
  CasterTradition,
  D20Model,
  NpcMagic,
  NpcStarfinderTuning,
  ProficiencyRank,
} from './types'
import { clampLevel } from './d20'
import { damageDiceCount, formatDamage } from './combat'

/** Truques de sabor (escolhidos por rotação determinística no nível). */
const CANTRIPS: readonly string[] = [
  'Raio de Fogo',
  'Toque Chocante',
  'Rajada Mística',
  'Lâmina de Gelo',
  'Mãos Mágicas',
  'Luz Tremeluzente',
]

/** Magias por banda de poder; o NPC conhece as da sua banda. */
const SPELLS_BY_BAND: Record<1 | 2 | 3 | 4, readonly string[]> = {
  1: ['Mísseis Mágicos', 'Escudo Arcano', 'Enfeitiçar Pessoa', 'Sono'],
  2: ['Bola de Fogo', 'Voo', 'Contramágica', 'Relâmpago'],
  3: ['Muralha de Fogo', 'Polimorfar', 'Cone de Frio', 'Banimento'],
  4: ['Parar o Tempo', 'Chuva de Meteoros', 'Desejo', 'Palavra de Poder: Matar'],
}

/** Truques de sabor da tradição divina. */
const DIVINE_CANTRIPS: readonly string[] = [
  'Chama Sagrada',
  'Orientação',
  'Taumaturgia',
  'Resistência',
  'Luz',
  'Poupar os Moribundos',
]

/** Magias divinas por banda de poder. */
const DIVINE_SPELLS_BY_BAND: Record<1 | 2 | 3 | 4, readonly string[]> = {
  1: ['Curar Ferimentos', 'Palavra Curativa', 'Escudo da Fé', 'Bênção'],
  2: ['Restauração Menor', 'Arma Espiritual', 'Silêncio', 'Auxílio'],
  3: ['Guardiões Espirituais', 'Reviver os Mortos', 'Coluna de Chamas', 'Banimento'],
  4: ['Palavra de Poder: Curar', 'Ressurreição Verdadeira', 'Tempestade de Vingança', 'Portão'],
}

const CANTRIPS_BY_TRADITION: Record<CasterTradition, readonly string[]> = {
  arcane: CANTRIPS,
  divine: DIVINE_CANTRIPS,
}
const SPELLS_BY_TRADITION: Record<CasterTradition, Record<1 | 2 | 3 | 4, readonly string[]>> = {
  arcane: SPELLS_BY_BAND,
  divine: DIVINE_SPELLS_BY_BAND,
}

function spellBand(level: number): 1 | 2 | 3 | 4 {
  if (level <= 4) return 1
  if (level <= 10) return 2
  if (level <= 16) return 3
  return 4
}

/** Pega `count` itens da lista a partir de um offset (rotação determinística). */
function pickRotating(list: readonly string[], count: number, offset: number): string[] {
  const out: string[] = []
  const n = Math.min(count, list.length)
  for (let i = 0; i < n; i++) out.push(list[(offset + i) % list.length]!)
  return out
}

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
  /** Tradição do conjurador (seleciona as listas de sabor). Padrão: 'arcane'. */
  tradition: CasterTradition = 'arcane',
): NpcMagic {
  // prof do 5e quando proficiency; senão BAB direto do PR 1 (já vem em prog).
  const prof = attackProg
  const cantripDieCount =
    cantripDamageDiceHook?.(level) ?? damageDiceCount('caster', level)
  // d8 padrão como dado de cantrip (similar ao Fire Bolt do 5e).
  const cantripDamage = formatDamage(cantripDieCount, 8, abilityMod)
  // Sabor de magias: determinístico por nível (sem RNG, pra não mexer no
  // stream de geração). Mais truques e mais magias conhecidas em níveis altos.
  const lvl = clampLevel(level)
  const cantrips = pickRotating(CANTRIPS_BY_TRADITION[tradition], lvl >= 11 ? 3 : 2, lvl)
  const spells = pickRotating(SPELLS_BY_TRADITION[tradition][spellBand(lvl)], lvl >= 9 ? 3 : 2, lvl)
  return {
    tradition,
    spellAbility,
    spellSaveDC: 8 + prof + abilityMod,
    spellAttackBonus: prof + abilityMod,
    cantripDamage,
    cantrips,
    spells,
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
