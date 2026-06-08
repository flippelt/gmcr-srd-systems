import { describe, it, expect } from 'vitest'
import { selectSkills, SKILL_ABILITY } from './skills'
import { ROLES } from './data'
import { generateAbilityScores } from './d20'
import { generateNpc } from './generate'
import { isD20Npc } from './types'

// soldier: skills athletics(str)/perception(wis); priority [str,con,dex,wis,int,cha]
// standard: str15(+2) con14(+2) dex13(+1) wis12(+1) int10(0) cha8(-1)
const def = ROLES.soldier
const abilities = generateAbilityScores('standard', 'soldier')
const prog = 3

describe('selectSkills', () => {
  it('inclui as perícias do arquétipo com bônus = mod + prog', () => {
    const s = selectSkills({ role: 'soldier', def, level: 1, abilities, prog })
    expect(s.athletics).toBe(2 + prog) // STR
    expect(s.perception).toBe(1 + prog) // WIS
  })

  it('sem systemSkills, traz só as perícias do arquétipo', () => {
    const s = selectSkills({ role: 'soldier', def, level: 20, abilities, prog })
    expect(Object.keys(s).sort()).toEqual(['athletics', 'perception'])
  })

  it('com systemSkills, adiciona extras escalando com o nível (+1 a cada 3)', () => {
    const sys = ['arcana', 'stealth', 'intimidation', 'medicine', 'acrobatics']
    const low = selectSkills({ role: 'soldier', def, level: 1, abilities, prog, systemSkills: sys })
    expect(Object.keys(low)).toHaveLength(2) // floor(1/3)=0 extras

    const high = selectSkills({ role: 'soldier', def, level: 9, abilities, prog, systemSkills: sys })
    expect(Object.keys(high)).toHaveLength(2 + 3) // floor(9/3)=3 extras
  })

  it('prioriza perícias dos atributos fortes do papel', () => {
    const sys = ['intimidation', 'stealth'] // CHA vs DEX; soldier prioriza DEX
    const s = selectSkills({ role: 'soldier', def, level: 3, abilities, prog, systemSkills: sys })
    expect(s.stealth).toBeDefined() // 1 vaga extra → DEX antes de CHA
    expect(s.intimidation).toBeUndefined()
  })

  it('perícia fora do mapa cai no atributo de ataque do papel', () => {
    const s = selectSkills({ role: 'soldier', def, level: 9, abilities, prog, systemSkills: ['xenobiology'] })
    expect(s.xenobiology).toBe(abilities[def.attackAbility].mod + prog) // STR
  })
})

describe('SKILL_ABILITY', () => {
  it('mapeia perícias canônicas comuns', () => {
    expect(SKILL_ABILITY.athletics).toBe('str')
    expect(SKILL_ABILITY.stealth).toBe('dex')
    expect(SKILL_ABILITY.arcana).toBe('int')
    expect(SKILL_ABILITY.perception).toBe('wis')
    expect(SKILL_ABILITY.persuasion).toBe('cha')
  })
})

describe('generateNpc consome o hook npc.skills', () => {
  it('expande as perícias e expõe availableSkills', () => {
    const skills = [
      'acrobatics', 'arcana', 'athletics', 'crafting',
      'deception', 'stealth', 'intimidation', 'medicine',
    ]
    const npc = generateNpc({
      systemId: 'pathfinder-2e',
      level: 9,
      role: 'soldier',
      name: 'X',
      npc: { skills },
    })
    if (!isD20Npc(npc)) throw new Error('expected d20 npc')
    expect(Object.keys(npc.skills).length).toBeGreaterThan(2) // arquétipo + extras
    expect(npc.availableSkills).toEqual(skills)
  })

  it('sem hook de skills, availableSkills fica indefinido e só vêm as do papel', () => {
    const npc = generateNpc({ systemId: 'dnd5e-2024', level: 5, role: 'soldier', name: 'X' })
    if (!isD20Npc(npc)) throw new Error('expected d20 npc')
    expect(npc.availableSkills).toBeUndefined()
    expect(Object.keys(npc.skills).sort()).toEqual(['athletics', 'perception'])
  })
})
