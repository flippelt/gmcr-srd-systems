/**
 * @lippelt/srd-core — contrato + registry para sistemas RPG plugáveis.
 *
 * Padrão de uso (lado do consumidor):
 *
 *   import { register, getSystem } from '@lippelt/srd-core'
 *   import { dnd5e2014 } from '@lippelt/srd-dnd5e-2014'
 *
 *   register(dnd5e2014)
 *   const sys = getSystem('dnd5e-2014')  // System | null
 */

export type {
  System,
  SystemId,
  SystemRules,
  DicePreset,
  ConditionDef,
  TrackerField,
  RollResult,
} from './types.js'

export { validateSystem } from './validate.js'
export type { SystemValidationResult } from './validate.js'

import type { System, SystemId } from './types.js'

const registry = new Map<SystemId, System>()

/**
 * Registra um sistema. Idempotente: registrar o mesmo `system` (mesma
 * referência) duas vezes é no-op. Registrar uma instância DIFERENTE com
 * id já existente lança erro — proteção contra conflitos.
 */
export function register(system: System): void {
  const existing = registry.get(system.id)
  if (existing && existing !== system) {
    throw new Error(
      `[gmcr-srd-core] sistema "${system.id}" já registrado por outra instância`,
    )
  }
  registry.set(system.id, system)
}

/** Resolve um sistema pelo id, ou null se não registrado. */
export function getSystem(id: SystemId): System | null {
  return registry.get(id) ?? null
}

/** Lista os ids de sistemas atualmente registrados. */
export function listRegisteredSystems(): SystemId[] {
  return [...registry.keys()]
}

/** Remove todos os registros. Útil em testes; raro em produção. */
export function clearRegistry(): void {
  registry.clear()
}
