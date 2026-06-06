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

  return [
    `### ${npc.name}`,
    `*${npc.role} • nível ${npc.level} • ${npc.systemId}*`,
    '',
    `- **CA** ${npc.ac}  **PV** ${npc.hp}  **Deslocamento** ${npc.speed} ft`,
    `- **${progLabel}** ${sign(npc.attackProgression)}`,
    `- **Atributos** ${abilities}`,
    `- **Resistências** ${saves}`,
    `- **Perícias** ${skills}`,
    `- **Ataque** ${npc.attack.name} ${sign(npc.attack.bonus)}, dano ${npc.attack.damage}`,
  ].join('\n')
}
