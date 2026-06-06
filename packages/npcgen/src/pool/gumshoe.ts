/**
 * Gerador de NPC pra GUMSHOE.
 *
 * Mecânica: d6 + spend de pools vs Difficulty (default 4). Pistas-chave são
 * automáticas; pontos compram informação extra ou bônus em testes.
 *
 * NPCs em GUMSHOE são definidos por:
 * - Hit Threshold (3-4 normal, 5-6 difícil)
 * - Pools de perícias gerais (Athletics, Fighting, Weapons, etc.)
 * - Pools de perícias investigativas (algumas pra adversários humanos)
 * - Health, Stability (mental)
 * - Damage modifier do ataque assinatura
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

export const GUMSHOE_ROLES = [
  'cultist',
  'investigator',
  'mook',
  'monster',
  'professional',
  'thug',
  'witness',
] as const

export type GumshoeRole = (typeof GUMSHOE_ROLES)[number]

interface GumshoeRoleDef {
  hitThreshold: number
  healthBase: number
  stabilityBase: number
  athletics: number
  fighting: number
  weapons: number
  attackName: string
  attackDamageMod: number
}

const GUMSHOE_ROLE_DEFS: Record<GumshoeRole, GumshoeRoleDef> = {
  cultist: { hitThreshold: 3, healthBase: 6, stabilityBase: 8, athletics: 4, fighting: 5, weapons: 4, attackName: 'Adaga ritual', attackDamageMod: -1 },
  investigator: { hitThreshold: 4, healthBase: 8, stabilityBase: 10, athletics: 6, fighting: 4, weapons: 6, attackName: 'Pistola', attackDamageMod: 0 },
  mook: { hitThreshold: 3, healthBase: 4, stabilityBase: 6, athletics: 3, fighting: 4, weapons: 2, attackName: 'Punho', attackDamageMod: -2 },
  monster: { hitThreshold: 5, healthBase: 14, stabilityBase: 0, athletics: 8, fighting: 10, weapons: 0, attackName: 'Garras', attackDamageMod: 2 },
  professional: { hitThreshold: 4, healthBase: 8, stabilityBase: 10, athletics: 6, fighting: 7, weapons: 8, attackName: 'Pistola silenciosa', attackDamageMod: 1 },
  thug: { hitThreshold: 4, healthBase: 8, stabilityBase: 6, athletics: 5, fighting: 8, weapons: 3, attackName: 'Cassetete', attackDamageMod: 0 },
  witness: { hitThreshold: 2, healthBase: 5, stabilityBase: 6, athletics: 2, fighting: 1, weapons: 0, attackName: 'Improviso', attackDamageMod: -2 },
}

export interface GumshoeOptions {
  /** Severidade do encontro: 1=trivial, 2=padrão, 3=ameaçador. Default 2. */
  tier?: 1 | 2 | 3
  role?: GumshoeRole
  name?: string
  creatureType?: CreatureType
  creatureSize?: CreatureSize
}

export interface GumshoeExtra {
  hitThreshold: number
  pools: { athletics: number; fighting: number; weapons: number }
  attackDamageMod: number
}

export function generateGumshoeNpc(opts: GumshoeOptions = {}): PoolGeneratedNpc {
  const tier = (Math.max(1, Math.min(3, Math.trunc(opts.tier ?? 2)))) as 1 | 2 | 3
  const role: GumshoeRole = opts.role ?? pick(GUMSHOE_ROLES as readonly GumshoeRole[])
  const def = GUMSHOE_ROLE_DEFS[role]

  // Tier sobe pools e thresholds proporcionalmente.
  const tierMult = tier === 1 ? 0.75 : tier === 3 ? 1.4 : 1
  const scale = (n: number) => Math.max(0, Math.round(n * tierMult))

  const tracks: Record<string, PoolTrack> = {
    health: { current: scale(def.healthBase), max: scale(def.healthBase) },
    stability: { current: scale(def.stabilityBase), max: scale(def.stabilityBase) },
    athletics: { current: scale(def.athletics), max: scale(def.athletics) },
    fighting: { current: scale(def.fighting), max: scale(def.fighting) },
    weapons: { current: scale(def.weapons), max: scale(def.weapons) },
  }

  // Dano: 1d6 + modificador. Modificador escala levemente com tier.
  const damageMod = def.attackDamageMod + (tier - 2)
  const damage =
    damageMod === 0
      ? '1d6'
      : `1d6${damageMod > 0 ? '+' : ''}${damageMod}`

  const attacks: PoolAttack[] = [
    {
      name: def.attackName,
      damage,
      notes: [`Hit Threshold ${def.hitThreshold} pra acertar`],
    },
  ]

  const creature: NpcCreature = buildCreature(
    opts.creatureType ?? 'humanoid',
    opts.creatureSize ?? 'medium',
  )

  const extra: GumshoeExtra = {
    hitThreshold: def.hitThreshold,
    pools: {
      athletics: tracks.athletics!.max,
      fighting: tracks.fighting!.max,
      weapons: tracks.weapons!.max,
    },
    attackDamageMod: damageMod,
  }

  return {
    family: 'pool',
    systemId: 'gumshoe',
    system: 'gumshoe',
    name: opts.name ?? generateName({ style: 'plain' }),
    role,
    tier,
    tracks,
    attacks,
    creature,
    extra: extra as unknown as Record<string, unknown>,
  }
}
