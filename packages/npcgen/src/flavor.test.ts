import { describe, expect, it } from 'vitest'
import { generateFlavor, flavorMarkdown } from './flavor'
import { generateNpc } from './generate'
import { toCodexMarkdown } from './adapters'
import { isD20Npc } from './types'

describe('generateFlavor', () => {
  it('é determinístico com o mesmo seed', () => {
    expect(generateFlavor({ seed: 21 })).toEqual(generateFlavor({ seed: 21 }))
  })

  it('seeds diferentes mudam o flavor', () => {
    expect(generateFlavor({ seed: 1 })).not.toEqual(generateFlavor({ seed: 2 }))
  })

  it('tem todos os campos preenchidos', () => {
    const f = generateFlavor({ seed: 5 })
    for (const k of ['personality', 'motivation', 'mannerism', 'tactic', 'hook'] as const) {
      expect(typeof f[k]).toBe('string')
      expect(f[k].length).toBeGreaterThan(0)
    }
  })

  it('respeita o sabor do estilo (cyberpunk ≠ fantasy)', () => {
    // Varre seeds: a personalidade cyberpunk nunca cai no banco fantasy.
    const fantasy = new Set(
      Array.from({ length: 30 }, (_, s) => generateFlavor({ style: 'fantasy', seed: s }).personality),
    )
    const cyber = new Set(
      Array.from({ length: 30 }, (_, s) => generateFlavor({ style: 'cyberpunk', seed: s }).personality),
    )
    // Conjuntos disjuntos: nenhuma personalidade aparece nos dois.
    for (const p of cyber) expect(fantasy.has(p)).toBe(false)
  })
})

describe('flavorMarkdown', () => {
  it('renderiza a seção Interpretação com os 5 campos', () => {
    const md = flavorMarkdown(generateFlavor({ seed: 7 }))
    expect(md).toContain('#### Interpretação')
    expect(md).toContain('Personalidade')
    expect(md).toContain('Motivação')
    expect(md).toContain('Maneirismo')
    expect(md).toContain('Tática')
    expect(md).toContain('Gancho')
  })
})

describe('generateNpc com withFlavor', () => {
  it('anexa flavor quando pedido (d20), determinístico por seed', () => {
    const a = generateNpc({ systemId: 'dnd5e-2024', level: 5, seed: 3, withFlavor: true })
    const b = generateNpc({ systemId: 'dnd5e-2024', level: 5, seed: 3, withFlavor: true })
    expect(a.flavor).toBeDefined()
    expect(a.flavor).toEqual(b.flavor)
  })

  it('não anexa flavor sem a flag', () => {
    const npc = generateNpc({ systemId: 'dnd5e-2024', level: 5, seed: 3 })
    expect(npc.flavor).toBeUndefined()
  })

  it('anexa flavor em sistema de pool', () => {
    const npc = generateNpc({ systemId: 'daggerheart', level: 2, seed: 4, withFlavor: true })
    expect(npc.flavor).toBeDefined()
  })

  it('markdown do NPC inclui a seção Interpretação quando há flavor', () => {
    const npc = generateNpc({ systemId: 'dnd5e-2024', level: 5, seed: 3, withFlavor: true })
    expect(isD20Npc(npc)).toBe(true)
    expect(toCodexMarkdown(npc)).toContain('#### Interpretação')
  })
})
