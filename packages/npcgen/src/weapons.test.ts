import { describe, expect, it } from 'vitest'
import type { NpcRole } from './types'
import {
  WEAPONS,
  ROLE_WEAPON,
  ROLE_WEAPON_OPTIONS,
  getRoleWeapon,
  getRoleWeaponOptions,
} from './weapons'

const ROLES: NpcRole[] = [
  'brute', 'soldier', 'skirmisher', 'archer', 'caster', 'leader', 'lurker', 'minion',
]

describe('weapons', () => {
  it('getRoleWeapon sem variant devolve a arma default (compat)', () => {
    expect(getRoleWeapon('brute').name).toBe('Machado Grande')
    expect(getRoleWeapon('soldier').name).toBe('Espada Longa')
  })

  it('a primeira opção de cada papel é a default de ROLE_WEAPON', () => {
    for (const role of ROLES) {
      expect(getRoleWeaponOptions(role)[0]).toBe(ROLE_WEAPON[role])
    }
  })

  it('getRoleWeapon com variant escolhe entre as opções (com wrap)', () => {
    // brute opção 1 = greatsword → Espadão
    expect(getRoleWeapon('brute', 1).name).toBe('Espadão')
    // wrap: variant = tamanho da lista volta pro índice 0
    const len = ROLE_WEAPON_OPTIONS.brute.length
    expect(getRoleWeapon('brute', len).name).toBe(getRoleWeapon('brute', 0).name)
  })

  it('toda arma referenciada existe no catálogo WEAPONS', () => {
    for (const role of ROLES) {
      for (const id of ROLE_WEAPON_OPTIONS[role]) {
        expect(WEAPONS[id]).toBeDefined()
      }
    }
  })
})
