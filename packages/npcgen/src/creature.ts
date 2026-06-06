/**
 * Defaults de criatura por tipo: sentidos, deslocamentos, idiomas.
 *
 * Convenção: humanoide é o caso comum (a maioria dos NPCs de campanha).
 * Outros tipos têm presets razoáveis que o GM pode editar depois.
 */

import type {
  CreatureSize,
  CreatureType,
  Movements,
  NpcCreature,
  Sense,
} from './types'

/** Idiomas comuns por tipo de criatura (5e SRD-ish). */
const LANGUAGES: Record<CreatureType, string[]> = {
  humanoid: ['Comum'],
  beast: [],
  undead: ['Comum'],
  fiend: ['Abissal', 'Infernal', 'Telepatia 60 ft'],
  celestial: ['Celestial', 'Comum'],
  fey: ['Silvano', 'Comum'],
  dragon: ['Dracônico', 'Comum'],
  aberration: ['Sub-Comum', 'Telepatia 60 ft'],
  construct: ['Comum (entende)'],
  elemental: ['Aquan/Auran/Ignan/Terran'],
  giant: ['Gigante', 'Comum'],
  monstrosity: [],
  ooze: [],
  plant: [],
}

/** Sentidos default por tipo (em pés). */
const SENSES: Record<CreatureType, Sense[]> = {
  humanoid: [],
  beast: ['low-light-vision'],
  undead: ['darkvision-60'],
  fiend: ['darkvision-120'],
  celestial: ['darkvision-60'],
  fey: ['darkvision-60'],
  dragon: ['darkvision-120', 'blindsight-30'],
  aberration: ['darkvision-60'],
  construct: ['darkvision-60'],
  elemental: ['darkvision-60'],
  giant: ['darkvision-60'],
  monstrosity: ['darkvision-60'],
  ooze: ['blindsight-60'],
  plant: ['darkvision-60'],
}

/** Deslocamentos default por tipo (em pés). */
function defaultMovements(type: CreatureType, size: CreatureSize): Movements {
  const baseWalk = size === 'tiny' || size === 'small' ? 25 : size === 'large' ? 40 : 30
  switch (type) {
    case 'beast':
      return { walk: baseWalk + 10 } // feras geralmente são mais rápidas
    case 'dragon':
      return { walk: baseWalk, fly: 80 }
    case 'celestial':
      return { walk: baseWalk, fly: 60 }
    case 'fiend':
      return { walk: baseWalk, fly: 40 }
    case 'elemental':
      return { walk: baseWalk, fly: 40 }
    case 'ooze':
      return { walk: 10, climb: 10 }
    case 'plant':
      return { walk: 10 }
    default:
      return { walk: baseWalk }
  }
}

/** Constrói o bloco de criatura. */
export function buildCreature(type: CreatureType, size: CreatureSize): NpcCreature {
  return {
    type,
    size,
    senses: [...SENSES[type]],
    movements: defaultMovements(type, size),
    languages: [...LANGUAGES[type]],
  }
}
