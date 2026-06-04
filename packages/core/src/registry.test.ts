import { afterEach, describe, expect, it } from 'vitest'
import type { System } from './types.js'
import { clearRegistry, getSystem, listRegisteredSystems, register } from './index.js'

const sample: System = {
  id: 'test-sys',
  name: 'Test System',
  ruleVersion: '0.0',
  dicePresets: [],
  conditions: [],
  trackerFields: [],
}

const other: System = {
  id: 'test-sys',
  name: 'Test System (impostor)',
  ruleVersion: '0.0',
  dicePresets: [],
  conditions: [],
  trackerFields: [],
}

afterEach(() => clearRegistry())

describe('registry', () => {
  it('retorna null para sistema não registrado', () => {
    expect(getSystem('inexistente')).toBeNull()
  })

  it('registra e resolve por id', () => {
    register(sample)
    expect(getSystem('test-sys')).toBe(sample)
  })

  it('registrar a mesma instância duas vezes é no-op', () => {
    register(sample)
    register(sample) // não lança
    expect(listRegisteredSystems()).toEqual(['test-sys'])
  })

  it('registrar instância diferente com mesmo id lança erro', () => {
    register(sample)
    expect(() => register(other)).toThrowError(/já registrado/)
  })

  it('listRegisteredSystems devolve todos os ids', () => {
    register(sample)
    register({ ...sample, id: 'outro' })
    expect(listRegisteredSystems().sort()).toEqual(['outro', 'test-sys'])
  })

  it('clearRegistry esvazia', () => {
    register(sample)
    clearRegistry()
    expect(listRegisteredSystems()).toEqual([])
    expect(getSystem('test-sys')).toBeNull()
  })
})
