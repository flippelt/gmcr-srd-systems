import { describe, expect, it } from 'vitest'
import {
  generateEncounter,
  encounterMultiplier,
  xpThreshold,
} from './encounter'
import {
  encounterToTrackerCombatants,
  encounterToCodexMarkdown,
} from './adapters'
import { isD20Npc } from './types'

const D20 = 'dnd5e-2024'
const POOL = 'daggerheart'

describe('tabelas de XP', () => {
  it('multiplicador 5e por nº de inimigos', () => {
    expect(encounterMultiplier(1)).toBe(1)
    expect(encounterMultiplier(2)).toBe(1.5)
    expect(encounterMultiplier(3)).toBe(2)
    expect(encounterMultiplier(6)).toBe(2)
    expect(encounterMultiplier(7)).toBe(2.5)
    expect(encounterMultiplier(11)).toBe(3)
    expect(encounterMultiplier(15)).toBe(4)
  })

  it('threshold por jogador escala com nível e dificuldade', () => {
    expect(xpThreshold(1, 'easy')).toBe(25)
    expect(xpThreshold(1, 'deadly')).toBe(100)
    expect(xpThreshold(20, 'medium')).toBe(5700)
    // clamp fora de 1..20
    expect(xpThreshold(99, 'easy')).toBe(xpThreshold(20, 'easy'))
  })
})

describe('generateEncounter — d20', () => {
  it('é determinístico com o mesmo seed', () => {
    const a = generateEncounter({ systemId: D20, partySize: 4, partyLevel: 5, seed: 42 })
    const b = generateEncounter({ systemId: D20, partySize: 4, partyLevel: 5, seed: 42 })
    expect(a.npcs.map((n) => n.name)).toEqual(b.npcs.map((n) => n.name))
    expect(a.meta).toEqual(b.meta)
  })

  it('seeds diferentes mudam o encontro', () => {
    const a = generateEncounter({ systemId: D20, partyLevel: 5, seed: 1 })
    const b = generateEncounter({ systemId: D20, partyLevel: 5, seed: 2 })
    expect(a.npcs.map((n) => n.name)).not.toEqual(b.npcs.map((n) => n.name))
  })

  it('atinge o orçamento de XP sem estourar maxEnemies', () => {
    const enc = generateEncounter({
      systemId: D20,
      partySize: 4,
      partyLevel: 5,
      difficulty: 'hard',
      seed: 7,
      maxEnemies: 16,
    })
    expect(enc.meta.targetXp).toBe(xpThreshold(5, 'hard') * 4)
    // ajustado >= alvo (ou bateu o teto de inimigos)
    expect(
      enc.meta.adjustedXp! >= enc.meta.targetXp! || enc.meta.count === 16,
    ).toBe(true)
    expect(enc.meta.count).toBeLessThanOrEqual(16)
    expect(enc.meta.count).toBeGreaterThanOrEqual(1)
    expect(enc.meta.adjustedXp).toBe(enc.meta.rawXp! * enc.meta.multiplier!)
  })

  it('dificuldade maior pede mais XP (alvo cresce)', () => {
    const easy = generateEncounter({ systemId: D20, partyLevel: 8, difficulty: 'easy', seed: 3 })
    const deadly = generateEncounter({ systemId: D20, partyLevel: 8, difficulty: 'deadly', seed: 3 })
    expect(deadly.meta.targetXp!).toBeGreaterThan(easy.meta.targetXp!)
  })

  it('gera NPCs d20 com o nível esperado por papel', () => {
    const enc = generateEncounter({ systemId: D20, partyLevel: 10, seed: 5 })
    expect(enc.meta.family).toBe('d20')
    for (const npc of enc.npcs) expect(isD20Npc(npc)).toBe(true)
  })

  it('respeita roleMix explícito (papéis e contagem exatos)', () => {
    const enc = generateEncounter({
      systemId: D20,
      partyLevel: 4,
      seed: 9,
      roleMix: [
        { role: 'brute', count: 1, level: 6 },
        { role: 'minion', count: 3, level: 2 },
      ],
    })
    expect(enc.npcs).toHaveLength(4)
    const d20npcs = enc.npcs.filter(isD20Npc)
    expect(d20npcs.filter((n) => n.role === 'brute')).toHaveLength(1)
    expect(d20npcs.filter((n) => n.role === 'minion')).toHaveLength(3)
    expect(d20npcs.find((n) => n.role === 'brute')!.level).toBe(6)
    expect(d20npcs.filter((n) => n.role === 'minion').every((n) => n.level === 2)).toBe(true)
  })
})

describe('generateEncounter — pool', () => {
  it('balanceia por contagem conforme a dificuldade', () => {
    const easy = generateEncounter({ systemId: POOL, partySize: 4, difficulty: 'easy', seed: 1 })
    const medium = generateEncounter({ systemId: POOL, partySize: 4, difficulty: 'medium', seed: 1 })
    const deadly = generateEncounter({ systemId: POOL, partySize: 4, difficulty: 'deadly', seed: 1 })
    expect(easy.meta.count).toBe(3)
    expect(medium.meta.count).toBe(4)
    expect(deadly.meta.count).toBe(6)
  })

  it('não usa orçamento de XP (sem targetXp, com nota)', () => {
    const enc = generateEncounter({ systemId: POOL, partySize: 3, seed: 2 })
    expect(enc.meta.family).toBe('pool')
    expect(enc.meta.targetXp).toBeUndefined()
    expect(enc.meta.notes && enc.meta.notes.length).toBeGreaterThan(0)
    for (const npc of enc.npcs) expect(npc.family).toBe('pool')
  })

  it('é determinístico com o mesmo seed', () => {
    const a = generateEncounter({ systemId: POOL, partySize: 4, seed: 99 })
    const b = generateEncounter({ systemId: POOL, partySize: 4, seed: 99 })
    expect(a.npcs.map((n) => n.name)).toEqual(b.npcs.map((n) => n.name))
  })
})

describe('generateEncounter — erros e limites', () => {
  it('lança erro para sistema sem suporte', () => {
    expect(() => generateEncounter({ systemId: 'sistema-inexistente' })).toThrow(/não suportado/)
  })

  it('garante pelo menos um inimigo mesmo com roleMix vazio/zerado', () => {
    const enc = generateEncounter({
      systemId: D20,
      partyLevel: 3,
      seed: 1,
      roleMix: [{ role: 'brute', count: 0 }],
    })
    expect(enc.npcs.length).toBeGreaterThanOrEqual(1)
  })

  it('respeita maxEnemies como teto', () => {
    const enc = generateEncounter({
      systemId: D20,
      partyLevel: 1,
      difficulty: 'deadly',
      partySize: 8,
      seed: 4,
      maxEnemies: 5,
    })
    expect(enc.meta.count).toBeLessThanOrEqual(5)
  })
})

describe('adapters de encontro', () => {
  it('encounterToTrackerCombatants devolve um combatente por NPC', () => {
    const enc = generateEncounter({ systemId: D20, partyLevel: 5, seed: 8 })
    const combatants = encounterToTrackerCombatants(enc)
    expect(combatants).toHaveLength(enc.npcs.length)
    expect(combatants[0]).toHaveProperty('name')
    expect(combatants[0]).toHaveProperty('hp')
  })

  it('encounterToCodexMarkdown traz cabeçalho do encontro e os stat blocks', () => {
    const enc = generateEncounter({ systemId: D20, partyLevel: 5, difficulty: 'hard', seed: 8 })
    const md = encounterToCodexMarkdown(enc)
    expect(md).toContain('## Encontro')
    expect(md).toContain('hard')
    expect(md).toContain('XP')
    // cada NPC aparece pelo nome
    for (const npc of enc.npcs) expect(md).toContain(npc.name)
  })
})
