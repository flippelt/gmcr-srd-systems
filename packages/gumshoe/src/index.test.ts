import { afterEach, describe, expect, it } from 'vitest'
import { gumshoe, investigativeSpend, resetRoller, setRoller } from './index.js'

function fixedRoller(...sequence: number[]): () => number {
  let i = 0
  return () => {
    const v = sequence[i % sequence.length]!
    i++
    return v
  }
}

afterEach(() => resetRoller())

describe('general test', () => {
  it('rola 1d6 + spend vs DC padrão 4', () => {
    setRoller(fixedRoller(3))
    const r = gumshoe.rules!.roll!('general', { spend: 2 })!
    expect(r.rolls).toEqual([3])
    expect(r.total).toBe(5)
    expect(r.notation).toBe('1d6+2')
    expect(r.notes).toContain('sucesso')
    expect(r.notes).toContain('DC 4')
    expect(r.notes).toContain('gastou 2 do pool')
  })

  it('falha quando total < dificuldade', () => {
    setRoller(fixedRoller(2))
    const r = gumshoe.rules!.roll!('general', { difficulty: 5 })!
    expect(r.total).toBe(2)
    expect(r.notes).toContain('falha')
  })

  it('respeita difficulty customizada', () => {
    setRoller(fixedRoller(4))
    const r = gumshoe.rules!.roll!('general', { difficulty: 7 })!
    expect(r.notes).toContain('falha')
    expect(r.notes).toContain('DC 7')
  })

  it('marca 6 natural', () => {
    setRoller(fixedRoller(6))
    expect(gumshoe.rules!.roll!('check', {})!.notes).toContain('6 natural')
  })
})

describe('stability test', () => {
  it('é o general test marcado como teste de estabilidade', () => {
    setRoller(fixedRoller(5))
    const r = gumshoe.rules!.roll!('stability', { spend: 1, difficulty: 6 })!
    expect(r.total).toBe(6)
    expect(r.notes![0]).toBe('teste de Estabilidade')
    expect(r.notes).toContain('sucesso')
  })

  it('alias sanity faz a mesma rolagem', () => {
    setRoller(fixedRoller(4))
    const r = gumshoe.rules!.roll!('sanity', {})!
    expect(r.notes![0]).toBe('teste de Estabilidade')
  })
})

describe('damage roll', () => {
  it('1d6 com modificador', () => {
    setRoller(fixedRoller(3))
    const r = gumshoe.rules!.roll!('damage', { modifier: 2 })!
    expect(r.rolls).toEqual([3])
    expect(r.total).toBe(5)
  })

  it('nunca negativo (mod muito baixo)', () => {
    setRoller(fixedRoller(1))
    const r = gumshoe.rules!.roll!('damage', { modifier: -3 })!
    expect(r.total).toBe(0)
  })

  it('notação inclui modificador positivo', () => {
    setRoller(fixedRoller(4))
    expect(gumshoe.rules!.roll!('damage', { modifier: 1 })!.notation).toBe('1d6+1')
  })
})

describe('investigative spend', () => {
  it('não rola — só registra o gasto', () => {
    const s = investigativeSpend('Academic', 2)
    expect(s).toEqual({ ability: 'Academic', amount: 2, cost: 2 })
  })

  it('clampa amount em 0', () => {
    const s = investigativeSpend('Library Use', -1)
    expect(s.amount).toBe(0)
  })

  it('trunca decimais', () => {
    const s = investigativeSpend('Forensics', 2.7)
    expect(s.amount).toBe(2)
  })

  it('corta nomes muito longos', () => {
    const s = investigativeSpend('a'.repeat(100), 1)
    expect(s.ability.length).toBe(40)
  })
})

describe('system bundle', () => {
  it('expõe id, atribuição CC-BY 3.0 e estrutura básica', () => {
    expect(gumshoe.id).toBe('gumshoe')
    expect(gumshoe.attribution).toContain('Creative Commons Attribution 3.0')
    expect(gumshoe.dicePresets.length).toBeGreaterThan(0)
    expect(gumshoe.conditions.length).toBeGreaterThan(0)
    expect(gumshoe.trackerFields.find((f) => f.key === 'stability')).toBeDefined()
  })
})
