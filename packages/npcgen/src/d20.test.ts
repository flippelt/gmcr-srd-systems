import { describe, it, expect } from 'vitest'
import {
  abilityMod,
  proficiencyBonus,
  fullBab,
  clampLevel,
  generateAbilityScores,
  deriveHp,
  deriveAc,
  deriveSaves,
} from './d20'
import { ROLES } from './data'

describe('abilityMod', () => {
  it('é floor((score-10)/2)', () => {
    expect(abilityMod(10)).toBe(0)
    expect(abilityMod(8)).toBe(-1)
    expect(abilityMod(15)).toBe(2)
    expect(abilityMod(20)).toBe(5)
  })
})

describe('progressões', () => {
  it('proficiencyBonus por faixa de nível', () => {
    expect(proficiencyBonus(1)).toBe(2)
    expect(proficiencyBonus(4)).toBe(2)
    expect(proficiencyBonus(5)).toBe(3)
    expect(proficiencyBonus(13)).toBe(5)
    expect(proficiencyBonus(17)).toBe(6)
    expect(proficiencyBonus(20)).toBe(6)
  })

  it('fullBab = nível, clamp 1..20', () => {
    expect(fullBab(5)).toBe(5)
    expect(fullBab(0)).toBe(1)
    expect(fullBab(99)).toBe(20)
  })

  it('clampLevel', () => {
    expect(clampLevel(0)).toBe(1)
    expect(clampLevel(7.9)).toBe(7)
    expect(clampLevel(50)).toBe(20)
  })
})

describe('generateAbilityScores (standard)', () => {
  it('distribui os maiores valores pelas prioridades do papel', () => {
    const a = generateAbilityScores('standard', 'soldier') // [str,con,dex,wis,int,cha]
    expect(a.str.score).toBe(15)
    expect(a.str.mod).toBe(2)
    expect(a.con.score).toBe(14)
    expect(a.dex.score).toBe(13)
    expect(a.cha.score).toBe(8)
    expect(a.cha.mod).toBe(-1)
  })
})

describe('derivações d20', () => {
  const soldier = ROLES.soldier

  it('deriveHp escala com nível e CON (mínimo 1)', () => {
    expect(deriveHp(soldier, 1, 2)).toBe(8) // (5.5+2)*1 = 7.5 → 8
    expect(deriveHp(soldier, 5, 2)).toBe(38) // 7.5*5 = 37.5 → 38
    expect(deriveHp(soldier, 1, -5)).toBe(1)
  })

  it('deriveAc = 10 + armadura + Dex limitada', () => {
    expect(deriveAc(soldier, 1)).toBe(17) // 10 + 6 + min(1,2)
    expect(deriveAc(soldier, 5)).toBe(18) // Dex capada em 2
  })

  it('deriveSaves (proficiency): proficiência soma o bônus de proficiência', () => {
    const a = generateAbilityScores('standard', 'soldier')
    const s = deriveSaves(a, soldier, 'proficiency', 5) // prof 3; profs str,con
    expect(s.str).toBe(5) // +2 +3
    expect(s.con).toBe(5)
    expect(s.dex).toBe(1) // +1, sem proficiência
  })

  it('deriveSaves (bab): usa save bom/fraco', () => {
    const a = generateAbilityScores('standard', 'brute') // int último → 8 (-1)
    const s = deriveSaves(a, ROLES.brute, 'bab', 5) // bom=4, fraco=1; profs str,con
    expect(s.str).toBe(6) // +2 +4
    expect(s.int).toBe(0) // -1 +1 (fraco)
  })
})
