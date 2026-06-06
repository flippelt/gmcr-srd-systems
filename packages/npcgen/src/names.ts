/**
 * Geração de nomes com estilos por gênero/tema + epítetos opcionais.
 *
 * Estilos:
 * - `fantasy` (default): sílabas medievais (Korak, Var-an, Mor-ix).
 * - `sci-fi`: nomes neutros com pegada técnica (Vex-7, Nyari-Or).
 * - `lovecraftian`: aglomerados consonantais (Kthun, Yog'shar).
 * - `cyberpunk`: handles/aliases curtos (Razor, V1per, Sable).
 * - `plain`: NAME_PREFIX só (curto, sem flair).
 */

import { pick } from './rng'
import { NAME_PREFIX, NAME_MIDDLE, NAME_SUFFIX } from './data'
import type { NameStyle } from './types'

// ============================================================================
// Pools por estilo
// ============================================================================

const SCIFI_PREFIX = [
  'Vex', 'Nyari', 'Kael', 'Zera', 'Orin', 'Tyr', 'Xen', 'Solas', 'Lin', 'Drex',
  'Aurix', 'Yev', 'Rho', 'Mira', 'Tess', 'Cael',
]
const SCIFI_SUFFIX = [
  '-7', '-9', '-12', '-X', '-Or', 'an', 'is', 'ar', 'el', 'ix', 'os', 'us',
]

const LOVECRAFTIAN_PREFIX = [
  'Yog', 'Kth', 'Sh', 'Nyarl', 'Zha', 'Cthu', 'Hast', 'Azath', 'Dag', 'Nyo',
  'Tsath', 'Yth', 'Glaa', 'Ub',
]
const LOVECRAFTIAN_SUFFIX = [
  'un', "'shar", 'lhu', 'gua', 'oth', 'oggua', 'iggurath', 'oth', 'igg', 'thoth',
  'lagn', 'azhi',
]

const CYBERPUNK_NAMES = [
  'Razor', 'V1per', 'Sable', 'Tek', 'Glitch', 'Nyx', 'Whisper', 'Vox', 'Echo',
  'Lynx', 'Murk', 'Static', 'Phase', 'Crow', 'Sable', 'Wraith', 'Specter',
  'Riot', 'Halo', 'Quill', 'Cypher',
]

// ============================================================================
// Epítetos (sufixo opcional tipo "Korak o Astuto")
// ============================================================================

const EPITHETS_FANTASY = [
  'o Astuto', 'o Implacável', 'da Lâmina Negra', 'do Vento', 'a Sombria',
  'o Pálido', 'da Torre', 'o Sem-Nome', 'a Indomável', 'o Verdadeiro',
  'das Cinzas', 'do Norte', 'a Eterna', 'o Tatuado', 'da Cova',
  'o Sangrento', 'a Silenciosa', 'do Crepúsculo', 'o Velho', 'a Rebelde',
]

const EPITHETS_SCIFI = [
  'unidade 4', 'Operativo-A', 'Pilot-X', 'Engenheiro-Chefe', 'do Setor 9',
  'reativada', 'do Drift', 'da Estação', 'Replicante', 'Construct',
]

const EPITHETS_LOVECRAFTIAN = [
  'o Sussurrador', 'devorador de tronos', 'que aguarda', 'além do limiar',
  'sem-rosto', 'o Vasto', 'o Latente', 'cantador no abismo',
]

const EPITHETS_CYBERPUNK = [
  'merc', 'fixer', 'netrunner', 'corp', 'street samurai', 'edgerunner',
  'rocker', 'medtech', 'nomad', 'tech-priest',
]

// ============================================================================
// Geração
// ============================================================================

function fantasyName(): string {
  return pick(NAME_PREFIX) + pick(NAME_MIDDLE) + pick(NAME_SUFFIX)
}

function scifiName(): string {
  return pick(SCIFI_PREFIX) + pick(SCIFI_SUFFIX)
}

function lovecraftianName(): string {
  return pick(LOVECRAFTIAN_PREFIX) + pick(LOVECRAFTIAN_SUFFIX)
}

function cyberpunkName(): string {
  return pick(CYBERPUNK_NAMES)
}

function plainName(): string {
  return pick(NAME_PREFIX)
}

function pickEpithet(style: NameStyle): string {
  switch (style) {
    case 'sci-fi':
      return pick(EPITHETS_SCIFI)
    case 'lovecraftian':
      return pick(EPITHETS_LOVECRAFTIAN)
    case 'cyberpunk':
      return pick(EPITHETS_CYBERPUNK)
    case 'plain':
    case 'fantasy':
    default:
      return pick(EPITHETS_FANTASY)
  }
}

export interface NameOptions {
  style?: NameStyle
  /** Anexa um epíteto/título ao nome ("Korak o Astuto"). Default false. */
  withEpithet?: boolean
}

/**
 * Gera um nome curto. Backward-compatible: chamado sem argumentos retorna o
 * estilo fantasy original (mesmo formato pré-v0.1.3).
 */
export function generateName(opts: NameOptions = {}): string {
  const style: NameStyle = opts.style ?? 'fantasy'
  let base: string
  switch (style) {
    case 'sci-fi':
      base = scifiName()
      break
    case 'lovecraftian':
      base = lovecraftianName()
      break
    case 'cyberpunk':
      base = cyberpunkName()
      break
    case 'plain':
      base = plainName()
      break
    case 'fantasy':
    default:
      base = fantasyName()
  }
  if (opts.withEpithet) {
    return `${base} ${pickEpithet(style)}`
  }
  return base
}
