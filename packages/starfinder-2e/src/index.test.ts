import { afterEach, describe, expect, it } from 'vitest'
import {
  abilityMod,
  applyToStaminaThenHp,
  degreeOfSuccess,
  proficiencyBonus,
  resetRoller,
  setRoller,
  starfinder2e,
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
  it('abilityMod e proficiencyBonus', () => {
    expect(abilityMod(16)).toBe(3)
    expect(proficiencyBonus('expert')).toBe(4)
  })

  it('applyToStaminaThenHp drena SP antes de HP', () => {
    expect(applyToStaminaThenHp(12, { stamina: 8, hp: 20 })).toEqual({
      stamina: 0,
      hp: 16,
      staminaLost: 8,
      hpLost: 4,
    })
  })
})

describe('degreeOfSuccess (mesmo de PF2)', () => {
  it('crit success quando total ≥ DC+10', () => {
    expect(degreeOfSuccess(30, 20, 10)).toBe('critical-success')
  })
  it('natural 20 com failure vira success', () => {
    expect(degreeOfSuccess(12, 20, 20)).toBe('success')
  })
  it('natural 1 com success vira failure', () => {
    expect(degreeOfSuccess(22, 20, 1)).toBe('failure')
  })
})

describe('attack vs EAC/KAC com MAP', () => {
  it('damageType kinetic compara com KAC, MAP −5', () => {
    setRoller(fixedRoller(15))
    const r = starfinder2e.rules!.roll!('attack', {
      modifier: 10,
      damageType: 'kinetic',
      targetKAC: 20,
      map: 5,
    })!
    // 15 + 10 - 5 = 20 → success
    expect(r.total).toBe(20)
    expect(r.notes).toContain('MAP −5')
    expect(r.notes).toContain('success')
    expect(r.notes).toContain('vs KINETIC AC 20')
  })

  it('damageType energy compara com EAC', () => {
    setRoller(fixedRoller(12))
    const r = starfinder2e.rules!.roll!('attack', {
      modifier: 5,
      damageType: 'energy',
      targetEAC: 15,
    })!
    // 12 + 5 = 17 ≥ 15 → success
    expect(r.notes).toContain('success')
    expect(r.notes).toContain('vs ENERGY AC 15')
  })
})

describe('damage com crit', () => {
  it('crit dobra o total e anota tipo', () => {
    setRoller(fixedRoller(6))
    const r = starfinder2e.rules!.roll!('damage', {
      count: 1,
      sides: 8,
      modifier: 2,
      damageType: 'fire',
      critical: true,
    })!
    // (6 + 2) × 2 = 16
    expect(r.total).toBe(16)
    expect(r.notes).toContain('crítico — total ×2')
    expect(r.notes).toContain('tipo: fire')
  })
})

describe('system bundle', () => {
  it('id e atribuição ORC', () => {
    expect(starfinder2e.id).toBe('starfinder-2e')
    expect(starfinder2e.attribution).toContain('ORC License')
    expect(starfinder2e.attribution).toContain('Starfinder')
  })

  it('combina EAC/KAC/Stamina (SF) + heroPoints (PF2)', () => {
    const keys = starfinder2e.trackerFields.map((f) => f.key)
    expect(keys).toContain('eac')
    expect(keys).toContain('kac')
    expect(keys).toContain('stamina')
    expect(keys).toContain('heroPoints')
  })

  it('inclui condition Off-Guard (SF2 versão de flat-footed) e Overheated', () => {
    const ids = starfinder2e.conditions.map((c) => c.id)
    expect(ids).toContain('off-guard')
    expect(ids).toContain('overheated')
  })
})
