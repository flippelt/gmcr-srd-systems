/**
 * Conversor NPC gerado → entrada de biblioteca de criaturas.
 *
 * O GM Control Room guarda criaturas num formato próprio
 * (`CreatureLibraryEntry` do `@gmcr/shared`). Este módulo produz um objeto
 * estruturalmente compatível (sem `id`/`createdAt`, que o servidor gera) a
 * partir de qualquer NPC das três famílias do npcgen — d20, pool e Lancer —
 * pronto pra:
 *
 * - salvar direto na biblioteca (socket `saveCreature`); ou
 * - copiar como JSON e colar no import da biblioteca.
 *
 * Duck-typed de propósito: o npcgen não depende do `@gmcr/shared`; o
 * consumidor faz o cast. Campos ausentes são simplesmente omitidos.
 */

import type { D20GeneratedNpc, GeneratedNpc, PoolGeneratedNpc } from './types'
import type { LancerGeneratedNpc } from './lancer'

/** Bloco nome + parágrafos (mesma forma do CreatureFeature do shared). */
export interface NpcLibraryFeature {
  name: string
  entries: string[]
}

/** Entrada de biblioteca (compatível com CreatureLibraryEntry sem id/createdAt). */
export interface NpcLibraryEntry {
  system: string
  name: string
  type?: string
  size?: string
  cr?: string
  hp?: { average?: number }
  ac?: { value: number; from?: string }
  speed?: Record<string, number>
  abilities?: {
    str?: number
    dex?: number
    con?: number
    int?: number
    wis?: number
    cha?: number
  }
  saves?: Record<string, string>
  senses?: string[]
  languages?: string[]
  immune?: string[]
  conditionImmune?: string[]
  traits?: NpcLibraryFeature[]
  actions?: NpcLibraryFeature[]
  notes?: string
}

const signed = (n: number): string => (n >= 0 ? `+${n}` : `${n}`)

function fromD20(npc: D20GeneratedNpc): NpcLibraryEntry {
  const actions: NpcLibraryFeature[] = npc.attacks.map((a) => ({
    name: a.name,
    entries: [`${signed(a.bonus)} para atingir, ${a.damage} de dano.`],
  }))
  if (npc.magic) {
    actions.push({
      name: `Conjuração (${npc.magic.tradition})`,
      entries: [
        `CD ${npc.magic.spellSaveDC}, ${signed(npc.magic.spellAttackBonus)} ataque mágico, cantrip ${npc.magic.cantripDamage}.`,
      ],
    })
  }

  const traits: NpcLibraryFeature[] = []
  const res = npc.resistances
  if (res.damageResistances.length) {
    traits.push({ name: 'Resistências', entries: [res.damageResistances.join(', ')] })
  }
  if (res.damageVulnerabilities.length) {
    traits.push({ name: 'Vulnerabilidades', entries: [res.damageVulnerabilities.join(', ')] })
  }
  const skills = Object.entries(npc.skills)
  if (skills.length) {
    traits.push({
      name: 'Perícias',
      entries: [skills.map(([k, v]) => `${k} ${signed(v)}`).join(', ')],
    })
  }

  return {
    system: npc.systemId,
    name: npc.name,
    type: `${npc.creature.type} (${npc.role})`,
    size: npc.creature.size,
    cr: String(npc.level),
    hp: { average: npc.hp },
    ac: { value: npc.ac },
    speed: Object.fromEntries(
      Object.entries(npc.creature.movements).filter(([, v]) => typeof v === 'number'),
    ) as Record<string, number>,
    abilities: Object.fromEntries(
      Object.entries(npc.abilities).map(([k, v]) => [k, v.score]),
    ),
    saves: Object.fromEntries(Object.entries(npc.saves).map(([k, v]) => [k, signed(v as number)])),
    senses: [...npc.creature.senses],
    languages: [...npc.creature.languages],
    immune: res.damageImmunities.length ? [...res.damageImmunities] : undefined,
    conditionImmune: res.conditionImmunities.length ? [...res.conditionImmunities] : undefined,
    traits: traits.length ? traits : undefined,
    actions: actions.length ? actions : undefined,
    notes: npc.flavor ? flavorNote(npc.flavor) : undefined,
  }
}

function fromPool(npc: PoolGeneratedNpc): NpcLibraryEntry {
  const hpTrack = npc.tracks.hp ?? npc.tracks.health ?? Object.values(npc.tracks)[0]
  const traits: NpcLibraryFeature[] = []
  const trackLine = Object.entries(npc.tracks)
    .map(([k, t]) => `${k} ${t.current}/${t.max}`)
    .join(' · ')
  if (trackLine) traits.push({ name: 'Tracks', entries: [trackLine] })
  for (const [k, v] of Object.entries(npc.extra)) {
    traits.push({ name: k, entries: [typeof v === 'string' ? v : JSON.stringify(v)] })
  }

  return {
    system: npc.systemId,
    name: npc.name,
    type: `${npc.creature.type} (${npc.role})`,
    size: npc.creature.size,
    cr: `Tier ${npc.tier}`,
    hp: hpTrack ? { average: hpTrack.max } : undefined,
    senses: [...npc.creature.senses],
    languages: [...npc.creature.languages],
    traits: traits.length ? traits : undefined,
    actions: npc.attacks.length
      ? npc.attacks.map((a) => ({
          name: a.name,
          entries: [
            [a.damage, a.range, ...(a.notes ?? [])].filter(Boolean).join(' · '),
          ],
        }))
      : undefined,
    notes: npc.flavor ? flavorNote(npc.flavor) : undefined,
  }
}

function fromLancer(npc: LancerGeneratedNpc): NpcLibraryEntry {
  const s = npc.stats
  const weapons = npc.features.filter((f) => f.type === 'Weapon')
  const others = npc.features.filter((f) => f.type !== 'Weapon')
  return {
    system: 'lancer',
    name: npc.name,
    type: `${npc.className}${npc.role ? ` (${npc.role})` : ''}`,
    cr: `Tier ${npc.tier}${npc.templates.length ? ` · ${npc.templates.join('+')}` : ''}`,
    hp: { average: s.hp },
    ac: { value: s.evade, from: 'Evasão' },
    speed: { walk: s.speed },
    traits: [
      {
        name: 'Chassi',
        entries: [
          `Estrutura ${s.structure} · Stress ${s.stress} · Blindagem ${s.armor} · E-Def ${s.edef} · Calor ${s.heatcap} · Save ${s.save} · Tamanho ${s.size} · Ativações ${s.activations}`,
          `HASE ${s.hull}/${s.agility}/${s.systems}/${s.engineering}`,
        ],
      },
      ...others.map((f) => ({
        name: `${f.name} [${f.from}]`,
        entries: [f.effect ?? ''],
      })),
    ],
    actions: weapons.length
      ? weapons.map((f) => ({ name: `${f.name} [${f.from}]`, entries: [f.effect ?? ''] }))
      : undefined,
    notes: [npc.tactics, ...npc.notes].filter(Boolean).join('\n') || undefined,
  }
}

function flavorNote(flavor: {
  personality?: string
  motivation?: string
  mannerism?: string
  tactic?: string
  hook?: string
}): string {
  return [flavor.personality, flavor.motivation, flavor.mannerism, flavor.tactic, flavor.hook]
    .filter(Boolean)
    .join('\n')
}

/**
 * Converte um NPC gerado (qualquer família) numa entrada de biblioteca.
 * Aceita também o LancerGeneratedNpc (kind: 'lancer').
 */
export function npcToLibraryEntry(npc: GeneratedNpc | LancerGeneratedNpc): NpcLibraryEntry {
  // Só o LancerGeneratedNpc tem `kind`; nos demais o discriminador é `family`.
  if ('kind' in npc) return fromLancer(npc)
  return npc.family === 'pool' ? fromPool(npc) : fromD20(npc)
}
