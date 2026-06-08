/**
 * @lippelt/srd-npcgen — gerador de NPCs/stat blocks para a família d20
 * (D&D 5e 2024/2014, D&D 3.5, Pathfinder 1e/2e, Starfinder 1e/2e).
 *
 *   import { generateNpc, toTrackerCombatant, toCodexMarkdown } from '@lippelt/srd-npcgen'
 *
 *   const npc = generateNpc({ systemId: 'dnd5e-2024', level: 5, role: 'soldier' })
 *   const combatant = toTrackerCombatant(npc)   // pro tracker do GM Control Room
 *   const md = toCodexMarkdown(npc)              // pro Campaign Codex
 *
 * Dois modelos de matemática cobrem a família: 'proficiency' (5e/PF2/SF2) e
 * 'bab' (3.5/PF1/SF1). Sistemas baseados em pool (Daggerheart, Candela,
 * GUMSHOE) ficam para uma versão futura.
 */

export * from './types'
export { setRng, resetRng, seededRoller, type Roller } from './rng'
export { abilityMod, proficiencyBonus, fullBab, attackProgression, clampLevel } from './d20'
export {
  ROLES,
  D20_MODEL,
  D20_SYSTEMS,
  SYSTEM_FAMILY,
  getSystemFamily,
  type RoleDef,
  type SystemFamily,
} from './data'
export {
  attackCount,
  damageDiceCount,
  formatDamage,
  buildAttacks,
  getBenchmark,
} from './combat'
export {
  getMagicStats,
  getStarfinderTuning,
  getProficiencyRank,
  STARFINDER_SYSTEMS,
  PROFICIENCY_RANK_SYSTEMS,
} from './tuning'
export { buildCreature } from './creature'
export { getResistancesForType } from './resistances'
export { selectSkills, SKILL_ABILITY, type SelectSkillsParams } from './skills'
export { WEAPONS, ROLE_WEAPON, getRoleWeapon, type WeaponId } from './weapons'
export { generateNpc, isD20System, isPoolSystem, isSupportedSystem } from './generate'
export {
  generateDaggerheartNpc,
  tierForLevel,
  DH_ROLES,
  type DhOptions,
  type DhRole,
  type DaggerheartExtra,
} from './pool/daggerheart'
export {
  generateCandelaNpc,
  CANDELA_ROLES,
  type CandelaOptions,
  type CandelaRole,
  type CandelaExtra,
} from './pool/candela'
export {
  generateGumshoeNpc,
  GUMSHOE_ROLES,
  type GumshoeOptions,
  type GumshoeRole,
  type GumshoeExtra,
} from './pool/gumshoe'
export { toTrackerCombatant, toCodexMarkdown } from './adapters'
export { generateName, type NameOptions } from './names'
