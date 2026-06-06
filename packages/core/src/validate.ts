/**
 * Validação de integridade de um `System`.
 *
 * Garante que um pacote de sistema cumpre o contrato antes de ser registrado:
 * campos obrigatórios presentes, ids/keys únicos e não-vazios, `kind` de
 * tracker válido e limites (min ≤ default ≤ max) coerentes. Pura — não
 * registra nada nem toca em estado global.
 *
 * Serve tanto para o consumidor (validar na hora de `register`) quanto como
 * rede de segurança nos testes de cada pacote de sistema.
 */
import type { System } from './types.js'

export interface SystemValidationResult {
  valid: boolean
  errors: string[]
}

// Ids estáveis: minúsculas, dígitos, hífen e ponto (ex.: 'dnd-3.5',
// 'pathfinder-2e', 'lancer'). Sem espaços nem maiúsculas.
const ID_RE = /^[a-z0-9][a-z0-9.-]*$/
const TRACKER_KINDS = new Set(['integer', 'maxCurrent', 'boolean'])

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.length > 0

export function validateSystem(sys: System): SystemValidationResult {
  const errors: string[] = []
  const check = (ok: boolean, msg: string) => {
    if (!ok) errors.push(msg)
  }

  // --- Identidade ---
  check(isNonEmptyString(sys?.id), 'id ausente ou vazio')
  if (isNonEmptyString(sys?.id)) {
    check(ID_RE.test(sys.id), `id "${sys.id}" deve ser minúsculo (a-z 0-9 . -), sem espaços`)
  }
  check(isNonEmptyString(sys?.name), 'name ausente ou vazio')
  check(isNonEmptyString(sys?.ruleVersion), 'ruleVersion ausente ou vazio')

  // --- Dice presets (id único; id/label/notation obrigatórios) ---
  if (!Array.isArray(sys?.dicePresets)) {
    errors.push('dicePresets deve ser um array')
  } else {
    const seen = new Set<string>()
    sys.dicePresets.forEach((p, i) => {
      check(isNonEmptyString(p?.id), `dicePresets[${i}].id ausente ou vazio`)
      check(isNonEmptyString(p?.label), `dicePresets[${i}].label ausente ou vazio`)
      check(isNonEmptyString(p?.notation), `dicePresets[${i}].notation ausente ou vazio`)
      if (isNonEmptyString(p?.id)) {
        check(!seen.has(p.id), `dicePresets: id duplicado "${p.id}"`)
        seen.add(p.id)
      }
    })
  }

  // --- Conditions (id único; id/label obrigatórios) ---
  if (!Array.isArray(sys?.conditions)) {
    errors.push('conditions deve ser um array')
  } else {
    const seen = new Set<string>()
    sys.conditions.forEach((c, i) => {
      check(isNonEmptyString(c?.id), `conditions[${i}].id ausente ou vazio`)
      check(isNonEmptyString(c?.label), `conditions[${i}].label ausente ou vazio`)
      if (isNonEmptyString(c?.id)) {
        check(!seen.has(c.id), `conditions: id duplicado "${c.id}"`)
        seen.add(c.id)
      }
    })
  }

  // --- Tracker fields (key única; kind válido; min ≤ default ≤ max) ---
  if (!Array.isArray(sys?.trackerFields)) {
    errors.push('trackerFields deve ser um array')
  } else {
    const seen = new Set<string>()
    sys.trackerFields.forEach((f, i) => {
      check(isNonEmptyString(f?.key), `trackerFields[${i}].key ausente ou vazio`)
      check(isNonEmptyString(f?.label), `trackerFields[${i}].label ausente ou vazio`)
      check(
        TRACKER_KINDS.has(f?.kind as string),
        `trackerFields[${i}] (${f?.key ?? '?'}): kind inválido "${f?.kind}"`,
      )
      if (isNonEmptyString(f?.key)) {
        check(!seen.has(f.key), `trackerFields: key duplicada "${f.key}"`)
        seen.add(f.key)
      }
      const { min, max, default: def } = f ?? {}
      if (typeof min === 'number' && typeof max === 'number') {
        check(min <= max, `trackerFields[${i}] (${f.key}): min (${min}) > max (${max})`)
      }
      if (typeof def === 'number') {
        if (typeof min === 'number') {
          check(def >= min, `trackerFields[${i}] (${f.key}): default (${def}) < min (${min})`)
        }
        if (typeof max === 'number') {
          check(def <= max, `trackerFields[${i}] (${f.key}): default (${def}) > max (${max})`)
        }
      }
    })
  }

  return { valid: errors.length === 0, errors }
}
