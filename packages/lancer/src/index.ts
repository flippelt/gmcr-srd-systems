/**
 * Lancer (Massif Press).
 *
 * Este pacote é um third party work sob a Lancer Third Party License.
 * Não é um produto oficial Lancer; não é afiliado com a Massif Press.
 *   https://massifpress.com/legal
 *
 * Implementa as MECÂNICAS de Lancer (checks com accuracy/difficulty,
 * structure/stress tracks, status conditions). Textos descritivos das
 * condições e tabelas são escritos com palavras próprias — nenhum
 * conteúdo textual ou artístico oficial de Massif Press é redistribuído.
 *
 * Referência conceitual: foundryvtt-lancer (GPL-3, NÃO copiado — só
 * estrutura de mecânica). Nomes de mecânicas e condições são termos
 * permitidos pelo 3PP License.
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
// Accuracy / Difficulty dice
// Lancer permite somar +1d6 por accuracy (até cap) e subtrair pela difficulty.
// Acc e diff CANCELAM 1-pra-1 antes de rolar.
// Resultado: pega o MAIOR (acc) ou MENOR (diff) d6 e soma (ou subtrai).
// Quando líquido é 0 (cancelaram), nada é somado.
// ============================================================================

interface AccDiffParams {
  accuracy?: number
  difficulty?: number
}

interface AccDiffOutcome {
  net: number // > 0 = accuracy líquida; < 0 = difficulty líquida
  rolled: number[] // os d6 que foram rolados pra resolver
  applied: number // valor somado ao total final (positivo = +; negativo = −)
}

function resolveAccDiff({ accuracy = 0, difficulty = 0 }: AccDiffParams): AccDiffOutcome {
  const a = Math.max(0, Math.trunc(accuracy))
  const d = Math.max(0, Math.trunc(difficulty))
  const net = a - d
  if (net === 0) return { net: 0, rolled: [], applied: 0 }
  const count = Math.abs(net)
  const dice = roll(6, count)
  const best = net > 0 ? Math.max(...dice) : Math.min(...dice)
  return { net, rolled: dice, applied: net > 0 ? best : -best }
}

// ============================================================================
// Presets de dados
// ============================================================================

const DICE_PRESETS: DicePreset[] = [
  { id: 'd20', label: 'd20', notation: '1d20', category: 'check' },
  { id: 'd6', label: 'd6', notation: '1d6', category: 'damage' },
  { id: '2d6', label: '2d6', notation: '2d6', category: 'damage' },
  { id: '3d6', label: '3d6', notation: '3d6', category: 'damage' },
  { id: '4d6', label: '4d6', notation: '4d6', category: 'damage' },
  { id: 'd3', label: 'd3', notation: '1d3', category: 'special', description: 'Útil para heat e outros rolls menores.' },
  {
    id: 'structure',
    label: 'Estrutura',
    notation: 'structure',
    category: 'special',
    description: 'Rolagem na tabela de dano estrutural (1d6 com efeito).',
  },
  {
    id: 'stress',
    label: 'Stress',
    notation: 'stress',
    category: 'special',
    description: 'Rolagem na tabela de dano de stress reactor (1d6 com efeito).',
  },
]

// ============================================================================
// Conditions (nomes permitidos pelo 3PP; resumos escritos do zero)
// ============================================================================

const CONDITIONS: ConditionDef[] = [
  {
    id: 'impaired',
    label: 'Impaired',
    summary: 'Falha em testes que importam — recebe dificuldade extra em rolagens críticas.',
  },
  {
    id: 'slowed',
    label: 'Slowed',
    summary: 'Velocidade reduzida; movimentação só com ação prolongada.',
  },
  {
    id: 'immobilized',
    label: 'Immobilized',
    summary: 'Não pode se mover voluntariamente; reage como se estivesse parado.',
  },
  {
    id: 'lock-on',
    label: 'Lock On',
    summary: 'Próximo ataque contra o alvo ganha um bônus; consome o efeito.',
  },
  {
    id: 'engaged',
    label: 'Engaged',
    summary: 'Em proximidade com uma unidade hostil — penalidade ao tentar sair.',
  },
  {
    id: 'stunned',
    label: 'Stunned',
    summary: 'Sem ações nesta rodada; ataques contra a unidade ganham vantagem.',
  },
  {
    id: 'prone',
    label: 'Prone',
    summary: 'Caído; movimento custa mais, ataques corpo-a-corpo são mais fáceis contra.',
  },
  {
    id: 'invisible',
    label: 'Invisible',
    summary: 'Não é detectável visualmente; ataques contra a unidade têm dificuldade extra.',
  },
  {
    id: 'shutdown',
    label: 'Shutdown',
    summary: 'Sistemas desligados — sem ações, mas resistente a efeitos baseados em sistemas.',
  },
  {
    id: 'hidden',
    label: 'Hidden',
    summary: 'Posição oculta enquanto não tomar ação que revele; ataques têm dificuldade extra.',
  },
  {
    id: 'danger-zone',
    label: 'Danger Zone',
    summary: 'Em zona de risco — alguns testes passam a precisar de checagem extra.',
  },
  {
    id: 'burn',
    label: 'Burn',
    summary: 'Acumula dano contínuo; teste a cada turno para apagar.',
  },
]

// ============================================================================
// Tracker fields
// ============================================================================

const TRACKER_FIELDS: TrackerField[] = [
  {
    key: 'structure',
    label: 'Estr',
    kind: 'integer',
    min: 0,
    max: 4,
    default: 4,
    description: 'Trilha de estrutura — quando HP=0, decrementa e rola na tabela.',
  },
  {
    key: 'stress',
    label: 'Stress',
    kind: 'integer',
    min: 0,
    max: 4,
    default: 4,
    description: 'Trilha de stress do reactor — quando heat ≥ max, decrementa e rola.',
  },
  {
    key: 'heat',
    label: 'Heat',
    kind: 'integer',
    min: 0,
    max: 99,
    default: 0,
    description: 'Calor acumulado pelo reator/sistema.',
  },
  {
    key: 'armor',
    label: 'Arm',
    kind: 'integer',
    min: 0,
    max: 4,
    default: 0,
    description: 'Redução flat aplicada a dano cinético/energético/explosivo.',
  },
  {
    key: 'evasion',
    label: 'Eva',
    kind: 'integer',
    min: 1,
    max: 30,
    default: 10,
    description: 'Dificuldade para ser atingido em ataques físicos.',
  },
  {
    key: 'eDef',
    label: 'E-Def',
    kind: 'integer',
    min: 1,
    max: 30,
    default: 8,
    description: 'Dificuldade para ser atingido em ataques tech/eletrônicos.',
  },
]

// ============================================================================
// Rules
// ============================================================================

interface CheckParams extends AccDiffParams {
  modifier?: number
}

/** d20 + mod + accuracy/difficulty. Crítico natural marcado em 20. */
function rollCheck({ modifier = 0, accuracy, difficulty }: CheckParams): RollResult {
  const d20 = roll(20)[0]!
  const ad = resolveAccDiff({ accuracy, difficulty })
  const total = d20 + modifier + ad.applied
  const notes: string[] = []
  if (ad.net > 0) notes.push(`accuracy líquida ${ad.net} (+${ad.applied})`)
  else if (ad.net < 0) notes.push(`difficulty líquida ${Math.abs(ad.net)} (${ad.applied})`)
  if (d20 === 20) notes.push('20 natural')
  if (d20 === 1) notes.push('1 natural')
  const modStr = modifier === 0 ? '' : modifier > 0 ? `+${modifier}` : `${modifier}`
  const adStr = ad.net === 0 ? '' : ad.net > 0 ? ` +${Math.abs(ad.net)}acc` : ` +${Math.abs(ad.net)}diff`
  return {
    rolls: [d20, ...ad.rolled],
    modifier,
    total,
    notation: `1d20${modStr}${adStr}`,
    notes,
  }
}

interface AttackParams extends CheckParams {
  /** Defesa-alvo (Evasion ou E-Defense). Quando ausente, só rola sem comparar. */
  targetDefense?: number
}

function rollAttack(params: AttackParams): RollResult {
  const r = rollCheck(params)
  const d20 = r.rolls[0]!
  const notes = [...(r.notes ?? [])]
  if (params.targetDefense !== undefined) {
    const crit = d20 === 20
    const fumble = d20 === 1
    // Em Lancer um 20 natural é sempre crítico; 1 nem sempre é falha automática,
    // mas tratamos como erro pra simplificar — GM pode ajustar.
    const hit = crit || (!fumble && r.total >= params.targetDefense)
    notes.push(hit ? (crit ? 'acerto crítico' : 'acertou') : 'errou')
  }
  return { ...r, notes }
}

interface DamageParams {
  count: number
  sides: number
  modifier?: number
  /** Tipo do dano: 'kinetic' | 'energy' | 'explosive' são reduzidos por armor. */
  type?: 'kinetic' | 'energy' | 'explosive' | 'burn' | 'heat'
  /** Pontos de armor do alvo (0..4). Reduz flat o dano só pros 3 tipos acima. */
  armor?: number
}

const ARMOR_REDUCED = new Set(['kinetic', 'energy', 'explosive'])

function rollDamage({
  count,
  sides,
  modifier = 0,
  type,
  armor = 0,
}: DamageParams): RollResult {
  const dice = roll(sides, count)
  const sum = dice.reduce((a, b) => a + b, 0)
  const preReduction = sum + modifier
  const reducible = type !== undefined && ARMOR_REDUCED.has(type) && armor > 0
  const reduction = reducible ? Math.min(armor, Math.max(0, preReduction)) : 0
  const total = Math.max(0, preReduction - reduction)
  const modStr = modifier === 0 ? '' : modifier > 0 ? `+${modifier}` : `${modifier}`
  const notes: string[] = []
  if (type) notes.push(`tipo: ${type}`)
  if (reduction > 0) notes.push(`armor reduziu ${reduction}`)
  if (type === 'burn') notes.push('burn — alvo deve testar pra apagar')
  return {
    rolls: dice,
    modifier,
    total,
    notation: `${count}d${sides}${modStr}`,
    notes,
  }
}

// Tabelas de structure/stress são paráfrases mecânicas (sem texto oficial).
const STRUCTURE_TABLE = [
  'destruído', // 1
  'crushed armor — armor cai a 0',
  'crushed armor — armor cai a 0',
  'sistema danificado — perde uma sub-sistema aleatório',
  'sistema danificado — perde uma sub-sistema aleatório',
  'recompôs-se — sem efeito extra além de perder a estrutura', // 6
]

const STRESS_TABLE = [
  'meltdown — reactor crítico, próximo turno explode',
  'sobrecarga — perde uma ação no próximo turno',
  'sobrecarga — perde uma ação no próximo turno',
  'heat surge — recebe 1d6 dano de heat',
  'heat surge — recebe 1d6 dano de heat',
  'reactor controlado — sem efeito extra além de perder o stress',
]

/** Roll na tabela de structure damage (1d6). */
function rollStructureTable(): RollResult {
  const d = roll(6)[0]!
  return {
    rolls: [d],
    modifier: 0,
    total: d,
    notation: 'structure',
    notes: [`${d}: ${STRUCTURE_TABLE[d - 1]}`],
  }
}

/** Roll na tabela de stress damage (1d6). */
function rollStressTable(): RollResult {
  const d = roll(6)[0]!
  return {
    rolls: [d],
    modifier: 0,
    total: d,
    notation: 'stress',
    notes: [`${d}: ${STRESS_TABLE[d - 1]}`],
  }
}

const RULES: SystemRules = {
  roll(kind, params) {
    switch (kind) {
      case 'd20':
      case 'check':
      case 'skill':
        return rollCheck(params as unknown as CheckParams)
      case 'attack':
        return rollAttack(params as unknown as AttackParams)
      case 'damage':
        return rollDamage(params as unknown as DamageParams)
      case 'structure':
        return rollStructureTable()
      case 'stress':
        return rollStressTable()
      default:
        return null
    }
  },
  applyDamage(incoming, target) {
    const t = target as { armor?: number; type?: string } | undefined
    if (!t) return { final: Math.max(0, incoming), notes: [] }
    const armor = typeof t.armor === 'number' ? Math.max(0, Math.trunc(t.armor)) : 0
    if (!t.type || !ARMOR_REDUCED.has(t.type) || armor === 0) {
      return { final: Math.max(0, incoming), notes: t.type ? [`tipo: ${t.type}`] : [] }
    }
    const reduction = Math.min(armor, Math.max(0, incoming))
    return {
      final: Math.max(0, incoming - reduction),
      notes: [`tipo: ${t.type}`, `armor reduziu ${reduction}`],
    }
  },
}

// ============================================================================
// Bundle
// ============================================================================

export const lancer: System = {
  id: 'lancer',
  name: 'Lancer',
  ruleVersion: 'Core (4ª ed)',
  attribution:
    'This work is not an official Lancer product; it is a third party work, and is not affiliated with Massif Press. Published via the Lancer Third Party License (https://massifpress.com/legal).',
  dicePresets: DICE_PRESETS,
  conditions: CONDITIONS,
  trackerFields: TRACKER_FIELDS,
  rules: RULES,
}
