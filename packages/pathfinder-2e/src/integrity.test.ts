import { describe, it, expect } from 'vitest'
import { validateSystem } from '@lippelt/srd-core'
import { pathfinder2e } from './index.js'

// Guarda de dados: garante que este pacote cumpre o contrato System
// (ids/keys únicos, campos obrigatórios, kind de tracker válido, limites
// coerentes). Mesmo padrão para todo sistema novo.
describe('pathfinder-2e — integridade de dados', () => {
  it('cumpre o contrato System sem erros', () => {
    const result = validateSystem(pathfinder2e)
    expect(result.errors).toEqual([])
    expect(result.valid).toBe(true)
  })
})
