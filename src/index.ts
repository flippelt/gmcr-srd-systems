/**
 * Entrypoint principal — exporta o contrato e um registry de sistemas
 * conhecidos (carregados sob demanda).
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

import type { System, SystemId } from './types.js'

/**
 * Resolve um sistema pelo id. Cada sistema é importado dinamicamente
 * pra que o consumidor só carregue o que usa (tree-shaking + lazy).
 *
 * Sistemas não suportados ainda retornam null.
 */
export async function getSystem(id: SystemId): Promise<System | null> {
  switch (id) {
    case 'dnd5e-2014': {
      const mod = await import('./systems/dnd5e-2014.js')
      return mod.dnd5e2014
    }
    default:
      return null
  }
}

/** Lista os ids de sistemas com implementação disponível. */
export function availableSystems(): SystemId[] {
  return ['dnd5e-2014']
}
