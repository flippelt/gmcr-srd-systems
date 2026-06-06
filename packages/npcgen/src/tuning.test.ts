import { describe, it, expect } from 'vitest'
import {
  getMagicStats,
  getProficiencyRank,
  getStarfinderTuning,
  PROFICIENCY_RANK_SYSTEMS,
  STARFINDER_SYSTEMS,
} from './tuning'

describe('getMagicStats', () => {
  it('5e (proficiency): DC = 8 + prof + mod; ataque = prof + mod', () => {
    // CHA mod +3, prof +4 (lvl 9) → DC 15, ataque +7
    const m = getMagicStats('cha', 3, 4, 'proficiency', 9)
    expect(m.spellAbility).toBe('cha')
    expect(m.spellSaveDC).toBe(15)
    expect(m.spellAttackBonus).toBe(7)
  })

  it('cantrip escala como caster (1d8 lvl 1, 2d8 lvl 5, 3d8 lvl 11)', () => {
    expect(getMagicStats('cha', 3, 2, 'proficiency', 1).cantripDamage).toBe('1d8+3')
    expect(getMagicStats('cha', 3, 3, 'proficiency', 5).cantripDamage).toBe('2d8+3')
    expect(getMagicStats('cha', 4, 4, 'proficiency', 11).cantripDamage).toBe('3d8+4')
    expect(getMagicStats('cha', 5, 6, 'proficiency', 17).cantripDamage).toBe('4d8+5')
  })

  it('bab usa BAB no lugar de prof (aproximação pra 3.5/PF1 casters)', () => {
    // BAB 6 (3.5 lvl 6 caster), CHA +3 → DC 8 + 6 + 3 = 17, ataque +9
    const m = getMagicStats('cha', 3, 6, 'bab', 6)
    expect(m.spellSaveDC).toBe(17)
    expect(m.spellAttackBonus).toBe(9)
  })

  it('cantrip sem modificador omite o "+0"', () => {
    const m = getMagicStats('int', 0, 2, 'proficiency', 1)
    expect(m.cantripDamage).toBe('1d8')
  })
})

describe('getStarfinderTuning', () => {
  it('SF1 (bab): stamina mais generosa que SF2', () => {
    const sf1 = getStarfinderTuning(16, 2, 5, 'bab')
    // (5 + 2) * 5 = 35
    expect(sf1.stamina).toBe(35)
    expect(sf1.kac).toBe(16)
    expect(sf1.eac).toBe(15)
    expect(sf1.resolve).toBe(3) // ⌊5/2⌋ + 1
  })

  it('SF2 (proficiency): stamina mais magra', () => {
    const sf2 = getStarfinderTuning(16, 2, 5, 'proficiency')
    // (2 + 2) * 5 = 20
    expect(sf2.stamina).toBe(20)
    expect(sf2.kac).toBe(16)
    expect(sf2.eac).toBe(15)
  })

  it('CON negativo reduz stamina, mas não vira negativo', () => {
    const sf = getStarfinderTuning(12, -3, 1, 'bab')
    // (5 - 3) * 1 = 2; positivo
    expect(sf.stamina).toBe(2)

    // CON muito baixo + lvl 1: pode dar 0
    const sf2 = getStarfinderTuning(12, -10, 1, 'bab')
    expect(sf2.stamina).toBe(0)
  })

  it('resolve mínimo é 1', () => {
    expect(getStarfinderTuning(10, 0, 1, 'bab').resolve).toBe(1)
  })
})

describe('getProficiencyRank', () => {
  it('faixas por nível', () => {
    expect(getProficiencyRank(1)).toBe('trained')
    expect(getProficiencyRank(4)).toBe('trained')
    expect(getProficiencyRank(5)).toBe('expert')
    expect(getProficiencyRank(10)).toBe('expert')
    expect(getProficiencyRank(11)).toBe('master')
    expect(getProficiencyRank(16)).toBe('master')
    expect(getProficiencyRank(17)).toBe('legendary')
    expect(getProficiencyRank(20)).toBe('legendary')
  })

  it('clamp pra fora do range', () => {
    expect(getProficiencyRank(0)).toBe('trained')
    expect(getProficiencyRank(99)).toBe('legendary')
  })
})

describe('Sets de sistemas', () => {
  it('STARFINDER_SYSTEMS cobre SF1 e SF2', () => {
    expect(STARFINDER_SYSTEMS.has('starfinder-1e')).toBe(true)
    expect(STARFINDER_SYSTEMS.has('starfinder-2e')).toBe(true)
    expect(STARFINDER_SYSTEMS.has('dnd5e-2024')).toBe(false)
  })

  it('PROFICIENCY_RANK_SYSTEMS cobre PF2 e SF2', () => {
    expect(PROFICIENCY_RANK_SYSTEMS.has('pathfinder-2e')).toBe(true)
    expect(PROFICIENCY_RANK_SYSTEMS.has('starfinder-2e')).toBe(true)
    expect(PROFICIENCY_RANK_SYSTEMS.has('pathfinder-1e')).toBe(false)
    expect(PROFICIENCY_RANK_SYSTEMS.has('dnd5e-2024')).toBe(false)
  })
})
