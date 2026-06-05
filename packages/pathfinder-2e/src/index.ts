/**
 * Pathfinder 2ª Edição (Paizo Publishing).
 *
 * Conteúdo de regras deriva do Pathfinder Reference Document (Pathfinder 2e)
 * sob a ORC License da Paizo:
 *   https://paizo.com/orclicense
 *
 * Pathfinder 2e tem mecânica de **degrees of success** (4 graus, crítico ±10):
 *  - Total ≥ DC+10: Critical Success
 *  - Total ≥ DC:   Success
 *  - Total ≥ DC-10: Failure
 *  - Total < DC-10: Critical Failure
 *
 * Natural 20 sobe um grau (success vira crit success, etc); natural 1 desce.
 */

import type {
  ConditionDef,
  DicePreset,
  RollResult,
  System,
  SystemRules,
  TrackerField,
} from '@lippelt/srd-core'

type Roller = (sides: number) => number
let roller: Roller = (sides: number) => Math.floor(Math.random() * sides) + 1

export function setRoller(fn: Roller): void {
  roller = fn
}
export function resetRoller(): void {
  roller = (sides: number) => Math.floor(Math.random() * sides) + 1
}
function rollDice(sides: number, count = 1): number[] {
  const out: number[] = []
  for (let i = 0; i < count; i++) out.push(roller(sides))
  return out
}

// ============================================================================
// Helpers
// ============================================================================

export function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2)
}

/**
 * Proficiency bonus por rank (PF2 usa Untrained 0, Trained 2, Expert 4, Master 6, Legendary 8, todos somados ao nível). Aqui retornamos só o bônus de rank.
 */
export type ProficiencyRank = 'untrained' | 'trained' | 'expert' | 'master' | 'legendary'

export function proficiencyBonus(rank: ProficiencyRank): number {
  switch (rank) {
    case 'untrained':
      return 0
    case 'trained':
      return 2
    case 'expert':
      return 4
    case 'master':
      return 6
    case 'legendary':
      return 8
  }
}

export type DegreeOfSuccess = 'critical-success' | 'success' | 'failure' | 'critical-failure'

/**
 * Calcula degree of success conforme PF2:
 * 20 nat sobe um grau; 1 nat desce um grau (clampados nas pontas).
 */
export function degreeOfSuccess(
  total: number,
  dc: number,
  natural: number,
): DegreeOfSuccess {
  let base: DegreeOfSuccess
  if (total >= dc + 10) base = 'critical-success'
  else if (total >= dc) base = 'success'
  else if (total >= dc - 10) base = 'failure'
  else base = 'critical-failure'

  if (natural === 20) base = stepUp(base)
  else if (natural === 1) base = stepDown(base)
  return base
}

function stepUp(d: DegreeOfSuccess): DegreeOfSuccess {
  return d === 'critical-failure'
    ? 'failure'
    : d === 'failure'
      ? 'success'
      : d === 'success'
        ? 'critical-success'
        : 'critical-success'
}
function stepDown(d: DegreeOfSuccess): DegreeOfSuccess {
  return d === 'critical-success'
    ? 'success'
    : d === 'success'
      ? 'failure'
      : d === 'failure'
        ? 'critical-failure'
        : 'critical-failure'
}

// ============================================================================
// Dice presets
// ============================================================================

const DICE_PRESETS: DicePreset[] = [
  { id: 'd20', label: 'd20', notation: '1d20', category: 'check' },
  { id: 'd4', label: 'd4', notation: '1d4', category: 'damage' },
  { id: 'd6', label: 'd6', notation: '1d6', category: 'damage' },
  { id: 'd8', label: 'd8', notation: '1d8', category: 'damage' },
  { id: 'd10', label: 'd10', notation: '1d10', category: 'damage' },
  { id: 'd12', label: 'd12', notation: '1d12', category: 'damage' },
  { id: 'd100', label: 'd100', notation: '1d100', category: 'special' },
]

// ============================================================================
// Conditions — Pathfinder 2e core (ORC content)
// PF2 tem MUITAS conditions com valores numéricos (ex: Frightened 3, Stupefied 2).
// Aqui anotamos os nomes core; a UI permite "tag" livre.
// ============================================================================

const CONDITIONS: ConditionDef[] = [
  { id: 'blinded', label: 'Blinded', summary: 'Cego: falha em testes que requerem visão; +4 DC pra atacar com sentido especial.' },
  { id: 'broken', label: 'Broken', summary: 'Quebrado: item com metade dos hit points; bônus de armadura zerado.' },
  { id: 'clumsy', label: 'Clumsy', summary: 'Desajeitado N: −N em rolagens baseadas em Dex (atk, AC, Ref, skills Dex).' },
  { id: 'concealed', label: 'Concealed', summary: 'Encoberto: atacantes precisam de DC 5 flat check pra acertar.' },
  { id: 'confused', label: 'Confused', summary: 'Confuso: atos aleatoriamente; pode ferir aliados.' },
  { id: 'controlled', label: 'Controlled', summary: 'Controlado: outra entidade decide suas ações.' },
  { id: 'dazzled', label: 'Dazzled', summary: 'Cegado por luz: tudo está concealed pra você.' },
  { id: 'deafened', label: 'Deafened', summary: 'Surdo: falha auditiva; −2 em iniciativa.' },
  { id: 'doomed', label: 'Doomed', summary: 'Condenado N: máximo de dying reduzido pra 4−N.' },
  { id: 'drained', label: 'Drained', summary: 'Drenado N: −N em Fort saves e Con; HP máximo reduzido por N×nível.' },
  { id: 'dying', label: 'Dying', summary: 'Morrendo N: ao chegar em 4, morre. Recupere fazendo recovery checks.' },
  { id: 'encumbered', label: 'Encumbered', summary: 'Sobrecarregado: clumsy 1; velocidade −10ft.' },
  { id: 'enfeebled', label: 'Enfeebled', summary: 'Enfraquecido N: −N em ataques baseados em Str e checagens.' },
  { id: 'fascinated', label: 'Fascinated', summary: 'Fascinado: −2 em Perception/skills; foco na fonte da fascinação.' },
  { id: 'fatigued', label: 'Fatigued', summary: 'Fatigado: −1 em AC e saves; sem exploration activities.' },
  { id: 'flat-footed', label: 'Flat-Footed', summary: 'Desprevenido: −2 em AC.' },
  { id: 'fleeing', label: 'Fleeing', summary: 'Em fuga: deve usar ações pra se afastar da fonte do medo.' },
  { id: 'frightened', label: 'Frightened', summary: 'Amedrontado N: −N em todas as rolagens; decrementa por turno.' },
  { id: 'grabbed', label: 'Grabbed', summary: 'Agarrado: off-guard; pode tentar Escape DC 5.' },
  { id: 'hidden', label: 'Hidden', summary: 'Escondido: atacantes flat check DC 11 pra acertar.' },
  { id: 'immobilized', label: 'Immobilized', summary: 'Imobilizado: não pode usar move actions.' },
  { id: 'invisible', label: 'Invisible', summary: 'Invisível: undetected pra criaturas que dependem de visão.' },
  { id: 'observed', label: 'Observed', summary: 'Observado: completamente perceptível ao alvo.' },
  { id: 'paralyzed', label: 'Paralyzed', summary: 'Paralisado: off-guard; não pode agir; crit auto a 1.5m.' },
  { id: 'persistent-damage', label: 'Persistent Damage', summary: 'Dano persistente: dano de tipo X a cada turno até DC 15 flat check ou cura específica.' },
  { id: 'petrified', label: 'Petrified', summary: 'Petrificado: vira pedra; inconsciente; immune a effects de mente.' },
  { id: 'prone', label: 'Prone', summary: 'Caído: off-guard; −2 em ataques.' },
  { id: 'quickened', label: 'Quickened', summary: 'Acelerado: 1 ação adicional por turno (usada como especificado).' },
  { id: 'restrained', label: 'Restrained', summary: 'Contido: off-guard; immobilized; só ações mentais ou Escape.' },
  { id: 'sickened', label: 'Sickened', summary: 'Enjoado N: −N em todas as rolagens.' },
  { id: 'slowed', label: 'Slowed', summary: 'Lento N: perde N ações por turno.' },
  { id: 'stunned', label: 'Stunned', summary: 'Atordoado N: perde N ações no próximo turno.' },
  { id: 'stupefied', label: 'Stupefied', summary: 'Atordoado N: −N em Will/skills/feitiços; +N DC pra concentração.' },
  { id: 'unconscious', label: 'Unconscious', summary: 'Inconsciente: off-guard; sem ações; cego.' },
  { id: 'undetected', label: 'Undetected', summary: 'Não detectado: atacante precisa adivinhar a posição.' },
  { id: 'wounded', label: 'Wounded', summary: 'Ferido N: ao ficar dying, valor inicial sobe por N.' },
]

// ============================================================================
// Tracker fields
// PF2 não usa BAB — proficiency é embutida nas rolagens.
// Adicionamos hero points (PC narrative resource).
// ============================================================================

const TRACKER_FIELDS: TrackerField[] = [
  { key: 'ac', label: 'CA', kind: 'integer', min: 0, max: 60, default: 10, description: 'Armor Class.' },
  { key: 'fort', label: 'Fort', kind: 'integer', min: -10, max: 50, default: 0, description: 'Fortitude save bonus total.' },
  { key: 'ref', label: 'Ref', kind: 'integer', min: -10, max: 50, default: 0, description: 'Reflex save bonus total.' },
  { key: 'will', label: 'Will', kind: 'integer', min: -10, max: 50, default: 0, description: 'Will save bonus total.' },
  { key: 'perception', label: 'Perc', kind: 'integer', min: -10, max: 50, default: 0, description: 'Perception modifier total.' },
  { key: 'speed', label: 'Spd', kind: 'integer', min: 0, max: 200, default: 25, description: 'Velocidade base em pés.' },
  { key: 'heroPoints', label: 'Hero', kind: 'integer', min: 0, max: 3, default: 1, description: 'Hero Points (default 1; gasta pra reroll ou cheat death).' },
  { key: 'focusPoints', label: 'Focus', kind: 'integer', min: 0, max: 3, default: 0, description: 'Focus Points pra feitiços de focus.' },
]

// ============================================================================
// Rules — PF2 com degrees of success
// ============================================================================

interface CheckParams {
  modifier?: number
  dc?: number
}

function rollCheck({ modifier = 0, dc }: CheckParams): RollResult {
  const d20 = rollDice(20)[0]!
  const total = d20 + modifier
  const notes: string[] = []
  if (d20 === 20) notes.push('20 natural')
  if (d20 === 1) notes.push('1 natural')
  if (dc !== undefined) {
    const degree = degreeOfSuccess(total, dc, d20)
    notes.push(degree)
    notes.push(`DC ${dc}`)
  }
  const modStr = modifier === 0 ? '' : modifier > 0 ? `+${modifier}` : `${modifier}`
  return { rolls: [d20], modifier, total, notation: `1d20${modStr}`, notes }
}

interface AttackParams {
  modifier?: number
  targetAC: number
  /**
   * Multiple Attack Penalty — segunda agility de atque na rodada -5, terceira -10
   * (ou -4/-8 com agile weapons). Passar diretamente.
   */
  map?: number
}

function rollAttack(params: AttackParams): RollResult {
  const baseMod = params.modifier ?? 0
  const map = params.map ?? 0
  const mod = baseMod - Math.abs(map)
  const r = rollCheck({ modifier: mod, dc: params.targetAC })
  const notes = [...(r.notes ?? [])]
  if (map !== 0) notes.unshift(`MAP −${Math.abs(map)}`)
  return { ...r, notes }
}

function rollSave(params: { modifier?: number; dc: number }): RollResult {
  return rollCheck(params)
}

interface DamageParams {
  count: number
  sides: number
  modifier?: number
  /** Se true, dobra os totais (PF2 crit success em ataque). */
  critical?: boolean
}

function rollDamage({ count, sides, modifier = 0, critical = false }: DamageParams): RollResult {
  const dice = rollDice(sides, count)
  const sum = dice.reduce((a, b) => a + b, 0)
  let total = Math.max(0, sum + modifier)
  if (critical) total = total * 2
  const modStr = modifier === 0 ? '' : modifier > 0 ? `+${modifier}` : `${modifier}`
  const critStr = critical ? ' (crit ×2)' : ''
  return {
    rolls: dice,
    modifier,
    total,
    notation: `${count}d${sides}${modStr}${critStr}`,
    notes: critical ? ['crítico — total ×2'] : [],
  }
}

const RULES: SystemRules = {
  roll(kind, params) {
    switch (kind) {
      case 'd20':
      case 'check':
      case 'skill':
      case 'perception':
        return rollCheck(params as unknown as CheckParams)
      case 'attack':
        return rollAttack(params as unknown as AttackParams)
      case 'save':
        return rollSave(params as unknown as { modifier?: number; dc: number })
      case 'damage':
        return rollDamage(params as unknown as DamageParams)
      default:
        return null
    }
  },
}

export const pathfinder2e: System = {
  id: 'pathfinder-2e',
  name: 'Pathfinder 2nd Edition',
  ruleVersion: 'Pathfinder Reference Document',
  attribution:
    'Contains material from the Pathfinder Reference Document for Pathfinder Second Edition by Paizo Publishing under the ORC License.',
  dicePresets: DICE_PRESETS,
  conditions: CONDITIONS,
  trackerFields: TRACKER_FIELDS,
  rules: RULES,
}
