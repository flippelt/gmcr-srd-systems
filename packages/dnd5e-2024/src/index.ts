/**
 * Dungeons & Dragons 5th Edition (2024 / "One D&D").
 *
 * Conteúdo de regras deriva do System Reference Document 5.2, publicado
 * pela Wizards of the Coast LLC sob a Creative Commons Attribution 4.0
 * International License:
 *   https://creativecommons.org/licenses/by/4.0/legalcode
 *
 * Mantém compatibilidade mecânica com a edição 2014 — o que mudou:
 *  - Exhaustion: agora uma escala 1..10 com −2 cumulativo em d20 tests
 *    (era 6 níveis discretos)
 *  - Algumas condições com wording refinado
 *  - Math de combate (advantage, attack vs AC, saves, crítico) é igual
 *
 * Esta implementação é original (referência conceitual: foundryvtt/dnd5e,
 * MIT). Para spells e features de classe, use o SRD 5.2 oficial.
 */

import type {
  ConditionDef,
  DicePreset,
  RollResult,
  System,
  SystemRules,
  TrackerField,
} from '@lippelt/srd-core'

// ============================================================================
// Random helper — injetável pra testes determinísticos.
// ============================================================================

type Roller = (sides: number) => number

let roller: Roller = (sides: number) => Math.floor(Math.random() * sides) + 1

export function setRoller(fn: Roller): void {
  roller = fn
}

export function resetRoller(): void {
  roller = (sides: number) => Math.floor(Math.random() * sides) + 1
}

function roll(sides: number, count = 1): number[] {
  const out: number[] = []
  for (let i = 0; i < count; i++) out.push(roller(sides))
  return out
}

// ============================================================================
// Presets de dados (idênticos aos 2014)
// ============================================================================

const DICE_PRESETS: DicePreset[] = [
  { id: 'd20', label: 'd20', notation: '1d20', category: 'check' },
  { id: 'd20-adv', label: 'd20 (adv.)', notation: 'advantage', category: 'check', description: 'Rola 2d20 e pega o maior.' },
  { id: 'd20-dis', label: 'd20 (desv.)', notation: 'disadvantage', category: 'check', description: 'Rola 2d20 e pega o menor.' },
  { id: 'd4', label: 'd4', notation: '1d4', category: 'damage' },
  { id: 'd6', label: 'd6', notation: '1d6', category: 'damage' },
  { id: 'd8', label: 'd8', notation: '1d8', category: 'damage' },
  { id: 'd10', label: 'd10', notation: '1d10', category: 'damage' },
  { id: 'd12', label: 'd12', notation: '1d12', category: 'damage' },
  { id: 'd100', label: 'd100', notation: '1d100', category: 'special' },
]

// ============================================================================
// Condições — SRD 5.2 (CC-BY 4.0)
//
// Mudança principal vs 5.1: Exhaustion é uma escala única 1..10, cada nível
// dá −2 acumulativo em d20 tests; nível 10 = morte.
// ============================================================================

const CONDITIONS: ConditionDef[] = [
  { id: 'blinded', label: 'Blinded', summary: 'Cego: falha em testes que exigem visão; atacantes têm vantagem; o cego tem desvantagem.' },
  { id: 'charmed', label: 'Charmed', summary: 'Enfeitiçado: não pode atacar o encantador nem usar habilidades nocivas contra ele.' },
  { id: 'deafened', label: 'Deafened', summary: 'Surdo: falha em testes que dependem de audição.' },
  { id: 'exhaustion', label: 'Exhaustion (level)', summary: 'Exaustão (1..10): −2 acumulativo em todos os testes de d20 por nível; nível 10 = morte.' },
  { id: 'frightened', label: 'Frightened', summary: 'Amedrontado: desvantagem se a fonte do medo estiver à vista; não pode se mover para perto dela.' },
  { id: 'grappled', label: 'Grappled', summary: 'Agarrado: velocidade 0; termina se o agarrador ficar incapacitado ou afastado.' },
  { id: 'incapacitated', label: 'Incapacitated', summary: 'Incapacitado: não pode tomar ações, reações nem mover-se.' },
  { id: 'invisible', label: 'Invisible', summary: 'Invisível: vantagem em ataques; atacantes têm desvantagem.' },
  { id: 'paralyzed', label: 'Paralyzed', summary: 'Paralisado: incapacitado, não pode mover/falar; ataques a até 1,5m crítico automático.' },
  { id: 'petrified', label: 'Petrified', summary: 'Petrificado: incapacitado, transformado em pedra; resistência a todo dano; imune a venenos e doenças.' },
  { id: 'poisoned', label: 'Poisoned', summary: 'Envenenado: desvantagem em ataques e testes de habilidade.' },
  { id: 'prone', label: 'Prone', summary: 'Caído: desvantagem em ataques; corpo-a-corpo contra o alvo têm vantagem; à distância têm desvantagem.' },
  { id: 'restrained', label: 'Restrained', summary: 'Contido: velocidade 0; desvantagem em ataques e em Dex saves; atacantes têm vantagem.' },
  { id: 'stunned', label: 'Stunned', summary: 'Atordoado: incapacitado; falha em Str/Dex saves; atacantes têm vantagem.' },
  { id: 'unconscious', label: 'Unconscious', summary: 'Inconsciente: incapacitado, caído; ataques a até 1,5m crítico automático.' },
]

// ============================================================================
// Tracker fields — mesmas do 2014 (AC, death saves)
// ============================================================================

const TRACKER_FIELDS: TrackerField[] = [
  {
    key: 'ac',
    label: 'CA',
    kind: 'integer',
    min: 1,
    max: 30,
    default: 10,
    description: 'Classe de Armadura — DC para ser atingido por ataques.',
  },
  {
    key: 'exhaustion',
    label: 'Exh',
    kind: 'integer',
    min: 0,
    max: 10,
    default: 0,
    description: 'Nível de Exhaustion (0..10). Cada ponto dá −2 cumulativo em d20 tests; 10 = morte.',
  },
  {
    key: 'deathSuccesses',
    label: 'M✓',
    kind: 'integer',
    min: 0,
    max: 3,
    default: 0,
    description: 'Sucessos em testes de resistência à morte (3 = estabilizado).',
  },
  {
    key: 'deathFailures',
    label: 'M✗',
    kind: 'integer',
    min: 0,
    max: 3,
    default: 0,
    description: 'Falhas em testes de resistência à morte (3 = morte).',
  },
]

// ============================================================================
// Regras automatizadas
// ============================================================================

export function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function spellSaveDC(proficiency: number, casterMod: number): number {
  return 8 + proficiency + casterMod
}

export function spellAttackBonus(proficiency: number, casterMod: number): number {
  return proficiency + casterMod
}

/** Modificador de exaustão por nível (2024): −2 por nível. */
export function exhaustionPenalty(level: number): number {
  const clamped = Math.max(0, Math.min(10, Math.trunc(level)))
  return clamped === 0 ? 0 : -2 * clamped
}

interface D20Params {
  modifier?: number
  advantage?: boolean
  disadvantage?: boolean
  /** Nível de exaustão (0..10). Aplica −2 por nível em todos os testes. */
  exhaustion?: number
}

function rollD20({
  modifier = 0,
  advantage = false,
  disadvantage = false,
  exhaustion = 0,
}: D20Params): RollResult {
  const cancelled = advantage && disadvantage
  const useAdv = advantage && !cancelled
  const useDis = disadvantage && !cancelled
  const count = useAdv || useDis ? 2 : 1
  const dice = roll(20, count)
  const picked = useAdv ? Math.max(...dice) : useDis ? Math.min(...dice) : dice[0]!
  const exhPenalty = exhaustionPenalty(exhaustion)
  const effectiveMod = modifier + exhPenalty
  const total = picked + effectiveMod
  const notes: string[] = []
  if (cancelled) notes.push('vantagem/desvantagem se cancelaram')
  else if (useAdv) notes.push('vantagem')
  else if (useDis) notes.push('desvantagem')
  if (exhPenalty !== 0) notes.push(`exaustão ${exhaustion} (${exhPenalty})`)
  if (picked === 20) notes.push('crítico natural')
  if (picked === 1) notes.push('falha crítica')
  const modStr =
    effectiveMod === 0 ? '' : effectiveMod > 0 ? `+${effectiveMod}` : `${effectiveMod}`
  const dStr = count === 2 ? `2d20${useAdv ? 'kh1' : 'kl1'}` : '1d20'
  return { rolls: dice, modifier: effectiveMod, total, notation: `${dStr}${modStr}`, notes }
}

interface AttackParams {
  modifier?: number
  targetAC?: number
  advantage?: boolean
  disadvantage?: boolean
  exhaustion?: number
}

function rollAttack(params: AttackParams): RollResult {
  const result = rollD20(params)
  const adv = params.advantage && !params.disadvantage
  const d20 =
    result.rolls.length === 2
      ? adv
        ? result.rolls[0]! >= result.rolls[1]!
          ? result.rolls[0]!
          : result.rolls[1]!
        : result.rolls[0]! <= result.rolls[1]!
          ? result.rolls[0]!
          : result.rolls[1]!
      : result.rolls[0]!
  const notes = [...(result.notes ?? [])]
  if (params.targetAC !== undefined) {
    const natural20 = d20 === 20
    const natural1 = d20 === 1
    const hit = natural20 || (!natural1 && result.total >= params.targetAC)
    notes.push(
      hit
        ? natural20
          ? 'acerto crítico'
          : 'acertou'
        : natural1
          ? 'erro crítico'
          : 'errou',
    )
  }
  return { ...result, notes }
}

interface SaveParams {
  modifier?: number
  dc: number
  advantage?: boolean
  disadvantage?: boolean
  exhaustion?: number
}

function rollSave(params: SaveParams): RollResult {
  const result = rollD20(params)
  const notes = [...(result.notes ?? [])]
  notes.push(result.total >= params.dc ? 'sucesso' : 'falha')
  return { ...result, notes: notes.concat([`DC ${params.dc}`]) }
}

interface DamageParams {
  count: number
  sides: number
  modifier?: number
  critical?: boolean
}

function rollDamage({ count, sides, modifier = 0, critical = false }: DamageParams): RollResult {
  const totalDice = critical ? count * 2 : count
  const dice = roll(sides, totalDice)
  const sum = dice.reduce((a, b) => a + b, 0)
  const total = Math.max(0, sum + modifier)
  const modStr = modifier === 0 ? '' : modifier > 0 ? `+${modifier}` : `${modifier}`
  return {
    rolls: dice,
    modifier,
    total,
    notation: `${totalDice}d${sides}${modStr}${critical ? ' (crit)' : ''}`,
    notes: critical ? ['dano crítico — dados dobrados'] : [],
  }
}

interface DamageTarget {
  resistance?: string[]
  vulnerability?: string[]
  immunity?: string[]
}

interface ApplyDamageInput {
  type?: string
  target?: DamageTarget
}

function applyDndDamage(
  incoming: number,
  ctx: ApplyDamageInput,
): { final: number; notes: string[] } {
  const t = ctx.target
  const type = ctx.type
  if (!type || !t) return { final: Math.max(0, incoming), notes: [] }
  if (t.immunity?.includes(type)) return { final: 0, notes: [`imune a ${type}`] }
  if (t.resistance?.includes(type)) {
    return { final: Math.floor(incoming / 2), notes: [`resistência a ${type} (metade)`] }
  }
  if (t.vulnerability?.includes(type)) {
    return { final: incoming * 2, notes: [`vulnerabilidade a ${type} (dobro)`] }
  }
  return { final: Math.max(0, incoming), notes: [] }
}

// ============================================================================
// Bundle
// ============================================================================

const RULES: SystemRules = {
  roll(kind, params) {
    switch (kind) {
      case 'd20':
      case 'check':
      case 'ability':
        return rollD20(params as unknown as D20Params)
      case 'attack':
        return rollAttack(params as unknown as AttackParams)
      case 'save':
        return rollSave(params as unknown as SaveParams)
      case 'damage':
        return rollDamage(params as unknown as DamageParams)
      default:
        return null
    }
  },
  applyDamage(incoming, target) {
    return applyDndDamage(incoming, target as ApplyDamageInput)
  },
}

/**
 * Hooks pra `@lippelt/srd-npcgen`. 5e 2024 mantém a mesma matemática
 * (proficiency + ability mod, cantrip scaling 1/5/11/17). A lista de skills
 * é idêntica à 2014 — o SRD 5.2 não acrescentou nem removeu skills.
 */
const DND5E_2024_SKILLS = [
  'acrobatics',
  'animal-handling',
  'arcana',
  'athletics',
  'deception',
  'history',
  'insight',
  'intimidation',
  'investigation',
  'medicine',
  'nature',
  'perception',
  'performance',
  'persuasion',
  'religion',
  'sleight-of-hand',
  'stealth',
  'survival',
] as const

export const dnd5e2024: System = {
  id: 'dnd5e-2024',
  name: 'Dungeons & Dragons 5e (2024)',
  ruleVersion: 'SRD 5.2',
  attribution:
    'Contains material from the System Reference Document 5.2 by Wizards of the Coast LLC, licensed under CC-BY 4.0.',
  dicePresets: DICE_PRESETS,
  conditions: CONDITIONS,
  trackerFields: TRACKER_FIELDS,
  rules: RULES,
  npc: {
    skills: DND5E_2024_SKILLS,
  },
}
