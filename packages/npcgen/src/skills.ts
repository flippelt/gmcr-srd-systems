import type { Ability, AbilityScores, NpcRole } from './types'
import { type RoleDef } from './data'
import { clampLevel } from './d20'

/**
 * Mapa default perícia → atributo, cobrindo os nomes comuns de 5e, Pathfinder
 * e Starfinder. É uma aproximação para geração de NPCs — alguns sistemas
 * divergem (ex.: `nature`/`religion` são INT no 5e e WIS no PF). Quando um
 * sistema passa sua lista canônica via `System.npc.skills`, usamos este mapa
 * para inferir o atributo de cada perícia extra.
 */
export const SKILL_ABILITY: Record<string, Ability> = {
  // STR
  athletics: 'str',
  // DEX
  acrobatics: 'dex',
  stealth: 'dex',
  thievery: 'dex',
  'sleight-of-hand': 'dex',
  piloting: 'dex',
  // INT
  arcana: 'int',
  history: 'int',
  investigation: 'int',
  crafting: 'int',
  society: 'int',
  occultism: 'int',
  engineering: 'int',
  computers: 'int',
  lore: 'int',
  // WIS
  perception: 'wis',
  insight: 'wis',
  medicine: 'wis',
  survival: 'wis',
  'animal-handling': 'wis',
  nature: 'wis',
  religion: 'wis',
  mysticism: 'wis',
  // CHA
  deception: 'cha',
  intimidation: 'cha',
  performance: 'cha',
  persuasion: 'cha',
  diplomacy: 'cha',
}

export interface SelectSkillsParams {
  role: NpcRole
  def: RoleDef
  level: number
  abilities: AbilityScores
  /** Progressão (proficiência/BAB) somada a cada perícia proficiente. */
  prog: number
  /** Lista canônica do sistema (de `System.npc.skills`), se houver. */
  systemSkills?: readonly string[]
}

/**
 * Seleciona as perícias proficientes do NPC e calcula seus bônus.
 *
 * - As perícias do arquétipo (`def.skills`) entram sempre, com o atributo que
 *   o papel define.
 * - Se o sistema fornece a lista canônica (`systemSkills`), escolhe perícias
 *   extras dela, priorizando as ligadas aos atributos fortes do papel, em
 *   quantidade que cresce com o nível (`+1` a cada 3 níveis). Determinístico
 *   (sem RNG) — não depende da seed.
 *
 * Bônus de cada perícia = modificador do atributo + `prog`.
 */
export function selectSkills(params: SelectSkillsParams): Record<string, number> {
  const { def, level, abilities, prog, systemSkills } = params
  const lvl = clampLevel(level)
  const result: Record<string, number> = {}

  const abilityFor = (skill: string): Ability => SKILL_ABILITY[skill] ?? def.attackAbility

  // 1) Perícias do arquétipo — atributo conhecido via def.skills.
  for (const skill of Object.keys(def.skills)) {
    result[skill] = abilities[def.skills[skill]!].mod + prog
  }

  // 2) Extras da lista canônica do sistema, escalando com o nível.
  if (systemSkills && systemSkills.length > 0) {
    const target = Object.keys(def.skills).length + Math.floor(lvl / 3)
    const priorityRank = new Map<Ability, number>(def.priority.map((ab, i) => [ab, i]))
    const candidates = systemSkills
      .filter((s) => !(s in result))
      .slice()
      .sort((a, b) => {
        const ra = priorityRank.get(abilityFor(a)) ?? 99
        const rb = priorityRank.get(abilityFor(b)) ?? 99
        if (ra !== rb) return ra - rb
        return a.localeCompare(b)
      })
    for (const skill of candidates) {
      if (Object.keys(result).length >= target) break
      result[skill] = abilities[abilityFor(skill)].mod + prog
    }
  }

  return result
}
