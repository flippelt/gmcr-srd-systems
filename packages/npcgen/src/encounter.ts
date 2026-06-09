/**
 * Gerador de encontros (v3): orquestra `generateNpc` N vezes e balanceia o
 * grupo. Determinístico — sub-seeds derivam do seed base (`seed + idx`), então
 * o mesmo input produz o mesmo encontro e cada NPC é distinto.
 *
 * Balanceamento:
 * - **d20**: orçamento de XP do 5e (threshold por jogador × tamanho do grupo),
 *   com o multiplicador por número de inimigos. Auto-compõe papéis até o XP
 *   ajustado atingir o alvo (respeitando `maxEnemies`).
 * - **pool**: sistemas de pool não têm orçamento de XP → balanceia por
 *   contagem (por dificuldade) e tier (= `partyLevel`).
 *
 * Tabelas de XP/orçamento seguem o SRD 5.1 (CC-BY-4.0).
 */
import type {
  EncounterDifficulty,
  EncounterInput,
  EncounterRoleSlot,
  GeneratedEncounter,
  GeneratedNpc,
  NpcGenFamily,
  NpcRole,
} from './types'
import { generateNpc } from './generate'
import { getSystemFamily } from './data'
import { clampLevel } from './d20'

/** XP por CR (5e). Usamos nível 1..20 como proxy de CR. */
export const XP_BY_CR: Record<number, number> = {
  1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800,
  6: 2300, 7: 2900, 8: 3900, 9: 5000, 10: 5900,
  11: 7200, 12: 8400, 13: 10000, 14: 11500, 15: 13000,
  16: 15000, 17: 18000, 18: 20000, 19: 22000, 20: 25000,
}

/** Thresholds de XP por personagem e nível: [easy, medium, hard, deadly]. */
const XP_THRESHOLDS: Record<number, [number, number, number, number]> = {
  1: [25, 50, 75, 100], 2: [50, 100, 150, 200], 3: [75, 150, 225, 400],
  4: [125, 250, 375, 500], 5: [250, 500, 750, 1100], 6: [300, 600, 900, 1400],
  7: [350, 750, 1100, 1700], 8: [450, 900, 1300, 2100], 9: [550, 1100, 1600, 2400],
  10: [600, 1200, 1900, 2800], 11: [800, 1600, 2400, 3600], 12: [1000, 2000, 3000, 4500],
  13: [1100, 2200, 3400, 5100], 14: [1250, 2500, 3800, 5700], 15: [1400, 2800, 4300, 6400],
  16: [1600, 3200, 4800, 7200], 17: [2000, 3900, 5900, 8800], 18: [2100, 4200, 6300, 9500],
  19: [2400, 4900, 7300, 10900], 20: [2800, 5700, 8500, 12700],
}

const DIFFICULTY_INDEX: Record<EncounterDifficulty, number> = {
  easy: 0, medium: 1, hard: 2, deadly: 3,
}

/** Offset de nível por papel no auto-balanceamento (minions mais fracos,
 *  líderes/brutes mais fortes — dá variedade de "corpos" no encontro). */
const ROLE_LEVEL_OFFSET: Record<NpcRole, number> = {
  minion: -3, archer: -1, skirmisher: -1, lurker: -1,
  soldier: 0, caster: 0, brute: 1, leader: 1,
}

/** Rotação de papéis usada pra auto-compor um encontro d20 (determinística). */
const AUTO_ROTATION: NpcRole[] = [
  'soldier', 'brute', 'skirmisher', 'archer', 'caster', 'minion', 'lurker', 'leader',
]

/** Multiplicador de XP do 5e por número de inimigos. */
export function encounterMultiplier(count: number): number {
  if (count <= 1) return 1
  if (count === 2) return 1.5
  if (count <= 6) return 2
  if (count <= 10) return 2.5
  if (count <= 14) return 3
  return 4
}

/** XP por personagem para um nível/dificuldade. */
export function xpThreshold(level: number, difficulty: EncounterDifficulty): number {
  const row = XP_THRESHOLDS[clampLevel(level)]!
  return row[DIFFICULTY_INDEX[difficulty]]!
}

/** XP de um inimigo de um dado nível (CR proxy). */
function xpForLevel(level: number): number {
  return XP_BY_CR[clampLevel(level)]!
}

/** Contagem-base de inimigos no pool por dificuldade (sem orçamento de XP). */
function poolCount(partySize: number, difficulty: EncounterDifficulty): number {
  const delta = { easy: -1, medium: 0, hard: 1, deadly: 2 }[difficulty]
  return Math.max(1, partySize + delta)
}

/** Uma entrada achatada de geração: papel (d20) + nível. */
interface GenEntry {
  role?: NpcRole
  level: number
}

/** Achata `roleMix` em entradas individuais (uma por inimigo). */
function flattenRoleMix(mix: EncounterRoleSlot[], partyLevel: number): GenEntry[] {
  const entries: GenEntry[] = []
  for (const slot of mix) {
    const level = clampLevel(slot.level ?? partyLevel)
    const count = Math.max(0, Math.floor(slot.count))
    for (let i = 0; i < count; i++) entries.push({ role: slot.role, level })
  }
  return entries
}

/** Auto-compõe um encontro d20 preenchendo o orçamento de XP. */
function autoComposeD20(
  target: number,
  partyLevel: number,
  maxEnemies: number,
): GenEntry[] {
  const entries: GenEntry[] = []
  let raw = 0
  let i = 0
  while (entries.length < maxEnemies) {
    const role = AUTO_ROTATION[i % AUTO_ROTATION.length]!
    i++
    const level = clampLevel(partyLevel + ROLE_LEVEL_OFFSET[role])
    entries.push({ role, level })
    raw += xpForLevel(level)
    if (raw * encounterMultiplier(entries.length) >= target) break
  }
  return entries
}

/**
 * Gera um encontro balanceado. Determinístico quando `seed` é informado.
 *
 * @throws se o sistema não for suportado (nem embutido nem declarado via hook).
 */
export function generateEncounter(input: EncounterInput): GeneratedEncounter {
  const family: NpcGenFamily | null =
    getSystemFamily(input.systemId) ?? input.npc?.family ?? null
  if (!family) {
    throw new Error(
      `[srd-npcgen] sistema "${input.systemId}" não suportado — declare family (ou generatePool) no hook npc`,
    )
  }

  const partySize = Math.max(1, Math.floor(input.partySize ?? 4))
  const partyLevel = clampLevel(input.partyLevel ?? 1)
  const difficulty: EncounterDifficulty = input.difficulty ?? 'medium'
  const maxEnemies = Math.max(1, Math.floor(input.maxEnemies ?? 16))

  // 1) Decide a composição (entradas achatadas, uma por inimigo).
  let entries: GenEntry[]
  if (input.roleMix && input.roleMix.length > 0) {
    entries = flattenRoleMix(input.roleMix, partyLevel).slice(0, maxEnemies)
  } else if (family === 'd20') {
    const target = xpThreshold(partyLevel, difficulty) * partySize
    entries = autoComposeD20(target, partyLevel, maxEnemies)
  } else {
    const count = Math.min(maxEnemies, poolCount(partySize, difficulty))
    entries = Array.from({ length: count }, () => ({ level: partyLevel }))
  }
  // Garante pelo menos um inimigo.
  if (entries.length === 0) entries = [{ level: partyLevel }]

  // 2) Gera cada NPC com sub-seed determinística.
  const npcs: GeneratedNpc[] = entries.map((e, idx) =>
    generateNpc({
      systemId: input.systemId,
      level: e.level,
      ...(family === 'd20' && e.role ? { role: e.role } : {}),
      ...(input.seed !== undefined ? { seed: input.seed + idx } : {}),
      ...(input.creatureType ? { creatureType: input.creatureType } : {}),
      ...(input.creatureSize ? { creatureSize: input.creatureSize } : {}),
      ...(input.nameStyle ? { nameStyle: input.nameStyle } : {}),
      ...(input.withEpithet ? { withEpithet: input.withEpithet } : {}),
      ...(input.npc ? { npc: input.npc } : {}),
    }),
  )

  // 3) Monta a meta (orçamento no d20; avisos no pool).
  const count = npcs.length
  if (family === 'd20') {
    const target = xpThreshold(partyLevel, difficulty) * partySize
    const rawXp = entries.reduce((sum, e) => sum + xpForLevel(e.level), 0)
    const multiplier = encounterMultiplier(count)
    return {
      meta: {
        systemId: input.systemId,
        family,
        partySize,
        partyLevel,
        difficulty,
        count,
        targetXp: target,
        rawXp,
        multiplier,
        adjustedXp: rawXp * multiplier,
      },
      npcs,
    }
  }

  return {
    meta: {
      systemId: input.systemId,
      family,
      partySize,
      partyLevel,
      difficulty,
      count,
      notes: [
        'Sistemas de pool não usam orçamento de XP; encontro balanceado por número de inimigos e tier.',
      ],
    },
    npcs,
  }
}
