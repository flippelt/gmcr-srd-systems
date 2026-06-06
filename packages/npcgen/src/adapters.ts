import type { Ability, GeneratedNpc, TrackerCombatant } from './types'

const ORDER: readonly Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

const sign = (n: number): string => (n >= 0 ? `+${n}` : `${n}`)

/** Converte o NPC para o formato do tracker do GM Control Room. A iniciativa
 *  é o modificador de Destreza (o GM rola na mesa); `fields.ac` alimenta o
 *  trackerField 'ac' dos sistemas d20. */
export function toTrackerCombatant(npc: GeneratedNpc): TrackerCombatant {
  return {
    name: npc.name,
    initiative: npc.abilities.dex.mod,
    hp: npc.hp,
    maxHp: npc.hp,
    statuses: [],
    fields: { ac: npc.ac },
  }
}

/** Stat block em Markdown para colar no Campaign Codex. */
export function toCodexMarkdown(npc: GeneratedNpc): string {
  const abilities = ORDER.map(
    (ab) => `${ab.toUpperCase()} ${npc.abilities[ab].score} (${sign(npc.abilities[ab].mod)})`,
  ).join(' · ')
  const saves = ORDER.map((ab) => `${ab.toUpperCase()} ${sign(npc.saves[ab])}`).join(', ')
  const skills = Object.keys(npc.skills)
    .map((s) => `${s} ${sign(npc.skills[s]!)}`)
    .join(', ')
  const progLabel = npc.model === 'proficiency' ? 'Proficiência' : 'BAB'

  // Multiataque: lista cada ataque numa linha quando > 1. Modelo bab tem
  // bônus decrescente, então a forma "1d8+3 / 1d8−2 / 1d8−7" é informativa.
  const attackLines =
    npc.attacks.length === 1
      ? [`- **Ataque** ${npc.attacks[0]!.name} ${sign(npc.attacks[0]!.bonus)}, dano ${npc.attacks[0]!.damage}`]
      : [
          `- **Ataques** (${npc.attacks.length} por turno):`,
          ...npc.attacks.map(
            (a, i) => `  ${i + 1}. ${a.name} ${sign(a.bonus)}, dano ${a.damage}`,
          ),
        ]

  // Header com criatura + proficiency rank.
  const creatureDesc = `${npc.creature.size} ${npc.creature.type}`
  const subtitle =
    `*${creatureDesc} • ${npc.role} • nível ${npc.level} • ${npc.systemId}` +
    (npc.proficiencyRank ? ` • ${npc.proficiencyRank}` : '') +
    `*`

  // Linha de defesa: CA padrão; em Starfinder mostra KAC/EAC + Stamina/Resolve.
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

  // Sentidos/idiomas (se houver).
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

  // Deslocamentos extras (voo, natação, etc.).
  const m = npc.creature.movements
  const extraMov: string[] = []
  if (m.fly) extraMov.push(`voo ${m.fly} ft`)
  if (m.swim) extraMov.push(`natação ${m.swim} ft`)
  if (m.climb) extraMov.push(`escalada ${m.climb} ft`)
  if (m.burrow) extraMov.push(`escavação ${m.burrow} ft`)
  if (extraMov.length > 0) {
    lines.push(`- **Movimentos extras** ${extraMov.join(', ')}`)
  }

  // Resistências/imunidades (só se tiver algo).
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

  // Bloco de magia (se for caster).
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
