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
export { ROLES, D20_MODEL, D20_SYSTEMS, type RoleDef } from './data'
export {
  attackCount,
  damageDiceCount,
  formatDamage,
  buildAttacks,
  getBenchmark,
} from './combat'
export { generateNpc, isD20System } from './generate'
export { toTrackerCombatant, toCodexMarkdown } from './adapters'
export { generateName } from './names'
