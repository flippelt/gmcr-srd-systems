import { describe, expect, it } from 'vitest'
import { generateLoot, lootToMarkdown } from './loot'
import { generateEncounter } from './encounter'
import { encounterToCodexMarkdown } from './adapters'

describe('generateLoot', () => {
  it('é determinístico com o mesmo seed', () => {
    const a = generateLoot({ level: 5, difficulty: 'hard', seed: 11 })
    const b = generateLoot({ level: 5, difficulty: 'hard', seed: 11 })
    expect(a).toEqual(b)
  })

  it('seeds diferentes mudam a recompensa', () => {
    const a = generateLoot({ level: 5, difficulty: 'hard', seed: 1 })
    const b = generateLoot({ level: 5, difficulty: 'hard', seed: 2 })
    expect(a).not.toEqual(b)
  })

  it('quantidade de itens segue a dificuldade', () => {
    expect(generateLoot({ level: 5, difficulty: 'easy', seed: 3 }).items).toHaveLength(0)
    expect(generateLoot({ level: 5, difficulty: 'medium', seed: 3 }).items).toHaveLength(1)
    expect(generateLoot({ level: 5, difficulty: 'hard', seed: 3 }).items).toHaveLength(2)
    expect(generateLoot({ level: 5, difficulty: 'deadly', seed: 3 }).items).toHaveLength(3)
  })

  it('itemCount sobrescreve o padrão', () => {
    expect(generateLoot({ level: 5, difficulty: 'easy', itemCount: 4, seed: 3 }).items).toHaveLength(4)
  })

  it('moedas escalam com a banda de nível', () => {
    const low = generateLoot({ level: 1, difficulty: 'easy', seed: 7 })
    const high = generateLoot({ level: 20, difficulty: 'easy', seed: 7 })
    expect(high.coins.gp).toBeGreaterThan(low.coins.gp)
    expect(low.coins.gp).toBeGreaterThanOrEqual(10)
    expect(low.coins.gp).toBeLessThanOrEqual(100)
  })

  it('coinMultiplier multiplica o ouro', () => {
    const single = generateLoot({ level: 5, seed: 4, coinMultiplier: 1 })
    const triple = generateLoot({ level: 5, seed: 4, coinMultiplier: 3 })
    expect(triple.coins.gp).toBe(single.coins.gp * 3)
  })

  it('raridade respeita a banda de nível', () => {
    // Nível alto nunca deve cair em "common".
    for (let s = 0; s < 20; s++) {
      const loot = generateLoot({ level: 20, itemCount: 3, seed: s })
      for (const it of loot.items) {
        expect(['rare', 'very-rare', 'legendary']).toContain(it.rarity)
      }
    }
  })

  it('totalGp reflete as moedas', () => {
    const loot = generateLoot({ level: 10, seed: 5 })
    const expected = Math.round((loot.coins.gp + loot.coins.sp / 10 + loot.coins.cp / 100) * 100) / 100
    expect(loot.totalGp).toBe(expected)
  })
})

describe('lootToMarkdown', () => {
  it('lista moedas e itens', () => {
    const loot = generateLoot({ level: 12, difficulty: 'hard', seed: 8 })
    const md = lootToMarkdown(loot)
    expect(md).toContain('#### Recompensa')
    expect(md).toContain('Moedas')
    for (const it of loot.items) expect(md).toContain(it.name)
  })
})

describe('encontro com withLoot', () => {
  it('anexa loot ao encontro de forma determinística', () => {
    const a = generateEncounter({ systemId: 'dnd5e-2024', partyLevel: 5, seed: 1, withLoot: true })
    const b = generateEncounter({ systemId: 'dnd5e-2024', partyLevel: 5, seed: 1, withLoot: true })
    expect(a.loot).toBeDefined()
    expect(a.loot).toEqual(b.loot)
  })

  it('sem withLoot não há recompensa', () => {
    const enc = generateEncounter({ systemId: 'dnd5e-2024', partyLevel: 5, seed: 1 })
    expect(enc.loot).toBeUndefined()
  })

  it('markdown do encontro inclui a recompensa quando presente', () => {
    const enc = generateEncounter({ systemId: 'dnd5e-2024', partyLevel: 5, difficulty: 'hard', seed: 1, withLoot: true })
    const md = encounterToCodexMarkdown(enc)
    expect(md).toContain('#### Recompensa')
  })
})
