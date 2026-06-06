import { describe, expect, it } from 'vitest'
import type { System } from './types.js'
import { validateSystem } from './index.js'

// Sistema mínimo e válido — ponto de partida que cada teste estraga de um jeito.
const valid: System = {
  id: 'test-sys',
  name: 'Test System',
  ruleVersion: 'SRD 1.0',
  dicePresets: [{ id: 'atk', label: 'Ataque', notation: '1d20+5' }],
  conditions: [{ id: 'prone', label: 'Prone' }],
  trackerFields: [{ key: 'ac', label: 'CA', kind: 'integer', min: 0, max: 40, default: 10 }],
}

describe('validateSystem', () => {
  it('aprova um sistema bem-formado', () => {
    expect(validateSystem(valid)).toEqual({ valid: true, errors: [] })
  })

  it('aceita id com ponto/hífen (ex.: dnd-3.5)', () => {
    expect(validateSystem({ ...valid, id: 'dnd-3.5' }).valid).toBe(true)
  })

  it('reprova id ausente, vazio ou com maiúscula/espaço', () => {
    expect(validateSystem({ ...valid, id: '' }).valid).toBe(false)
    expect(validateSystem({ ...valid, id: 'DnD 5e' }).errors.join()).toMatch(/minúsculo/)
  })

  it('exige name e ruleVersion', () => {
    expect(validateSystem({ ...valid, name: '' }).errors.join()).toMatch(/name/)
    expect(validateSystem({ ...valid, ruleVersion: '' }).errors.join()).toMatch(/ruleVersion/)
  })

  it('detecta dicePreset com id duplicado', () => {
    const r = validateSystem({
      ...valid,
      dicePresets: [
        { id: 'atk', label: 'A', notation: '1d20' },
        { id: 'atk', label: 'B', notation: '1d20' },
      ],
    })
    expect(r.valid).toBe(false)
    expect(r.errors.join()).toMatch(/dicePresets: id duplicado "atk"/)
  })

  it('exige id/label/notation em cada dicePreset', () => {
    const r = validateSystem({
      ...valid,
      dicePresets: [{ id: '', label: '', notation: '' }],
    })
    expect(r.errors.length).toBeGreaterThanOrEqual(3)
  })

  it('detecta condition com id duplicado', () => {
    const r = validateSystem({
      ...valid,
      conditions: [
        { id: 'prone', label: 'A' },
        { id: 'prone', label: 'B' },
      ],
    })
    expect(r.errors.join()).toMatch(/conditions: id duplicado "prone"/)
  })

  it('detecta trackerField com key duplicada', () => {
    const r = validateSystem({
      ...valid,
      trackerFields: [
        { key: 'ac', label: 'CA', kind: 'integer' },
        { key: 'ac', label: 'CA2', kind: 'integer' },
      ],
    })
    expect(r.errors.join()).toMatch(/trackerFields: key duplicada "ac"/)
  })

  it('reprova kind de tracker inválido', () => {
    const r = validateSystem({
      ...valid,
      // @ts-expect-error kind fora do contrato, de propósito
      trackerFields: [{ key: 'x', label: 'X', kind: 'float' }],
    })
    expect(r.errors.join()).toMatch(/kind inválido/)
  })

  it('valida limites min ≤ default ≤ max', () => {
    expect(
      validateSystem({
        ...valid,
        trackerFields: [{ key: 'x', label: 'X', kind: 'integer', min: 5, max: 1 }],
      }).errors.join(),
    ).toMatch(/min \(5\) > max/)

    expect(
      validateSystem({
        ...valid,
        trackerFields: [{ key: 'x', label: 'X', kind: 'integer', min: 0, max: 10, default: 99 }],
      }).errors.join(),
    ).toMatch(/default \(99\) > max/)
  })

  it('reprova arrays ausentes', () => {
    // @ts-expect-error campos obrigatórios omitidos de propósito
    const r = validateSystem({ id: 'x', name: 'X', ruleVersion: '1' })
    expect(r.valid).toBe(false)
    expect(r.errors.join()).toMatch(/dicePresets deve ser um array/)
  })
})
