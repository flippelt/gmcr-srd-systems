import { afterEach, describe, expect, it } from 'vitest'
import { lancer, resetRoller, setRoller } from './index.js'

function fixedRoller(...sequence: number[]): () => number {
  let i = 0
  return () => {
    const v = sequence[i % sequence.length]!
    i++
    return v
  }
}

afterEach(() => resetRoller())

describe('check rolls', () => {
  it('d20 puro com modificador', () => {
    setRoller(fixedRoller(15))
    const r = lancer.rules!.roll!('check', { modifier: 3 })!
    expect(r.rolls).toEqual([15])
    expect(r.total).toBe(18)
    expect(r.notation).toBe('1d20+3')
  })

  it('aplica accuracy líquida pegando o MAIOR d6', () => {
    // Roller: 1° d20=12, depois 2 d6 (2 acc, 1 diff = 1 acc líquida... espera,
    // accuracy 2 + difficulty 1 = net 1 acc → rola 1d6.
    setRoller(fixedRoller(12, 5))
    const r = lancer.rules!.roll!('check', { accuracy: 2, difficulty: 1 })!
    expect(r.total).toBe(12 + 5)
    expect(r.notes).toContain('accuracy líquida 1 (+5)')
  })

  it('aplica difficulty líquida pegando o MENOR d6 e subtraindo', () => {
    setRoller(fixedRoller(10, 6, 2))
    const r = lancer.rules!.roll!('check', { difficulty: 2 })!
    expect(r.total).toBe(10 - 2) // subtrai o menor (2)
    expect(r.notes).toContain('difficulty líquida 2 (-2)')
  })

  it('acc e diff iguais cancelam totalmente (não rola d6)', () => {
    setRoller(fixedRoller(14))
    const r = lancer.rules!.roll!('check', { accuracy: 2, difficulty: 2 })!
    expect(r.rolls).toEqual([14])
    expect(r.total).toBe(14)
    // Nenhuma nota de acc/diff
    expect(r.notes?.some((n) => n.includes('accuracy'))).toBeFalsy()
    expect(r.notes?.some((n) => n.includes('difficulty'))).toBeFalsy()
  })

  it('anota 20 e 1 naturais', () => {
    setRoller(fixedRoller(20))
    expect(lancer.rules!.roll!('check', {})!.notes).toContain('20 natural')
    setRoller(fixedRoller(1))
    expect(lancer.rules!.roll!('check', {})!.notes).toContain('1 natural')
  })
})

describe('attack rolls', () => {
  it('acerta quando total ≥ targetDefense', () => {
    setRoller(fixedRoller(12))
    const r = lancer.rules!.roll!('attack', { modifier: 3, targetDefense: 10 })!
    expect(r.notes).toContain('acertou')
  })

  it('20 natural é crítico mesmo contra alvo difícil', () => {
    setRoller(fixedRoller(20))
    const r = lancer.rules!.roll!('attack', { modifier: 0, targetDefense: 30 })!
    expect(r.notes).toContain('acerto crítico')
  })

  it('1 natural sempre erra', () => {
    setRoller(fixedRoller(1))
    const r = lancer.rules!.roll!('attack', { modifier: 20, targetDefense: 5 })!
    expect(r.notes).toContain('errou')
  })
})

describe('damage rolls', () => {
  it('NdM+K direto sem armor', () => {
    setRoller(fixedRoller(3, 4))
    const r = lancer.rules!.roll!('damage', { count: 2, sides: 6, modifier: 2 })!
    expect(r.total).toBe(3 + 4 + 2)
  })

  it('armor reduz tipos físicos (kinetic) mas nunca negativo', () => {
    setRoller(fixedRoller(5))
    const r = lancer.rules!.roll!('damage', {
      count: 1,
      sides: 6,
      type: 'kinetic',
      armor: 2,
    })!
    expect(r.total).toBe(3) // 5 - 2
    expect(r.notes).toContain('armor reduziu 2')
  })

  it('armor não reduz burn nem heat', () => {
    setRoller(fixedRoller(4))
    const r = lancer.rules!.roll!('damage', {
      count: 1,
      sides: 6,
      type: 'burn',
      armor: 3,
    })!
    expect(r.total).toBe(4)
    expect(r.notes).toContain('burn — alvo deve testar pra apagar')
  })

  it('clampa em 0 quando armor ≥ dano', () => {
    setRoller(fixedRoller(1))
    const r = lancer.rules!.roll!('damage', {
      count: 1,
      sides: 6,
      type: 'energy',
      armor: 4,
    })!
    expect(r.total).toBe(0)
  })
})

describe('applyDamage', () => {
  const apply = lancer.rules!.applyDamage!

  it('reduz armor pra tipos físicos', () => {
    const r = apply(10, { type: 'kinetic', armor: 3 })
    expect(r.final).toBe(7)
    expect(r.notes).toContain('armor reduziu 3')
  })

  it('ignora armor pra burn', () => {
    const r = apply(5, { type: 'burn', armor: 4 })
    expect(r.final).toBe(5)
  })

  it('sem type retorna dano direto', () => {
    expect(apply(8, {}).final).toBe(8)
  })
})

describe('structure / stress tables', () => {
  it('structure rola 1d6 e devolve o efeito da linha correspondente', () => {
    setRoller(fixedRoller(1))
    const r = lancer.rules!.roll!('structure', {})!
    expect(r.rolls).toEqual([1])
    expect(r.notes![0]).toMatch(/destruído/)
  })

  it('stress 6 é o resultado mais benigno', () => {
    setRoller(fixedRoller(6))
    const r = lancer.rules!.roll!('stress', {})!
    expect(r.notes![0]).toMatch(/reactor controlado/)
  })
})

describe('system bundle', () => {
  it('expõe id, atribuição 3PP e dicePresets/conditions/trackerFields', () => {
    expect(lancer.id).toBe('lancer')
    expect(lancer.attribution).toContain('Lancer Third Party License')
    expect(lancer.dicePresets.length).toBeGreaterThan(0)
    expect(lancer.conditions.length).toBeGreaterThanOrEqual(11)
    expect(lancer.trackerFields.find((f) => f.key === 'structure')).toBeDefined()
    expect(lancer.trackerFields.find((f) => f.key === 'stress')).toBeDefined()
  })
})
