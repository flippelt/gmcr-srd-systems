import { afterEach, describe, expect, it } from 'vitest'
import {
  abilityMod,
  dnd5e2024,
  exhaustionPenalty,
  resetRoller,
  setRoller,
  spellAttackBonus,
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
  it('abilityMod', () => {
    expect(abilityMod(10)).toBe(0)
    expect(abilityMod(20)).toBe(5)
    expect(abilityMod(1)).toBe(-5)
  })

  it('spellSaveDC e spellAttackBonus', () => {
    expect(spellSaveDC(2, 3)).toBe(13)
    expect(spellAttackBonus(3, 4)).toBe(7)
  })

  it('exhaustionPenalty: −2 cumulativo, cap 10', () => {
    expect(exhaustionPenalty(0)).toBe(0)
    expect(exhaustionPenalty(1)).toBe(-2)
    expect(exhaustionPenalty(5)).toBe(-10)
    expect(exhaustionPenalty(10)).toBe(-20)
    expect(exhaustionPenalty(15)).toBe(-20) // clampado
    expect(exhaustionPenalty(-1)).toBe(0)
  })
})

describe('d20 com exhaustion', () => {
  it('aplica −2 por nível na rolagem', () => {
    setRoller(fixedRoller(15))
    const r = dnd5e2024.rules!.roll!('d20', { modifier: 3, exhaustion: 2 })!
    // mod efetivo = 3 + (-4) = -1; total = 15 - 1 = 14
    expect(r.total).toBe(14)
    expect(r.notes).toContain('exaustão 2 (-4)')
  })

  it('sem exhaustion = mesma rolagem do 5.1', () => {
    setRoller(fixedRoller(12))
    const r = dnd5e2024.rules!.roll!('d20', { modifier: 5 })!
    expect(r.total).toBe(17)
  })
})

describe('attack rolls', () => {
  it('acerta quando total ≥ AC', () => {
    setRoller(fixedRoller(15))
    const r = dnd5e2024.rules!.roll!('attack', { modifier: 5, targetAC: 18 })!
    expect(r.notes).toContain('acertou')
  })

  it('20 natural sempre crita', () => {
    setRoller(fixedRoller(20))
    expect(
      dnd5e2024.rules!.roll!('attack', { modifier: 0, targetAC: 30 })!.notes,
    ).toContain('acerto crítico')
  })

  it('1 natural sempre erra', () => {
    setRoller(fixedRoller(1))
    expect(
      dnd5e2024.rules!.roll!('attack', { modifier: 20, targetAC: 5 })!.notes,
    ).toContain('erro crítico')
  })

  it('exhaustion penaliza o ataque', () => {
    setRoller(fixedRoller(15))
    const r = dnd5e2024.rules!.roll!('attack', { modifier: 5, exhaustion: 1, targetAC: 18 })!
    // 15 + 5 - 2 = 18 → acerto na AC 18
    expect(r.total).toBe(18)
    expect(r.notes).toContain('exaustão 1 (-2)')
  })
})

describe('saving throws', () => {
  it('sucesso quando total ≥ DC', () => {
    setRoller(fixedRoller(12))
    const r = dnd5e2024.rules!.roll!('save', { modifier: 3, dc: 15 })!
    expect(r.notes).toContain('sucesso')
  })

  it('falha quando total < DC', () => {
    setRoller(fixedRoller(5))
    const r = dnd5e2024.rules!.roll!('save', { modifier: 1, dc: 15 })!
    expect(r.notes).toContain('falha')
  })
})

describe('damage rolls', () => {
  it('NdM+K normal', () => {
    setRoller(fixedRoller(3, 5))
    const r = dnd5e2024.rules!.roll!('damage', { count: 2, sides: 6, modifier: 2 })!
    expect(r.total).toBe(10)
  })

  it('crítico dobra os dados', () => {
    setRoller(fixedRoller(3, 4, 5, 6))
    const r = dnd5e2024.rules!.roll!('damage', {
      count: 2,
      sides: 6,
      modifier: 3,
      critical: true,
    })!
    expect(r.rolls).toHaveLength(4)
    expect(r.total).toBe(21)
  })
})

describe('applyDamage', () => {
  const apply = dnd5e2024.rules!.applyDamage!

  it('imunidade zera', () => {
    expect(apply(20, { type: 'fire', target: { immunity: ['fire'] } }).final).toBe(0)
  })

  it('resistência metade', () => {
    expect(apply(11, { type: 'cold', target: { resistance: ['cold'] } }).final).toBe(5)
  })

  it('vulnerabilidade dobra', () => {
    expect(apply(10, { type: 'thunder', target: { vulnerability: ['thunder'] } }).final).toBe(20)
  })
})

describe('system bundle', () => {
  it('id, atribuição CC-BY 4.0, SRD 5.2', () => {
    expect(dnd5e2024.id).toBe('dnd5e-2024')
    expect(dnd5e2024.attribution).toContain('System Reference Document 5.2')
    expect(dnd5e2024.attribution).toContain('CC-BY 4.0')
    expect(dnd5e2024.ruleVersion).toBe('SRD 5.2')
  })

  it('inclui exhaustion como condition única + 14 outras core', () => {
    const ids = dnd5e2024.conditions.map((c) => c.id)
    expect(ids).toContain('exhaustion')
    // Exhaustion na 5.2 é uma única entrada (vs 6 níveis discretos na 5.1).
    expect(ids.filter((id) => id.startsWith('exhaustion-'))).toHaveLength(0)
  })

  it('tracker fields inclui exhaustion 0..10', () => {
    const exh = dnd5e2024.trackerFields.find((f) => f.key === 'exhaustion')
    expect(exh).toBeDefined()
    expect(exh!.max).toBe(10)
  })
})
