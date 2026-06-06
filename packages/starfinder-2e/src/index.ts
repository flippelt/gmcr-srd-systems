/**
 * Starfinder 2ª Edição (Paizo Publishing).
 *
 * Conteúdo de regras deriva do Starfinder Second Edition Reference
 * Document, sob a ORC License da Paizo:
 *   https://paizo.com/orclicense
 *
 * Combina a mecânica de Pathfinder 2e (degrees of success ±10, ranks de
 * proficiency, 3-action economy) com o framework sci-fi de Starfinder 1e
 * (EAC/KAC, Stamina Points + HP, Resolve Points).
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
// Helpers (compartilhados conceitualmente com PF2)
// ============================================================================

export function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2)
}

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

export function degreeOfSuccess(total: number, dc: number, natural: number): DegreeOfSuccess {
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

/** Drena Stamina primeiro, sobra vai pra HP (mesmo modelo de SF1e). */
export function applyToStaminaThenHp(
  incoming: number,
  current: { stamina: number; hp: number },
): { stamina: number; hp: number; staminaLost: number; hpLost: number } {
  const dmg = Math.max(0, Math.trunc(incoming))
  const toStamina = Math.min(current.stamina, dmg)
  const toHp = dmg - toStamina
  return {
    stamina: current.stamina - toStamina,
    hp: Math.max(0, current.hp - toHp),
    staminaLost: toStamina,
    hpLost: toHp,
  }
}

// ============================================================================
// Presets
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
// Conditions — mesmo conjunto core do PF2 (mecânica é praticamente igual)
// ============================================================================

const CONDITIONS: ConditionDef[] = [
  { id: 'blinded', label: 'Blinded', summary: 'Cego: falha em testes que requerem visão.' },
  { id: 'broken', label: 'Broken', summary: 'Item com metade dos hit points; bônus zerado.' },
  { id: 'clumsy', label: 'Clumsy', summary: 'Desajeitado N: −N em rolagens baseadas em Dex.' },
  { id: 'concealed', label: 'Concealed', summary: 'Encoberto: atacantes precisam de DC 5 flat check.' },
  { id: 'dazzled', label: 'Dazzled', summary: 'Cegado por luz: tudo está concealed.' },
  { id: 'deafened', label: 'Deafened', summary: 'Surdo: penalidades auditivas.' },
  { id: 'doomed', label: 'Doomed', summary: 'Condenado N: máximo de dying reduzido.' },
  { id: 'drained', label: 'Drained', summary: 'Drenado N: −N em Fort/Con; HP máximo reduzido.' },
  { id: 'dying', label: 'Dying', summary: 'Morrendo N: ao chegar em 4, morre.' },
  { id: 'enfeebled', label: 'Enfeebled', summary: 'Enfraquecido N: −N em ataques Str e checks.' },
  { id: 'fascinated', label: 'Fascinated', summary: 'Fascinado: −2 em Perception/skills.' },
  { id: 'fatigued', label: 'Fatigued', summary: 'Fatigado: −1 em AC/saves.' },
  { id: 'flat-footed', label: 'Flat-Footed', summary: 'Desprevenido: −2 em AC.' },
  { id: 'fleeing', label: 'Fleeing', summary: 'Em fuga: ações vão pra longe.' },
  { id: 'frightened', label: 'Frightened', summary: 'Amedrontado N: −N em todas rolagens.' },
  { id: 'grabbed', label: 'Grabbed', summary: 'Agarrado: off-guard; Escape DC 5.' },
  { id: 'hidden', label: 'Hidden', summary: 'Escondido: atacantes flat check DC 11.' },
  { id: 'immobilized', label: 'Immobilized', summary: 'Imobilizado: sem move actions.' },
  { id: 'off-guard', label: 'Off-Guard', summary: 'Desprevenido (versão SF2 de flat-footed): −2 em AC.' },
  { id: 'overheated', label: 'Overheated', summary: 'Superaquecido: equipamento ou personagem com penalidades de calor.' },
  { id: 'paralyzed', label: 'Paralyzed', summary: 'Paralisado: off-guard; sem ações.' },
  { id: 'persistent-damage', label: 'Persistent Damage', summary: 'Dano contínuo até DC 15 flat check.' },
  { id: 'prone', label: 'Prone', summary: 'Caído: off-guard; −2 em ataques.' },
  { id: 'quickened', label: 'Quickened', summary: 'Acelerado: 1 ação extra por turno.' },
  { id: 'restrained', label: 'Restrained', summary: 'Contido: off-guard; immobilized; só Escape.' },
  { id: 'sickened', label: 'Sickened', summary: 'Enjoado N: −N em rolagens.' },
  { id: 'slowed', label: 'Slowed', summary: 'Lento N: perde N ações.' },
  { id: 'stunned', label: 'Stunned', summary: 'Atordoado N: perde N ações.' },
  { id: 'stupefied', label: 'Stupefied', summary: 'Atordoado N: −N em Will/skills/feitiços.' },
  { id: 'unconscious', label: 'Unconscious', summary: 'Inconsciente: off-guard; cego; sem ações.' },
  { id: 'wounded', label: 'Wounded', summary: 'Ferido N: valor inicial de dying sobe.' },
]

// ============================================================================
// Tracker fields — combina PF2 (Hero/Focus) com SF1 (EAC/KAC/Stamina/Resolve)
// ============================================================================

const TRACKER_FIELDS: TrackerField[] = [
  { key: 'eac', label: 'EAC', kind: 'integer', min: 0, max: 60, default: 10, description: 'Energy Armor Class — ataques de energia.' },
  { key: 'kac', label: 'KAC', kind: 'integer', min: 0, max: 60, default: 10, description: 'Kinetic Armor Class — ataques cinéticos.' },
  { key: 'fort', label: 'Fort', kind: 'integer', min: -10, max: 50, default: 0, description: 'Fortitude save.' },
  { key: 'ref', label: 'Ref', kind: 'integer', min: -10, max: 50, default: 0, description: 'Reflex save.' },
  { key: 'will', label: 'Will', kind: 'integer', min: -10, max: 50, default: 0, description: 'Will save.' },
  { key: 'perception', label: 'Perc', kind: 'integer', min: -10, max: 50, default: 0, description: 'Perception modifier.' },
  { key: 'speed', label: 'Spd', kind: 'integer', min: 0, max: 200, default: 25, description: 'Velocidade base.' },
  { key: 'stamina', label: 'SP', kind: 'integer', min: 0, max: 999, default: 0, description: 'Stamina Points atuais.' },
  { key: 'resolve', label: 'RP', kind: 'integer', min: 0, max: 99, default: 0, description: 'Resolve Points.' },
  { key: 'heroPoints', label: 'Hero', kind: 'integer', min: 0, max: 3, default: 1, description: 'Hero Points pra reroll/cheat death.' },
]

// ============================================================================
// Rules
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
  damageType?: 'kinetic' | 'energy'
  targetEAC?: number
  targetKAC?: number
  /** Multiple Attack Penalty: −5 ou −10 (ou customizado). */
  map?: number
}

function rollAttack(params: AttackParams): RollResult {
  const baseMod = params.modifier ?? 0
  const map = params.map ?? 0
  const mod = baseMod - Math.abs(map)
  const targetAC =
    params.damageType === 'energy'
      ? params.targetEAC
      : params.damageType === 'kinetic'
        ? params.targetKAC
        : undefined
  const r = rollCheck({ modifier: mod, dc: targetAC })
  const notes = [...(r.notes ?? [])]
  if (map !== 0) notes.unshift(`MAP −${Math.abs(map)}`)
  if (params.damageType && targetAC !== undefined) notes.push(`vs ${params.damageType.toUpperCase()} AC ${targetAC}`)
  return { ...r, notes }
}

function rollSave(params: { modifier?: number; dc: number }): RollResult {
  return rollCheck(params)
}

interface DamageParams {
  count: number
  sides: number
  modifier?: number
  damageType?: string
  /** PF2/SF2: crit dobra o total final. */
  critical?: boolean
}

function rollDamage({ count, sides, modifier = 0, damageType, critical = false }: DamageParams): RollResult {
  const dice = rollDice(sides, count)
  const sum = dice.reduce((a, b) => a + b, 0)
  let total = Math.max(0, sum + modifier)
  if (critical) total *= 2
  const modStr = modifier === 0 ? '' : modifier > 0 ? `+${modifier}` : `${modifier}`
  const critStr = critical ? ' (crit ×2)' : ''
  const notes: string[] = []
  if (damageType) notes.push(`tipo: ${damageType}`)
  if (critical) notes.push('crítico — total ×2')
  return {
    rolls: dice,
    modifier,
    total,
    notation: `${count}d${sides}${modStr}${critStr}`,
    notes,
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

/**
 * Hooks pra `@lippelt/srd-npcgen`: SF2 herda a matemática do PF2 (level +
 * rank bonus). Skills com viés sci-fi (Computers, Piloting etc.) + idiomas
 * default Galáctico/Vesk/Ysoki/Shirren pra humanoides.
 */
function profRankBonus(level: number): number {
  if (level >= 17) return 8
  if (level >= 11) return 6
  if (level >= 5) return 4
  return 2
}

const SF2_SKILLS = [
  'acrobatics',
  'arcana',
  'athletics',
  'computers',
  'crafting',
  'deception',
  'diplomacy',
  'engineering',
  'intimidation',
  'medicine',
  'nature',
  'occultism',
  'performance',
  'piloting',
  'religion',
  'society',
  'stealth',
  'survival',
  'thievery',
] as const

export const starfinder2e: System = {
  id: 'starfinder-2e',
  name: 'Starfinder 2nd Edition',
  ruleVersion: 'Reference Document',
  attribution:
    'Contains material from the Starfinder Second Edition Reference Document by Paizo Publishing under the ORC License.',
  dicePresets: DICE_PRESETS,
  conditions: CONDITIONS,
  trackerFields: TRACKER_FIELDS,
  rules: RULES,
  npc: {
    attackProgression: (level) => level + profRankBonus(level),
    cantripDamageDice: (level) => Math.max(1, Math.ceil(level / 2)),
    skills: SF2_SKILLS,
    defaultLanguages: (type) => {
      if (type === 'humanoid') return ['Comum Galáctico']
      if (type === 'aberration') return ['Telepatia 60 ft']
      if (type === 'construct') return ['Comum Galáctico (entende)']
      return []
    },
  },
}
