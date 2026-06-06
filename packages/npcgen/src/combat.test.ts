import { describe, it, expect } from 'vitest'
import {
  attackCount,
  buildAttacks,
  damageDiceCount,
  formatDamage,
  getBenchmark,
} from './combat'
import { ROLES } from './data'

describe('attackCount', () => {
  it('marciais (proficiency) ganham extra attack em 5/11/20', () => {
    expect(attackCount('soldier', 'proficiency', 1)).toBe(1)
    expect(attackCount('soldier', 'proficiency', 4)).toBe(1)
    expect(attackCount('soldier', 'proficiency', 5)).toBe(2)
    expect(attackCount('soldier', 'proficiency', 10)).toBe(2)
    expect(attackCount('soldier', 'proficiency', 11)).toBe(3)
    expect(attackCount('soldier', 'proficiency', 19)).toBe(3)
    expect(attackCount('soldier', 'proficiency', 20)).toBe(4)
  })

  it('marciais (bab) ganham iterativos em 6/11/16', () => {
    expect(attackCount('brute', 'bab', 5)).toBe(1)
    expect(attackCount('brute', 'bab', 6)).toBe(2)
    expect(attackCount('brute', 'bab', 10)).toBe(2)
    expect(attackCount('brute', 'bab', 11)).toBe(3)
    expect(attackCount('brute', 'bab', 15)).toBe(3)
    expect(attackCount('brute', 'bab', 16)).toBe(4)
    expect(attackCount('brute', 'bab', 20)).toBe(4)
  })

  it('caster sempre 1 ataque (escala via dados, não via qtd)', () => {
    expect(attackCount('caster', 'proficiency', 1)).toBe(1)
    expect(attackCount('caster', 'proficiency', 20)).toBe(1)
    expect(attackCount('caster', 'bab', 11)).toBe(1)
  })

  it('leader: 1 ataque até nível 4, 2 a partir do 5', () => {
    expect(attackCount('leader', 'proficiency', 4)).toBe(1)
    expect(attackCount('leader', 'proficiency', 5)).toBe(2)
    expect(attackCount('leader', 'bab', 20)).toBe(2)
  })

  it('minion sempre 1', () => {
    expect(attackCount('minion', 'proficiency', 1)).toBe(1)
    expect(attackCount('minion', 'proficiency', 20)).toBe(1)
  })
})

describe('damageDiceCount', () => {
  it('caster escala como cantrip 5e (1/2/3/4 em 1/5/11/17)', () => {
    expect(damageDiceCount('caster', 1)).toBe(1)
    expect(damageDiceCount('caster', 4)).toBe(1)
    expect(damageDiceCount('caster', 5)).toBe(2)
    expect(damageDiceCount('caster', 10)).toBe(2)
    expect(damageDiceCount('caster', 11)).toBe(3)
    expect(damageDiceCount('caster', 16)).toBe(3)
    expect(damageDiceCount('caster', 17)).toBe(4)
    expect(damageDiceCount('caster', 20)).toBe(4)
  })

  it('brute ganha um dado extra no nível 11', () => {
    expect(damageDiceCount('brute', 10)).toBe(1)
    expect(damageDiceCount('brute', 11)).toBe(2)
    expect(damageDiceCount('brute', 20)).toBe(2)
  })

  it('outros marciais ficam em 1 dado', () => {
    expect(damageDiceCount('soldier', 1)).toBe(1)
    expect(damageDiceCount('soldier', 20)).toBe(1)
    expect(damageDiceCount('archer', 15)).toBe(1)
  })

  it('minion/leader: 1 dado', () => {
    expect(damageDiceCount('minion', 20)).toBe(1)
    expect(damageDiceCount('leader', 20)).toBe(1)
  })
})

describe('formatDamage', () => {
  it('sem modificador omite o "+0"', () => {
    expect(formatDamage(1, 8, 0)).toBe('1d8')
    expect(formatDamage(2, 6, 0)).toBe('2d6')
  })
  it('modificador positivo com "+"', () => {
    expect(formatDamage(1, 8, 3)).toBe('1d8+3')
  })
  it('modificador negativo com "-"', () => {
    expect(formatDamage(1, 8, -1)).toBe('1d8-1')
  })
})

describe('buildAttacks (proficiency model)', () => {
  it('todos os ataques têm o mesmo bônus (5e Extra Attack)', () => {
    // soldier nível 11: 3 ataques; STR mod 2; prof +4 → bônus +6
    const atks = buildAttacks('soldier', ROLES.soldier, 'proficiency', 11, 2, 4)
    expect(atks).toHaveLength(3)
    expect(atks.every((a) => a.bonus === 6)).toBe(true)
    expect(atks.every((a) => a.damage === '1d8+2')).toBe(true)
  })

  it('brute nível 11: dano usa 2 dados (escala)', () => {
    const atks = buildAttacks('brute', ROLES.brute, 'proficiency', 11, 3, 4)
    expect(atks[0]!.damage).toBe('2d10+3')
  })

  it('caster nível 11: 1 ataque, 3 dados (escala cantrip)', () => {
    const atks = buildAttacks('caster', ROLES.caster, 'proficiency', 11, 4, 4)
    expect(atks).toHaveLength(1)
    expect(atks[0]!.damage).toBe('3d8+4')
  })
})

describe('buildAttacks (bab model — iterativos)', () => {
  it('BAB 11 (3.5/PF1) gera 3 ataques: BAB, BAB−5, BAB−10', () => {
    // brute nível 11, BAB 11, STR mod +3 → bônus +14 / +9 / +4
    const atks = buildAttacks('brute', ROLES.brute, 'bab', 11, 3, 11)
    expect(atks).toHaveLength(3)
    expect(atks[0]!.bonus).toBe(14)
    expect(atks[1]!.bonus).toBe(9)
    expect(atks[2]!.bonus).toBe(4)
  })

  it('todos os iterativos compartilham o mesmo dano', () => {
    const atks = buildAttacks('archer', ROLES.archer, 'bab', 6, 2, 6)
    expect(atks.every((a) => a.damage === atks[0]!.damage)).toBe(true)
  })
})

describe('getBenchmark', () => {
  it('retorna stats esperados pra nível 5', () => {
    const b = getBenchmark(5)
    expect(b.level).toBe(5)
    expect(b.hp).toBe(115)
    expect(b.ac).toBe(15)
    expect(b.attackBonus).toBe(6)
    expect(b.damagePerRound).toBe(33)
  })

  it('aplica clamp em níveis fora do range', () => {
    expect(getBenchmark(0).level).toBe(1)
    expect(getBenchmark(99).level).toBe(20)
    expect(getBenchmark(-5).hp).toBe(22)
  })

  it('HP/CA crescem monotonicamente', () => {
    let prevHp = 0
    let prevAc = 0
    for (let lvl = 1; lvl <= 20; lvl++) {
      const b = getBenchmark(lvl)
      expect(b.hp).toBeGreaterThanOrEqual(prevHp)
      expect(b.ac).toBeGreaterThanOrEqual(prevAc)
      prevHp = b.hp
      prevAc = b.ac
    }
  })
})
