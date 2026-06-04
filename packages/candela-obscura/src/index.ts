/**
 * Candela Obscura (Darrington Press).
 *
 * Roda sobre o sistema **Illuminated Worlds** da Darrington Press
 * (d6 dice pool com "take highest"). Conteúdo de regras é usado sob a
 * Darrington Press Community Gaming License (DPCGL):
 *   https://darringtonpress.com/license/
 *
 * Candela Obscura™ é trademark da Darrington Press. Este pacote
 * implementa MECÂNICA do Illuminated Worlds e dos marks/drives, sem
 * copiar texto oficial — resumos de condições são originais.
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
// Illuminated Worlds dice pool
//
// - Rola N d6 (pool de 1 a 6 dados).
// - PEGA O MAIOR resultado.
// - Outcome:
//    6  → 'clean'   (sucesso pleno)
//    4-5 → 'partial' (sucesso com custo)
//    1-3 → 'failure'
// - Se um dado adicional é "gilded" e o jogador escolhe usar o resultado dele,
//   ele recupera Drive (mecânica opcional — exposta no parâmetro `gilded`).
// ============================================================================

type Outcome = 'clean' | 'partial' | 'failure'

function outcomeFor(value: number): Outcome {
  if (value === 6) return 'clean'
  if (value >= 4) return 'partial'
  return 'failure'
}

interface PoolParams {
  /** Tamanho do pool (1..6, clampado). */
  pool: number
  /**
   * Se true, marca que o JOGADOR optou por usar o "gilded die" — implica
   * regenerar 1 Drive (anota nas notes; o tracker fica com o GM atualizar).
   * Não muda a rolagem em si.
   */
  gilded?: boolean
}

interface PoolBreakdown {
  dice: number[]
  highest: number
  outcome: Outcome
}

function rollPool(params: PoolParams): RollResult & { breakdown: PoolBreakdown } {
  const n = Math.max(1, Math.min(6, Math.trunc(params.pool)))
  const dice = roll(6, n)
  const highest = Math.max(...dice)
  const outcome = outcomeFor(highest)

  const notes: string[] = [
    outcome === 'clean'
      ? 'sucesso (6)'
      : outcome === 'partial'
        ? 'sucesso com custo (4-5)'
        : 'falha (1-3)',
  ]
  if (params.gilded) notes.push('gilded usado — recupera 1 Drive')

  return {
    rolls: dice,
    modifier: 0,
    total: highest,
    notation: `${n}d6 (take highest)`,
    notes,
    breakdown: { dice, highest, outcome },
  }
}

// ============================================================================
// Resistance roll — pra reduzir consequências
// Mesma mecânica do pool, mas o outcome é interpretado como "quanto a
// consequência diminui":
//  - clean:    sem custo, anula
//  - partial:  reduz mas você toma 1 Drive
//  - failure:  paga o custo total + Drive
// ============================================================================

function rollResistance(params: PoolParams): RollResult & { breakdown: PoolBreakdown } {
  const r = rollPool(params)
  const notes: string[] = [...r.notes]
  // Substituir/anotar interpretação de resistance:
  notes.push(
    r.breakdown.outcome === 'clean'
      ? 'resistance: consequência anulada'
      : r.breakdown.outcome === 'partial'
        ? 'resistance: consequência reduzida (-1 Drive)'
        : 'resistance: consequência mantida (-2 Drive)',
  )
  return { ...r, notes }
}

// ============================================================================
// Presets de dados
// ============================================================================

const DICE_PRESETS: DicePreset[] = [
  { id: 'pool-1', label: 'Pool 1', notation: '1d6', category: 'check' },
  { id: 'pool-2', label: 'Pool 2', notation: '2d6', category: 'check' },
  { id: 'pool-3', label: 'Pool 3', notation: '3d6', category: 'check' },
  { id: 'pool-4', label: 'Pool 4', notation: '4d6', category: 'check' },
  { id: 'pool-5', label: 'Pool 5', notation: '5d6', category: 'check' },
  { id: 'pool-6', label: 'Pool 6', notation: '6d6', category: 'check', description: 'Pool máximo (6 dados).' },
  {
    id: 'resistance',
    label: 'Resistance',
    notation: 'resistance',
    category: 'special',
    description: 'Rolagem de resistência — interpretação narrativa em vez de check.',
  },
]

// ============================================================================
// Conditions (Illuminated Worlds / Candela: resumos próprios)
// ============================================================================

const CONDITIONS: ConditionDef[] = [
  { id: 'bleeding', label: 'Bleeding', summary: 'Sangrando — marca um Body mark a cada turno até estabilizar.' },
  { id: 'shaken', label: 'Shaken', summary: 'Abalado — penalidade em ações que exigem concentração.' },
  { id: 'hunted', label: 'Hunted', summary: 'Sendo caçado — encontros adicionais até despistar.' },
  { id: 'illuminated', label: 'Illuminated', summary: 'Em contato com a Bruma — risco de marks de Bleed/Mind.' },
  { id: 'compromised', label: 'Compromised', summary: 'Identidade ou disfarce exposto — perdeu vantagem narrativa.' },
  { id: 'exhausted', label: 'Exhausted', summary: 'Esgotado — pools máximos reduzidos até descanso.' },
]

// ============================================================================
// Tracker fields
//
// Health track tem 3 categorias (Body / Brain / Bleed) com 3 slots cada
// antes de virar um Scar. Drive é gerenciado por 3 grupos (Nerve / Cunning /
// Intuition), cada um com 0..3 pontos.
// ============================================================================

const TRACKER_FIELDS: TrackerField[] = [
  { key: 'bodyMarks', label: 'Body', kind: 'integer', min: 0, max: 3, default: 0, description: 'Marcas físicas. Ao atingir 3, escolhe um Body Scar.' },
  { key: 'brainMarks', label: 'Brain', kind: 'integer', min: 0, max: 3, default: 0, description: 'Marcas mentais. Ao atingir 3, escolhe um Brain Scar.' },
  { key: 'bleedMarks', label: 'Bleed', kind: 'integer', min: 0, max: 3, default: 0, description: 'Marcas espirituais. Ao atingir 3, escolhe um Bleed Scar.' },
  { key: 'scars', label: 'Scars', kind: 'integer', min: 0, max: 9, default: 0, description: 'Cicatrizes permanentes acumuladas (todas as categorias).' },
  { key: 'driveNerve', label: 'Nerve', kind: 'integer', min: 0, max: 3, default: 1, description: 'Drive do grupo Nerve — gasta pra adicionar d6 em pools relacionados.' },
  { key: 'driveCunning', label: 'Cunning', kind: 'integer', min: 0, max: 3, default: 1, description: 'Drive do grupo Cunning.' },
  { key: 'driveIntuition', label: 'Intuit', kind: 'integer', min: 0, max: 3, default: 1, description: 'Drive do grupo Intuition.' },
]

// ============================================================================
// Rules
// ============================================================================

const RULES: SystemRules = {
  roll(kind, params) {
    switch (kind) {
      case 'pool':
      case 'check':
      case 'action': {
        const r = rollPool(params as unknown as PoolParams)
        const { breakdown, ...res } = r
        void breakdown
        return res
      }
      case 'resistance': {
        const r = rollResistance(params as unknown as PoolParams)
        const { breakdown, ...res } = r
        void breakdown
        return res
      }
      default:
        return null
    }
  },
}

export { rollPool, rollResistance, outcomeFor }

// ============================================================================
// Bundle
// ============================================================================

export const candelaObscura: System = {
  id: 'candela-obscura',
  name: 'Candela Obscura',
  ruleVersion: 'Illuminated Worlds Core',
  attribution:
    'Candela Obscura is a trademark of Darrington Press LLC. Mechanics derive from the Illuminated Worlds rules under the Darrington Press Community Gaming License (https://darringtonpress.com/license/).',
  dicePresets: DICE_PRESETS,
  conditions: CONDITIONS,
  trackerFields: TRACKER_FIELDS,
  rules: RULES,
}
