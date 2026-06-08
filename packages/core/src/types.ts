/**
 * Contrato comum para sistemas RPG plugáveis.
 *
 * Cada implementação (pacote separado) exporta um `System` e o consumidor
 * registra com `register()` deste pacote. O consumidor escolhe quais
 * sistemas instalar — `@lippelt/srd-core` por si só não traz nenhum.
 */

// ============================================================================
// Identidade
// ============================================================================

/**
 * ID estável de um sistema. Convenção: `<sistema>-<edição>` em kebab-case
 * (ex: `dnd5e-2014`, `lancer`, `vampire-v5`). Cada implementação define
 * o seu; conflitos entre pacotes registrados são erro.
 */
export type SystemId = string

// ============================================================================
// Notação de dados
// ============================================================================

/**
 * Preset de rolagem rápida — botões que aparecem no painel de dados,
 * adaptados ao sistema.
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
 */
export interface TrackerField {
  /** Chave estável usada na ficha (ex: 'ac', 'hunger'). */
  key: string
  /** Rótulo curto (4–8 chars) — vai num pill compacto no tracker. */
  label: string
  /** Tipo do valor — define UI (stepper, pair max/current, toggle). */
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

export interface SystemRules {
  /**
   * Rola uma checagem do sistema. `kind` é definido por cada sistema
   * (ex: 'attack', 'save', 'check', 'damage'). Retorna null se a mecânica
   * não existe no sistema.
   */
  roll?: (kind: string, params: Record<string, unknown>) => RollResult | null

  /**
   * Reduz dano conforme regras do sistema (resistência, vulnerabilidade,
   * imunidade, armadura, etc).
   */
  applyDamage?: (
    incoming: number,
    target: Record<string, unknown>,
  ) => { final: number; notes?: string[] }
}

// ============================================================================
// Hooks de geração de NPC (consumidos pelo @lippelt/srd-npcgen)
// ============================================================================

/** Família de geração de NPC. */
export type NpcGenFamily = 'd20' | 'pool'

/** Modelo de matemática d20 (proficiência tipo 5e/PF2 vs BAB tipo 3.5/PF1). */
export type D20AttackModel = 'proficiency' | 'bab'

/** Entrada que o npcgen passa a um gerador de pool externo (hook). */
export interface NpcGenInput {
  systemId: string
  level: number
  name?: string
  creatureType: string
  creatureSize: string
}

/**
 * Bloco que um `generatePool` retorna — as partes específicas do sistema. O
 * npcgen acopla o restante (criatura, família, systemId) ao redor disto.
 */
export interface NpcPoolBlock {
  /** Papel/arquétipo (string livre por sistema). */
  role: string
  /** Tier/nível (1..4). */
  tier: number
  /** Nome (se o gerador quiser definir; senão o npcgen gera). */
  name?: string
  /** Tracks principais (vida/estresse/sanidade/etc). */
  tracks: Record<string, { current: number; max: number }>
  /** Ataques/ações principais. */
  attacks: { name: string; damage: string; range?: string; notes?: string[] }[]
  /** Stats específicos do sistema (formato livre). */
  extra?: Record<string, unknown>
}

/**
 * Hooks opcionais para refinar a geração de NPCs por sistema. Quando o
 * `@lippelt/srd-npcgen` encontra um destes preenchidos em `System.npc`,
 * usa em vez dos defaults genéricos.
 *
 * Cada hook é puro e independente — implemente só os que fizerem sentido pra
 * mecânica do seu sistema. Sistemas FORA das famílias embutidas (d20 e os
 * pools daggerheart/candela/gumshoe) se plugam declarando `family` e, para
 * pool, um `generatePool` — o npcgen público nunca precisa conhecer o id.
 */
export interface SystemNpcHooks {
  /**
   * Família de geração. Opcional pros sistemas embutidos (o npcgen já sabe);
   * obrigatória pra um sistema externo/privado fora das listas embutidas.
   */
  family?: NpcGenFamily

  /**
   * Modelo de matemática pra um sistema d20 externo (quando `family` é 'd20'
   * e o id não é embutido). Ignorado pros embutidos.
   */
  model?: D20AttackModel

  /**
   * Gerador de NPC de pool do próprio sistema. Quando `family` é 'pool' e o
   * sistema não é embutido, o npcgen chama isto e acopla criatura/metadata em
   * volta — mantendo a separação (o npcgen público não importa o pacote).
   */
  generatePool?: (input: NpcGenInput) => NpcPoolBlock

  /**
   * Override da progressão de ataque (default 5e: prof = 2 + ⌊(lvl−1)/4⌋).
   *
   * PF2e/SF2e devem retornar `level + bônus de patente` (rank bonus):
   * trained +2, expert +4, master +6, legendary +8.
   *
   * `role` é o id do arquétipo (ex.: 'soldier', 'caster').
   */
  attackProgression?: (level: number, role: string) => number

  /**
   * Override da quantidade de dados de cantrip pra casters. Default 5e:
   * 1 (lvl 1-4) → 2 (5-10) → 3 (11-16) → 4 (17+).
   *
   * PF2e segue padrão diferente (heightening de cantrips a cada 2 níveis).
   */
  cantripDamageDice?: (level: number) => number

  /**
   * Lista canônica de perícias do sistema (snake-case ou camelCase). O
   * npcgen pode usar pra validar/expandir o set de perícias proficient
   * por arquétipo.
   */
  skills?: readonly string[]

  /**
   * Idiomas default pra um tipo de criatura no setting do sistema. Quando
   * preenchido, sobrescreve o default genérico do npcgen.
   *
   * Útil pra settings com idiomas exóticos (ex.: SF tem Vesk, Ysoki etc.).
   */
  defaultLanguages?: (creatureType: string) => string[]
}

// ============================================================================
// Sistema completo
// ============================================================================

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
  /** Hooks pra refinar a geração de NPCs (consumidos pelo @lippelt/srd-npcgen). */
  npc?: SystemNpcHooks
}
