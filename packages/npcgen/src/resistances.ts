/**
 * Resistências/imunidades default por tipo de criatura.
 *
 * Heurísticas conservadoras seguindo o estilo 5e SRD. NPCs humanoides
 * normais não recebem resistências; tipos mágicos/sobrenaturais ganham
 * pacotes característicos.
 */

import type { CreatureType, NpcResistances } from './types'

const EMPTY: NpcResistances = {
  damageResistances: [],
  damageImmunities: [],
  damageVulnerabilities: [],
  conditionImmunities: [],
}

export function getResistancesForType(type: CreatureType): NpcResistances {
  switch (type) {
    case 'undead':
      return {
        damageResistances: ['necrotic'],
        damageImmunities: ['poison'],
        damageVulnerabilities: [],
        conditionImmunities: ['poisoned', 'exhaustion'],
      }
    case 'fiend':
      return {
        damageResistances: ['cold', 'fire', 'lightning'],
        damageImmunities: ['poison'],
        damageVulnerabilities: ['radiant'],
        conditionImmunities: ['poisoned'],
      }
    case 'celestial':
      return {
        damageResistances: ['radiant'],
        damageImmunities: [],
        damageVulnerabilities: ['necrotic'],
        conditionImmunities: ['charmed', 'frightened'],
      }
    case 'construct':
      return {
        damageResistances: ['psychic'],
        damageImmunities: ['poison'],
        damageVulnerabilities: [],
        conditionImmunities: ['poisoned', 'charmed', 'exhaustion', 'paralyzed', 'petrified'],
      }
    case 'ooze':
      return {
        damageResistances: ['acid'],
        damageImmunities: [],
        damageVulnerabilities: [],
        conditionImmunities: ['prone', 'blinded', 'charmed', 'deafened', 'exhaustion'],
      }
    case 'elemental':
      // Tipo de elemental decide o pacote — usa fire/cold como default
      // genérico. GM pode editar depois.
      return {
        damageResistances: ['fire', 'cold'],
        damageImmunities: ['poison'],
        damageVulnerabilities: [],
        conditionImmunities: ['poisoned', 'exhaustion', 'paralyzed', 'petrified'],
      }
    case 'plant':
      return {
        damageResistances: [],
        damageImmunities: [],
        damageVulnerabilities: ['fire'],
        conditionImmunities: ['blinded', 'deafened'],
      }
    case 'dragon':
      // Resistência de raça/cor é específica — deixa em branco; benchmark
      // de CR já compensa via HP/CA.
      return EMPTY
    case 'aberration':
      return {
        damageResistances: ['psychic'],
        damageImmunities: [],
        damageVulnerabilities: [],
        conditionImmunities: [],
      }
    case 'fey':
      return {
        damageResistances: [],
        damageImmunities: [],
        damageVulnerabilities: ['cold iron'] as never, // 5e usa material; manter conservador
        conditionImmunities: [],
      }
    case 'beast':
    case 'monstrosity':
    case 'giant':
    case 'humanoid':
    default:
      return EMPTY
  }
}
