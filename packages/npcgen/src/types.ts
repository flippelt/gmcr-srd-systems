export type Ability = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'

export const ABILITIES: Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

/** Mapa com as 6 chaves de atributo sempre presentes (evita index signature
 *  para conviver com noUncheckedIndexedAccess). */
export interface AbilityMap<T> {
  str: T
  dex: T
  con: T
  int: T
  wis: T
  cha: T
}

export interface AbilityScore {
  score: number
  mod: number
}

export type AbilityScores = AbilityMap<AbilityScore>

export type NpcRole =
  | 'brute'
  | 'soldier'
  | 'skirmisher'
  | 'archer'
  | 'caster'
  | 'leader'
  | 'lurker'
  | 'minion'

export type AbilityMethod = 'standard' | 'elite' | 'rolled' | 'average'

/** Modelo de progressão de ataque/resistência da família d20. */
export type D20Model = 'proficiency' | 'bab'

/** Família de geração de NPC. */
export type NpcGenFamily = 'd20' | 'pool'

/** Entrada passada a um gerador de pool externo (hook `generatePool`). */
export interface NpcGenInput {
  systemId: string
  level: number
  name?: string
  creatureType: CreatureType
  creatureSize: CreatureSize
}

/**
 * Bloco específico do sistema que um `generatePool` retorna; o npcgen acopla
 * criatura/família/systemId em volta para formar o `PoolGeneratedNpc`.
 */
export interface NpcPoolBlock {
  role: string
  tier: number
  name?: string
  tracks: Record<string, PoolTrack>
  attacks: PoolAttack[]
  extra?: Record<string, unknown>
}

/**
 * Hooks opcionais pra refinar a geração por sistema. Espelha o
 * `SystemNpcHooks` do `@lippelt/srd-core` (declarado aqui pra evitar dep
 * obrigatória — o consumidor passa o objeto via `NpcOptions.npc`).
 *
 * Sistemas fora das famílias embutidas (d20 e os pools daggerheart/candela/
 * gumshoe) se plugam declarando `family` e, para pool, `generatePool`.
 */
export interface NpcGenHooks {
  /** Família de um sistema externo (não-embutido). */
  family?: NpcGenFamily
  /** Modelo d20 de um sistema d20 externo. */
  model?: D20Model
  /** Gerador de pool do próprio sistema (sistemas de pool externos). */
  generatePool?: (input: NpcGenInput) => NpcPoolBlock
  attackProgression?: (level: number, role: string) => number
  cantripDamageDice?: (level: number) => number
  skills?: readonly string[]
  defaultLanguages?: (creatureType: string) => string[]
}

export interface NpcOptions {
  /** Id do sistema (família d20). Ex.: 'dnd5e-2024'. */
  systemId: string
  /** Nível/CR aproximado (1..20). Padrão: 1. */
  level?: number
  /** Arquétipo de combate. Padrão: sorteado. */
  role?: NpcRole
  /** Método de atributos. Padrão: 'standard'. */
  abilityMethod?: AbilityMethod
  /** Nome fixo (senão é gerado). */
  name?: string
  /** Seed para geração reproduzível (define o RNG internamente). */
  seed?: number
  /** Tipo de criatura. Padrão: 'humanoid'. */
  creatureType?: CreatureType
  /** Tamanho. Padrão: 'medium'. */
  creatureSize?: CreatureSize
  /** Estilo do nome gerado. Padrão: 'fantasy'. */
  nameStyle?: NameStyle
  /** Quando `true`, anexa um epíteto/título ao nome (ex.: "Korak o Astuto"). */
  withEpithet?: boolean
  /**
   * Hooks de sistema. Quando o consumidor passa um `System` do
   * `@lippelt/srd-core`, ele tipicamente faz `npc: system.npc`. O npcgen
   * usa os hooks pra refinar a geração; sem hooks cai no genérico d20.
   */
  npc?: NpcGenHooks
}

export type NameStyle = 'fantasy' | 'sci-fi' | 'lovecraftian' | 'cyberpunk' | 'plain'

export interface NpcAttack {
  name: string
  bonus: number
  damage: string
}

/**
 * Bloco de magia. Anexado a `GeneratedNpc.magic` quando o role é `caster`.
 * Os valores derivam do atributo de conjuração do papel (`def.attackAbility`)
 * + bônus de proficiência/BAB do modelo.
 */
export interface NpcMagic {
  /** Atributo usado pra conjurar (geralmente CHA pro caster genérico). */
  spellAbility: Ability
  /** CD pra resistir a magias deste conjurador (8 + prof + mod no 5e). */
  spellSaveDC: number
  /** Bônus de ataque mágico (prof + mod no 5e). */
  spellAttackBonus: number
  /** Dano de cantrip/feitiço at-will (escala com nível como em PR 1). */
  cantripDamage: string
}

/**
 * Stats específicos de Starfinder (1e e 2e). Anexado quando o sistema é SF.
 *
 * - SF1: Stamina Points = level * 5 (com mod CON), Resolve = 1 + level/2,
 *   KAC/EAC derivam da armadura (KAC ≈ AC, EAC ≈ AC − 1).
 * - SF2: aproximadamente o mesmo, com tuning leve do PF2.
 */
export interface NpcStarfinderTuning {
  /** Stamina Points (drenam antes do HP). */
  stamina: number
  /** Kinetic Armor Class (defesa contra ataques físicos). */
  kac: number
  /** Energy Armor Class (defesa contra ataques de energia). */
  eac: number
  /** Resolve Points (recurso narrativo). */
  resolve: number
}

/**
 * Patente de proficiência do PF2/SF2, determinada pelo nível. Quando o sistema
 * passa o hook `attackProgression` (PF2e/SF2e o fazem), a matemática real
 * `level + bônus de patente` é aplicada ao `attackProgression` do NPC; este
 * tipo expõe a patente correspondente de forma legível.
 */
export type ProficiencyRank = 'trained' | 'expert' | 'master' | 'legendary'

// ============================================================================
// Criatura: tipo, tamanho, sentidos, deslocamento, idiomas
// ============================================================================

export type CreatureType =
  | 'humanoid'
  | 'beast'
  | 'undead'
  | 'fiend'
  | 'celestial'
  | 'fey'
  | 'dragon'
  | 'aberration'
  | 'construct'
  | 'elemental'
  | 'giant'
  | 'monstrosity'
  | 'ooze'
  | 'plant'

export type CreatureSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan'

/**
 * Sentidos comuns. Formato `<sentido>-<alcance em pés>` pra facilitar parse
 * (ex.: `darkvision-60`, `tremorsense-30`).
 */
export type Sense =
  | 'darkvision-60'
  | 'darkvision-120'
  | 'blindsight-30'
  | 'blindsight-60'
  | 'tremorsense-30'
  | 'tremorsense-60'
  | 'truesight-60'
  | 'low-light-vision'

/** Tipos de dano comuns no d20. */
export type DamageType =
  | 'acid'
  | 'cold'
  | 'fire'
  | 'force'
  | 'lightning'
  | 'necrotic'
  | 'poison'
  | 'psychic'
  | 'radiant'
  | 'thunder'
  | 'bludgeoning'
  | 'piercing'
  | 'slashing'

/** Deslocamentos em pés (5e/PF). `walk` é sempre o padrão. */
export interface Movements {
  walk: number
  fly?: number
  swim?: number
  climb?: number
  burrow?: number
}

export interface NpcCreature {
  type: CreatureType
  size: CreatureSize
  senses: Sense[]
  movements: Movements
  languages: string[]
}

export interface NpcResistances {
  damageResistances: DamageType[]
  damageImmunities: DamageType[]
  damageVulnerabilities: DamageType[]
  /** Condições às quais é imune (formato livre — depende do sistema). */
  conditionImmunities: string[]
}

// ============================================================================
// Armas
// ============================================================================

export type WeaponCategory =
  | 'simple-melee'
  | 'martial-melee'
  | 'simple-ranged'
  | 'martial-ranged'
  | 'natural'

export type WeaponProperty =
  | 'finesse'
  | 'versatile'
  | 'two-handed'
  | 'heavy'
  | 'light'
  | 'thrown'
  | 'ammunition'
  | 'reach'

export interface NpcWeapon {
  name: string
  category: WeaponCategory
  damageDie: 4 | 6 | 8 | 10 | 12
  /**
   * Tipo de dano. Geralmente físico (bludgeoning/piercing/slashing) pra armas
   * comuns; armas naturais/mágicas (ex.: Dardo Arcano) podem ter qualquer
   * `DamageType`.
   */
  damageType: DamageType
  /** Para armas a distância: alcance normal e longo em pés. */
  range?: { normal: number; long?: number }
  /** Pra armas de corpo-a-corpo com alcance estendido (ex.: lança). */
  reach?: number
  properties: WeaponProperty[]
}

/** Faixa-alvo de stats por nível/CR. Usada pra calibrar/comparar a saída
 *  do gerador com expectativa de "encontro adequado" no estilo 5e DMG. */
export interface CRBenchmark {
  /** Nível/CR alvo (1..20). */
  level: number
  /** HP médio esperado pra um NPC desse nível. */
  hp: number
  /** CA típica pra esse nível. */
  ac: number
  /** Bônus de ataque típico (proficiency model). */
  attackBonus: number
  /** Dano por round esperado (todos os ataques somados). */
  damagePerRound: number
  /** CD de magia/efeito típica. */
  saveDC: number
}

/**
 * NPC d20 (D&D-like). Família tradicional do gerador: HP, CA, ataques,
 * saves, perícias.
 *
 * Discriminador: `family: 'd20'`.
 */
export interface D20GeneratedNpc {
  family: 'd20'
  systemId: string
  name: string
  role: NpcRole
  level: number
  abilities: AbilityScores
  model: D20Model
  /** Bônus de proficiência (modelo 'proficiency') ou BAB (modelo 'bab'). */
  attackProgression: number
  hp: number
  ac: number
  speed: number
  saves: AbilityMap<number>
  /**
   * Atalhos pros saves comuns d20: Fortitude (CON), Reflex (DEX), Will (WIS).
   * Mesma origem que `saves.con/dex/wis` mas expostos com os nomes clássicos
   * usados em 3.5/PF1.
   */
  fortSave: number
  refSave: number
  willSave: number
  skills: Record<string, number>
  /**
   * Lista canônica de perícias do sistema (de `System.npc.skills`), quando o
   * sistema a fornece — útil pra UI mostrar o vocabulário completo de perícias.
   */
  availableSkills?: string[]
  /**
   * Lista de ataques por turno.
   * - Modelo `proficiency` (5e/PF2/SF2): todos com mesmo bônus (multiattack).
   * - Modelo `bab` (3.5/PF1/SF1): iterativos (BAB, BAB−5, BAB−10, BAB−15).
   *
   * Sempre tem ≥ 1 entrada; `attacks[0]` é o ataque assinatura.
   */
  attacks: NpcAttack[]
  /**
   * Atalho retro-compatível: igual a `attacks[0]`. Mantido pra UIs que
   * mostram só um ataque resumido.
   */
  attack: NpcAttack
  /** Bloco de magia (só preenchido quando `role === 'caster'`). */
  magic?: NpcMagic
  /** Stats específicos de Starfinder (1e/2e) — só preenchido pra esses sistemas. */
  starfinder?: NpcStarfinderTuning
  /**
   * Patente de proficiência (PF2/SF2). Quando os pacotes PF2e/SF2e passam seu
   * hook `npc.attackProgression`, o `attackProgression` deste NPC já reflete a
   * matemática `level + bônus de patente`; esta patente é só a etiqueta legível.
   */
  proficiencyRank?: ProficiencyRank
  /** Tipo/tamanho/sentidos/deslocamentos/idiomas (sempre presente). */
  creature: NpcCreature
  /** Resistências/imunidades/vulnerabilidades derivadas do tipo de criatura. */
  resistances: NpcResistances
  /** Arma assinatura (mesma do `attack[0]`, mas com mais metadata). */
  weapon: NpcWeapon
  /** Benchmark esperado pra esse nível/CR (referência). */
  benchmark: CRBenchmark
}

// ============================================================================
// Pool systems (Daggerheart, Candela Obscura, GUMSHOE)
// ============================================================================

/** Identificadores de sistemas de pool suportados. */
export type PoolSystemId = 'daggerheart' | 'candela-obscura' | 'gumshoe'

/**
 * Track com valor atual e máximo (HP/Stress/Armor no Daggerheart,
 * Stability/Sanidade no GUMSHOE etc.).
 */
export interface PoolTrack {
  current: number
  max: number
}

/**
 * Recurso "ataque/ação" pra sistemas de pool. Não tem `bonus` no estilo
 * d20 — o sistema decide como aplicar (rolagem de pool, dado de dualidade,
 * d6 GUMSHOE etc.).
 */
export interface PoolAttack {
  name: string
  /** Notação humana do dano (ex.: '1d8+2', '1d10', '+3 dado de Stress'). */
  damage: string
  /** Range opcional ("Melee", "Far", "Long"). */
  range?: string
  /** Notas de mecânica (ex.: "gasta 1 Hope", "Persistente"). */
  notes?: string[]
}

/**
 * NPC genérico de sistema de pool. Cada sistema preenche o `extra` com
 * stats específicos via campo `system`-discriminado:
 *
 * - daggerheart: thresholds major/severe, Hope, Evasion, Stress
 * - candela-obscura: Drives (Nerve/Cunning/Intuition), marks
 * - gumshoe: Hit Threshold, pools investigativos/gerais
 *
 * Discriminador interno: `family: 'pool'` + `system`.
 */
export interface PoolGeneratedNpc {
  family: 'pool'
  /** Id do sistema. */
  systemId: string
  /** Subtipo de sistema de pool. Embutidos usam um `PoolSystemId`; sistemas
   *  externos (via hook `generatePool`) usam o próprio id. */
  system: string
  /** Nome (gerado ou fornecido). */
  name: string
  /** Papel/arquétipo (string livre por sistema). */
  role: string
  /** Tier/nível (1..4 em Daggerheart, equivalente em outros). */
  tier: number
  /** Tracks principais (vida/estresse/etc). Estrutura comum entre os sistemas. */
  tracks: Record<string, PoolTrack>
  /** Ataques/ações principais. */
  attacks: PoolAttack[]
  /** Tipo/tamanho/sentidos compartilhados (sempre presente, igual ao d20). */
  creature: NpcCreature
  /** Stats específicos do sistema (formato livre, documentado por sistema). */
  extra: Record<string, unknown>
}

/**
 * União principal exportada: NPC d20 OU pool. Use `npc.family === 'd20'`
 * (ou os type guards `isD20Npc`/`isPoolNpc`) pra narrow.
 *
 * **Backward-compat**: o `family` é novo (v0.2.0). Código que consumia
 * o shape antigo precisa adicionar `if (npc.family === 'd20') { ... }`
 * ou usar `isD20Npc(npc)`.
 */
export type GeneratedNpc = D20GeneratedNpc | PoolGeneratedNpc

/** Type guard: o NPC é da família d20? */
export function isD20Npc(npc: GeneratedNpc): npc is D20GeneratedNpc {
  return npc.family === 'd20'
}

/** Type guard: o NPC é de sistema de pool? */
export function isPoolNpc(npc: GeneratedNpc): npc is PoolGeneratedNpc {
  return npc.family === 'pool'
}

/** Combatente no formato do tracker do GM Control Room. Desacoplado: espelha
 *  a forma do Combatant do GMCR sem importar seu tipo. */
export interface TrackerCombatant {
  name: string
  initiative: number
  hp: number
  maxHp: number
  statuses: string[]
  fields: Record<string, number>
}

// ----------------------------------------------------------------------------
// Encontros (v3) — grupo balanceado de NPCs
// ----------------------------------------------------------------------------

/** Dificuldade-alvo de um encontro (escala do orçamento de XP no d20). */
export type EncounterDifficulty = 'easy' | 'medium' | 'hard' | 'deadly'

/** Um slot de composição: N inimigos de um papel/nível. */
export interface EncounterRoleSlot {
  /** Papel d20 (ignorado em pool, onde o sistema decide o papel). */
  role?: NpcRole
  /** Quantidade de inimigos neste slot. */
  count: number
  /** Nível/CR (d20) ou tier (pool) deste slot. Padrão: `partyLevel`. */
  level?: number
}

/** Entrada do gerador de encontros. */
export interface EncounterInput {
  /** Id do sistema (d20 ou pool; embutido ou via hook `npc.family`). */
  systemId: string
  /** Nº de jogadores (orçamento de XP no d20; contagem no pool). Padrão: 4. */
  partySize?: number
  /** Nível médio do grupo (1..20). Padrão: 1. */
  partyLevel?: number
  /** Dificuldade-alvo. Padrão: 'medium'. */
  difficulty?: EncounterDifficulty
  /** Composição fixa; se ausente, auto-balanceia (d20) ou usa contagem (pool). */
  roleMix?: EncounterRoleSlot[]
  /** Seed base — sub-seeds determinísticas por NPC derivam dela (`seed + idx`). */
  seed?: number
  /** Tipo de criatura aplicado a todos. Padrão: 'humanoid'. */
  creatureType?: CreatureType
  /** Tamanho aplicado a todos. Padrão: 'medium'. */
  creatureSize?: CreatureSize
  /** Estilo dos nomes gerados. */
  nameStyle?: NameStyle
  /** Anexa epíteto/título aos nomes. */
  withEpithet?: boolean
  /** Hooks de sistema (mesmos do NPC avulso). */
  npc?: NpcGenHooks
  /** Limite de inimigos (segurança contra estouro). Padrão: 16. */
  maxEnemies?: number
}

/** Metadados do encontro gerado (orçamento/contagem/avisos). */
export interface EncounterMeta {
  systemId: string
  family: NpcGenFamily
  partySize: number
  partyLevel: number
  difficulty: EncounterDifficulty
  /** Nº total de inimigos gerados. */
  count: number
  /** d20: orçamento-alvo de XP (threshold por jogador × `partySize`). */
  targetXp?: number
  /** d20: XP bruto somado dos inimigos. */
  rawXp?: number
  /** d20: multiplicador 5e por nº de inimigos. */
  multiplier?: number
  /** d20: XP ajustado (`rawXp × multiplier`) — o que se compara com o alvo. */
  adjustedXp?: number
  /** Avisos/explicações (ex.: pool sem orçamento de XP). */
  notes?: string[]
}

/** Encontro completo: metadados + lista de NPCs. */
export interface GeneratedEncounter {
  meta: EncounterMeta
  npcs: GeneratedNpc[]
}
