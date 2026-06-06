import { describe, it, expect } from 'vitest'
import { buildCreature } from './creature'
import { getResistancesForType } from './resistances'
import { getRoleWeapon, WEAPONS } from './weapons'

describe('buildCreature', () => {
  it('humanoide medium é o default razoável', () => {
    const c = buildCreature('humanoid', 'medium')
    expect(c.type).toBe('humanoid')
    expect(c.size).toBe('medium')
    expect(c.movements.walk).toBe(30)
    expect(c.senses).toEqual([])
    expect(c.languages).toContain('Comum')
  })

  it('dragão tem voo e darkvision longe', () => {
    const c = buildCreature('dragon', 'large')
    expect(c.movements.fly).toBe(80)
    expect(c.senses).toContain('darkvision-120')
    expect(c.senses).toContain('blindsight-30')
  })

  it('fera tem walking mais rápido e low-light vision', () => {
    const c = buildCreature('beast', 'medium')
    expect(c.movements.walk).toBe(40) // base 30 + 10
    expect(c.senses).toContain('low-light-vision')
  })

  it('ooze é lento e tem blindsight', () => {
    const c = buildCreature('ooze', 'medium')
    expect(c.movements.walk).toBe(10)
    expect(c.movements.climb).toBe(10)
    expect(c.senses).toContain('blindsight-60')
  })

  it('tamanho tiny/small reduz walk; large aumenta', () => {
    expect(buildCreature('humanoid', 'tiny').movements.walk).toBe(25)
    expect(buildCreature('humanoid', 'small').movements.walk).toBe(25)
    expect(buildCreature('humanoid', 'large').movements.walk).toBe(40)
  })
})

describe('getResistancesForType', () => {
  it('undead resiste a necrotic e é imune a poison', () => {
    const r = getResistancesForType('undead')
    expect(r.damageResistances).toContain('necrotic')
    expect(r.damageImmunities).toContain('poison')
    expect(r.conditionImmunities).toContain('exhaustion')
  })

  it('fiend tem resistências múltiplas + vulnerabilidade radiant', () => {
    const r = getResistancesForType('fiend')
    expect(r.damageResistances).toEqual(expect.arrayContaining(['cold', 'fire', 'lightning']))
    expect(r.damageVulnerabilities).toContain('radiant')
  })

  it('construct é imune a poison + várias condições', () => {
    const r = getResistancesForType('construct')
    expect(r.damageImmunities).toContain('poison')
    expect(r.conditionImmunities).toEqual(
      expect.arrayContaining(['poisoned', 'charmed', 'paralyzed']),
    )
  })

  it('humanoide não tem resistências', () => {
    const r = getResistancesForType('humanoid')
    expect(r.damageResistances).toEqual([])
    expect(r.damageImmunities).toEqual([])
    expect(r.conditionImmunities).toEqual([])
  })

  it('plant é vulnerável a fogo', () => {
    const r = getResistancesForType('plant')
    expect(r.damageVulnerabilities).toContain('fire')
  })
})

describe('weapons', () => {
  it('catálogo tem armas básicas', () => {
    expect(WEAPONS.longsword.damageDie).toBe(8)
    expect(WEAPONS.greatsword.damageDie).toBe(10)
    expect(WEAPONS.longbow.range?.normal).toBe(150)
  })

  it('getRoleWeapon retorna arma assinatura', () => {
    expect(getRoleWeapon('brute').name).toBe('Machado Grande')
    expect(getRoleWeapon('archer').category).toBe('martial-ranged')
    expect(getRoleWeapon('caster').damageType).toBe('force')
    expect(getRoleWeapon('lurker').properties).toContain('finesse')
  })
})
