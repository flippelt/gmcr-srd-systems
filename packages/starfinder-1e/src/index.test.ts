import { afterEach, describe, expect, it } from 'vitest'
import {
  abilityMod,
  applyToStaminaThenHp,
  resetRoller,
  setRoller,
  spellSaveDC,
  starfinder1e,
} from './index.js'

function fixedRoller(...sequence: number[]): () => number {
  let i = 0
  return () => {
    const v = sequence[i % sequence.length]!
    i++
    return v
  }
}

afterEach(() => resetRoller())

describe('helpers', () => {
  it('abilityMod e spellSaveDC', () => {
    expect(abilityMod(14)).toBe(2)
    expect(spellSaveDC(5, 4)).toBe(19)
  })
})

describe('applyToStaminaThenHp', () => {
  it('drena stamina primeiro', () => {
    const r = applyToStaminaThenHp(5, { stamina: 10, hp: 20 })
    expect(r).toEqual({ stamina: 5, hp: 20, staminaLost: 5, hpLost: 0 })
  })
  it('quando stamina não basta, sobra vai pra HP', () => {
    const r = applyToStaminaThenHp(15, { stamina: 10, hp: 20 })
    expect(r).toEqual({ stamina: 0, hp: 15, staminaLost: 10, hpLost: 5 })
  })
  it('clampa HP em 0', () => {
    const r = applyToStaminaThenHp(100, { stamina: 5, hp: 10 })
    expect(r.hp).toBe(0)
    expect(r.staminaLost).toBe(5)
    expect(r.hpLost).toBe(95)
  })
  it('dano negativo trata como 0', () => {
    expect(applyToStaminaThenHp(-3, { stamina: 5, hp: 5 })).toEqual({
      stamina: 5,
      hp: 5,
      staminaLost: 0,
      hpLost: 0,
    })
  })
})

describe('attack vs EAC/KAC', () => {
  it('damageType: kinetic compara com KAC', () => {
    setRoller(fixedRoller(15))
    const r = starfinder1e.rules!.roll!('attack', {
      modifier: 4,
      damageType: 'kinetic',
      targetKAC: 18,
    })!
    // 15 + 4 = 19 ≥ 18 = acertou
    expect(r.notes!.some((n) => n.startsWith('acertou (vs KINETIC'))).toBe(true)
  })

  it('damageType: energy compara com EAC', () => {
    setRoller(fixedRoller(5))
    const r = starfinder1e.rules!.roll!('attack', {
      modifier: 2,
      damageType: 'energy',
      targetEAC: 15,
    })!
    expect(r.notes!.some((n) => n.startsWith('errou (vs ENERGY'))).toBe(true)
  })

  it('20 natural sempre crita', () => {
    setRoller(fixedRoller(20))
    const r = starfinder1e.rules!.roll!('attack', {
      modifier: 0,
      damageType: 'kinetic',
      targetKAC: 99,
    })!
    expect(r.notes!.some((n) => n.startsWith('acerto crítico'))).toBe(true)
  })
})

describe('save', () => {
  it('20 nat auto-passa; 1 nat auto-falha', () => {
    setRoller(fixedRoller(20))
    expect(starfinder1e.rules!.roll!('save', { modifier: 0, dc: 99 })!.notes).toContain('sucesso')
    setRoller(fixedRoller(1))
    expect(starfinder1e.rules!.roll!('save', { modifier: 50, dc: 1 })!.notes).toContain('falha')
  })
})

describe('damage com tipo', () => {
  it('anota damageType nas notes', () => {
    setRoller(fixedRoller(4))
    const r = starfinder1e.rules!.roll!('damage', { count: 1, sides: 6, damageType: 'fire' })!
    expect(r.notes).toContain('tipo: fire')
    expect(r.total).toBe(4)
  })
})

describe('system bundle', () => {
  it('id e atribuição Starfinder SRD', () => {
    expect(starfinder1e.id).toBe('starfinder-1e')
    expect(starfinder1e.attribution).toContain('Starfinder')
    expect(starfinder1e.attribution).toContain('Open Game License')
  })
  it('tem EAC, KAC, stamina e resolve no tracker', () => {
    const keys = starfinder1e.trackerFields.map((f) => f.key)
    expect(keys).toContain('eac')
    expect(keys).toContain('kac')
    expect(keys).toContain('stamina')
    expect(keys).toContain('resolve')
  })
  it('inclui condition Off-target (PF-1e/SF1e específico)', () => {
    expect(starfinder1e.conditions.find((c) => c.id === 'off-target')).toBeDefined()
  })
})
