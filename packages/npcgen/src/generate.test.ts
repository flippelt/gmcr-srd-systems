import { describe, it, expect } from 'vitest'
import { generateNpc, isD20System } from './generate'

describe('generateNpc (opções fixas → determinístico)', () => {
  const npc = generateNpc({
    systemId: 'dnd5e-2024',
    level: 5,
    role: 'soldier',
    abilityMethod: 'standard',
    name: 'Test',
  })

  it('usa o modelo proficiency e a progressão correta', () => {
    expect(npc.model).toBe('proficiency')
    expect(npc.attackProgression).toBe(3)
  })

  it('deriva atributos, HP e CA', () => {
    expect(npc.abilities.str.score).toBe(15)
    expect(npc.hp).toBe(38)
    expect(npc.ac).toBe(17)
  })

  it('ataque e perícias incorporam a progressão', () => {
    expect(npc.attack.bonus).toBe(5) // STR +2 + prof 3
    expect(npc.attack.damage).toBe('1d8+2')
    expect(npc.skills.athletics).toBe(5)
    expect(npc.skills.perception).toBe(4)
  })

  it('soldier nível 5: 2 ataques (Extra Attack)', () => {
    expect(npc.attacks).toHaveLength(2)
    expect(npc.attack).toEqual(npc.attacks[0]) // alias retro-compat
    // ambos com mesmo bônus (proficiency model)
    expect(npc.attacks[0]!.bonus).toBe(5)
    expect(npc.attacks[1]!.bonus).toBe(5)
  })

  it('inclui benchmark de CR pra nível 5', () => {
    expect(npc.benchmark.level).toBe(5)
    expect(npc.benchmark.hp).toBe(115)
    expect(npc.benchmark.attackBonus).toBe(6)
  })

  it('todos os mods conferem com os scores', () => {
    for (const ab of ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const) {
      expect(npc.abilities[ab].mod).toBe(Math.floor((npc.abilities[ab].score - 10) / 2))
    }
  })
})

describe('generateNpc (modelo bab)', () => {
  it('dnd-3.5 usa BAB = nível', () => {
    const n = generateNpc({
      systemId: 'dnd-3.5',
      level: 6,
      role: 'brute',
      abilityMethod: 'standard',
      name: 'X',
    })
    expect(n.model).toBe('bab')
    expect(n.attackProgression).toBe(6)
    expect(n.attack.bonus).toBe(8) // STR +2 + BAB 6
  })
})

describe('generateNpc (seed reproduzível)', () => {
  it('a mesma seed gera o mesmo NPC', () => {
    const a = generateNpc({ systemId: 'pathfinder-2e', seed: 42 })
    const b = generateNpc({ systemId: 'pathfinder-2e', seed: 42 })
    expect(a).toEqual(b)
    expect(a.name.length).toBeGreaterThan(0)
  })
})

describe('isD20System / erros', () => {
  it('reconhece sistemas d20', () => {
    expect(isD20System('dnd5e-2024')).toBe(true)
    expect(isD20System('daggerheart')).toBe(false)
  })

  it('lança para sistema fora da família d20', () => {
    expect(() => generateNpc({ systemId: 'daggerheart' })).toThrowError(/família d20/)
  })
})
