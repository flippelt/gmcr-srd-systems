import { describe, it, expect } from 'vitest'
import { generateNpc as generateNpcRaw } from './generate'
import type { D20GeneratedNpc, NpcOptions } from './types'
import { toTrackerCombatant, toCodexMarkdown } from './adapters'

const generateNpc = (opts: NpcOptions): D20GeneratedNpc =>
  generateNpcRaw(opts) as D20GeneratedNpc

const npc = generateNpc({
  systemId: 'dnd5e-2024',
  level: 5,
  role: 'soldier',
  abilityMethod: 'standard',
  name: 'Test',
})

describe('toTrackerCombatant', () => {
  it('mapeia hp/maxHp, iniciativa (mod de Dex) e fields.ac', () => {
    const c = toTrackerCombatant(npc)
    expect(c.name).toBe('Test')
    expect(c.hp).toBe(38)
    expect(c.maxHp).toBe(38)
    expect(c.initiative).toBe(npc.abilities.dex.mod)
    expect(c.fields.ac).toBe(17)
    expect(c.statuses).toEqual([])
  })
})

describe('toCodexMarkdown', () => {
  it('inclui nome, CA, PV e o ataque', () => {
    const md = toCodexMarkdown(npc)
    expect(md).toContain('### Test')
    expect(md).toContain('**CA** 17')
    expect(md).toContain('**PV** 38')
    expect(md).toContain('Golpe de arma')
    expect(md).toContain('1d8+2')
  })

  it('lista múltiplos ataques quando multiattack ativo', () => {
    const multi = generateNpc({
      systemId: 'dnd5e-2024',
      level: 11,
      role: 'soldier',
      abilityMethod: 'standard',
      name: 'Veterano',
    })
    expect(multi.attacks).toHaveLength(3)
    const md = toCodexMarkdown(multi)
    expect(md).toContain('Ataques** (3 por turno)')
    expect(md).toContain('1. Golpe de arma')
    expect(md).toContain('3. Golpe de arma')
  })
})
