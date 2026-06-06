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
}

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
 * Patente de proficiência do PF2/SF2. Determinada pelo nível e usada como
 * referência informativa (a matemática real do PF2 é `level + bônus de patente`,
 * que difere do 5e — o `attackProgression` atual ainda usa o modelo 5e).
 */
export type ProficiencyRank = 'trained' | 'expert' | 'master' | 'legendary'

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

export interface GeneratedNpc {
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
   * Patente de proficiência (PF2/SF2). Informativa — a matemática do
   * `attackProgression` ainda usa o modelo 5e (5e e PF2 diferem; ver
   * ROADMAP Bloco A item 5).
   */
  proficiencyRank?: ProficiencyRank
  /** Benchmark esperado pra esse nível/CR (referência). */
  benchmark: CRBenchmark
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
