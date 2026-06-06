/**
 * Gerador de NPC pra Candela Obscura.
 *
 * Mecânica: d6 pool, take highest (6=clean, 4-5=partial, 1-3=failure).
 * Personagens têm 3 Drives (Nerve/Cunning/Intuition) que servem como
 * pools de ação. NPCs têm:
 * - Hit Threshold (resistência geral)
 * - Drives (valores 1-3 cada)
 * - Tier/Role pra calibrar dificuldade
 *
 * Como Candela é narrativo, NPCs aqui são mais "estatísticos" — guideline
 * pra o GM ajustar.
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
import { pick } from '../rng'
import { generateName } from '../names'

export const CANDELA_ROLES = [
  'cultist',
  'investigator',
  'mundane',
  'occultist',
  'spectre',
  'thug',
  'whisper',
] as const

export type CandelaRole = (typeof CANDELA_ROLES)[number]

interface CandelaRoleDef {
  hitThreshold: 1 | 2 | 3
  drives: { nerve: 1 | 2 | 3; cunning: 1 | 2 | 3; intuition: 1 | 2 | 3 }
  attackName: string
  attackDamage: string
  attackRange: 'melee' | 'close' | 'far'
}

const CANDELA_ROLE_DEFS: Record<CandelaRole, CandelaRoleDef> = {
  cultist: { hitThreshold: 2, drives: { nerve: 2, cunning: 1, intuition: 3 }, attackName: 'Adaga ritual', attackDamage: '1 marca de sangue', attackRange: 'melee' },
  investigator: { hitThreshold: 2, drives: { nerve: 2, cunning: 3, intuition: 2 }, attackName: 'Revólver', attackDamage: '1 marca de corpo', attackRange: 'far' },
  mundane: { hitThreshold: 1, drives: { nerve: 1, cunning: 2, intuition: 1 }, attackName: 'Improviso', attackDamage: '1 marca de corpo', attackRange: 'melee' },
  occultist: { hitThreshold: 2, drives: { nerve: 1, cunning: 3, intuition: 3 }, attackName: 'Manifestação', attackDamage: '1 marca de mente', attackRange: 'close' },
  spectre: { hitThreshold: 3, drives: { nerve: 3, cunning: 2, intuition: 3 }, attackName: 'Toque Espectral', attackDamage: '2 marcas (Iluminação cresce)', attackRange: 'melee' },
  thug: { hitThreshold: 2, drives: { nerve: 3, cunning: 1, intuition: 1 }, attackName: 'Soco-inglês', attackDamage: '1 marca de corpo + abalado', attackRange: 'melee' },
  whisper: { hitThreshold: 1, drives: { nerve: 2, cunning: 2, intuition: 3 }, attackName: 'Susurros', attackDamage: '1 marca de mente', attackRange: 'close' },
}

export interface CandelaOptions {
  /** Tier informal: 1 (capacho) a 3 (chefe). Default 1. */
  tier?: 1 | 2 | 3
  role?: CandelaRole
  name?: string
  creatureType?: CreatureType
  creatureSize?: CreatureSize
}

export interface CandelaExtra {
  hitThreshold: number
  drives: { nerve: number; cunning: number; intuition: number }
  attackRange: string
}

export function generateCandelaNpc(opts: CandelaOptions = {}): PoolGeneratedNpc {
  const tier = (Math.max(1, Math.min(3, Math.trunc(opts.tier ?? 1)))) as 1 | 2 | 3
  const role: CandelaRole = opts.role ?? pick(CANDELA_ROLES as readonly CandelaRole[])
  const def = CANDELA_ROLE_DEFS[role]

  // Tier eleva hit threshold e drives.
  const hitThreshold = Math.min(3, def.hitThreshold + (tier - 1))
  const driveBoost = tier - 1
  const drives = {
    nerve: Math.min(3, def.drives.nerve + driveBoost),
    cunning: Math.min(3, def.drives.cunning + driveBoost),
    intuition: Math.min(3, def.drives.intuition + driveBoost),
  }

  const tracks: Record<string, PoolTrack> = {
    body: { current: 0, max: 3 },
    brain: { current: 0, max: 3 },
    bleed: { current: 0, max: 3 },
  }

  const attacks: PoolAttack[] = [
    {
      name: def.attackName,
      damage: def.attackDamage,
      range: def.attackRange,
      notes: [`Hit Threshold ${hitThreshold} pra ferir`],
    },
  ]

  const creature: NpcCreature = buildCreature(
    opts.creatureType ?? 'humanoid',
    opts.creatureSize ?? 'medium',
  )

  const extra: CandelaExtra = {
    hitThreshold,
    drives,
    attackRange: def.attackRange,
  }

  return {
    family: 'pool',
    systemId: 'candela-obscura',
    system: 'candela-obscura',
    name: opts.name ?? generateName({ style: 'lovecraftian' }),
    role,
    tier,
    tracks,
    attacks,
    creature,
    extra: extra as unknown as Record<string, unknown>,
  }
}
