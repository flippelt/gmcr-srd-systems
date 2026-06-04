/**
 * GUMSHOE — system genérico de investigação (Robin D. Laws / Pelgrane Press).
 *
 * Implementado a partir do GUMSHOE SRD (CC-BY 3.0 Unported, Pelgrane Press).
 *   https://site.pelgranepress.com/index.php/the-gumshoe-system-reference-document/
 *
 * Este pacote cobre a MECÂNICA GENÉRICA. Produtos específicos como
 * Trail of Cthulhu, Night's Black Agents, Ashen Stars, Esoterrorists,
 * Mutant City Blues, Fear Itself são Product Identity da Pelgrane Press
 * e NÃO são incluídos aqui.
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
// Random helper
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
// Investigative spend — não é um "roll", é gasto direto. Mantido aqui pra
// documentar a outra metade do GUMSHOE: investigative abilities NÃO usam
// dados. Achar pistas básicas é automático; gastar pontos compra cluês extras.
// ============================================================================

/**
 * Representa um "investigative spend": gasto direto de pontos de uma
 * perícia de investigação para ganhar informação adicional. Não rola.
 */
export interface InvestigativeSpend {
  ability: string
  amount: number
  /** Custo deduzido do pool da perícia. */
  cost: number
}

/**
 * Resolve um gasto de investigação. O custo é simplesmente o amount —
 * a UI subtrai do pool da perícia no tracker, se houver. Sucesso é
 * automático: GUMSHOE garante que pistas básicas estão sempre disponíveis.
 */
export function investigativeSpend(ability: string, amount: number): InvestigativeSpend {
  const cost = Math.max(0, Math.trunc(amount))
  return { ability: String(ability).slice(0, 40), amount: cost, cost }
}

// ============================================================================
// Presets de dados — General Ability tests usam 1d6 + spend vs DC (default 4).
// ============================================================================

const DICE_PRESETS: DicePreset[] = [
  { id: 'd6', label: 'd6', notation: '1d6', category: 'check', description: 'Teste de perícia geral GUMSHOE: 1d6 + pontos gastos vs Dificuldade (padrão 4).' },
  { id: 'd6+1', label: 'd6+1', notation: '1d6+1', category: 'check', description: 'Teste com 1 ponto gasto do pool.' },
  { id: 'd6+2', label: 'd6+2', notation: '1d6+2', category: 'check', description: 'Teste com 2 pontos gastos.' },
  { id: 'd6+3', label: 'd6+3', notation: '1d6+3', category: 'check', description: 'Teste com 3 pontos gastos.' },
  { id: 'd6+4', label: 'd6+4', notation: '1d6+4', category: 'check', description: 'Teste com 4 pontos gastos.' },
  { id: 'damage-d6-2', label: 'Dano d6−2', notation: '1d6-2', category: 'damage', description: 'Soco/chute desarmado típico.' },
  { id: 'damage-d6-1', label: 'Dano d6−1', notation: '1d6-1', category: 'damage', description: 'Faca pequena.' },
  { id: 'damage-d6', label: 'Dano d6', notation: '1d6', category: 'damage', description: 'Pistola leve/faca grande.' },
  { id: 'damage-d6+1', label: 'Dano d6+1', notation: '1d6+1', category: 'damage', description: 'Pistola pesada/arma de cano longo.' },
  { id: 'damage-d6+2', label: 'Dano d6+2', notation: '1d6+2', category: 'damage', description: 'Espingarda à queima-roupa.' },
]

// ============================================================================
// Conditions — termos genéricos cobertos pelo SRD GUMSHOE
// ============================================================================

const CONDITIONS: ConditionDef[] = [
  {
    id: 'hurt',
    label: 'Hurt',
    summary: 'Ferido — penalidades em testes envolvendo esforço físico até receber cuidados.',
  },
  {
    id: 'seriously-wounded',
    label: 'Seriously Wounded',
    summary: 'Gravemente ferido — em risco de morrer; ações limitadas até estabilizar.',
  },
  {
    id: 'shaken',
    label: 'Shaken',
    summary: 'Abalado — penalidades em testes mentais até se recompor.',
  },
  {
    id: 'stunned',
    label: 'Stunned',
    summary: 'Atordoado — perde a próxima ação significativa.',
  },
  {
    id: 'unconscious',
    label: 'Unconscious',
    summary: 'Inconsciente — não age, não percebe; vulnerável.',
  },
  {
    id: 'insane',
    label: 'Insane',
    summary: 'Insanidade temporária ou permanente — comportamento determinado pelo GM ou trauma.',
  },
  {
    id: 'pursued',
    label: 'Pursued',
    summary: 'Sob perseguição — encontros aleatórios mais frequentes até despistar.',
  },
  {
    id: 'connected',
    label: 'Connected',
    summary: 'Em contato com o sobrenatural/anomalia — risco de Stability/Sanity loss em cenas adjacentes.',
  },
]

// ============================================================================
// Tracker fields — pools comuns do GUMSHOE
// ============================================================================

const TRACKER_FIELDS: TrackerField[] = [
  {
    key: 'stability',
    label: 'Estab',
    kind: 'integer',
    min: -12,
    max: 20,
    default: 8,
    description: 'Estabilidade emocional — perda em encontros mentalmente abalando.',
  },
  {
    key: 'sanity',
    label: 'Sanid',
    kind: 'integer',
    min: 0,
    max: 15,
    default: 10,
    description: 'Sanidade de longo prazo — esgotar pode ser permanente.',
  },
  {
    key: 'athletics',
    label: 'Atlet',
    kind: 'integer',
    min: 0,
    max: 20,
    default: 8,
    description: 'Pool da perícia geral Athletics (gasto em testes físicos/movimento).',
  },
  {
    key: 'sense-trouble',
    label: 'STro',
    kind: 'integer',
    min: 0,
    max: 20,
    default: 6,
    description: 'Pool da perícia Sense Trouble (gasto em testes de percepção/iniciativa).',
  },
]

// ============================================================================
// Rules — General test, Stability test, damage
// ============================================================================

interface GeneralTestParams {
  /** Pontos gastos do pool (somam ao d6). */
  spend?: number
  /** Dificuldade alvo. Padrão GUMSHOE: 4. */
  difficulty?: number
}

/**
 * Teste de perícia geral GUMSHOE: 1d6 + pontos gastos vs Dificuldade.
 * Padrão Difficulty 4. 6 natural sempre passa; 1 natural raramente é
 * tratado como falha automática (deixamos a critério do narrador).
 */
function rollGeneralTest({ spend = 0, difficulty = 4 }: GeneralTestParams): RollResult {
  const d6 = roll(6)[0]!
  const spent = Math.max(0, Math.trunc(spend))
  const total = d6 + spent
  const notes: string[] = []
  notes.push(total >= difficulty ? 'sucesso' : 'falha')
  notes.push(`DC ${difficulty}`)
  if (spent > 0) notes.push(`gastou ${spent} do pool`)
  if (d6 === 6) notes.push('6 natural')
  return {
    rolls: [d6],
    modifier: spent,
    total,
    notation: spent === 0 ? '1d6' : `1d6+${spent}`,
    notes,
  }
}

/**
 * Stability test — variação semântica do General test (estabilidade emocional).
 * Mesma mecânica, mas notas mencionam "stability".
 */
function rollStabilityTest({ spend = 0, difficulty = 4 }: GeneralTestParams): RollResult {
  const r = rollGeneralTest({ spend, difficulty })
  return {
    ...r,
    notes: ['teste de Estabilidade', ...(r.notes ?? [])],
  }
}

interface DamageParams {
  /** Modificador da arma (-2 a +2 típico em GUMSHOE). */
  modifier?: number
}

/** Damage roll GUMSHOE: 1d6 + modificador da arma (não há armor flat). */
function rollDamage({ modifier = 0 }: DamageParams): RollResult {
  const d6 = roll(6)[0]!
  const total = Math.max(0, d6 + modifier)
  const modStr = modifier === 0 ? '' : modifier > 0 ? `+${modifier}` : `${modifier}`
  return {
    rolls: [d6],
    modifier,
    total,
    notation: `1d6${modStr}`,
  }
}

const RULES: SystemRules = {
  roll(kind, params) {
    switch (kind) {
      case 'check':
      case 'general':
        return rollGeneralTest(params as unknown as GeneralTestParams)
      case 'stability':
      case 'sanity':
        return rollStabilityTest(params as unknown as GeneralTestParams)
      case 'damage':
        return rollDamage(params as unknown as DamageParams)
      default:
        return null
    }
  },
}

// ============================================================================
// Bundle
// ============================================================================

export const gumshoe: System = {
  id: 'gumshoe',
  name: 'GUMSHOE',
  ruleVersion: 'SRD (CC-BY 3.0)',
  attribution:
    'Based on the GUMSHOE System by Robin D. Laws, published by Pelgrane Press under the Creative Commons Attribution 3.0 Unported License (https://creativecommons.org/licenses/by/3.0/).',
  dicePresets: DICE_PRESETS,
  conditions: CONDITIONS,
  trackerFields: TRACKER_FIELDS,
  rules: RULES,
}
