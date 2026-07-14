import type {
  CasterTradition,
  D20GeneratedNpc,
  GeneratedNpc,
  NpcGenFamily,
  NpcGenHooks,
  NpcOptions,
  NpcRole,
  PoolGeneratedNpc,
} from './types'
import { CASTER_DIVINE, D20_MODEL, ROLES, getSystemFamily } from './data'
import { generateDaggerheartNpc } from './pool/daggerheart'
import { generateCandelaNpc } from './pool/candela'
import { generateGumshoeNpc } from './pool/gumshoe'
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
import { selectSkills } from './skills'
import { d, seededRoller, setRng } from './rng'
import { generateName } from './names'
import { generateFlavor } from './flavor'

/** Anexa flavor de interpretação ao NPC quando `withFlavor` é pedido.
 *  Sem seed próprio: usa o RNG global (já fixado pelo seed do NPC). */
function attachFlavor<T extends GeneratedNpc>(npc: T, opts: NpcOptions): T {
  if (opts.withFlavor) npc.flavor = generateFlavor({ style: opts.nameStyle })
  return npc
}

const ROLE_LIST = Object.keys(ROLES) as NpcRole[]

/** Diz se o sistema é da família d20 suportada pelo gerador. */
export function isD20System(systemId: string): boolean {
  return systemId in D20_MODEL
}

/** Diz se o sistema é um sistema de pool suportado. */
export function isPoolSystem(systemId: string): boolean {
  return getSystemFamily(systemId) === 'pool'
}

/** Sistemas suportados (d20 + pool). */
export function isSupportedSystem(systemId: string): boolean {
  return getSystemFamily(systemId) !== null
}

/** Gera um NPC/stat block. Despacha por família:
 *
 * - Sistemas d20 (D&D 5e, PF1/2, SF1/2, D&D 3.5) → D20GeneratedNpc
 * - Sistemas pool (Daggerheart, Candela Obscura, GUMSHOE) → PoolGeneratedNpc
 *
 * Determinístico quando `seed` é informado.
 *
 * Use os type guards `isD20Npc(npc)` / `isPoolNpc(npc)` pra narrow no
 * consumidor. */
export function generateNpc(opts: NpcOptions): GeneratedNpc {
  if (opts.seed !== undefined) setRng(seededRoller(opts.seed))

  // Família: embutida (npcgen conhece o id) ou declarada pelo hook do sistema
  // (sistema externo/privado que o npcgen público não conhece).
  const builtinFamily = getSystemFamily(opts.systemId)
  const family: NpcGenFamily | null = builtinFamily ?? opts.npc?.family ?? null

  if (family === 'pool') {
    switch (opts.systemId) {
      case 'daggerheart':
        return attachFlavor(generateDaggerheartNpc({
          level: opts.level,
          name: opts.name,
          creatureType: opts.creatureType,
          creatureSize: opts.creatureSize,
        }), opts)
      case 'candela-obscura':
        return attachFlavor(generateCandelaNpc({
          tier: opts.level ? Math.min(3, Math.max(1, opts.level)) as 1 | 2 | 3 : undefined,
          name: opts.name,
          creatureType: opts.creatureType,
          creatureSize: opts.creatureSize,
        }), opts)
      case 'gumshoe':
        return attachFlavor(generateGumshoeNpc({
          tier: opts.level ? Math.min(3, Math.max(1, opts.level)) as 1 | 2 | 3 : undefined,
          name: opts.name,
          creatureType: opts.creatureType,
          creatureSize: opts.creatureSize,
        }), opts)
      default: {
        // Sistema de pool externo/privado: o gerador vem do próprio sistema.
        const gen = opts.npc?.generatePool
        if (!gen) {
          throw new Error(
            `[srd-npcgen] sistema pool "${opts.systemId}" sem generatePool no hook npc`,
          )
        }
        return attachFlavor(assembleExternalPool(opts, gen), opts)
      }
    }
  }

  // Família d20 (embutida ou declarada via hook). O modelo vem da lista
  // embutida ou do hook `model` (sistema d20 externo).
  const model = D20_MODEL[opts.systemId] ?? opts.npc?.model
  if (!model) {
    throw new Error(
      `[srd-npcgen] sistema "${opts.systemId}" não suportado — declare family/model (ou generatePool) no hook npc`,
    )
  }

  const level = clampLevel(opts.level ?? 1)
  const role: NpcRole = opts.role ?? ROLE_LIST[d(ROLE_LIST.length) - 1]!
  const casterTradition: CasterTradition = opts.casterTradition ?? 'arcane'
  // Caster divino usa uma def de papel própria (prioridade WIS, ataque sacro);
  // qualquer outro caso mantém a def canônica. Default arcano = sem mudança.
  const def =
    role === 'caster' && casterTradition === 'divine' ? CASTER_DIVINE : ROLES[role]
  const abilities = generateAbilityScores(opts.abilityMethod ?? 'standard', role, def)
  // Hook do sistema sobrescreve a progressão (útil pra PF2: level + rank).
  const prog =
    opts.npc?.attackProgression?.(level, role) ?? attackProgression(model, level)

  // Perícias: arquétipo + extras da lista canônica do sistema (hook npc.skills).
  const skills = selectSkills({ role, def, level, abilities, prog, systemSkills: opts.npc?.skills })

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
          casterTradition,
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

  const d20Npc: D20GeneratedNpc = {
    family: 'd20',
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
    ...(opts.npc?.skills ? { availableSkills: [...opts.npc.skills] } : {}),
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
  return attachFlavor(d20Npc, opts)
}

/**
 * Monta um `PoolGeneratedNpc` a partir do bloco específico do sistema que um
 * `generatePool` externo retorna, acoplando criatura/família/systemId. Mantém
 * a separação: o npcgen público não conhece o sistema, só chama o hook.
 */
function assembleExternalPool(
  opts: NpcOptions,
  gen: NonNullable<NpcGenHooks['generatePool']>,
): PoolGeneratedNpc {
  const creatureType = opts.creatureType ?? 'humanoid'
  const creatureSize = opts.creatureSize ?? 'medium'
  const block = gen({
    systemId: opts.systemId,
    level: clampLevel(opts.level ?? 1),
    name: opts.name,
    creatureType,
    creatureSize,
  })
  return {
    family: 'pool',
    systemId: opts.systemId,
    system: opts.systemId,
    name: block.name ?? opts.name ?? generateName(),
    role: block.role,
    tier: block.tier,
    tracks: block.tracks,
    attacks: block.attacks,
    creature: buildCreature(creatureType, creatureSize),
    extra: block.extra ?? {},
  }
}

// Re-export type alias pra compat (consumidores que esperavam só d20).
export type { D20GeneratedNpc, PoolGeneratedNpc, GeneratedNpc } from './types'
