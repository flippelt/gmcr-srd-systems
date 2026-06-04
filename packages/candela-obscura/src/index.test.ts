import { afterEach, describe, expect, it } from 'vitest'
import { candelaObscura, outcomeFor, resetRoller, rollPool, rollResistance, setRoller } from './index.js'

function fixedRoller(...sequence: number[]): () => number {
  let i = 0
  return () => {
    const v = sequence[i % sequence.length]!
    i++
    return v
  }
}

afterEach(() => resetRoller())

describe('outcomeFor helper', () => {
  it('6 = clean', () => expect(outcomeFor(6)).toBe('clean'))
  it('4-5 = partial', () => {
    expect(outcomeFor(4)).toBe('partial')
    expect(outcomeFor(5)).toBe('partial')
  })
  it('1-3 = failure', () => {
    expect(outcomeFor(1)).toBe('failure')
    expect(outcomeFor(3)).toBe('failure')
  })
})

describe('pool rolls (take highest)', () => {
  it('pega o maior dos N dados', () => {
    setRoller(fixedRoller(2, 5, 3))
    const r = rollPool({ pool: 3 })
    expect(r.breakdown.dice).toEqual([2, 5, 3])
    expect(r.breakdown.highest).toBe(5)
    expect(r.total).toBe(5)
    expect(r.breakdown.outcome).toBe('partial')
  })

  it('outcome clean quando há um 6', () => {
    setRoller(fixedRoller(1, 6, 2))
    const r = rollPool({ pool: 3 })
    expect(r.breakdown.outcome).toBe('clean')
    expect(r.notes).toContain('sucesso (6)')
  })

  it('outcome failure quando todos ≤ 3', () => {
    setRoller(fixedRoller(1, 2, 3))
    const r = rollPool({ pool: 3 })
    expect(r.breakdown.outcome).toBe('failure')
    expect(r.notes).toContain('falha (1-3)')
  })

  it('clampa pool em 1..6', () => {
    setRoller(fixedRoller(4, 4, 4, 4, 4, 4))
    const r = rollPool({ pool: 100 })
    expect(r.breakdown.dice.length).toBe(6)
  })

  it('pool mínimo é 1', () => {
    setRoller(fixedRoller(4))
    const r = rollPool({ pool: 0 })
    expect(r.breakdown.dice.length).toBe(1)
  })

  it('gilded adiciona nota de recuperação de Drive', () => {
    setRoller(fixedRoller(3))
    const r = rollPool({ pool: 1, gilded: true })
    expect(r.notes).toContain('gilded usado — recupera 1 Drive')
  })
})

describe('resistance rolls', () => {
  it('clean = anula consequência', () => {
    setRoller(fixedRoller(6, 2))
    const r = rollResistance({ pool: 2 })
    expect(r.notes).toContain('resistance: consequência anulada')
  })

  it('partial = consequência reduzida (-1 Drive)', () => {
    setRoller(fixedRoller(5, 1))
    const r = rollResistance({ pool: 2 })
    expect(r.notes).toContain('resistance: consequência reduzida (-1 Drive)')
  })

  it('failure = consequência mantida (-2 Drive)', () => {
    setRoller(fixedRoller(2, 3))
    const r = rollResistance({ pool: 2 })
    expect(r.notes).toContain('resistance: consequência mantida (-2 Drive)')
  })
})

describe('system bundle', () => {
  it('expõe id, atribuição DPCGL e estrutura básica', () => {
    expect(candelaObscura.id).toBe('candela-obscura')
    expect(candelaObscura.attribution).toContain('Darrington Press Community Gaming License')
    expect(candelaObscura.attribution).toContain('Illuminated Worlds')
    const fields = candelaObscura.trackerFields.map((f) => f.key)
    expect(fields).toEqual([
      'bodyMarks',
      'brainMarks',
      'bleedMarks',
      'scars',
      'driveNerve',
      'driveCunning',
      'driveIntuition',
    ])
  })

  it('roll("check") delega ao pool sem expor breakdown', () => {
    setRoller(fixedRoller(6))
    const r = candelaObscura.rules!.roll!('check', { pool: 1 })!
    expect(r).not.toHaveProperty('breakdown')
    expect(r.notes).toContain('sucesso (6)')
  })

  it('roll("resistance") delega ao resistance', () => {
    setRoller(fixedRoller(4))
    const r = candelaObscura.rules!.roll!('resistance', { pool: 1 })!
    expect(r.notes.some((n) => n.startsWith('resistance:'))).toBe(true)
  })

  it('roll("desconhecido") retorna null', () => {
    expect(candelaObscura.rules!.roll!('asdf', {})).toBeNull()
  })
})
