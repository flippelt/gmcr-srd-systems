/**
 * Integridade dos sistemas de pool: garante que os campos que o adapter
 * `toTrackerCombatant` emite em `fields` para um NPC de pool existem de fato
 * nos `trackerFields` declarados pelo pacote daquele sistema. Sem isso, o
 * tracker do GM Control Room receberia campos que o sistema não conhece.
 *
 * Importa os pacotes reais (daggerheart/candela/gumshoe) — daí o CI buildar
 * todos os pacotes antes dos testes.
 */
import { describe, it, expect } from 'vitest'
import type { System } from '@lippelt/srd-core'
import { daggerheart } from '@lippelt/srd-daggerheart'
import { candelaObscura } from '@lippelt/srd-candela-obscura'
import { gumshoe } from '@lippelt/srd-gumshoe'
import { generateNpc } from './generate'
import { toTrackerCombatant } from './adapters'
import { isPoolNpc } from './types'

const POOL_SYSTEMS: System[] = [daggerheart, candelaObscura, gumshoe]

describe('integridade pool: fields do tracker ⊆ trackerFields do sistema', () => {
  for (const system of POOL_SYSTEMS) {
    it(`${system.id}: todo campo emitido existe nos trackerFields do pacote`, () => {
      const declared = new Set(system.trackerFields.map((f) => f.key))
      // Várias seeds/níveis cobrem papéis e tiers diferentes do gerador.
      for (let seed = 1; seed <= 12; seed++) {
        const npc = generateNpc({ systemId: system.id, seed, level: (seed % 4) + 1 })
        expect(isPoolNpc(npc)).toBe(true)
        const combatant = toTrackerCombatant(npc)
        for (const key of Object.keys(combatant.fields)) {
          expect(
            declared.has(key),
            `${system.id}: campo "${key}" emitido pelo adapter não está em trackerFields`,
          ).toBe(true)
        }
      }
    })
  }
})
