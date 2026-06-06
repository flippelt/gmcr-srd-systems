import type { GeneratedNpc, NpcOptions, NpcRole } from './types'
import { D20_MODEL, ROLES } from './data'
import {
  attackProgression,
  clampLevel,
  deriveAc,
  deriveHp,
  deriveSaves,
  generateAbilityScores,
} from './d20'
import { buildAttacks, getBenchmark } from './combat'
import { d, seededRoller, setRng } from './rng'
import { generateName } from './names'

const ROLE_LIST = Object.keys(ROLES) as NpcRole[]

/** Diz se o sistema é da família d20 suportada pelo gerador. */
export function isD20System(systemId: string): boolean {
  return systemId in D20_MODEL
}

/** Gera um NPC/stat block para um sistema da família d20. Determinístico
 *  quando `seed` é informado (e quando role/abilityMethod/name são fixos). */
export function generateNpc(opts: NpcOptions): GeneratedNpc {
  const model = D20_MODEL[opts.systemId]
  if (!model) {
    throw new Error(`[srd-npcgen] sistema "${opts.systemId}" não é da família d20 suportada`)
  }
  if (opts.seed !== undefined) setRng(seededRoller(opts.seed))

  const level = clampLevel(opts.level ?? 1)
  const role: NpcRole = opts.role ?? ROLE_LIST[d(ROLE_LIST.length) - 1]!
  const def = ROLES[role]
  const abilities = generateAbilityScores(opts.abilityMethod ?? 'standard', role)
  const prog = attackProgression(model, level)

  const skills: Record<string, number> = {}
  for (const skill of Object.keys(def.skills)) {
    const ab = def.skills[skill]!
    skills[skill] = abilities[ab].mod + prog
  }

  const dmgMod = abilities[def.attackAbility].mod
  const attacks = buildAttacks(role, def, model, level, dmgMod, prog)

  return {
    systemId: opts.systemId,
    name: opts.name ?? generateName(),
    role,
    level,
    abilities,
    model,
    attackProgression: prog,
    hp: deriveHp(def, level, abilities.con.mod),
    ac: deriveAc(def, abilities.dex.mod),
    speed: 30,
    saves: deriveSaves(abilities, def, model, level),
    skills,
    attacks,
    attack: attacks[0]!,
    benchmark: getBenchmark(level),
  }
}
