import { describe, it, expect } from 'vitest'
import { validateSystem } from '@lippelt/srd-core'
import { lancer } from './index.js'

// Guarda de dados: garante que este pacote cumpre o contrato System
// (ids/keys únicos, campos obrigatórios, kind de tracker válido, limites
// coerentes). Mesmo padrão para todo sistema novo.
describe('lancer — integridade de dados', () => {
  it('cumpre o contrato System sem erros', () => {
    const result = validateSystem(lancer)
    expect(result.errors).toEqual([])
    expect(result.valid).toBe(true)
  })
})
