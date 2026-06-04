/**
 * Daggerheart (Darrington Press).
 *
 * Conteúdo derivado do Daggerheart SRD, publicado pela Darrington Press
 * sob a Darrington Press Community Gaming License (DPCGL):
 *   https://darringtonpress.com/license/
 *
 * Daggerheart™ é trademark da Darrington Press. Este pacote implementa
 * MECÂNICA (Duality Dice, damage thresholds, Hope/Fear, etc) sem copiar
 * texto oficial — resumos de condições são escritos com palavras próprias.
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
// Duality Dice — 2d12 com cores distintas (Hope/Fear)
//
// - Roll 2d12: um é o Hope die, outro é o Fear die
// - Soma + modifier vs difficulty
// - "with Hope" se Hope > Fear (PC ganha 1 Hope token)
// - "with Fear" se Fear > Hope (GM ganha 1 Fear token)
// - "Critical Success" se Hope == Fear (passa automaticamente + 1 Hope + clear 1 Stress)
// ============================================================================

interface DualityParams {
  modifier?: number
  /** Dificuldade do teste. Quando ausente, só anota Hope/Fear/Critical. */
  difficulty?: number
  /**
   * Aplica Advantage: rola um d6 extra; soma o resultado ao total.
   * Disadvantage: rola um d6 extra e subtrai. Cancelam 1-1.
   */
  advantage?: boolean
  disadvantage?: boolean
}

interface DualityBreakdown {
  hope: number
  fear: number
  /** Tag estrutural: 'critical' | 'with-hope' | 'with-fear' */
  outcome: 'critical' | 'with-hope' | 'with-fear'
  /** Modificador de Advantage/Disadvantage aplicado (positivo ou negativo). */
  advMod: number
  advDice: number[]
}

function rollDuality(params: DualityParams): RollResult & { breakdown: DualityBreakdown } {
  const modifier = params.modifier ?? 0
  const [hope, fear] = roll(12, 2) as [number, number]

  // Advantage/Disadvantage: cancelam 1-1; resta um d6 +/-.
  const adv = params.advantage && !params.disadvantage
  const dis = params.disadvantage && !params.advantage
  const advDice: number[] = adv || dis ? roll(6, 1) : []
  const advMod = advDice.length > 0 ? (adv ? advDice[0]! : -advDice[0]!) : 0

  const total = hope + fear + modifier + advMod
  const outcome: DualityBreakdown['outcome'] =
    hope === fear ? 'critical' : hope > fear ? 'with-hope' : 'with-fear'

  const notes: string[] = []
  if (outcome === 'critical') notes.push('crítico (Hope = Fear, +1 Hope, limpa 1 Stress)')
  else if (outcome === 'with-hope') notes.push('com Hope (+1 Hope)')
  else notes.push('com Fear (+1 Fear pra GM)')
  if (adv) notes.push(`vantagem +${advDice[0]}`)
  if (dis) notes.push(`desvantagem -${advDice[0]}`)
  if (params.advantage && params.disadvantage) notes.push('vantagem/desvantagem se cancelaram')
  if (params.difficulty !== undefined) {
    notes.push(`DC ${params.difficulty}`)
    notes.push(total >= params.difficulty || outcome === 'critical' ? 'sucesso' : 'falha')
  }

  const modStr = modifier === 0 ? '' : modifier > 0 ? `+${modifier}` : `${modifier}`
  const advStr = adv ? ' +d6adv' : dis ? ' -d6dis' : ''
  return {
    rolls: [hope, fear, ...advDice],
    modifier: modifier + advMod,
    total,
    notation: `2d12 (Hope/Fear)${modStr}${advStr}`,
    notes,
    breakdown: { hope, fear, outcome, advMod, advDice },
  }
}

// ============================================================================
// Damage thresholds
//
// HP marks taken depend on (incoming damage) vs (Major / Severe thresholds):
//  - dmg <  Major    →  1 HP
//  - Major ≤ dmg < Severe → 2 HP
//  - dmg ≥ Severe   →  3 HP
//
// Marking an Armor slot reduces the severity by one band (Severe→Major,
// Major→Minor, Minor→Nothing).
// ============================================================================

interface ApplyDamageInput {
  major?: number
  severe?: number
  /** Quando true, marca 1 armor slot e reduz a severidade em 1 banda. */
  armorMark?: boolean
}

interface ApplyDamageResult {
  /** Quantos HP slots devem ser marcados (0..3). */
  hpMarks: number
  /** Banda de severidade pré-armor: 'minor' | 'major' | 'severe' */
  severity: 'minor' | 'major' | 'severe'
  /** Banda final aplicada (depois de armor). */
  appliedSeverity: 'minor' | 'major' | 'severe' | 'none'
  notes: string[]
}

function applyDhDamage(incoming: number, ctx: ApplyDamageInput): {
  final: number
  notes: string[]
  extra: Omit<ApplyDamageResult, 'notes'>
} {
  const major = ctx.major ?? 1
  const severe = ctx.severe ?? major + 1
  const severity: ApplyDamageResult['severity'] =
    incoming >= severe ? 'severe' : incoming >= major ? 'major' : 'minor'

  let band: 'minor' | 'major' | 'severe' | 'none' = severity
  if (ctx.armorMark) {
    band = severity === 'severe' ? 'major' : severity === 'major' ? 'minor' : 'none'
  }

  const hpMarks = band === 'severe' ? 3 : band === 'major' ? 2 : band === 'minor' ? 1 : 0

  const notes: string[] = [`severidade: ${severity}`]
  if (ctx.armorMark && band !== severity) notes.push(`armor reduziu pra ${band}`)
  notes.push(`marca ${hpMarks} HP`)

  return {
    final: hpMarks,
    notes,
    extra: { hpMarks, severity, appliedSeverity: band },
  }
}

// ============================================================================
// Damage roll (weapon) — NdM+K simples; thresholds aplicam-se depois.
// ============================================================================

interface DamageRollParams {
  count: number
  sides: number
  modifier?: number
}

function rollDamage({ count, sides, modifier = 0 }: DamageRollParams): RollResult {
  const dice = roll(sides, count)
  const sum = dice.reduce((a, b) => a + b, 0)
  const total = Math.max(0, sum + modifier)
  const modStr = modifier === 0 ? '' : modifier > 0 ? `+${modifier}` : `${modifier}`
  return {
    rolls: dice,
    modifier,
    total,
    notation: `${count}d${sides}${modStr}`,
  }
}

// ============================================================================
// Presets
// ============================================================================

const DICE_PRESETS: DicePreset[] = [
  {
    id: 'duality',
    label: 'Duality',
    notation: '2d12',
    category: 'check',
    description: 'Duality Dice: 2d12 (Hope/Fear). Hope > Fear = +1 Hope; Fear > Hope = +1 Fear; iguais = crítico.',
  },
  { id: 'd4', label: 'd4', notation: '1d4', category: 'damage' },
  { id: 'd6', label: 'd6', notation: '1d6', category: 'damage' },
  { id: 'd8', label: 'd8', notation: '1d8', category: 'damage' },
  { id: 'd10', label: 'd10', notation: '1d10', category: 'damage' },
  { id: 'd12', label: 'd12', notation: '1d12', category: 'damage' },
  { id: 'd20', label: 'd20', notation: '1d20', category: 'special' },
]

// ============================================================================
// Conditions (DPCGL: resumos próprios)
// ============================================================================

const CONDITIONS: ConditionDef[] = [
  { id: 'restrained', label: 'Restrained', summary: 'Impedido de se mover ou agir livremente até se libertar.' },
  { id: 'vulnerable', label: 'Vulnerable', summary: 'Rolagens contra a criatura são feitas com vantagem.' },
  { id: 'hidden', label: 'Hidden', summary: 'Não pode ser alvo direto até ser revelado.' },
  { id: 'burning', label: 'Burning', summary: 'Em chamas: dano contínuo a cada turno até apagar.' },
  { id: 'poisoned', label: 'Poisoned', summary: 'Envenenado: penalidades a rolagens físicas; dano periódico em alguns casos.' },
  { id: 'stunned', label: 'Stunned', summary: 'Atordoado: ações limitadas no próximo turno.' },
  { id: 'distracted', label: 'Distracted', summary: 'Desatento: rolagens da criatura sofrem desvantagem.' },
  { id: 'cloaked', label: 'Cloaked', summary: 'Encoberto: dificuldade extra pra ser detectado/atingido.' },
  { id: 'charged', label: 'Charged', summary: 'Carregado: próxima ação ganha bônus específico de habilidade.' },
  { id: 'down', label: 'Down', summary: 'Caído inconsciente — risco de morrer sem cuidados.' },
]

// ============================================================================
// Tracker fields
// ============================================================================

const TRACKER_FIELDS: TrackerField[] = [
  { key: 'hp', label: 'HP', kind: 'integer', min: 0, max: 12, default: 0, description: 'HP slots marcados (de 0 até max ~12 — quando todos marcados o personagem cai).' },
  { key: 'hpMax', label: 'HPmax', kind: 'integer', min: 1, max: 12, default: 6, description: 'Total de HP slots da ficha.' },
  { key: 'stress', label: 'Stress', kind: 'integer', min: 0, max: 12, default: 0, description: 'Stress slots marcados.' },
  { key: 'stressMax', label: 'Stmax', kind: 'integer', min: 1, max: 12, default: 6, description: 'Total de Stress slots da ficha (geralmente 6).' },
  { key: 'armor', label: 'Arm', kind: 'integer', min: 0, max: 12, default: 0, description: 'Armor slots marcados (consumidos pra reduzir severidade de dano).' },
  { key: 'armorMax', label: 'Armax', kind: 'integer', min: 0, max: 12, default: 3, description: 'Total de Armor slots disponíveis.' },
  { key: 'hope', label: 'Hope', kind: 'integer', min: 0, max: 6, default: 2, description: 'Tokens de Hope acumulados.' },
  { key: 'evasion', label: 'Eva', kind: 'integer', min: 1, max: 30, default: 10, description: 'Evasion — DC pra ser atingido por ataques físicos.' },
  { key: 'majorThreshold', label: 'Major', kind: 'integer', min: 1, max: 30, default: 6, description: 'Limite de Major threshold de dano: ≥ marca 2 HP.' },
  { key: 'severeThreshold', label: 'Severe', kind: 'integer', min: 1, max: 30, default: 12, description: 'Limite de Severe threshold de dano: ≥ marca 3 HP.' },
]

// ============================================================================
// Rules
// ============================================================================

const RULES: SystemRules = {
  roll(kind, params) {
    switch (kind) {
      case 'check':
      case 'duality': {
        const r = rollDuality(params as unknown as DualityParams)
        const { breakdown, ...res } = r
        void breakdown
        return res
      }
      case 'damage':
        return rollDamage(params as unknown as DamageRollParams)
      default:
        return null
    }
  },
  applyDamage(incoming, target) {
    return applyDhDamage(incoming, target as unknown as ApplyDamageInput)
  },
}

export { rollDuality }

// ============================================================================
// Bundle
// ============================================================================

export const daggerheart: System = {
  id: 'daggerheart',
  name: 'Daggerheart',
  ruleVersion: 'SRD 1.0',
  attribution:
    'Daggerheart is a trademark of Darrington Press LLC. This work uses mechanics from the Daggerheart SRD under the Darrington Press Community Gaming License (https://darringtonpress.com/license/).',
  dicePresets: DICE_PRESETS,
  conditions: CONDITIONS,
  trackerFields: TRACKER_FIELDS,
  rules: RULES,
}
