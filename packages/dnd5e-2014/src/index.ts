/**
 * Dungeons & Dragons 5th Edition (2014).
 *
 * Conteúdo de regras (condições, ability scores, escala de DC) deriva do
 * System Reference Document 5.1, publicado pela Wizards of the Coast LLC
 * sob a Creative Commons Attribution 4.0 International License:
 *   https://creativecommons.org/licenses/by/4.0/legalcode
 *
 * Esta implementação é original (não copia código de implementações
 * existentes). Referência conceitual: foundryvtt/dnd5e (MIT).
 */

import type {
  ConditionDef,
  DicePreset,
  RollResult,
  System,
  SystemRules,
  TrackerField,
} from '@gmcr/srd-core'

// ============================================================================
// Random helper — extraído pra que os testes possam injetar uma fonte
// determinística via `setRoller`.
// ============================================================================

type Roller = (sides: number) => number

let roller: Roller = (sides: number) => Math.floor(Math.random() * sides) + 1

/** Substitui o gerador de dados (use em testes). Restaurar com `resetRoller`. */
export function setRoller(fn: Roller): void {
  roller = fn
}

/** Restaura o gerador padrão (Math.random). */
export function resetRoller(): void {
  roller = (sides: number) => Math.floor(Math.random() * sides) + 1
}

function roll(sides: number, count = 1): number[] {
  const out: number[] = []
  for (let i = 0; i < count; i++) out.push(roller(sides))
  return out
}

// ============================================================================
// Presets de dados — botões rápidos da UI
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
// Condições — SRD 5.1 (CC-BY 4.0)
// ============================================================================

const CONDITIONS: ConditionDef[] = [
  { id: 'blinded', label: 'Blinded', summary: 'Cego: falha em testes que exigem visão; atacantes têm vantagem; o cego tem desvantagem.' },
  { id: 'charmed', label: 'Charmed', summary: 'Enfeitiçado: não pode atacar o encantador nem usar habilidades nocivas contra ele.' },
  { id: 'deafened', label: 'Deafened', summary: 'Surdo: falha em testes que dependem de audição.' },
  { id: 'exhaustion-1', label: 'Exhaustion 1', summary: 'Exaustão 1: desvantagem em testes de habilidade.' },
  { id: 'exhaustion-2', label: 'Exhaustion 2', summary: 'Exaustão 2: velocidade reduzida pela metade.' },
  { id: 'exhaustion-3', label: 'Exhaustion 3', summary: 'Exaustão 3: desvantagem em ataques e jogadas de resistência.' },
  { id: 'exhaustion-4', label: 'Exhaustion 4', summary: 'Exaustão 4: máximo de HP reduzido pela metade.' },
  { id: 'exhaustion-5', label: 'Exhaustion 5', summary: 'Exaustão 5: velocidade reduzida a 0.' },
  { id: 'exhaustion-6', label: 'Exhaustion 6', summary: 'Exaustão 6: morte.' },
  { id: 'frightened', label: 'Frightened', summary: 'Amedrontado: desvantagem se a fonte do medo estiver à vista; não pode se mover para perto dela.' },
  { id: 'grappled', label: 'Grappled', summary: 'Agarrado: velocidade 0; termina se o agarrador ficar incapacitado.' },
  { id: 'incapacitated', label: 'Incapacitated', summary: 'Incapacitado: não pode tomar ações nem reações.' },
  { id: 'invisible', label: 'Invisible', summary: 'Invisível: vantagem em ataques; atacantes têm desvantagem.' },
  { id: 'paralyzed', label: 'Paralyzed', summary: 'Paralisado: incapacitado, não pode se mover/falar; ataques a até 1,5m são automáticos críticos.' },
  { id: 'petrified', label: 'Petrified', summary: 'Petrificado: transformado em substância sólida; resistência a todo dano; imune a venenos e doenças.' },
  { id: 'poisoned', label: 'Poisoned', summary: 'Envenenado: desvantagem em ataques e testes de habilidade.' },
  { id: 'prone', label: 'Prone', summary: 'Caído: desvantagem em ataques; ataques corpo-a-corpo contra o alvo têm vantagem; à distância têm desvantagem.' },
  { id: 'restrained', label: 'Restrained', summary: 'Contido: velocidade 0; desvantagem em ataques e Dex saves; atacantes têm vantagem.' },
  { id: 'stunned', label: 'Stunned', summary: 'Atordoado: incapacitado; falha automaticamente em Str/Dex saves; atacantes têm vantagem.' },
  { id: 'unconscious', label: 'Unconscious', summary: 'Inconsciente: incapacitado, caído; ataques a até 1,5m são críticos automáticos.' },
]

// ============================================================================
// Tracker fields — AC e death saves além de initiative/hp genéricos
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

/** Modificador derivado da ability score: floor((score - 10) / 2). */
export function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2)
}

/** DC de feitiço: 8 + proficiency + ability modifier. */
export function spellSaveDC(proficiency: number, casterMod: number): number {
  return 8 + proficiency + casterMod
}

/** Bônus de ataque por feitiço: proficiency + ability modifier. */
export function spellAttackBonus(proficiency: number, casterMod: number): number {
  return proficiency + casterMod
}

interface D20Params {
  modifier?: number
  advantage?: boolean
  disadvantage?: boolean
}

/** Rola um d20 com possível advantage/disadvantage e modificador. */
function rollD20({ modifier = 0, advantage = false, disadvantage = false }: D20Params): RollResult {
  // Vantagem e desvantagem se cancelam mutuamente (SRD 5.1).
  const cancelled = advantage && disadvantage
  const useAdv = advantage && !cancelled
  const useDis = disadvantage && !cancelled
  const count = useAdv || useDis ? 2 : 1
  const dice = roll(20, count)
  const picked = useAdv ? Math.max(...dice) : useDis ? Math.min(...dice) : dice[0]!
  const total = picked + modifier
  const notes: string[] = []
  if (cancelled) notes.push('vantagem/desvantagem se cancelaram')
  else if (useAdv) notes.push('vantagem')
  else if (useDis) notes.push('desvantagem')
  if (picked === 20) notes.push('crítico natural')
  if (picked === 1) notes.push('falha crítica')
  const modStr = modifier === 0 ? '' : modifier > 0 ? `+${modifier}` : `${modifier}`
  const dStr = count === 2 ? `2d20${useAdv ? 'kh1' : 'kl1'}` : '1d20'
  return { rolls: dice, modifier, total, notation: `${dStr}${modStr}`, notes }
}

interface AttackParams {
  modifier?: number
  targetAC?: number
  advantage?: boolean
  disadvantage?: boolean
}

/**
 * Rolagem de ataque contra AC. Se `targetAC` for fornecido, anota se acertou.
 * Crítico natural 20 sempre acerta; 1 sempre erra (SRD 5.1).
 */
function rollAttack(params: AttackParams): RollResult {
  const result = rollD20(params)
  const d20 = result.rolls[result.rolls.length === 2
    ? (params.advantage && !params.disadvantage ? (result.rolls[0]! >= result.rolls[1]! ? 0 : 1) : (result.rolls[0]! <= result.rolls[1]! ? 0 : 1))
    : 0]!
  const notes = [...(result.notes ?? [])]
  if (params.targetAC !== undefined) {
    const natural20 = d20 === 20
    const natural1 = d20 === 1
    const hit = natural20 || (!natural1 && result.total >= params.targetAC)
    notes.push(hit ? (natural20 ? 'acerto crítico' : 'acertou') : (natural1 ? 'erro crítico' : 'errou'))
  }
  return { ...result, notes }
}

interface SaveParams {
  modifier?: number
  dc: number
  advantage?: boolean
  disadvantage?: boolean
}

/** Saving throw vs DC. Anota success/failure. */
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

/**
 * Rolagem de dano: NdM+K, com opção de crítico (rola o dobro dos dados,
 * mantém o modificador uma única vez — SRD 5.1).
 */
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

/**
 * Reduz dano pelas propriedades do alvo. Ordem (SRD 5.1):
 * 1. Imunidade zera o dano.
 * 2. Resistência metade (arredondar pra baixo).
 * 3. Vulnerabilidade dobra.
 * Se uma criatura tem múltiplas categorias para o mesmo tipo, apenas uma se aplica
 * (mas combinadas com outras categorias podem coexistir — aqui assumimos exclusividade).
 */
function applyDndDamage(incoming: number, ctx: ApplyDamageInput): { final: number; notes: string[] } {
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
// Bundle do sistema
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

export const dnd5e2014: System = {
  id: 'dnd5e-2014',
  name: 'Dungeons & Dragons 5e (2014)',
  ruleVersion: 'SRD 5.1',
  attribution:
    'Contains material from the System Reference Document 5.1 by Wizards of the Coast LLC, licensed under CC-BY 4.0.',
  dicePresets: DICE_PRESETS,
  conditions: CONDITIONS,
  trackerFields: TRACKER_FIELDS,
  rules: RULES,
}
