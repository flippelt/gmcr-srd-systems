/**
 * Testes do hook System.npc? — sobrescreve o genérico d20 quando presente.
 *
 * Cobre os três pontos de extensão:
 * - attackProgression (PF2 = level + rank bonus)
 * - cantripDamageDice (overrides do nº de dados de cantrip)
 * - defaultLanguages (override por tipo de criatura)
 */

import { describe, it, expect } from 'vitest'
import { generateNpc } from './generate'
import { isD20Npc, type D20GeneratedNpc } from './types'

/** Helper: narrow do union pros casos d20 dos testes. */
function asD20(npc: ReturnType<typeof generateNpc>): D20GeneratedNpc {
  if (!isD20Npc(npc)) throw new Error('expected d20 npc')
  return npc
}

describe('hooks: attackProgression', () => {
  it('sem hook, usa modelo 5e (proficiency)', () => {
    const npc = asD20(generateNpc({
      systemId: 'dnd5e-2024',
      level: 5,
      role: 'soldier',
      name: 'X',
    }))
    expect(npc.attackProgression).toBe(3) // proficiency lvl 5
  })

  it('com hook, sobrescreve a progressão', () => {
    // Simula PF2: level + rank bonus. Lvl 5 = expert → +4 → 5 + 4 = 9
    const npc = asD20(generateNpc({
      systemId: 'pathfinder-2e',
      level: 5,
      role: 'soldier',
      name: 'PF2-soldier',
      npc: {
        attackProgression: (level) => level + (level >= 5 ? 4 : 2),
      },
    }))
    expect(npc.attackProgression).toBe(9)
    // attacks também usam a nova progressão (multiataque proficiency)
    expect(npc.attacks[0]!.bonus).toBe(9 + npc.abilities.str.mod)
  })
})

describe('hooks: cantripDamageDice', () => {
  it('sem hook, usa escala 5e (1/5/11/17)', () => {
    const npc = asD20(generateNpc({
      systemId: 'dnd5e-2024',
      level: 7,
      role: 'caster',
      name: 'Wizard',
    }))
    // lvl 7 → 2 dados no 5e
    expect(npc.magic!.cantripDamage.startsWith('2d8')).toBe(true)
  })

  it('com hook, sobrescreve nº de dados', () => {
    // Simula PF2 heightening: cantrip dice = ⌈level/2⌉
    const npc = asD20(generateNpc({
      systemId: 'pathfinder-2e',
      level: 7,
      role: 'caster',
      name: 'Witch',
      npc: {
        cantripDamageDice: (level) => Math.ceil(level / 2),
      },
    }))
    // lvl 7 → 4 dados
    expect(npc.magic!.cantripDamage.startsWith('4d8')).toBe(true)
  })
})

describe('hooks: defaultLanguages', () => {
  it('sem hook, usa lista genérica (Comum pra humanoide)', () => {
    const npc = asD20(generateNpc({
      systemId: 'starfinder-2e',
      level: 3,
      role: 'soldier',
      creatureType: 'humanoid',
      name: 'X',
    }))
    expect(npc.creature.languages).toContain('Comum')
  })

  it('com hook, override pra setting específico (ex.: Starfinder)', () => {
    const npc = asD20(generateNpc({
      systemId: 'starfinder-2e',
      level: 3,
      role: 'soldier',
      creatureType: 'humanoid',
      name: 'Vesk',
      npc: {
        defaultLanguages: (t) => (t === 'humanoid' ? ['Comum Galáctico', 'Vesk'] : []),
      },
    }))
    expect(npc.creature.languages).toEqual(['Comum Galáctico', 'Vesk'])
    expect(npc.creature.languages).not.toContain('Comum')
  })
})

describe('hooks: presença não-obrigatória', () => {
  it('passar npc: undefined funciona como sem hooks', () => {
    const a = generateNpc({ systemId: 'dnd5e-2024', seed: 100, name: 'A' })
    const b = generateNpc({ systemId: 'dnd5e-2024', seed: 100, name: 'A', npc: undefined })
    expect(a).toEqual(b)
  })

  it('hooks parciais: só um campo definido, resto cai no default', () => {
    const npc = asD20(generateNpc({
      systemId: 'dnd5e-2024',
      level: 5,
      role: 'caster',
      name: 'X',
      npc: {
        attackProgression: (lvl) => lvl, // só esse
        // cantripDamageDice e defaultLanguages ficam default
      },
    }))
    expect(npc.attackProgression).toBe(5)
    // cantrip continua escala 5e (2 dados em lvl 5)
    expect(npc.magic!.cantripDamage.startsWith('2d8')).toBe(true)
  })
})
