import type {
  Ability,
  D20GeneratedNpc,
  GeneratedEncounter,
  GeneratedNpc,
  PoolGeneratedNpc,
  TrackerCombatant,
} from './types'
import { isD20Npc } from './types'
import { lootToMarkdown } from './loot'

const ORDER: readonly Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

const sign = (n: number): string => (n >= 0 ? `+${n}` : `${n}`)

/**
 * Converte o NPC para o formato do tracker do GM Control Room.
 *
 * - d20: hp/maxHp = npc.hp; initiative = dex mod; fields.ac = npc.ac
 * - pool: hp/maxHp = tracks.hp.max (fallback pra primeiro track); initiative = 0
 *   (sistemas de pool tipicamente não usam iniciativa numérica); fields = stats
 *   relevantes do sistema (difficulty/evasion/hitThreshold).
 */
export function toTrackerCombatant(npc: GeneratedNpc): TrackerCombatant {
  if (isD20Npc(npc)) {
    return {
      name: npc.name,
      initiative: npc.abilities.dex.mod,
      hp: npc.hp,
      maxHp: npc.hp,
      statuses: [],
      fields: { ac: npc.ac },
    }
  }

  // Pool NPC: extrai HP do track primário.
  const hpTrack = npc.tracks.hp ?? npc.tracks.health ?? Object.values(npc.tracks)[0]
  const hpMax = hpTrack?.max ?? 1

  // Fields do tracker a partir do `extra`:
  // - embutidos (daggerheart/candela/gumshoe): o `extra` mistura metadados
  //   (tier, attackDamageMod…), então usamos um whitelist conservador.
  // - externos: por convenção o `extra` traz só stats (chaves dos próprios
  //   trackerFields), então emitimos todos os valores numéricos.
  const BUILTIN_POOL = new Set(['daggerheart', 'candela-obscura', 'gumshoe'])
  const fields: Record<string, number> = {}
  const extra = npc.extra as Record<string, unknown>
  if (BUILTIN_POOL.has(npc.system)) {
    for (const key of ['evasion', 'difficulty', 'hitThreshold']) {
      if (typeof extra[key] === 'number') fields[key] = extra[key] as number
    }
  } else {
    for (const [key, value] of Object.entries(extra)) {
      if (typeof value === 'number') fields[key] = value
    }
  }

  return {
    name: npc.name,
    initiative: 0,
    hp: hpMax,
    maxHp: hpMax,
    statuses: [],
    fields,
  }
}

/** Stat block em Markdown para colar no Campaign Codex. */
export function toCodexMarkdown(npc: GeneratedNpc): string {
  if (isD20Npc(npc)) return d20Markdown(npc)
  return poolMarkdown(npc)
}

// ----------------------------------------------------------------------------
// Encontros (v3) — adapters do grupo inteiro
// ----------------------------------------------------------------------------

/** Converte o encontro inteiro para combatentes do tracker do GMCR.
 *  Cada NPC vira um `TrackerCombatant` (jogue todos com vários addCombatant). */
export function encounterToTrackerCombatants(enc: GeneratedEncounter): TrackerCombatant[] {
  return enc.npcs.map(toTrackerCombatant)
}

/** Encontro em Markdown: cabeçalho (dificuldade/XP/contagem) + cada stat block. */
export function encounterToCodexMarkdown(enc: GeneratedEncounter): string {
  const m = enc.meta
  const head = [`## Encontro — ${m.difficulty} (${m.count} inimigos)`]
  if (m.family === 'd20' && m.targetXp !== undefined) {
    head.push(
      `*Grupo ${m.partySize} × nível ${m.partyLevel} • ` +
        `orçamento ${m.targetXp} XP • ajustado ${m.adjustedXp} XP ` +
        `(bruto ${m.rawXp} × ${m.multiplier})*`,
    )
  } else {
    head.push(`*Grupo ${m.partySize} × tier ${m.partyLevel} • ${m.systemId}*`)
  }
  if (m.notes && m.notes.length > 0) {
    head.push('', ...m.notes.map((n) => `> ${n}`))
  }
  const blocks = enc.npcs.map((npc) => toCodexMarkdown(npc))
  const parts = [head.join('\n'), '', blocks.join('\n\n')]
  if (enc.loot) parts.push('', lootToMarkdown(enc.loot))
  return parts.join('\n')
}

// ----------------------------------------------------------------------------
// D20 markdown (mesma lógica anterior, agora encapsulada)
// ----------------------------------------------------------------------------

function d20Markdown(npc: D20GeneratedNpc): string {
  const abilities = ORDER.map(
    (ab) => `${ab.toUpperCase()} ${npc.abilities[ab].score} (${sign(npc.abilities[ab].mod)})`,
  ).join(' · ')
  const saves = ORDER.map((ab) => `${ab.toUpperCase()} ${sign(npc.saves[ab])}`).join(', ')
  const skills = Object.keys(npc.skills)
    .map((s) => `${s} ${sign(npc.skills[s]!)}`)
    .join(', ')
  const progLabel = npc.model === 'proficiency' ? 'Proficiência' : 'BAB'

  const attackLines =
    npc.attacks.length === 1
      ? [`- **Ataque** ${npc.attacks[0]!.name} ${sign(npc.attacks[0]!.bonus)}, dano ${npc.attacks[0]!.damage}`]
      : [
          `- **Ataques** (${npc.attacks.length} por turno):`,
          ...npc.attacks.map(
            (a, i) => `  ${i + 1}. ${a.name} ${sign(a.bonus)}, dano ${a.damage}`,
          ),
        ]

  const creatureDesc = `${npc.creature.size} ${npc.creature.type}`
  const subtitle =
    `*${creatureDesc} • ${npc.role} • nível ${npc.level} • ${npc.systemId}` +
    (npc.proficiencyRank ? ` • ${npc.proficiencyRank}` : '') +
    `*`

  const defenseLine = npc.starfinder
    ? `- **KAC** ${npc.starfinder.kac}  **EAC** ${npc.starfinder.eac}  ` +
      `**PV** ${npc.hp}  **SP** ${npc.starfinder.stamina}  ` +
      `**RP** ${npc.starfinder.resolve}  **Deslocamento** ${npc.speed} ft`
    : `- **CA** ${npc.ac}  **PV** ${npc.hp}  **Deslocamento** ${npc.speed} ft`

  const lines = [
    `### ${npc.name}`,
    subtitle,
    '',
    defenseLine,
    `- **${progLabel}** ${sign(npc.attackProgression)}`,
    `- **Fort** ${sign(npc.fortSave)}  **Ref** ${sign(npc.refSave)}  **Will** ${sign(npc.willSave)}`,
    `- **Atributos** ${abilities}`,
    `- **Resistências** ${saves}`,
    `- **Perícias** ${skills}`,
    ...attackLines,
  ]

  if (npc.creature.senses.length > 0 || npc.creature.languages.length > 0) {
    const sensesPart =
      npc.creature.senses.length > 0
        ? `**Sentidos** ${npc.creature.senses.join(', ')}`
        : ''
    const langsPart =
      npc.creature.languages.length > 0
        ? `**Idiomas** ${npc.creature.languages.join(', ')}`
        : ''
    const parts = [sensesPart, langsPart].filter(Boolean)
    if (parts.length > 0) lines.push(`- ${parts.join('  ·  ')}`)
  }

  const m = npc.creature.movements
  const extraMov: string[] = []
  if (m.fly) extraMov.push(`voo ${m.fly} ft`)
  if (m.swim) extraMov.push(`natação ${m.swim} ft`)
  if (m.climb) extraMov.push(`escalada ${m.climb} ft`)
  if (m.burrow) extraMov.push(`escavação ${m.burrow} ft`)
  if (extraMov.length > 0) {
    lines.push(`- **Movimentos extras** ${extraMov.join(', ')}`)
  }

  const r = npc.resistances
  if (r.damageResistances.length > 0) {
    lines.push(`- **Resistente a** ${r.damageResistances.join(', ')}`)
  }
  if (r.damageImmunities.length > 0) {
    lines.push(`- **Imune a** ${r.damageImmunities.join(', ')}`)
  }
  if (r.damageVulnerabilities.length > 0) {
    lines.push(`- **Vulnerável a** ${r.damageVulnerabilities.join(', ')}`)
  }
  if (r.conditionImmunities.length > 0) {
    lines.push(`- **Imune a condições** ${r.conditionImmunities.join(', ')}`)
  }

  if (npc.magic) {
    lines.push(
      `- **Magia** ${npc.magic.spellAbility.toUpperCase()}` +
        ` · CD ${npc.magic.spellSaveDC}` +
        ` · ataque ${sign(npc.magic.spellAttackBonus)}` +
        ` · cantrip ${npc.magic.cantripDamage}`,
    )
  }

  return lines.join('\n')
}

// ----------------------------------------------------------------------------
// Pool markdown (Daggerheart / Candela / GUMSHOE)
// ----------------------------------------------------------------------------

function poolMarkdown(npc: PoolGeneratedNpc): string {
  const creatureDesc = `${npc.creature.size} ${npc.creature.type}`
  const subtitle = `*${creatureDesc} • ${npc.role} • tier ${npc.tier} • ${npc.systemId}*`

  const lines = [`### ${npc.name}`, subtitle, '']

  // Tracks (HP/Stress/Armor/etc).
  const trackKeys = Object.keys(npc.tracks)
  if (trackKeys.length > 0) {
    const trackParts = trackKeys.map((k) => {
      const t = npc.tracks[k]!
      return `**${k.charAt(0).toUpperCase()}${k.slice(1)}** ${t.current}/${t.max}`
    })
    lines.push(`- ${trackParts.join('  ·  ')}`)
  }

  // Stats específicos do sistema (extra).
  const extra = npc.extra as Record<string, unknown>
  if (npc.system === 'daggerheart') {
    if (typeof extra.difficulty === 'number') {
      lines.push(
        `- **Dificuldade** ${extra.difficulty as number}  ` +
          `**Evasão** ${extra.evasion as number}  ` +
          `**Limiar Maior** ${extra.majorThreshold as number}  ` +
          `**Limiar Severo** ${extra.severeThreshold as number}`,
      )
    }
  } else if (npc.system === 'candela-obscura') {
    if (typeof extra.hitThreshold === 'number') {
      const drives = extra.drives as Record<string, number> | undefined
      lines.push(
        `- **Hit Threshold** ${extra.hitThreshold as number}` +
          (drives
            ? `  ·  **Drives** Nerve ${drives.nerve}, Cunning ${drives.cunning}, Intuition ${drives.intuition}`
            : ''),
      )
    }
  } else if (npc.system === 'gumshoe') {
    if (typeof extra.hitThreshold === 'number') {
      const pools = extra.pools as Record<string, number> | undefined
      lines.push(
        `- **Hit Threshold** ${extra.hitThreshold as number}` +
          (pools
            ? `  ·  **Pools** Athletics ${pools.athletics}, Fighting ${pools.fighting}, Weapons ${pools.weapons}`
            : ''),
      )
    }
  } else {
    // Sistema externo (ex.: privados): renderiza os stats numéricos do extra
    // genericamente, em uma linha.
    const numeric = Object.entries(extra).filter(([, v]) => typeof v === 'number')
    if (numeric.length > 0) {
      lines.push(
        '- ' +
          numeric
            .map(([k, v]) => `**${k.charAt(0).toUpperCase()}${k.slice(1)}** ${v as number}`)
            .join('  ·  '),
      )
    }
  }

  // Ataques.
  npc.attacks.forEach((a, i) => {
    const rangePart = a.range ? ` [${a.range}]` : ''
    const notesPart = a.notes && a.notes.length > 0 ? ` — ${a.notes.join('; ')}` : ''
    const label = npc.attacks.length === 1 ? '**Ataque**' : `**Ataque ${i + 1}**`
    lines.push(`- ${label} ${a.name}${rangePart}, dano ${a.damage}${notesPart}`)
  })

  // Sentidos/idiomas.
  if (npc.creature.senses.length > 0 || npc.creature.languages.length > 0) {
    const sensesPart =
      npc.creature.senses.length > 0
        ? `**Sentidos** ${npc.creature.senses.join(', ')}`
        : ''
    const langsPart =
      npc.creature.languages.length > 0
        ? `**Idiomas** ${npc.creature.languages.join(', ')}`
        : ''
    const parts = [sensesPart, langsPart].filter(Boolean)
    if (parts.length > 0) lines.push(`- ${parts.join('  ·  ')}`)
  }

  return lines.join('\n')
}
