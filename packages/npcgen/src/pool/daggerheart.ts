/**
 * Gerador de NPC pra Daggerheart.
 *
 * Mecânica Daggerheart (Duality Dice):
 * - 2d12 (Hope/Fear) + modificador vs Difficulty
 * - HP track (~5-15), Stress (4-7), Armor (0-3)
 * - Damage thresholds: Major (médio), Severe (alto)
 * - Evasion: defesa estática (ex.: 8-16)
 *
 * Tier (1..4) escala HP/dificuldade/limiares no estilo do livro
 * (Adversaries do SRD Daggerheart).
 */

import type {
  CreatureSize,
  CreatureType,
  NpcCreature,
  PoolAttack,
  PoolGeneratedNpc,
  PoolTrack,
} from '../types'
import { buildCreature } from '../creature'
import { d, pick } from '../rng'
import { generateName } from '../names'

/** Tier 1..4 por nível Daggerheart (10 níveis: 1-3, 4-6, 7-9, 10). */
export function tierForLevel(level: number): 1 | 2 | 3 | 4 {
  const lvl = Math.max(1, Math.min(10, Math.trunc(level)))
  if (lvl <= 3) return 1
  if (lvl <= 6) return 2
  if (lvl <= 9) return 3
  return 4
}

/** Arquétipos comuns de adversários no Daggerheart. */
export const DH_ROLES = [
  'bruiser',
  'horde',
  'leader',
  'minion',
  'ranged',
  'skulk',
  'social',
  'solo',
  'standard',
  'support',
] as const

export type DhRole = (typeof DH_ROLES)[number]

interface DhRoleDef {
  hpBase: number
  hpPerTier: number
  stressBase: number
  evasionBase: number
  difficultyBase: number
  attackName: string
  damageDie: 4 | 6 | 8 | 10 | 12
  damageMod: number
  range: 'Melee' | 'Close' | 'Far' | 'Very Far'
}

const DH_ROLE_DEFS: Record<DhRole, DhRoleDef> = {
  bruiser: { hpBase: 7, hpPerTier: 3, stressBase: 5, evasionBase: 11, difficultyBase: 13, attackName: 'Pancada Brutal', damageDie: 10, damageMod: 2, range: 'Melee' },
  horde: { hpBase: 4, hpPerTier: 2, stressBase: 3, evasionBase: 12, difficultyBase: 11, attackName: 'Ataque em Grupo', damageDie: 6, damageMod: 1, range: 'Melee' },
  leader: { hpBase: 6, hpPerTier: 2, stressBase: 4, evasionBase: 12, difficultyBase: 13, attackName: 'Espada de Comando', damageDie: 8, damageMod: 2, range: 'Melee' },
  minion: { hpBase: 2, hpPerTier: 1, stressBase: 2, evasionBase: 13, difficultyBase: 10, attackName: 'Ataque Fraco', damageDie: 4, damageMod: 0, range: 'Melee' },
  ranged: { hpBase: 5, hpPerTier: 2, stressBase: 4, evasionBase: 13, difficultyBase: 13, attackName: 'Tiro Certeiro', damageDie: 8, damageMod: 1, range: 'Far' },
  skulk: { hpBase: 4, hpPerTier: 2, stressBase: 4, evasionBase: 15, difficultyBase: 14, attackName: 'Ataque Furtivo', damageDie: 6, damageMod: 2, range: 'Melee' },
  social: { hpBase: 4, hpPerTier: 1, stressBase: 6, evasionBase: 12, difficultyBase: 14, attackName: 'Palavra Cortante', damageDie: 6, damageMod: 0, range: 'Close' },
  solo: { hpBase: 12, hpPerTier: 4, stressBase: 8, evasionBase: 14, difficultyBase: 15, attackName: 'Investida', damageDie: 12, damageMod: 3, range: 'Melee' },
  standard: { hpBase: 5, hpPerTier: 2, stressBase: 4, evasionBase: 12, difficultyBase: 12, attackName: 'Golpe', damageDie: 8, damageMod: 1, range: 'Melee' },
  support: { hpBase: 4, hpPerTier: 2, stressBase: 5, evasionBase: 12, difficultyBase: 12, attackName: 'Aura Debilitante', damageDie: 4, damageMod: 1, range: 'Close' },
}

export interface DhOptions {
  level?: number
  role?: DhRole
  name?: string
  creatureType?: CreatureType
  creatureSize?: CreatureSize
}

/** Stats específicos do Daggerheart anexados em `npc.extra`. */
export interface DaggerheartExtra {
  /** Tier (1..4). */
  tier: number
  /** Difficulty pra ataques contra o NPC (≈ "AC"). */
  difficulty: number
  /** Evasion (defesa estática). */
  evasion: number
  /** Damage thresholds: dano abaixo do major faz 1 HP, abaixo de severe faz 2, acima faz 3. */
  majorThreshold: number
  severeThreshold: number
  /** Range categórico do ataque assinatura. */
  range: string
}

export function generateDaggerheartNpc(opts: DhOptions = {}): PoolGeneratedNpc {
  const level = Math.max(1, Math.min(10, Math.trunc(opts.level ?? 1)))
  const tier = tierForLevel(level)
  const role: DhRole = opts.role ?? pick(DH_ROLES as readonly DhRole[])
  const def = DH_ROLE_DEFS[role]

  const hpMax = def.hpBase + def.hpPerTier * (tier - 1)
  const stressMax = def.stressBase + Math.floor((tier - 1) / 2)
  const armorMax = Math.min(3, Math.floor(tier / 2))
  const difficulty = def.difficultyBase + (tier - 1)
  const evasion = def.evasionBase + Math.floor((tier - 1) / 2)
  const majorThreshold = 5 + tier * 3
  const severeThreshold = 10 + tier * 5

  const tracks: Record<string, PoolTrack> = {
    hp: { current: hpMax, max: hpMax },
    stress: { current: 0, max: stressMax },
    armor: { current: armorMax, max: armorMax },
    hope: { current: 0, max: 6 },
  }

  // Damage notation com tier bonus (estilo Daggerheart: dano cresce com tier).
  const tierBonus = (tier - 1) * 2
  const totalMod = def.damageMod + tierBonus
  const damage = totalMod === 0
    ? `1d${def.damageDie}`
    : `1d${def.damageDie}${totalMod > 0 ? '+' : ''}${totalMod}`

  const attacks: PoolAttack[] = [
    {
      name: def.attackName,
      damage,
      range: def.range,
      notes: [],
    },
  ]

  const creature: NpcCreature = buildCreature(
    opts.creatureType ?? 'humanoid',
    opts.creatureSize ?? 'medium',
  )

  const extra: DaggerheartExtra = {
    tier,
    difficulty,
    evasion,
    majorThreshold,
    severeThreshold,
    range: def.range,
  }

  return {
    family: 'pool',
    systemId: 'daggerheart',
    system: 'daggerheart',
    name: opts.name ?? generateName({ style: 'fantasy' }),
    role,
    tier,
    tracks,
    attacks,
    creature,
    extra: extra as unknown as Record<string, unknown>,
  }
}

// `d` está aqui pra forçar import explícito do RNG global (consumido por
// `pick`). Se nenhum sistema pool precisar do `d` diretamente, podemos
// remover essa referência sem efeito visível.
void d
