/**
 * Gerador de NPC pra Lancer — alimentado por dados de LCP (COMP/CON).
 *
 * Lancer não é d20 nem pool: NPCs são montados por CATÁLOGO — uma classe
 * (Assault, Sentinel, ...) com stats por tier (1-3), features base +
 * opcionais, e templates que modificam o chassi (Grunt, Veteran, Elite,
 * Commander, Ultra, ...).
 *
 * Este módulo NÃO embute nenhum dado de livro: o chamador injeta o catálogo
 * (`LancerNpcData`) — tipicamente parseado dos arquivos `npc_classes.json`,
 * `npc_templates.json` e `npc_features.json` de um ou mais .lcp que o
 * usuário possui. Use `parseLancerNpcData` pra mesclar/normalizar.
 *
 * Regras numéricas dos cinco templates centrais são aplicadas de forma
 * conservadora (Grunt→1 HP; Veteran/Elite→+1 estrutura/stress; Ultra→+3,
 * age mais de uma vez). Ajustes finos ficam com o MJ — o texto das
 * features do template acompanha o resultado.
 */

import { d, pick } from './rng'
import { setRng, seededRoller } from './rng'

// ===================== Tipos (subset tolerante do COMP/CON) =====================

/** Dano de uma arma de NPC: valor por tier ou fixo. */
export interface LancerFeatureDamage {
  type?: string
  damage?: number[] | number
}

export interface LancerFeatureRange {
  type?: string
  val?: number
}

/** Feature de NPC (arma, sistema, trait ou reação) vinda do LCP. */
export interface LancerNpcFeature {
  id: string
  name: string
  type?: string // 'Weapon' | 'System' | 'Trait' | 'Reaction' | ...
  effect?: string
  damage?: LancerFeatureDamage[]
  range?: LancerFeatureRange[]
  weapon_type?: string
  origin?: { name?: string; type?: string }
  tags?: unknown[]
}

/** Stats de classe por tier: arrays indexados por tier-1. */
export interface LancerClassStats {
  armor?: number[]
  hp?: number[]
  evade?: number[]
  edef?: number[]
  heatcap?: number[]
  speed?: number[]
  sensor?: number[]
  save?: number[]
  hull?: number[]
  agility?: number[]
  systems?: number[]
  engineering?: number[]
  size?: (number[] | number)[]
  structure?: number[]
  stress?: number[]
  activations?: number[]
}

export interface LancerNpcClass {
  id: string
  name: string
  role?: string
  info?: { flavor?: string; tactics?: string }
  stats: LancerClassStats
  base_features?: string[]
  optional_features?: string[]
}

export interface LancerNpcTemplate {
  id: string
  name: string
  description?: string
  base_features?: string[]
  optional_features?: string[]
}

/** Catálogo consolidado (1+ LCPs mesclados). */
export interface LancerNpcData {
  classes: LancerNpcClass[]
  templates: LancerNpcTemplate[]
  features: LancerNpcFeature[]
}

// ===================== Parser / merge =====================

/** Pedaço cru de um LCP: qualquer combinação dos três arquivos npc_*. */
export interface LancerLcpChunk {
  classes?: unknown
  templates?: unknown
  features?: unknown
}

function asArray(v: unknown): Record<string, unknown>[] {
  return Array.isArray(v) ? (v.filter((x) => x && typeof x === 'object') as Record<string, unknown>[]) : []
}

/**
 * Mescla N chunks de LCP num catálogo único. Dedup por `id` (primeira
 * ocorrência vence, como no seed de criaturas privadas). Entradas sem
 * id/name são descartadas silenciosamente — LCPs de aventura costumam
 * trazer só um subconjunto dos arquivos.
 */
export function parseLancerNpcData(chunks: LancerLcpChunk[]): LancerNpcData {
  const classes = new Map<string, LancerNpcClass>()
  const templates = new Map<string, LancerNpcTemplate>()
  const features = new Map<string, LancerNpcFeature>()

  for (const chunk of chunks) {
    for (const raw of asArray(chunk.classes)) {
      const id = String(raw.id ?? '')
      const name = String(raw.name ?? '')
      if (!id || !name || classes.has(id)) continue
      const stats = (raw.stats ?? {}) as LancerClassStats
      classes.set(id, {
        id,
        name,
        role: typeof raw.role === 'string' ? raw.role : undefined,
        info: (raw.info ?? undefined) as LancerNpcClass['info'],
        stats,
        base_features: asStringArray(raw.base_features),
        optional_features: asStringArray(raw.optional_features),
      })
    }
    for (const raw of asArray(chunk.templates)) {
      const id = String(raw.id ?? '')
      const name = String(raw.name ?? '')
      if (!id || !name || templates.has(id)) continue
      templates.set(id, {
        id,
        name,
        description: typeof raw.description === 'string' ? raw.description : undefined,
        base_features: asStringArray(raw.base_features),
        optional_features: asStringArray(raw.optional_features),
      })
    }
    for (const raw of asArray(chunk.features)) {
      const id = String(raw.id ?? '')
      const name = String(raw.name ?? '')
      if (!id || !name || features.has(id)) continue
      features.set(id, raw as unknown as LancerNpcFeature)
    }
  }

  return {
    classes: [...classes.values()].sort((a, b) => a.name.localeCompare(b.name)),
    templates: [...templates.values()].sort((a, b) => a.name.localeCompare(b.name)),
    features: [...features.values()],
  }
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []
}

// ===================== Geração =====================

export type LancerTier = 1 | 2 | 3

export interface LancerNpcOptions {
  /** Catálogo injetado (obrigatório — o npcgen não embute dados de livro). */
  data: LancerNpcData
  /** Classe (id ou nome, case-insensitive). Sorteada se ausente. */
  classId?: string
  /** Tier 1-3. Padrão: 1. */
  tier?: LancerTier
  /** Templates a aplicar (ids ou nomes). */
  templateIds?: string[]
  /** Quantas features opcionais da classe sortear. Padrão: tier. */
  optionalFeatureCount?: number
  /** Nome fixo (senão fica "<CLASSE> T<tier>"). */
  name?: string
  /** Seed pra geração reproduzível. */
  seed?: number
}

export interface LancerGeneratedFeature {
  name: string
  type: string
  /** Texto de efeito (ou resumo de dano/alcance pra armas). */
  effect?: string
  /** De onde veio: 'class' | 'class-optional' | nome do template. */
  from: string
}

export interface LancerGeneratedNpc {
  kind: 'lancer'
  name: string
  className: string
  role?: string
  tier: LancerTier
  templates: string[]
  stats: {
    hp: number
    armor: number
    structure: number
    stress: number
    evade: number
    edef: number
    heatcap: number
    speed: number
    sensor: number
    save: number
    hull: number
    agility: number
    systems: number
    engineering: number
    size: number
    activations: number
  }
  features: LancerGeneratedFeature[]
  tactics?: string
  /** Notas de template que o MJ deve arbitrar (texto do livro/LCP). */
  notes: string[]
}

function statAt(arr: number[] | undefined, tier: LancerTier, fallback: number): number {
  if (!arr || arr.length === 0) return fallback
  return arr[Math.min(tier - 1, arr.length - 1)] ?? fallback
}

function sizeAt(stats: LancerClassStats, tier: LancerTier): number {
  const raw = stats.size?.[Math.min(tier - 1, (stats.size?.length ?? 1) - 1)]
  if (Array.isArray(raw)) return raw[0] ?? 1
  return typeof raw === 'number' ? raw : 1
}

function findByIdOrName<T extends { id: string; name: string }>(
  list: T[],
  key: string,
): T | undefined {
  const k = key.trim().toLowerCase()
  return list.find((x) => x.id.toLowerCase() === k || x.name.toLowerCase() === k)
}

function summarizeWeapon(f: LancerNpcFeature, tier: LancerTier): string {
  const parts: string[] = []
  if (f.weapon_type) parts.push(f.weapon_type)
  for (const r of f.range ?? []) {
    if (r.type && r.val != null) parts.push(`${r.type} ${r.val}`)
  }
  for (const dm of f.damage ?? []) {
    const v = Array.isArray(dm.damage)
      ? dm.damage[Math.min(tier - 1, dm.damage.length - 1)]
      : dm.damage
    if (v != null) parts.push(`${v} ${dm.type ?? 'dano'}`)
  }
  const head = parts.join(' · ')
  const eff = (f.effect ?? '').trim()
  return eff ? (head ? `${head} — ${eff}` : eff) : head
}

function resolveFeatures(
  ids: string[],
  data: LancerNpcData,
  tier: LancerTier,
  from: string,
): LancerGeneratedFeature[] {
  const out: LancerGeneratedFeature[] = []
  for (const id of ids) {
    const f = data.features.find((x) => x.id === id)
    if (!f) continue
    out.push({
      name: f.name,
      type: f.type ?? 'Trait',
      effect: f.type === 'Weapon' ? summarizeWeapon(f, tier) : (f.effect ?? undefined),
      from,
    })
  }
  return out
}

/**
 * Modificadores numéricos dos templates centrais. Reconhecidos por NOME
 * (case-insensitive), então funcionam pra qualquer LCP que os declare.
 * Templates fora desta lista aplicam só suas features/notas de texto.
 */
const TEMPLATE_MODS: Record<
  string,
  { hp?: 'one' | number; structure?: number; stress?: number; activations?: number; note?: string }
> = {
  grunt: { hp: 'one', note: 'Peão: 1 PV, sem estrutura/stress — cai com qualquer dano.' },
  veteran: { structure: 1, stress: 1, note: 'Veterano: +1 estrutura/stress e melhorias de veterania (arbitre bônus de precisão conforme o livro).' },
  elite: { structure: 1, stress: 1, activations: 1, note: 'Elite: age 2x por rodada.' },
  commander: { structure: 1, stress: 1, note: 'Comandante: aura de comando e táticas — veja as features do template.' },
  ultra: { structure: 3, stress: 3, activations: 1, note: 'Ultra: chefe — age múltiplas vezes por rodada e resiste ao que destruiria um chassi comum.' },
}

/** Gera um NPC de Lancer a partir do catálogo injetado. Determinístico com `seed`. */
export function generateLancerNpc(opts: LancerNpcOptions): LancerGeneratedNpc {
  if (opts.seed !== undefined) setRng(seededRoller(opts.seed))
  const { data } = opts
  if (!data || data.classes.length === 0) {
    throw new Error('generateLancerNpc: catálogo vazio — injete LancerNpcData parseado do(s) LCP(s).')
  }

  const tier: LancerTier = opts.tier ?? 1
  const cls = (opts.classId ? findByIdOrName(data.classes, opts.classId) : undefined) ?? pick(data.classes)

  const stats = {
    hp: statAt(cls.stats.hp, tier, 10),
    armor: statAt(cls.stats.armor, tier, 0),
    structure: statAt(cls.stats.structure, tier, 1),
    stress: statAt(cls.stats.stress, tier, 1),
    evade: statAt(cls.stats.evade, tier, 8),
    edef: statAt(cls.stats.edef, tier, 8),
    heatcap: statAt(cls.stats.heatcap, tier, 5),
    speed: statAt(cls.stats.speed, tier, 4),
    sensor: statAt(cls.stats.sensor, tier, 10),
    save: statAt(cls.stats.save, tier, 10),
    hull: statAt(cls.stats.hull, tier, 0),
    agility: statAt(cls.stats.agility, tier, 0),
    systems: statAt(cls.stats.systems, tier, 0),
    engineering: statAt(cls.stats.engineering, tier, 0),
    size: sizeAt(cls.stats, tier),
    activations: statAt(cls.stats.activations, tier, 1),
  }

  const features: LancerGeneratedFeature[] = resolveFeatures(cls.base_features ?? [], data, tier, 'class')

  // Opcionais da classe: sorteia N sem repetição (default: tier).
  const optionalPool = [...(cls.optional_features ?? [])]
  const optionalCount = Math.min(opts.optionalFeatureCount ?? tier, optionalPool.length)
  for (let i = 0; i < optionalCount; i++) {
    const idx = optionalPool.length > 1 ? d(optionalPool.length) - 1 : 0
    const [id] = optionalPool.splice(idx, 1)
    if (id) features.push(...resolveFeatures([id], data, tier, 'class-optional'))
  }

  // Templates: features + modificadores conhecidos.
  const appliedTemplates: string[] = []
  const notes: string[] = []
  for (const key of opts.templateIds ?? []) {
    const tpl = findByIdOrName(data.templates, key)
    if (!tpl) continue
    appliedTemplates.push(tpl.name)
    features.push(...resolveFeatures(tpl.base_features ?? [], data, tier, tpl.name))
    const mods = TEMPLATE_MODS[tpl.name.trim().toLowerCase()]
    if (mods) {
      if (mods.hp === 'one') {
        stats.hp = 1
        stats.structure = 1
        stats.stress = 1
      }
      if (typeof mods.structure === 'number') stats.structure += mods.structure
      if (typeof mods.stress === 'number') stats.stress += mods.stress
      if (typeof mods.activations === 'number') stats.activations += mods.activations
      if (mods.note) notes.push(mods.note)
    } else if (tpl.description) {
      notes.push(`${tpl.name}: ${tpl.description}`)
    }
  }

  const name =
    opts.name?.trim() ||
    `${cls.name}${appliedTemplates.length ? ` (${appliedTemplates.join('+')})` : ''} T${tier}`

  return {
    kind: 'lancer',
    name,
    className: cls.name,
    role: cls.role,
    tier,
    templates: appliedTemplates,
    stats,
    features,
    tactics: cls.info?.tactics,
    notes,
  }
}

/** Statblock em markdown (pro preview/códex, como os demais geradores). */
export function lancerNpcToMarkdown(npc: LancerGeneratedNpc): string {
  const s = npc.stats
  const lines: string[] = [
    `## ${npc.name}`,
    `*${npc.className}${npc.role ? ` — ${npc.role}` : ''} · Tier ${npc.tier}${npc.templates.length ? ` · ${npc.templates.join(' + ')}` : ''}*`,
    '',
    `**PV** ${s.hp} · **Blindagem** ${s.armor} · **Estrutura** ${s.structure} · **Stress** ${s.stress}`,
    `**Evasão** ${s.evade} · **E-Def** ${s.edef} · **Calor** ${s.heatcap} · **Velocidade** ${s.speed}`,
    `**Sensores** ${s.sensor} · **Save** ${s.save} · **Tamanho** ${s.size} · **Ativações** ${s.activations}`,
    `**HASE** ${s.hull}/${s.agility}/${s.systems}/${s.engineering}`,
  ]
  if (npc.features.length) {
    lines.push('', '### Features')
    for (const f of npc.features) {
      lines.push(`- **${f.name}** (${f.type}${f.from !== 'class' ? ` · ${f.from}` : ''})${f.effect ? ` — ${f.effect}` : ''}`)
    }
  }
  if (npc.tactics) lines.push('', `> **Táticas:** ${npc.tactics}`)
  for (const n of npc.notes) lines.push('', `> ⚠ ${n}`)
  return lines.join('\n')
}
