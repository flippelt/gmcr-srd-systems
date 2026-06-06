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

/** Retorna o NpcWeapon completo da arma assinatura do role. */
export function getRoleWeapon(role: NpcRole): NpcWeapon {
  // Widen pro tipo público (o `as const` deixa as propriedades readonly
  // literais; consumidores esperam NpcWeapon mutable).
  return WEAPONS[ROLE_WEAPON[role]] as NpcWeapon
}
