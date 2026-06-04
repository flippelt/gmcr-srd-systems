import { afterEach, describe, expect, it } from 'vitest'
import { daggerheart, resetRoller, rollDuality, setRoller } from './index.js'

function fixedRoller(...sequence: number[]): () => number {
  let i = 0
  return () => {
    const v = sequence[i % sequence.length]!
    i++
    return v
  }
}

afterEach(() => resetRoller())

describe('duality dice', () => {
  it('"with Hope" quando Hope > Fear', () => {
    setRoller(fixedRoller(8, 5)) // Hope=8, Fear=5
    const r = rollDuality({})
    expect(r.breakdown.outcome).toBe('with-hope')
    expect(r.breakdown.hope).toBe(8)
    expect(r.breakdown.fear).toBe(5)
    expect(r.total).toBe(13)
    expect(r.notes).toContain('com Hope (+1 Hope)')
  })

  it('"with Fear" quando Fear > Hope', () => {
    setRoller(fixedRoller(3, 9))
    const r = rollDuality({})
    expect(r.breakdown.outcome).toBe('with-fear')
    expect(r.notes).toContain('com Fear (+1 Fear pra GM)')
  })

  it('crítico quando Hope = Fear', () => {
    setRoller(fixedRoller(7, 7))
    const r = rollDuality({ difficulty: 30 }) // dificuldade absurda
    expect(r.breakdown.outcome).toBe('critical')
    expect(r.notes!.some((n) => n.includes('crítico'))).toBe(true)
    // Crítico passa mesmo se total < dificuldade
    expect(r.notes).toContain('sucesso')
  })

  it('adiciona modifier ao total', () => {
    setRoller(fixedRoller(6, 4))
    const r = rollDuality({ modifier: 3 })
    expect(r.total).toBe(13)
  })

  it('aplica vantagem somando d6', () => {
    setRoller(fixedRoller(5, 4, 5)) // Hope=5, Fear=4, adv d6=5
    const r = rollDuality({ advantage: true })
    expect(r.total).toBe(5 + 4 + 5)
    expect(r.notes!.some((n) => n.startsWith('vantagem'))).toBe(true)
  })

  it('aplica desvantagem subtraindo d6', () => {
    setRoller(fixedRoller(8, 6, 3)) // Hope=8, Fear=6, dis d6=3
    const r = rollDuality({ disadvantage: true })
    expect(r.total).toBe(8 + 6 - 3)
    expect(r.notes!.some((n) => n.startsWith('desvantagem'))).toBe(true)
  })

  it('vantagem e desvantagem se cancelam (não rola d6)', () => {
    setRoller(fixedRoller(7, 5))
    const r = rollDuality({ advantage: true, disadvantage: true })
    expect(r.rolls).toEqual([7, 5])
    expect(r.notes).toContain('vantagem/desvantagem se cancelaram')
  })

  it('compara com dificuldade — sucesso quando total ≥ DC', () => {
    setRoller(fixedRoller(10, 8))
    const r = rollDuality({ difficulty: 15 })
    expect(r.notes).toContain('sucesso')
    expect(r.notes).toContain('DC 15')
  })

  it('falha quando total < DC e não é crítico', () => {
    setRoller(fixedRoller(3, 2))
    const r = rollDuality({ difficulty: 10 })
    expect(r.notes).toContain('falha')
  })
})

describe('applyDamage (thresholds)', () => {
  const apply = daggerheart.rules!.applyDamage!

  it('dano < major = minor (1 HP)', () => {
    const r = apply(3, { major: 6, severe: 12 })
    expect(r.final).toBe(1)
    expect(r.notes).toContain('severidade: minor')
  })

  it('dano >= major e < severe = major (2 HP)', () => {
    const r = apply(8, { major: 6, severe: 12 })
    expect(r.final).toBe(2)
    expect(r.notes).toContain('severidade: major')
  })

  it('dano >= severe = severe (3 HP)', () => {
    const r = apply(15, { major: 6, severe: 12 })
    expect(r.final).toBe(3)
    expect(r.notes).toContain('severidade: severe')
  })

  it('armorMark reduz severidade em 1 banda', () => {
    const r = apply(15, { major: 6, severe: 12, armorMark: true })
    expect(r.final).toBe(2) // severe → major
    expect(r.notes!.some((n) => n.includes('armor reduziu'))).toBe(true)
  })

  it('armorMark em minor zera dano', () => {
    const r = apply(3, { major: 6, severe: 12, armorMark: true })
    expect(r.final).toBe(0)
  })
})

describe('damage roll (weapon)', () => {
  it('NdM+K com mod positivo', () => {
    setRoller(fixedRoller(4, 5))
    const r = daggerheart.rules!.roll!('damage', { count: 2, sides: 6, modifier: 1 })!
    expect(r.total).toBe(4 + 5 + 1)
  })

  it('nunca negativo (mod muito baixo)', () => {
    setRoller(fixedRoller(1))
    const r = daggerheart.rules!.roll!('damage', { count: 1, sides: 6, modifier: -5 })!
    expect(r.total).toBe(0)
  })
})

describe('system bundle', () => {
  it('expõe id, atribuição DPCGL e estrutura básica', () => {
    expect(daggerheart.id).toBe('daggerheart')
    expect(daggerheart.attribution).toContain('Darrington Press Community Gaming License')
    expect(daggerheart.dicePresets.find((p) => p.id === 'duality')).toBeDefined()
    expect(daggerheart.conditions.length).toBeGreaterThan(0)
    const fields = daggerheart.trackerFields.map((f) => f.key)
    expect(fields).toContain('hp')
    expect(fields).toContain('stress')
    expect(fields).toContain('hope')
    expect(fields).toContain('majorThreshold')
    expect(fields).toContain('severeThreshold')
  })

  it('roll("check") delega ao duality sem expor breakdown', () => {
    setRoller(fixedRoller(6, 6))
    const r = daggerheart.rules!.roll!('check', { difficulty: 12 })!
    expect(r).not.toHaveProperty('breakdown')
    // 6=6 = crítico → passa mesmo se total < DC
    expect(r.notes).toContain('sucesso')
  })

  it('roll("desconhecido") retorna null', () => {
    expect(daggerheart.rules!.roll!('asdf', {})).toBeNull()
  })
})
