import { afterEach, describe, expect, it } from 'vitest'
import { resetRng } from './rng'
import { generateNpc } from './generate'
import { generateLancerNpc, parseLancerNpcData } from './lancer'
import { npcToLibraryEntry } from './library'

afterEach(resetRng)

describe('npcToLibraryEntry', () => {
  it('d20: mapeia hp/ac/atributos/ataques e mantém o sistema', () => {
    const npc = generateNpc({ systemId: 'dnd5e-2024', level: 5, seed: 11, withFlavor: true })
    const entry = npcToLibraryEntry(npc)
    expect(entry.system).toBe('dnd5e-2024')
    expect(entry.name).toBe(npc.name)
    expect(entry.cr).toBe('5')
    if (npc.family === 'd20') {
      expect(entry.hp?.average).toBe(npc.hp)
      expect(entry.ac?.value).toBe(npc.ac)
      expect(entry.abilities?.str).toBe(npc.abilities.str.score)
    }
    expect(entry.actions?.length).toBeGreaterThan(0)
    expect(entry.actions?.[0]?.entries[0]).toMatch(/para atingir/)
    expect(entry.notes).toBeTruthy() // flavor vira notes
  })

  it('pool: tracks viram trait e tier vira cr', () => {
    const npc = generateNpc({ systemId: 'daggerheart', level: 2, seed: 3 })
    const entry = npcToLibraryEntry(npc)
    expect(entry.system).toBe('daggerheart')
    expect(entry.cr).toMatch(/Tier/)
    expect(entry.traits?.some((t) => t.name === 'Tracks')).toBe(true)
  })

  it('lancer: chassi vira trait, armas viram actions, evasão vira ac', () => {
    const data = parseLancerNpcData([
      {
        classes: [
          {
            id: 'c1',
            name: 'ASSAULT',
            role: 'striker',
            stats: { hp: [15], evade: [8], edef: [8], armor: [1], speed: [4] },
            base_features: ['w1'],
          },
        ],
        templates: [],
        features: [
          {
            id: 'w1',
            name: 'RIFLE',
            type: 'Weapon',
            damage: [{ type: 'Kinetic', damage: [5] }],
            range: [{ type: 'Range', val: 10 }],
          },
        ],
      },
    ])
    const npc = generateLancerNpc({ data, classId: 'c1', tier: 1, seed: 1 })
    const entry = npcToLibraryEntry(npc)
    expect(entry.system).toBe('lancer')
    expect(entry.ac).toEqual({ value: 8, from: 'Evasão' })
    expect(entry.traits?.[0]?.name).toBe('Chassi')
    expect(entry.actions?.[0]?.name).toContain('RIFLE')
  })

  it('serializa limpo pra colar (JSON sem undefined)', () => {
    const npc = generateNpc({ systemId: 'dnd5e-2024', level: 1, seed: 2 })
    const json = JSON.stringify(npcToLibraryEntry(npc), null, 2)
    const parsed = JSON.parse(json)
    expect(parsed.name).toBe(npc.name)
    expect(json).not.toContain('undefined')
  })
})
