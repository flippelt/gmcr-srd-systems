import { afterEach, describe, expect, it } from 'vitest'
import {
  abilityMod,
  degreeOfSuccess,
  pathfinder2e,
  proficiencyBonus,
  resetRoller,
  setRoller,
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
  it('abilityMod', () => {
    expect(abilityMod(18)).toBe(4)
  })

  it('proficiencyBonus por rank', () => {
    expect(proficiencyBonus('untrained')).toBe(0)
    expect(proficiencyBonus('trained')).toBe(2)
    expect(proficiencyBonus('expert')).toBe(4)
    expect(proficiencyBonus('master')).toBe(6)
    expect(proficiencyBonus('legendary')).toBe(8)
  })
})

describe('degreeOfSuccess', () => {
  it('crit success quando total ≥ DC+10', () => {
    expect(degreeOfSuccess(25, 15, 10)).toBe('critical-success')
  })
  it('success quando total ≥ DC mas < DC+10', () => {
    expect(degreeOfSuccess(18, 15, 10)).toBe('success')
  })
  it('failure quando total ≥ DC-10 mas < DC', () => {
    expect(degreeOfSuccess(10, 15, 10)).toBe('failure')
  })
  it('crit failure quando total < DC-10', () => {
    expect(degreeOfSuccess(2, 15, 10)).toBe('critical-failure')
  })
  it('natural 20 sobe um grau (success → crit success)', () => {
    expect(degreeOfSuccess(17, 15, 20)).toBe('critical-success')
  })
  it('natural 20 não passa do critical-success', () => {
    expect(degreeOfSuccess(30, 15, 20)).toBe('critical-success')
  })
  it('natural 1 desce um grau (success → failure)', () => {
    expect(degreeOfSuccess(17, 15, 1)).toBe('failure')
  })
  it('natural 1 não passa do critical-failure', () => {
    expect(degreeOfSuccess(1, 15, 1)).toBe('critical-failure')
  })
})

describe('check rolls', () => {
  it('rola d20 + mod e anota degree quando DC presente', () => {
    setRoller(fixedRoller(15))
    const r = pathfinder2e.rules!.roll!('check', { modifier: 3, dc: 15 })!
    expect(r.total).toBe(18)
    expect(r.notes).toContain('success')
    expect(r.notes).toContain('DC 15')
  })

  it('natural 20 com success vira critical-success', () => {
    setRoller(fixedRoller(20))
    const r = pathfinder2e.rules!.roll!('check', { modifier: 0, dc: 18 })!
    expect(r.notes).toContain('critical-success')
  })

  it('alias perception/skill funcionam', () => {
    setRoller(fixedRoller(10))
    expect(pathfinder2e.rules!.roll!('perception', { modifier: 5, dc: 12 })!.notes).toContain('success')
    setRoller(fixedRoller(10))
    expect(pathfinder2e.rules!.roll!('skill', { modifier: 5, dc: 12 })!.notes).toContain('success')
  })
})

describe('attack com MAP', () => {
  it('MAP −5 reduz modificador efetivo', () => {
    setRoller(fixedRoller(15))
    const r = pathfinder2e.rules!.roll!('attack', { modifier: 10, targetAC: 20, map: 5 })!
    // 15 + 10 - 5 = 20 → success
    expect(r.total).toBe(20)
    expect(r.notes).toContain('MAP −5')
    expect(r.notes).toContain('success')
  })

  it('MAP −10 (terceiro ataque) penaliza mais', () => {
    setRoller(fixedRoller(15))
    const r = pathfinder2e.rules!.roll!('attack', { modifier: 10, targetAC: 20, map: 10 })!
    // 15 + 10 - 10 = 15 → failure
    expect(r.total).toBe(15)
    expect(r.notes).toContain('MAP −10')
    expect(r.notes).toContain('failure')
  })
})

describe('damage com crit', () => {
  it('crit dobra o total', () => {
    setRoller(fixedRoller(5))
    const r = pathfinder2e.rules!.roll!('damage', { count: 1, sides: 8, modifier: 3, critical: true })!
    // (5 + 3) × 2 = 16
    expect(r.total).toBe(16)
    expect(r.notes).toContain('crítico — total ×2')
  })
})

describe('system bundle', () => {
  it('id e atribuição ORC', () => {
    expect(pathfinder2e.id).toBe('pathfinder-2e')
    expect(pathfinder2e.attribution).toContain('ORC License')
  })

  it('inclui conditions PF2 (clumsy, doomed, frightened, slowed, etc)', () => {
    const ids = pathfinder2e.conditions.map((c) => c.id)
    expect(ids).toContain('clumsy')
    expect(ids).toContain('doomed')
    expect(ids).toContain('drained')
    expect(ids).toContain('slowed')
    expect(ids).toContain('quickened')
  })

  it('tracker tem hero points e focus points', () => {
    const keys = pathfinder2e.trackerFields.map((f) => f.key)
    expect(keys).toContain('heroPoints')
    expect(keys).toContain('focusPoints')
    // PF2 não usa BAB
    expect(keys).not.toContain('bab')
  })
})
