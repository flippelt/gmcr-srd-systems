import { afterEach, describe, expect, it } from 'vitest'
import {
  abilityMod,
  combatManeuverDefense,
  pathfinder1e,
  resetRoller,
  setRoller,
  spellSaveDC,
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
    expect(abilityMod(15)).toBe(2)
    expect(spellSaveDC(4, 5)).toBe(19)
  })
  it('combatManeuverDefense (CMD = 10 + BAB + Str + Dex + size)', () => {
    expect(combatManeuverDefense(5, 3, 2, 1)).toBe(21)
    expect(combatManeuverDefense(0, 0, 0)).toBe(10)
  })
})

describe('d20', () => {
  it('rola e marca natural 20/1', () => {
    setRoller(fixedRoller(20))
    expect(pathfinder1e.rules!.roll!('d20', {})!.notes).toContain('20 natural')
    setRoller(fixedRoller(1))
    expect(pathfinder1e.rules!.roll!('d20', {})!.notes).toContain('1 natural')
  })
})

describe('attack', () => {
  it('threat range alargado marca ameaça', () => {
    setRoller(fixedRoller(19))
    const r = pathfinder1e.rules!.roll!('attack', { modifier: 4, targetAC: 18, critRange: 19 })!
    expect(r.notes!.some((n) => n.startsWith('ameaça'))).toBe(true)
  })

  it('20 natural sempre crita', () => {
    setRoller(fixedRoller(20))
    const r = pathfinder1e.rules!.roll!('attack', { modifier: 0, targetAC: 99 })!
    expect(r.notes).toContain('acerto crítico (20 natural)')
  })
})

describe('save', () => {
  it('20 nat auto-passa; 1 nat auto-falha', () => {
    setRoller(fixedRoller(20))
    expect(pathfinder1e.rules!.roll!('save', { modifier: 0, dc: 99 })!.notes).toContain('sucesso')
    setRoller(fixedRoller(1))
    expect(pathfinder1e.rules!.roll!('save', { modifier: 50, dc: 5 })!.notes).toContain('falha')
  })
})

describe('damage com crit multiplier', () => {
  it('×3 triplica dados e mod', () => {
    setRoller(fixedRoller(4, 4, 4))
    const r = pathfinder1e.rules!.roll!('damage', {
      count: 1,
      sides: 6,
      modifier: 2,
      critMultiplier: 3,
    })!
    expect(r.rolls).toHaveLength(3)
    expect(r.total).toBe(12 + 6)
  })
})

describe('combat maneuver', () => {
  it('bem-sucedida quando total ≥ CMD', () => {
    setRoller(fixedRoller(15))
    const r = pathfinder1e.rules!.roll!('combat-maneuver', { cmb: 5, targetCMD: 18 })!
    expect(r.total).toBe(20)
    expect(r.notes).toContain('manobra bem-sucedida')
  })

  it('falhou quando total < CMD', () => {
    setRoller(fixedRoller(5))
    const r = pathfinder1e.rules!.roll!('combat-maneuver', { cmb: 2, targetCMD: 20 })!
    expect(r.notes).toContain('manobra falhou')
  })

  it('alias "maneuver"', () => {
    setRoller(fixedRoller(10))
    const r = pathfinder1e.rules!.roll!('maneuver', { cmb: 3, targetCMD: 12 })!
    expect(r.total).toBe(13)
  })
})

describe('system bundle', () => {
  it('id e atribuição OGL', () => {
    expect(pathfinder1e.id).toBe('pathfinder-1e')
    expect(pathfinder1e.attribution).toContain('Open Game License')
    expect(pathfinder1e.attribution).toContain('Pathfinder Reference Document')
  })
  it('inclui Bleed e Pinned (typical PF1e additions)', () => {
    const ids = pathfinder1e.conditions.map((c) => c.id)
    expect(ids).toContain('bleed')
    expect(ids).toContain('pinned')
    expect(ids).toContain('flat-footed')
  })
  it('tracker tem cmb e cmd (touch/flat-footed também)', () => {
    const keys = pathfinder1e.trackerFields.map((f) => f.key)
    expect(keys).toContain('cmb')
    expect(keys).toContain('cmd')
    expect(keys).toContain('touch')
    expect(keys).toContain('flatFooted')
  })
})
