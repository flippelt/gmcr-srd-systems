import { afterEach, describe, expect, it } from 'vitest'
import {
  abilityMod,
  dnd5e2014,
  resetRoller,
  setRoller,
  spellAttackBonus,
  spellSaveDC,
} from './dnd5e-2014.js'

/** Helper: cria um roller que devolve a sequência fixa, ciclando. */
function fixedRoller(...sequence: number[]): () => number {
  let i = 0
  return () => {
    const v = sequence[i % sequence.length]!
    i++
    return v
  }
}

afterEach(() => {
  resetRoller()
})

describe('ability scores', () => {
  it('calcula o modificador corretamente', () => {
    expect(abilityMod(10)).toBe(0)
    expect(abilityMod(11)).toBe(0)
    expect(abilityMod(12)).toBe(1)
    expect(abilityMod(8)).toBe(-1)
    expect(abilityMod(20)).toBe(5)
    expect(abilityMod(1)).toBe(-5)
  })

  it('calcula DC de feitiço (8 + prof + mod)', () => {
    expect(spellSaveDC(2, 3)).toBe(13)
    expect(spellSaveDC(4, 5)).toBe(17)
  })

  it('calcula bônus de ataque por feitiço (prof + mod)', () => {
    expect(spellAttackBonus(3, 4)).toBe(7)
  })
})

describe('d20 rolls', () => {
  it('rola um único d20 com modificador', () => {
    setRoller(fixedRoller(15))
    const r = dnd5e2014.rules!.roll!('d20', { modifier: 3 })!
    expect(r.rolls).toEqual([15])
    expect(r.total).toBe(18)
    expect(r.notation).toBe('1d20+3')
  })

  it('aplica vantagem pegando o maior dos dois', () => {
    setRoller(fixedRoller(7, 18))
    const r = dnd5e2014.rules!.roll!('d20', { advantage: true })!
    expect(r.rolls).toEqual([7, 18])
    expect(r.total).toBe(18)
    expect(r.notes).toContain('vantagem')
  })

  it('aplica desvantagem pegando o menor dos dois', () => {
    setRoller(fixedRoller(7, 18))
    const r = dnd5e2014.rules!.roll!('d20', { disadvantage: true })!
    expect(r.total).toBe(7)
    expect(r.notes).toContain('desvantagem')
  })

  it('cancela vantagem + desvantagem (rola um único d20)', () => {
    setRoller(fixedRoller(12))
    const r = dnd5e2014.rules!.roll!('d20', { advantage: true, disadvantage: true })!
    expect(r.rolls).toEqual([12])
    expect(r.notes).toContain('vantagem/desvantagem se cancelaram')
  })

  it('anota crítico natural (20) e falha crítica (1)', () => {
    setRoller(fixedRoller(20))
    expect(dnd5e2014.rules!.roll!('d20', {})!.notes).toContain('crítico natural')
    setRoller(fixedRoller(1))
    expect(dnd5e2014.rules!.roll!('d20', {})!.notes).toContain('falha crítica')
  })
})

describe('attack rolls', () => {
  it('acerta quando total >= AC', () => {
    setRoller(fixedRoller(15))
    const r = dnd5e2014.rules!.roll!('attack', { modifier: 5, targetAC: 18 })!
    expect(r.total).toBe(20)
    expect(r.notes).toContain('acertou')
  })

  it('erra quando total < AC', () => {
    setRoller(fixedRoller(5))
    const r = dnd5e2014.rules!.roll!('attack', { modifier: 2, targetAC: 18 })!
    expect(r.notes).toContain('errou')
  })

  it('natural 20 sempre acerta, mesmo abaixo da AC', () => {
    setRoller(fixedRoller(20))
    const r = dnd5e2014.rules!.roll!('attack', { modifier: 0, targetAC: 30 })!
    expect(r.notes).toContain('acerto crítico')
  })

  it('natural 1 sempre erra, mesmo com modificador alto', () => {
    setRoller(fixedRoller(1))
    const r = dnd5e2014.rules!.roll!('attack', { modifier: 20, targetAC: 5 })!
    expect(r.notes).toContain('erro crítico')
  })
})

describe('saving throws', () => {
  it('sucesso quando total >= DC', () => {
    setRoller(fixedRoller(12))
    const r = dnd5e2014.rules!.roll!('save', { modifier: 3, dc: 15 })!
    expect(r.notes).toContain('sucesso')
    expect(r.notes).toContain('DC 15')
  })

  it('falha quando total < DC', () => {
    setRoller(fixedRoller(5))
    const r = dnd5e2014.rules!.roll!('save', { modifier: 1, dc: 15 })!
    expect(r.notes).toContain('falha')
  })
})

describe('damage rolls', () => {
  it('rola NdM+K normalmente', () => {
    setRoller(fixedRoller(3, 5))
    const r = dnd5e2014.rules!.roll!('damage', { count: 2, sides: 6, modifier: 2 })!
    expect(r.rolls).toEqual([3, 5])
    expect(r.total).toBe(10) // 3+5+2
  })

  it('crítico dobra os dados mas mantém o modificador', () => {
    setRoller(fixedRoller(3, 4, 5, 6))
    const r = dnd5e2014.rules!.roll!('damage', {
      count: 2,
      sides: 6,
      modifier: 3,
      critical: true,
    })!
    expect(r.rolls).toHaveLength(4) // 2 * 2 dados
    expect(r.total).toBe(3 + 4 + 5 + 6 + 3) // 21
    expect(r.notes).toContain('dano crítico — dados dobrados')
  })

  it('dano nunca fica negativo (mod muito baixo)', () => {
    setRoller(fixedRoller(1))
    const r = dnd5e2014.rules!.roll!('damage', { count: 1, sides: 6, modifier: -10 })!
    expect(r.total).toBe(0)
  })
})

describe('applyDamage (resistance/vulnerability/immunity)', () => {
  const apply = dnd5e2014.rules!.applyDamage!

  it('imunidade zera o dano', () => {
    const r = apply(20, { type: 'fire', target: { immunity: ['fire'] } })
    expect(r.final).toBe(0)
    expect(r.notes).toContain('imune a fire')
  })

  it('resistência reduz pela metade (arredondando pra baixo)', () => {
    const r = apply(11, { type: 'cold', target: { resistance: ['cold'] } })
    expect(r.final).toBe(5)
    expect(r.notes).toContain('resistência a cold (metade)')
  })

  it('vulnerabilidade dobra', () => {
    const r = apply(10, { type: 'thunder', target: { vulnerability: ['thunder'] } })
    expect(r.final).toBe(20)
    expect(r.notes).toContain('vulnerabilidade a thunder (dobro)')
  })

  it('sem tipo nem target retorna o dano original', () => {
    const r = apply(7, {})
    expect(r.final).toBe(7)
    expect(r.notes).toEqual([])
  })
})

describe('system bundle', () => {
  it('expõe id, nome e atribuição CC-BY', () => {
    expect(dnd5e2014.id).toBe('dnd5e-2014')
    expect(dnd5e2014.name).toContain('5e')
    expect(dnd5e2014.attribution).toContain('CC-BY 4.0')
  })

  it('inclui as 14 condições core da SRD 5.1 (sem exaustão) + 6 níveis de exaustão', () => {
    const ids = dnd5e2014.conditions.map((c) => c.id)
    expect(ids).toContain('charmed')
    expect(ids).toContain('frightened')
    expect(ids).toContain('grappled')
    expect(ids).toContain('paralyzed')
    expect(ids.filter((id) => id.startsWith('exhaustion-'))).toHaveLength(6)
  })

  it('inclui campos de tracker AC e death saves', () => {
    const keys = dnd5e2014.trackerFields.map((f) => f.key)
    expect(keys).toContain('ac')
    expect(keys).toContain('deathSuccesses')
    expect(keys).toContain('deathFailures')
  })
})
