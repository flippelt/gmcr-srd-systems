/**
 * Starfinder 1ª Edição (Paizo Publishing).
 *
 * Conteúdo de regras deriva do Starfinder SRD da Paizo, sob a
 * Open Game License v1.0a:
 *   https://www.aonsrd.com/Default.aspx
 *
 * Variante sci-fi da família d20: usa Stamina Points + Hit Points
 * (stamina drena primeiro), Energy Armor Class (EAC) e Kinetic Armor
 * Class (KAC) separadas, e Resolve Points como recurso "narrativo".
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

export function spellSaveDC(spellLevel: number, abilityMod: number): number {
  return 10 + spellLevel + abilityMod
}

/**
 * Aplica dano em Stamina + HP — stamina drena primeiro, sobra vai pra HP.
 * Retorna o novo estado e quantos foram pra cada trilha.
 */
export interface ApplyDamageInput {
  stamina: number
  hp: number
}

export function applyToStaminaThenHp(
  incoming: number,
  current: ApplyDamageInput,
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
// Conditions — Starfinder SRD (OGC)
// ============================================================================

const CONDITIONS: ConditionDef[] = [
  { id: 'asleep', label: 'Asleep', summary: 'Dormindo: indefeso; alvo de coup de grace.' },
  { id: 'bleeding', label: 'Bleeding', summary: 'Sangrando: perde HP a cada turno até estabilizar.' },
  { id: 'blinded', label: 'Blinded', summary: 'Cego: −2 EAC/KAC; ½ velocidade; sem ações que exijam visão.' },
  { id: 'broken', label: 'Broken', summary: 'Item ou armadura quebrado: bônus pela metade.' },
  { id: 'burning', label: 'Burning', summary: 'Em chamas: dano de fogo a cada turno; gasta ação pra apagar.' },
  { id: 'confused', label: 'Confused', summary: 'Confuso: comportamento aleatório por d%.' },
  { id: 'cowering', label: 'Cowering', summary: 'Encolhido: perde Dex; +2 pra atacantes; sem ações.' },
  { id: 'dazed', label: 'Dazed', summary: 'Aturdido: sem ações por 1 rodada.' },
  { id: 'dazzled', label: 'Dazzled', summary: 'Cegado por luz: −1 em ataques e Perception.' },
  { id: 'deafened', label: 'Deafened', summary: 'Surdo: −4 em iniciativa; chance de falha em feitiço verbal.' },
  { id: 'dying', label: 'Dying', summary: 'Inconsciente com 0 HP: precisa estabilizar.' },
  { id: 'encumbered', label: 'Encumbered', summary: 'Sobrecarregado: −3 em ataques/Dex; ¾ velocidade.' },
  { id: 'entangled', label: 'Entangled', summary: 'Enredado: ½ velocidade, −2 atk, −4 Dex.' },
  { id: 'exhausted', label: 'Exhausted', summary: 'Exausto: −6 Str/Dex; ½ velocidade.' },
  { id: 'fascinated', label: 'Fascinated', summary: 'Fascinado: imóvel, sem ações; −4 em testes de Perception.' },
  { id: 'fatigued', label: 'Fatigued', summary: 'Fatigado: −2 Str/Dex; sem correr.' },
  { id: 'flat-footed', label: 'Flat-Footed', summary: 'Desprevenido: perde Dex em EAC/KAC.' },
  { id: 'frightened', label: 'Frightened', summary: 'Amedrontado: foge; −2 em rolagens.' },
  { id: 'grappled', label: 'Grappled', summary: 'Agarrado: perde Dex; −2 em ataques.' },
  { id: 'helpless', label: 'Helpless', summary: 'Indefeso: alvo de coup de grace.' },
  { id: 'nauseated', label: 'Nauseated', summary: 'Nauseado: só move ações.' },
  { id: 'off-target', label: 'Off-target', summary: 'Mira ruim: −2 em ataques.' },
  { id: 'paralyzed', label: 'Paralyzed', summary: 'Paralisado: helpless; Dex/Str 0.' },
  { id: 'pinned', label: 'Pinned', summary: 'Pinado: sem ações exceto escapar.' },
  { id: 'prone', label: 'Prone', summary: 'Caído: −4 melee; +4 AC vs ranged; −4 AC vs melee.' },
  { id: 'shaken', label: 'Shaken', summary: 'Abalado: −2 em rolagens.' },
  { id: 'sickened', label: 'Sickened', summary: 'Enjoado: −2 em rolagens/dano.' },
  { id: 'staggered', label: 'Staggered', summary: 'Atordoado leve: 1 ação por turno.' },
  { id: 'stunned', label: 'Stunned', summary: 'Atordoado: sem ações; perde Dex.' },
  { id: 'unconscious', label: 'Unconscious', summary: 'Inconsciente: indefeso.' },
]

// ============================================================================
// Tracker fields — SF1e separa EAC (energia) e KAC (cinético)
// ============================================================================

const TRACKER_FIELDS: TrackerField[] = [
  { key: 'eac', label: 'EAC', kind: 'integer', min: 0, max: 50, default: 10, description: 'Energy Armor Class — ataques de energia (laser, plasma).' },
  { key: 'kac', label: 'KAC', kind: 'integer', min: 0, max: 50, default: 10, description: 'Kinetic Armor Class — ataques cinéticos (balas, slashing).' },
  { key: 'fort', label: 'Fort', kind: 'integer', min: -10, max: 30, default: 0, description: 'Fortitude save modifier.' },
  { key: 'ref', label: 'Ref', kind: 'integer', min: -10, max: 30, default: 0, description: 'Reflex save modifier.' },
  { key: 'will', label: 'Will', kind: 'integer', min: -10, max: 30, default: 0, description: 'Will save modifier.' },
  { key: 'bab', label: 'BAB', kind: 'integer', min: 0, max: 25, default: 0, description: 'Base Attack Bonus.' },
  { key: 'stamina', label: 'SP', kind: 'integer', min: 0, max: 999, default: 0, description: 'Stamina Points atuais (dano vai aqui primeiro).' },
  { key: 'resolve', label: 'RP', kind: 'integer', min: 0, max: 99, default: 0, description: 'Resolve Points — gasta pra estabilizar, recuperar SP, etc.' },
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
  /** Tipo do ataque define qual AC consultar. */
  damageType?: 'kinetic' | 'energy'
  targetEAC?: number
  targetKAC?: number
}

function rollAttack(params: AttackParams): RollResult {
  const r = rollD20(params)
  const d20 = r.rolls[0]!
  const notes = [...(r.notes ?? [])]
  const targetAC =
    params.damageType === 'energy' ? params.targetEAC : params.damageType === 'kinetic' ? params.targetKAC : undefined
  if (targetAC !== undefined) {
    const natural20 = d20 === 20
    const natural1 = d20 === 1
    const hit = natural20 || (!natural1 && r.total >= targetAC)
    if (natural20) notes.push(`acerto crítico vs ${params.damageType?.toUpperCase()} AC ${targetAC}`)
    else if (natural1) notes.push('erro automático (1 natural)')
    else notes.push(hit ? `acertou (vs ${params.damageType?.toUpperCase()} ${targetAC})` : `errou (vs ${params.damageType?.toUpperCase()} ${targetAC})`)
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
  /** Tipo do dano — anotado pra resolver bypass/resistance no aplicador. */
  damageType?: string
}

function rollDamage({ count, sides, modifier = 0, damageType }: DamageParams): RollResult {
  const dice = rollDice(sides, count)
  const sum = dice.reduce((a, b) => a + b, 0)
  const total = Math.max(0, sum + modifier)
  const modStr = modifier === 0 ? '' : modifier > 0 ? `+${modifier}` : `${modifier}`
  const notes: string[] = damageType ? [`tipo: ${damageType}`] : []
  return {
    rolls: dice,
    modifier,
    total,
    notation: `${count}d${sides}${modStr}`,
    notes,
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

/**
 * Hooks pra `@lippelt/srd-npcgen`. SF1 usa BAB (D20_MODEL já trata).
 * Cantrips em SF1 não escalam por nível (texto fixo dos 0-levels) — override
 * pra 1 dado. Skills SF1 são as 20 perícias canônicas do SRD sci-fi.
 *
 * defaultLanguages: SF1 não tem "Common" — usa Common (≈ Standard) +
 * idiomas raciais. Tentativa razoável por tipo de criatura.
 */
const SF1_SKILLS = [
  'acrobatics',
  'athletics',
  'bluff',
  'computers',
  'culture',
  'diplomacy',
  'disguise',
  'engineering',
  'intimidate',
  'life-science',
  'medicine',
  'mysticism',
  'perception',
  'physical-science',
  'piloting',
  'profession',
  'sense-motive',
  'sleight-of-hand',
  'stealth',
  'survival',
] as const

function sf1DefaultLanguages(creatureType: string): string[] {
  const langs = ['Common']
  switch (creatureType) {
    case 'humanoid':
    case 'aberration':
      return langs
    case 'construct':
      return ['Common', 'Castrovelian']
    case 'undead':
      return ['Common', 'Necril']
    case 'celestial':
    case 'fiend':
      return ['Common', 'Celestial', 'Infernal']
    default:
      return langs
  }
}

export const starfinder1e: System = {
  id: 'starfinder-1e',
  name: 'Starfinder 1st Edition',
  ruleVersion: 'SRD',
  attribution:
    'Contains material from the Starfinder System Reference Document by Paizo Publishing under the Open Game License v1.0a.',
  dicePresets: DICE_PRESETS,
  conditions: CONDITIONS,
  trackerFields: TRACKER_FIELDS,
  rules: RULES,
  npc: {
    cantripDamageDice: () => 1,
    skills: SF1_SKILLS,
    defaultLanguages: sf1DefaultLanguages,
  },
}
