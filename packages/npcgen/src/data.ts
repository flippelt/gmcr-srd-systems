import type { Ability, D20Model, NpcRole } from './types'

export interface RoleDef {
  /** Ordem de prioridade dos atributos (melhor valor vai pro primeiro). */
  priority: Ability[]
  /** Dado de vida do arquétipo. */
  hitDie: 6 | 8 | 10 | 12
  /** Bônus de armadura embutido (somado a 10 + Dex limitada). */
  armor: number
  /** Limite de Dex aplicável à CA (armadura pesada limita). */
  maxDex: number
  /** Atributo usado no ataque assinatura. */
  attackAbility: Ability
  /** Atributos proficientes em testes de resistência. */
  saveProfs: [Ability, Ability]
  /** Perícias representativas (nome → atributo). */
  skills: Record<string, Ability>
  /** Nome do ataque assinatura. */
  attackName: string
  /** Dado de dano do ataque assinatura. */
  damageDie: 4 | 6 | 8 | 10 | 12
}

export const ROLES: Record<NpcRole, RoleDef> = {
  brute: {
    priority: ['str', 'con', 'dex', 'wis', 'cha', 'int'],
    hitDie: 12,
    armor: 2,
    maxDex: 3,
    attackAbility: 'str',
    saveProfs: ['str', 'con'],
    skills: { athletics: 'str', intimidation: 'cha' },
    attackName: 'Pancada brutal',
    damageDie: 10,
  },
  soldier: {
    priority: ['str', 'con', 'dex', 'wis', 'int', 'cha'],
    hitDie: 10,
    armor: 6,
    maxDex: 2,
    attackAbility: 'str',
    saveProfs: ['str', 'con'],
    skills: { athletics: 'str', perception: 'wis' },
    attackName: 'Golpe de arma',
    damageDie: 8,
  },
  skirmisher: {
    priority: ['dex', 'con', 'str', 'wis', 'cha', 'int'],
    hitDie: 8,
    armor: 3,
    maxDex: 4,
    attackAbility: 'dex',
    saveProfs: ['dex', 'int'],
    skills: { acrobatics: 'dex', stealth: 'dex' },
    attackName: 'Lâmina ágil',
    damageDie: 6,
  },
  archer: {
    priority: ['dex', 'con', 'wis', 'str', 'int', 'cha'],
    hitDie: 8,
    armor: 3,
    maxDex: 5,
    attackAbility: 'dex',
    saveProfs: ['dex', 'wis'],
    skills: { perception: 'wis', stealth: 'dex' },
    attackName: 'Tiro certeiro',
    damageDie: 8,
  },
  caster: {
    priority: ['cha', 'con', 'dex', 'int', 'wis', 'str'],
    hitDie: 6,
    armor: 2,
    maxDex: 4,
    attackAbility: 'cha',
    saveProfs: ['int', 'wis'],
    skills: { arcana: 'int', perception: 'wis' },
    attackName: 'Dardo arcano',
    damageDie: 8,
  },
  leader: {
    priority: ['cha', 'con', 'str', 'wis', 'dex', 'int'],
    hitDie: 8,
    armor: 5,
    maxDex: 3,
    attackAbility: 'str',
    saveProfs: ['wis', 'cha'],
    skills: { persuasion: 'cha', insight: 'wis' },
    attackName: 'Espada de comando',
    damageDie: 8,
  },
  lurker: {
    priority: ['dex', 'con', 'wis', 'cha', 'int', 'str'],
    hitDie: 6,
    armor: 3,
    maxDex: 5,
    attackAbility: 'dex',
    saveProfs: ['dex', 'cha'],
    skills: { stealth: 'dex', deception: 'cha' },
    attackName: 'Ataque furtivo',
    damageDie: 6,
  },
  minion: {
    priority: ['con', 'str', 'dex', 'wis', 'cha', 'int'],
    hitDie: 6,
    armor: 2,
    maxDex: 3,
    attackAbility: 'str',
    saveProfs: ['con', 'str'],
    skills: { athletics: 'str' },
    attackName: 'Ataque',
    damageDie: 4,
  },
}

/** Mapa sistema d20 → modelo de matemática. */
export const D20_MODEL: Record<string, D20Model> = {
  'dnd5e-2024': 'proficiency',
  'dnd5e-2014': 'proficiency',
  'pathfinder-2e': 'proficiency',
  'starfinder-2e': 'proficiency',
  'dnd-3.5': 'bab',
  'pathfinder-1e': 'bab',
  'starfinder-1e': 'bab',
}

export const D20_SYSTEMS: string[] = Object.keys(D20_MODEL)

/**
 * Família mecânica do sistema. `d20` cobre D&D-likes (rolagem d20 + AC + saves);
 * `pool` cobre sistemas de pool de dados (2d12 dualidade, d6 pool, etc) com
 * track/threshold em vez de HP/AC.
 *
 * NPCs gerados pra cada família têm shapes diferentes — ver `D20GeneratedNpc`
 * e `PoolGeneratedNpc`.
 */
export type SystemFamily = 'd20' | 'pool'

export const SYSTEM_FAMILY: Record<string, SystemFamily> = {
  // d20 family
  'dnd5e-2024': 'd20',
  'dnd5e-2014': 'd20',
  'dnd-3.5': 'd20',
  'pathfinder-1e': 'd20',
  'pathfinder-2e': 'd20',
  'starfinder-1e': 'd20',
  'starfinder-2e': 'd20',
  // pool family
  daggerheart: 'pool',
  'candela-obscura': 'pool',
  gumshoe: 'pool',
}

export function getSystemFamily(systemId: string): SystemFamily | null {
  return SYSTEM_FAMILY[systemId] ?? null
}

/** Sílabas para nomes gerados. */
export const NAME_PREFIX = [
  'Kor', 'Var', 'Mal', 'Thar', 'Ser', 'Bel', 'Dra', 'Gor', 'Lyr', 'Nyx',
  'Ash', 'Bran', 'Cael', 'Eld', 'Fen', 'Grim', 'Hald', 'Ira', 'Jor', 'Mor',
]
export const NAME_MIDDLE = ['a', 'e', 'i', 'o', 'u', 'an', 'en', 'or', 'ul', 'ar', 'is']
export const NAME_SUFFIX = [
  'ek', 'os', 'an', 'ur', 'eth', 'ix', 'om', 'iel', 'wyn', 'dak', 'rin', 'val', 'mok', 'tha',
]
