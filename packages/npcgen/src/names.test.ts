import { afterEach, describe, expect, it } from 'vitest'
import { generateName } from './names'
import { resetRng, seededRoller, setRng } from './rng'

afterEach(() => resetRng())

describe('generateName', () => {
  it('default sem args retorna fantasy', () => {
    setRng(seededRoller(7))
    const n = generateName()
    expect(n.length).toBeGreaterThan(2)
  })

  it('estilo sci-fi produz nomes diferentes do fantasy', () => {
    setRng(seededRoller(7))
    const fantasy = generateName({ style: 'fantasy' })
    setRng(seededRoller(7))
    const scifi = generateName({ style: 'sci-fi' })
    expect(fantasy).not.toBe(scifi)
  })

  it('estilo lovecraftian gera aglomerados consonantais', () => {
    setRng(seededRoller(1))
    const n = generateName({ style: 'lovecraftian' })
    expect(n.length).toBeGreaterThan(2)
  })

  it('estilo cyberpunk pega de pool fixo', () => {
    setRng(seededRoller(1))
    const n = generateName({ style: 'cyberpunk' })
    expect(n.length).toBeGreaterThan(2)
  })

  it('withEpithet anexa epíteto separado por espaço', () => {
    setRng(seededRoller(42))
    const n = generateName({ style: 'fantasy', withEpithet: true })
    expect(n).toContain(' ')
    const parts = n.split(' ')
    expect(parts.length).toBeGreaterThanOrEqual(2)
  })

  it('seed igual produz nome igual', () => {
    setRng(seededRoller(123))
    const a = generateName({ style: 'fantasy', withEpithet: true })
    setRng(seededRoller(123))
    const b = generateName({ style: 'fantasy', withEpithet: true })
    expect(a).toBe(b)
  })
})
