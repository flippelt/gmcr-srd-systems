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
import {
  PROFICIENCY_RANK_SYSTEMS,
  STARFINDER_SYSTEMS,
  getMagicStats,
  getProficiencyRank,
  getStarfinderTuning,
} from './tuning'
import { buildCreature } from './creature'
import { getResistancesForType } from './resistances'
import { getRoleWeapon } from './weapons'
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
  // Hook do sistema sobrescreve a progressão (útil pra PF2: level + rank).
  const prog =
    opts.npc?.attackProgression?.(level, role) ?? attackProgression(model, level)

  const skills: Record<string, number> = {}
  for (const skill of Object.keys(def.skills)) {
    const ab = def.skills[skill]!
    skills[skill] = abilities[ab].mod + prog
  }

  const dmgMod = abilities[def.attackAbility].mod
  const attacks = buildAttacks(role, def, model, level, dmgMod, prog)
  const saves = deriveSaves(abilities, def, model, level)
  const ac = deriveAc(def, abilities.dex.mod)

  // Tuning condicional por papel/sistema.
  const magic =
    role === 'caster'
      ? getMagicStats(
          def.attackAbility,
          dmgMod,
          prog,
          model,
          level,
          opts.npc?.cantripDamageDice,
        )
      : undefined
  const starfinder = STARFINDER_SYSTEMS.has(opts.systemId)
    ? getStarfinderTuning(ac, abilities.con.mod, level, model)
    : undefined
  const proficiencyRank = PROFICIENCY_RANK_SYSTEMS.has(opts.systemId)
    ? getProficiencyRank(level)
    : undefined

  // Criatura: tipo/tamanho/sentidos/idiomas; resistências derivam do tipo.
  const creatureType = opts.creatureType ?? 'humanoid'
  const creatureSize = opts.creatureSize ?? 'medium'
  const creature = buildCreature(creatureType, creatureSize)
  // Hook do sistema pode sobrescrever idiomas (settings com fauna exótica).
  if (opts.npc?.defaultLanguages) {
    const fromHook = opts.npc.defaultLanguages(creatureType)
    if (Array.isArray(fromHook)) creature.languages = [...fromHook]
  }
  const resistances = getResistancesForType(creatureType)
  const weapon = getRoleWeapon(role)
  const speed = creature.movements.walk

  // Nome com estilo opcional.
  const name =
    opts.name ??
    generateName({ style: opts.nameStyle, withEpithet: opts.withEpithet })

  return {
    systemId: opts.systemId,
    name,
    role,
    level,
    abilities,
    model,
    attackProgression: prog,
    hp: deriveHp(def, level, abilities.con.mod),
    ac,
    speed,
    saves,
    // Atalhos de Fort/Ref/Will (classics 3.5/PF1, válidos em 5e também).
    fortSave: saves.con,
    refSave: saves.dex,
    willSave: saves.wis,
    skills,
    attacks,
    attack: attacks[0]!,
    ...(magic ? { magic } : {}),
    ...(starfinder ? { starfinder } : {}),
    ...(proficiencyRank ? { proficiencyRank } : {}),
    creature,
    resistances,
    weapon,
    benchmark: getBenchmark(level),
  }
}
