/**
 * Contrato comum para todos os sistemas RPG suportados.
 *
 * Princípios:
 *  - Tudo aqui é DEFAULTS e LÓGICA — sem estado, sem efeitos colaterais.
 *  - A UI (gm-control-room) consome via `Campaign.system` → `getSystem(id)`.
 *  - Os módulos por sistema são pequenos e auto-contidos; conteúdo
 *    proprietário fica em pacotes privados separados.
 */

// ============================================================================
// Identidade
// ============================================================================

/** Identificadores estáveis de sistemas. Adicionar novos aqui. */
export type SystemId =
  | 'dnd5e-2014'
  | 'dnd5e-2024'
  | 'lancer'
  | 'gumshoe-trail'
  | 'vampire-v5'
  | 'blade-runner'
  | 'fallout-2d20'
  | 'wng'
  | 'imperium-maledictum'
  | 'cyberpunk-red'

// ============================================================================
// Notação de dados
// ============================================================================

/**
 * Preset de rolagem rápida — botões que aparecem no painel de dados,
 * adaptados ao sistema (ex: D&D mostra d20+mod; V5 mostra pool de d10).
 */
export interface DicePreset {
  /** Identificador único dentro do sistema. */
  id: string
  /** Texto exibido no botão (curto: "d20+mod", "Pool", "Hunger"). */
  label: string
  /** Notação a rolar (formato GM Control Room: NdM+K, ou string especial). */
  notation: string
  /** Categoria — ajuda a agrupar visualmente (ex: 'attack', 'save', 'damage'). */
  category?: string
  /** Descrição expandida pra tooltip. */
  description?: string
}

// ============================================================================
// Condições / status
// ============================================================================

/**
 * Condição/status disponível no sistema. O nome é o que aparece no
 * tracker; a descrição pode aparecer em tooltip.
 */
export interface ConditionDef {
  /** ID estável (snake-case, ex: 'frightened'). */
  id: string
  /** Nome de exibição (ex: 'Frightened', 'Amedrontado'). */
  label: string
  /** Resumo do efeito mecânico (uma linha). */
  summary?: string
}

// ============================================================================
// Tracker
// ============================================================================

/**
 * Definição de um campo numérico extra no tracker do sistema
 * (além dos genéricos initiative/hp).
 *
 * Exemplos:
 *  - D&D: AC (armor class, 1–30)
 *  - Lancer: Structure (1–4), Stress (1–4)
 *  - V5: Hunger (0–5)
 *  - W&G: Wounds (current/max)
 */
export interface TrackerField {
  /** Chave estável usada na ficha (ex: 'ac', 'hunger'). */
  key: string
  /** Rótulo curto (4–8 chars) — vai num pill compacto no tracker. */
  label: string
  /** Tipo do valor — define UI (stepper, slider, pair max/current). */
  kind: 'integer' | 'maxCurrent' | 'boolean'
  /** Faixa válida (inclusiva). */
  min?: number
  max?: number
  /** Valor inicial pra novos combatentes. */
  default?: number
  /** Descrição/tooltip. */
  description?: string
}

// ============================================================================
// Regras automatizadas (hooks puros)
// ============================================================================

/**
 * Resultado de uma rolagem com modificações de sistema aplicadas
 * (ex: advantage no D&D pega o maior de 2d20).
 */
export interface RollResult {
  /** Rolagens individuais (todos os dados antes de filtragem). */
  rolls: number[]
  /** Modificador somado ao total. */
  modifier: number
  /** Total final. */
  total: number
  /** Notação humana do que foi rolado. */
  notation: string
  /** Anotações estruturadas (ex: 'crit', 'fumble', 'advantage'). */
  notes?: string[]
}

/**
 * Hooks que um sistema PODE implementar. Todos opcionais —
 * sistemas simples só precisam de presets/conditions/tracker.
 */
export interface SystemRules {
  /**
   * Rola uma checagem do sistema com mecânica própria.
   * O `kind` é definido por cada sistema (ex: 'attack', 'save', 'check', 'damage').
   * Retorna null se o sistema não tem essa mecânica.
   */
  roll?: (kind: string, params: Record<string, unknown>) => RollResult | null

  /**
   * Reduz dano conforme regras do sistema (resistência, vulnerabilidade,
   * imunidade, armadura, etc).
   */
  applyDamage?: (incoming: number, target: Record<string, unknown>) => {
    final: number
    notes?: string[]
  }
}

// ============================================================================
// Sistema completo
// ============================================================================

/**
 * O bundle completo de um sistema RPG. Forma estável que a UI consome.
 */
export interface System {
  id: SystemId
  /** Nome humano (ex: "Dungeons & Dragons 5e (2014)"). */
  name: string
  /** Versão da regra/SRD (ex: "SRD 5.1"). */
  ruleVersion: string
  /** Atribuição obrigatória (se vier de SRD CC-BY etc). Vazio = MIT puro. */
  attribution?: string
  /** Botões rápidos de rolagem que aparecem na UI. */
  dicePresets: DicePreset[]
  /** Condições/status pra autocomplete no tracker. */
  conditions: ConditionDef[]
  /** Campos extras do tracker (além de initiative/hp genéricos). */
  trackerFields: TrackerField[]
  /** Regras automatizáveis (opcionais). */
  rules?: SystemRules
}
