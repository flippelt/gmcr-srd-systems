/**
 * Dungeons & Dragons 3.5 (System Reference Document 3.5).
 *
 * Conteúdo de regras deriva do SRD 3.5 da Wizards of the Coast, sob a
 * Open Game License v1.0a:
 *   https://www.opengamingfoundation.org/ogl.html
 *
 * Esta implementação é original (não copia código de outras
 * implementações). Termos de game design (saves Fortitude/Reflex/Will,
 * Base Attack Bonus, AC, etc) são parte da Open Game Content do SRD 3.5.
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

function rollDice(sides: number, count = 1): number[] {
  const out: number[] = []
  for (let i = 0; i < count; i++) out.push(roller(sides))
  return out
}

// ============================================================================
// Helpers públicos do D&D 3.5
// ============================================================================

/** Modificador de habilidade: floor((score - 10) / 2). */
export function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2)
}

/** DC de feitiço: 10 + nível do feitiço + modificador da habilidade. */
export function spellSaveDC(spellLevel: number, abilityMod: number): number {
  return 10 + spellLevel + abilityMod
}

// ============================================================================
// Presets de dados
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
// Conditions — SRD 3.5 (Open Game Content)
// ============================================================================

const CONDITIONS: ConditionDef[] = [
  { id: 'blinded', label: 'Blinded', summary: 'Cego: −2 na AC, perde Dex à AC; metade da velocidade.' },
  { id: 'confused', label: 'Confused', summary: 'Confuso: comportamento aleatório por d% (atacar, fugir, divagar).' },
  { id: 'cowering', label: 'Cowering', summary: 'Encolhido de medo: sem ações; perde Dex à AC; atacantes têm +2.' },
  { id: 'dazed', label: 'Dazed', summary: 'Aturdido: nenhuma ação nesta rodada (livre de defesas).' },
  { id: 'dazzled', label: 'Dazzled', summary: 'Cegado por luz: −1 em ataques e Spot/Search.' },
  { id: 'deafened', label: 'Deafened', summary: 'Surdo: −4 em iniciativa; 20% de chance de falhar feitiço verbal.' },
  { id: 'disabled', label: 'Disabled', summary: 'Com HP em 0: 1 ação parcial por turno; ação extenuante perde 1 HP.' },
  { id: 'dying', label: 'Dying', summary: 'Inconsciente entre −1 e −9 HP: estabiliza com 10% por turno; senão perde 1 HP.' },
  { id: 'entangled', label: 'Entangled', summary: 'Enredado: ½ velocidade, −2 em ataques, −4 em Dex efetivo.' },
  { id: 'exhausted', label: 'Exhausted', summary: 'Exausto: −6 em Str/Dex; metade da velocidade. Vira fatigado após 1 hora.' },
  { id: 'fatigued', label: 'Fatigued', summary: 'Fatigado: −2 em Str/Dex; não pode correr ou carga.' },
  { id: 'frightened', label: 'Frightened', summary: 'Amedrontado: foge da fonte; −2 em ataques/saves/checks.' },
  { id: 'grappled', label: 'Grappled', summary: 'Agarrado: sem feitiços com somatic ou material; perde Dex à AC.' },
  { id: 'helpless', label: 'Helpless', summary: 'Indefeso: Dex efetivo 0; melee crit auto; coup de grace possível.' },
  { id: 'nauseated', label: 'Nauseated', summary: 'Nauseado: só move ações; sem ataques, feitiços ou concentração.' },
  { id: 'panicked', label: 'Panicked', summary: 'Em pânico: −2 em saves/skills; deve fugir; sem ataques.' },
  { id: 'paralyzed', label: 'Paralyzed', summary: 'Paralisado: sem ações físicas; Dex/Str efetivos 0; helpless.' },
  { id: 'petrified', label: 'Petrified', summary: 'Petrificado: virou pedra; inconsciente e indefeso.' },
  { id: 'pinned', label: 'Pinned', summary: 'Imobilizado em grapple: perde Dex à AC; sem ações exceto escapar.' },
  { id: 'prone', label: 'Prone', summary: 'Caído: −4 em ataques corpo-a-corpo; +4 AC vs ranged; −4 AC vs melee.' },
  { id: 'shaken', label: 'Shaken', summary: 'Abalado: −2 em ataques, saves, skills.' },
  { id: 'sickened', label: 'Sickened', summary: 'Enjoado: −2 em ataques, saves, skills, damage.' },
  { id: 'stunned', label: 'Stunned', summary: 'Atordoado: sem ações; perde Dex; −2 AC; solta itens.' },
  { id: 'unconscious', label: 'Unconscious', summary: 'Inconsciente: indefeso, normalmente porque HP ≤ −1.' },
]

// ============================================================================
// Tracker fields
// ============================================================================

const TRACKER_FIELDS: TrackerField[] = [
  { key: 'ac', label: 'CA', kind: 'integer', min: 0, max: 50, default: 10, description: 'Armor Class (Classe de Armadura).' },
  { key: 'fort', label: 'Fort', kind: 'integer', min: -10, max: 30, default: 0, description: 'Fortitude save modifier.' },
  { key: 'ref', label: 'Ref', kind: 'integer', min: -10, max: 30, default: 0, description: 'Reflex save modifier.' },
  { key: 'will', label: 'Will', kind: 'integer', min: -10, max: 30, default: 0, description: 'Will save modifier.' },
  { key: 'bab', label: 'BAB', kind: 'integer', min: 0, max: 25, default: 0, description: 'Base Attack Bonus.' },
]

// ============================================================================
// Rules
// ============================================================================

interface D20Params {
  modifier?: number
}

function rollD20({ modifier = 0 }: D20Params): RollResult {
  const d20 = rollDice(20)[0]!
  const total = d20 + modifier
  const notes: string[] = []
  if (d20 === 20) notes.push('20 natural')
  if (d20 === 1) notes.push('1 natural')
  const modStr = modifier === 0 ? '' : modifier > 0 ? `+${modifier}` : `${modifier}`
  return { rolls: [d20], modifier, total, notation: `1d20${modStr}`, notes }
}

interface AttackParams {
  modifier?: number
  targetAC?: number
  /** Threshold do crítico (default 20). Armas como rapier 18-20, picareta 20/×4 etc. */
  critRange?: number
}

function rollAttack(params: AttackParams): RollResult {
  const r = rollD20(params)
  const d20 = r.rolls[0]!
  const notes = [...(r.notes ?? [])]
  if (params.targetAC !== undefined) {
    const critRange = params.critRange ?? 20
    const natural20 = d20 === 20
    const natural1 = d20 === 1
    const threat = d20 >= critRange && !natural1
    const hit = natural20 || (!natural1 && r.total >= params.targetAC)
    if (natural20) notes.push('acerto crítico (20 natural)')
    else if (threat) notes.push(`ameaça de crítico (${d20} ≥ ${critRange})`)
    else if (natural1) notes.push('erro automático (1 natural)')
    else notes.push(hit ? 'acertou' : 'errou')
  }
  return { ...r, notes }
}

interface SaveParams {
  modifier?: number
  dc: number
}

function rollSave({ modifier = 0, dc }: SaveParams): RollResult {
  const r = rollD20({ modifier })
  const notes = [...(r.notes ?? [])]
  // 1 natural sempre falha; 20 natural sempre passa (regra do SRD 3.5).
  const d20 = r.rolls[0]!
  const auto = d20 === 1 ? false : d20 === 20 ? true : null
  const passed = auto !== null ? auto : r.total >= dc
  notes.push(passed ? 'sucesso' : 'falha')
  notes.push(`DC ${dc}`)
  return { ...r, notes }
}

interface DamageParams {
  count: number
  sides: number
  modifier?: number
  /** Multiplica os dados de dano em caso de crítico (×2 default, alguns ×3 ou ×4). */
  critMultiplier?: number
}

function rollDamage({ count, sides, modifier = 0, critMultiplier }: DamageParams): RollResult {
  const m = critMultiplier && critMultiplier > 1 ? Math.trunc(critMultiplier) : 1
  const dice = rollDice(sides, count * m)
  const sum = dice.reduce((a, b) => a + b, 0)
  const total = Math.max(0, sum + modifier * m)
  const modStr = modifier === 0 ? '' : modifier > 0 ? `+${modifier}` : `${modifier}`
  const critStr = m > 1 ? ` (crit ×${m})` : ''
  return {
    rolls: dice,
    modifier: modifier * m,
    total,
    notation: `${count * m}d${sides}${modStr}${critStr}`,
    notes: m > 1 ? [`dano crítico — dados e mod ×${m}`] : [],
  }
}

const RULES: SystemRules = {
  roll(kind, params) {
    switch (kind) {
      case 'd20':
      case 'check':
      case 'ability':
      case 'skill':
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
}

// ============================================================================
// Bundle
// ============================================================================

export const dnd35: System = {
  id: 'dnd-3.5',
  name: 'Dungeons & Dragons 3.5',
  ruleVersion: 'SRD 3.5',
  attribution:
    'Contains material from the System Reference Document 3.5 by Wizards of the Coast LLC under the Open Game License v1.0a.',
  dicePresets: DICE_PRESETS,
  conditions: CONDITIONS,
  trackerFields: TRACKER_FIELDS,
  rules: RULES,
}
