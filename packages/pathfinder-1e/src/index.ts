/**
 * Pathfinder 1ª Edição (Pathfinder Roleplaying Game).
 *
 * Conteúdo de regras deriva do Pathfinder Reference Document (PRD) da
 * Paizo Publishing, sob a Open Game License v1.0a:
 *   https://paizo.com/community/communityuse
 *
 * Esta implementação é original. Termos de game design (saves Fortitude/
 * Reflex/Will, CMB/CMD, Base Attack Bonus, AC, etc) são Open Game Content.
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

/** DC de feitiço: 10 + nível do feitiço + modificador da habilidade. */
export function spellSaveDC(spellLevel: number, abilityMod: number): number {
  return 10 + spellLevel + abilityMod
}

/** CMD = 10 + BAB + Str mod + Dex mod + size mod. */
export function combatManeuverDefense(
  bab: number,
  strMod: number,
  dexMod: number,
  sizeMod = 0,
): number {
  return 10 + bab + strMod + dexMod + sizeMod
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
// Conditions — PRD (OGC)
// PF1e expandiu várias conditions do 3.5 e adicionou Bleed, Pinned, etc.
// ============================================================================

const CONDITIONS: ConditionDef[] = [
  { id: 'bleed', label: 'Bleed', summary: 'Sangrando: perde HP por turno até parar com Heal DC 15 ou cura.' },
  { id: 'blinded', label: 'Blinded', summary: 'Cego: −2 na AC, perde Dex à AC, ½ velocidade, falha em testes de visão.' },
  { id: 'broken', label: 'Broken', summary: 'Quebrado: arma/armadura com metade do bônus; sem feitiços de arma.' },
  { id: 'confused', label: 'Confused', summary: 'Confuso: comportamento aleatório por d% (atacar, fugir, divagar).' },
  { id: 'cowering', label: 'Cowering', summary: 'Encolhido: perde Dex à AC; atacantes têm +2; sem ações.' },
  { id: 'dazed', label: 'Dazed', summary: 'Aturdido: nenhuma ação nesta rodada.' },
  { id: 'dazzled', label: 'Dazzled', summary: 'Cegado por luz: −1 em ataques e Perception.' },
  { id: 'dead', label: 'Dead', summary: 'Morto: HP em −Con score; necessita res.' },
  { id: 'deafened', label: 'Deafened', summary: 'Surdo: −4 em iniciativa; 20% de falha em feitiço verbal.' },
  { id: 'disabled', label: 'Disabled', summary: 'Com 0 HP: 1 ação por turno; ação extenuante causa 1 ponto de dano.' },
  { id: 'dying', label: 'Dying', summary: 'Inconsciente abaixo de 0 HP: estabiliza com Heal/Con check ou perde 1 HP/turno.' },
  { id: 'energy-drained', label: 'Energy Drained', summary: 'Drenado: −1 por nível negativo em ataques, saves, skills, pontos.' },
  { id: 'entangled', label: 'Entangled', summary: 'Enredado: ½ velocidade, −2 em ataques, −4 em Dex efetivo.' },
  { id: 'exhausted', label: 'Exhausted', summary: 'Exausto: −6 em Str/Dex, ½ velocidade.' },
  { id: 'fatigued', label: 'Fatigued', summary: 'Fatigado: −2 em Str/Dex, sem correr/cargar.' },
  { id: 'flat-footed', label: 'Flat-Footed', summary: 'Desprevenido: perde Dex à AC; comum no início do combate.' },
  { id: 'frightened', label: 'Frightened', summary: 'Amedrontado: foge; −2 em ataques/saves/checks.' },
  { id: 'grappled', label: 'Grappled', summary: 'Agarrado: −4 em Dex; perde ações de feitiço com somatic; só uma mão livre.' },
  { id: 'helpless', label: 'Helpless', summary: 'Indefeso: Dex 0; melee crit auto; coup de grace possível.' },
  { id: 'incorporeal', label: 'Incorporeal', summary: 'Incorpóreo: imune a dano de armas não-mágicas; 50% miss vs mágicas.' },
  { id: 'invisible', label: 'Invisible', summary: 'Invisível: +2 em melee atacar; alvos ficam flat-footed.' },
  { id: 'nauseated', label: 'Nauseated', summary: 'Nauseado: apenas move ações; sem ataques ou feitiços.' },
  { id: 'panicked', label: 'Panicked', summary: 'Em pânico: −2 em saves/skills; deve fugir; solta itens.' },
  { id: 'paralyzed', label: 'Paralyzed', summary: 'Paralisado: helpless; Dex/Str efetivos 0; sem ações físicas.' },
  { id: 'petrified', label: 'Petrified', summary: 'Petrificado: virou pedra; indefeso.' },
  { id: 'pinned', label: 'Pinned', summary: 'Pinado: perde Dex à AC; sem ações exceto escapar.' },
  { id: 'prone', label: 'Prone', summary: 'Caído: −4 em melee attacks; +4 AC vs ranged; −4 AC vs melee.' },
  { id: 'shaken', label: 'Shaken', summary: 'Abalado: −2 em ataques, saves, skills, ability checks.' },
  { id: 'sickened', label: 'Sickened', summary: 'Enjoado: −2 em ataques, saves, skills, dano de armas.' },
  { id: 'staggered', label: 'Staggered', summary: 'Atordoado leve: 1 ação por turno; comum com 0 HP.' },
  { id: 'stunned', label: 'Stunned', summary: 'Atordoado: sem ações; perde Dex; −2 AC; solta itens.' },
  { id: 'unconscious', label: 'Unconscious', summary: 'Inconsciente: indefeso.' },
]

// ============================================================================
// Tracker fields — PF1e adiciona CMB/CMD
// ============================================================================

const TRACKER_FIELDS: TrackerField[] = [
  { key: 'ac', label: 'CA', kind: 'integer', min: 0, max: 50, default: 10, description: 'Armor Class total.' },
  { key: 'touch', label: 'Touch', kind: 'integer', min: 0, max: 50, default: 10, description: 'Touch AC (sem armor/shield/nat).' },
  { key: 'flatFooted', label: 'FF', kind: 'integer', min: 0, max: 50, default: 10, description: 'Flat-footed AC (sem Dex).' },
  { key: 'fort', label: 'Fort', kind: 'integer', min: -10, max: 30, default: 0, description: 'Fortitude save modifier.' },
  { key: 'ref', label: 'Ref', kind: 'integer', min: -10, max: 30, default: 0, description: 'Reflex save modifier.' },
  { key: 'will', label: 'Will', kind: 'integer', min: -10, max: 30, default: 0, description: 'Will save modifier.' },
  { key: 'bab', label: 'BAB', kind: 'integer', min: 0, max: 25, default: 0, description: 'Base Attack Bonus.' },
  { key: 'cmb', label: 'CMB', kind: 'integer', min: -5, max: 50, default: 0, description: 'Combat Maneuver Bonus.' },
  { key: 'cmd', label: 'CMD', kind: 'integer', min: 0, max: 50, default: 10, description: 'Combat Maneuver Defense.' },
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
    notes: m > 1 ? [`dano crítico — ×${m}`] : [],
  }
}

interface CombatManeuverParams {
  cmb: number
  /** CMD do alvo. */
  targetCMD: number
}

/** Combat Maneuver: 1d20 + CMB vs alvo CMD. */
function rollCombatManeuver({ cmb, targetCMD }: CombatManeuverParams): RollResult {
  const r = rollD20({ modifier: cmb })
  const notes = [...(r.notes ?? [])]
  notes.push(r.total >= targetCMD ? 'manobra bem-sucedida' : 'manobra falhou')
  notes.push(`CMD ${targetCMD}`)
  return { ...r, notes }
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
      case 'combat-maneuver':
      case 'maneuver':
        return rollCombatManeuver(params as unknown as CombatManeuverParams)
      default:
        return null
    }
  },
}

export const pathfinder1e: System = {
  id: 'pathfinder-1e',
  name: 'Pathfinder 1st Edition',
  ruleVersion: 'Pathfinder Reference Document',
  attribution:
    'Contains material from the Pathfinder Reference Document by Paizo Publishing under the Open Game License v1.0a.',
  dicePresets: DICE_PRESETS,
  conditions: CONDITIONS,
  trackerFields: TRACKER_FIELDS,
  rules: RULES,
}
