/**
 * Catálogo de armas básicas (estilo SRD 5e) e mapeamento role → arma default.
 *
 * O role já carrega `attackName` e `damageDie` — esta arma estende com
 * categoria, tipo de dano, alcance e propriedades pra alimentar o stat block.
 */

import type { NpcRole, NpcWeapon } from './types'

export const WEAPONS = {
  longsword: {
    name: 'Espada Longa',
    category: 'martial-melee',
    damageDie: 8,
    damageType: 'slashing',
    properties: ['versatile'],
  },
  greatsword: {
    name: 'Espadão',
    category: 'martial-melee',
    damageDie: 10,
    damageType: 'slashing',
    properties: ['two-handed', 'heavy'],
  },
  greataxe: {
    name: 'Machado Grande',
    category: 'martial-melee',
    damageDie: 12,
    damageType: 'slashing',
    properties: ['two-handed', 'heavy'],
  },
  shortsword: {
    name: 'Espada Curta',
    category: 'martial-melee',
    damageDie: 6,
    damageType: 'piercing',
    properties: ['finesse', 'light'],
  },
  rapier: {
    name: 'Rapieira',
    category: 'martial-melee',
    damageDie: 8,
    damageType: 'piercing',
    properties: ['finesse'],
  },
  dagger: {
    name: 'Adaga',
    category: 'simple-melee',
    damageDie: 4,
    damageType: 'piercing',
    properties: ['finesse', 'light', 'thrown'],
  },
  mace: {
    name: 'Maça',
    category: 'simple-melee',
    damageDie: 6,
    damageType: 'bludgeoning',
    properties: [],
  },
  club: {
    name: 'Clava',
    category: 'simple-melee',
    damageDie: 4,
    damageType: 'bludgeoning',
    properties: ['light'],
  },
  spear: {
    name: 'Lança',
    category: 'simple-melee',
    damageDie: 6,
    damageType: 'piercing',
    properties: ['versatile', 'thrown', 'reach'],
    reach: 10,
  },
  longbow: {
    name: 'Arco Longo',
    category: 'martial-ranged',
    damageDie: 8,
    damageType: 'piercing',
    properties: ['two-handed', 'ammunition'],
    range: { normal: 150, long: 600 },
  },
  shortbow: {
    name: 'Arco Curto',
    category: 'simple-ranged',
    damageDie: 6,
    damageType: 'piercing',
    properties: ['two-handed', 'ammunition'],
    range: { normal: 80, long: 320 },
  },
  crossbowHeavy: {
    name: 'Besta Pesada',
    category: 'martial-ranged',
    damageDie: 10,
    damageType: 'piercing',
    properties: ['two-handed', 'heavy', 'ammunition'],
    range: { normal: 100, long: 400 },
  },
  staff: {
    name: 'Cajado',
    category: 'simple-melee',
    damageDie: 6,
    damageType: 'bludgeoning',
    properties: ['versatile'],
  },
  quarterstaff: {
    name: 'Bordão',
    category: 'simple-melee',
    damageDie: 6,
    damageType: 'bludgeoning',
    properties: ['versatile'],
  },
  warhammer: {
    name: 'Martelo de Guerra',
    category: 'martial-melee',
    damageDie: 8,
    damageType: 'bludgeoning',
    properties: ['versatile'],
  },
  battleaxe: {
    name: 'Machado de Batalha',
    category: 'martial-melee',
    damageDie: 8,
    damageType: 'slashing',
    properties: ['versatile'],
  },
  scimitar: {
    name: 'Cimitarra',
    category: 'martial-melee',
    damageDie: 6,
    damageType: 'slashing',
    properties: ['finesse', 'light'],
  },
  morningstar: {
    name: 'Estrela-da-manhã',
    category: 'martial-melee',
    damageDie: 8,
    damageType: 'piercing',
    properties: [],
  },
  glaive: {
    name: 'Glaive',
    category: 'martial-melee',
    damageDie: 10,
    damageType: 'slashing',
    properties: ['two-handed', 'heavy', 'reach'],
    reach: 10,
  },
  handaxe: {
    name: 'Machadinha',
    category: 'simple-melee',
    damageDie: 6,
    damageType: 'slashing',
    properties: ['light', 'thrown'],
    range: { normal: 20, long: 60 },
  },
  javelin: {
    name: 'Azagaia',
    category: 'simple-melee',
    damageDie: 6,
    damageType: 'piercing',
    properties: ['thrown'],
    range: { normal: 30, long: 120 },
  },
  lightCrossbow: {
    name: 'Besta Leve',
    category: 'simple-ranged',
    damageDie: 8,
    damageType: 'piercing',
    properties: ['two-handed', 'ammunition'],
    range: { normal: 80, long: 320 },
  },
  sling: {
    name: 'Funda',
    category: 'simple-ranged',
    damageDie: 4,
    damageType: 'bludgeoning',
    properties: ['ammunition'],
    range: { normal: 30, long: 120 },
  },
  arcaneDart: {
    name: 'Dardo Arcano',
    category: 'natural',
    damageDie: 8,
    damageType: 'force',
    properties: [],
    range: { normal: 120 },
  },
  unarmed: {
    name: 'Soco',
    category: 'natural',
    damageDie: 4,
    damageType: 'bludgeoning',
    properties: ['light'],
  },
} as const satisfies Record<string, NpcWeapon>

export type WeaponId = keyof typeof WEAPONS

/** Mapa role → arma assinatura. Casa com o `attackName` e `damageDie` do role. */
export const ROLE_WEAPON: Record<NpcRole, WeaponId> = {
  brute: 'greataxe',
  soldier: 'longsword',
  skirmisher: 'shortsword',
  archer: 'longbow',
  caster: 'arcaneDart',
  leader: 'longsword',
  lurker: 'dagger',
  minion: 'club',
}

/**
 * Opções de arma por papel (a primeira é a default de `ROLE_WEAPON`).
 * Permite variar a arma assinatura sem mudar a matemática do ataque (o dano
 * segue vindo do `damageDie` do papel; a arma é metadata do stat block).
 */
export const ROLE_WEAPON_OPTIONS: Record<NpcRole, WeaponId[]> = {
  brute: ['greataxe', 'greatsword', 'warhammer'],
  soldier: ['longsword', 'battleaxe', 'morningstar'],
  skirmisher: ['shortsword', 'scimitar', 'rapier'],
  archer: ['longbow', 'shortbow', 'lightCrossbow'],
  caster: ['arcaneDart', 'staff', 'quarterstaff'],
  leader: ['longsword', 'rapier', 'warhammer'],
  lurker: ['dagger', 'shortsword', 'handaxe'],
  minion: ['club', 'spear', 'sling'],
}

/** Lista de armas candidatas do papel (default + alternativas). */
export function getRoleWeaponOptions(role: NpcRole): WeaponId[] {
  return ROLE_WEAPON_OPTIONS[role]
}

/**
 * Retorna o NpcWeapon completo da arma assinatura do role.
 *
 * Sem `variant`: a arma default (compat). Com `variant` (índice): escolhe
 * deterministicamente entre as opções do papel — útil pra dar variedade ao
 * stat block sem afetar o dano.
 */
export function getRoleWeapon(role: NpcRole, variant?: number): NpcWeapon {
  const id =
    variant === undefined
      ? ROLE_WEAPON[role]
      : ROLE_WEAPON_OPTIONS[role][variant % ROLE_WEAPON_OPTIONS[role].length]!
  // Widen pro tipo público (o `as const` deixa as propriedades readonly
  // literais; consumidores esperam NpcWeapon mutable).
  return WEAPONS[id] as NpcWeapon
}
