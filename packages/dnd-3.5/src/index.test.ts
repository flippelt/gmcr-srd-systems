import { afterEach, describe, expect, it } from 'vitest'
import { abilityMod, dnd35, resetRoller, setRoller, spellSaveDC } from './index.js'

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
    expect(abilityMod(10)).toBe(0)
    expect(abilityMod(20)).toBe(5)
    expect(abilityMod(7)).toBe(-2)
  })
  it('spellSaveDC: 10 + level + mod', () => {
    expect(spellSaveDC(3, 4)).toBe(17)
  })
})

describe('d20 rolls', () => {
  it('rola d20 + mod', () => {
    setRoller(fixedRoller(14))
    const r = dnd35.rules!.roll!('d20', { modifier: 3 })!
    expect(r.total).toBe(17)
    expect(r.notation).toBe('1d20+3')
  })

  it('anota 20 e 1 natural', () => {
    setRoller(fixedRoller(20))
    expect(dnd35.rules!.roll!('d20', {})!.notes).toContain('20 natural')
    setRoller(fixedRoller(1))
    expect(dnd35.rules!.roll!('d20', {})!.notes).toContain('1 natural')
  })
})

describe('attack rolls', () => {
  it('acerta quando total ≥ AC', () => {
    setRoller(fixedRoller(15))
    const r = dnd35.rules!.roll!('attack', { modifier: 5, targetAC: 18 })!
    expect(r.notes).toContain('acertou')
  })

  it('20 natural é crítico automático', () => {
    setRoller(fixedRoller(20))
    const r = dnd35.rules!.roll!('attack', { modifier: 0, targetAC: 50 })!
    expect(r.notes).toContain('acerto crítico (20 natural)')
  })

  it('1 natural sempre erra', () => {
    setRoller(fixedRoller(1))
    const r = dnd35.rules!.roll!('attack', { modifier: 50, targetAC: 5 })!
    expect(r.notes).toContain('erro automático (1 natural)')
  })

  it('critRange estendido marca ameaça de crítico', () => {
    setRoller(fixedRoller(18))
    const r = dnd35.rules!.roll!('attack', { modifier: 5, targetAC: 15, critRange: 18 })!
    expect(r.notes!.some((n) => n.startsWith('ameaça'))).toBe(true)
  })
})

describe('saving throws', () => {
  it('20 natural sempre passa, mesmo abaixo do DC', () => {
    setRoller(fixedRoller(20))
    const r = dnd35.rules!.roll!('save', { modifier: 0, dc: 30 })!
    expect(r.notes).toContain('sucesso')
  })

  it('1 natural sempre falha', () => {
    setRoller(fixedRoller(1))
    const r = dnd35.rules!.roll!('save', { modifier: 20, dc: 5 })!
    expect(r.notes).toContain('falha')
  })

  it('comparação normal entre 2-19', () => {
    setRoller(fixedRoller(12))
    const r = dnd35.rules!.roll!('save', { modifier: 3, dc: 15 })!
    expect(r.notes).toContain('sucesso')
  })
})

describe('damage rolls', () => {
  it('NdM+K normal sem crítico', () => {
    setRoller(fixedRoller(3, 5))
    const r = dnd35.rules!.roll!('damage', { count: 2, sides: 6, modifier: 2 })!
    expect(r.total).toBe(10)
  })

  it('crítico ×2 dobra dados e modificador', () => {
    setRoller(fixedRoller(4, 4, 4, 4))
    const r = dnd35.rules!.roll!('damage', { count: 2, sides: 6, modifier: 3, critMultiplier: 2 })!
    expect(r.rolls).toHaveLength(4)
    expect(r.total).toBe(4 + 4 + 4 + 4 + 6) // 16 dice + 6 mod (×2)
  })

  it('crítico ×3 triplica', () => {
    setRoller(fixedRoller(5, 5, 5))
    const r = dnd35.rules!.roll!('damage', { count: 1, sides: 6, modifier: 2, critMultiplier: 3 })!
    expect(r.rolls).toHaveLength(3)
    expect(r.total).toBe(15 + 6)
  })
})

describe('system bundle', () => {
  it('expõe id, OGL atribuição', () => {
    expect(dnd35.id).toBe('dnd-3.5')
    expect(dnd35.attribution).toContain('Open Game License')
    expect(dnd35.attribution).toContain('System Reference Document 3.5')
  })

  it('inclui conditions clássicas do 3.5', () => {
    const ids = dnd35.conditions.map((c) => c.id)
    expect(ids).toContain('cowering')
    expect(ids).toContain('dying')
    expect(ids).toContain('panicked')
    expect(ids).toContain('shaken')
  })

  it('tracker fields fort/ref/will/bab', () => {
    const keys = dnd35.trackerFields.map((f) => f.key)
    expect(keys).toEqual(['ac', 'fort', 'ref', 'will', 'bab'])
  })
})
