/**
 * Extensibilidade (Bloco D): sistemas FORA das listas embutidas se plugam
 * declarando `family` no hook (e, para pool, `generatePool`). O npcgen nunca
 * precisa conhecer o id — mantém a separação público × privado.
 */
import { describe, it, expect } from 'vitest'
import { generateNpc } from './generate'
import { isD20Npc, isPoolNpc } from './types'
import type { NpcPoolBlock } from './types'

describe('sistema d20 externo via hook (family + model)', () => {
  it('gera um NPC d20 para um id desconhecido', () => {
    const npc = generateNpc({
      systemId: 'homebrew-d20',
      level: 5,
      role: 'soldier',
      name: 'X',
      npc: { family: 'd20', model: 'proficiency', attackProgression: (l) => l + 2 },
    })
    expect(isD20Npc(npc)).toBe(true)
    if (!isD20Npc(npc)) return
    expect(npc.systemId).toBe('homebrew-d20')
    expect(npc.attackProgression).toBe(7) // hook: 5 + 2
  })
})

describe('sistema de pool externo via hook (generatePool)', () => {
  const generatePool = (): NpcPoolBlock => ({
    role: 'horror',
    tier: 2,
    tracks: { health: { current: 8, max: 8 }, willpower: { current: 3, max: 3 } },
    attacks: [{ name: 'Garra', damage: '2 dados' }],
    extra: { hitThreshold: 4 },
  })

  it('monta o NPC de pool com o bloco do hook + criatura do npcgen', () => {
    const npc = generateNpc({
      systemId: 'wng',
      level: 2,
      name: 'Besta',
      creatureType: 'monstrosity',
      npc: { family: 'pool', generatePool },
    })
    expect(isPoolNpc(npc)).toBe(true)
    if (!isPoolNpc(npc)) return
    expect(npc.systemId).toBe('wng')
    expect(npc.system).toBe('wng')
    expect(npc.role).toBe('horror')
    expect(npc.tier).toBe(2)
    expect(npc.tracks.health!.max).toBe(8)
    expect(npc.attacks[0]!.name).toBe('Garra')
    expect(npc.name).toBe('Besta')
    // o npcgen acopla a criatura em volta do bloco específico do sistema
    expect(npc.creature.type).toBe('monstrosity')
  })
})

describe('erros de sistema não-suportado', () => {
  it('id desconhecido sem hook → erro', () => {
    expect(() => generateNpc({ systemId: 'desconhecido' })).toThrowError(/não suportado/)
  })

  it('family pool sem generatePool → erro', () => {
    expect(() => generateNpc({ systemId: 'wng', npc: { family: 'pool' } })).toThrowError(
      /sem generatePool/,
    )
  })
})
