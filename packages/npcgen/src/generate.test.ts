import { describe, it, expect } from 'vitest'
import { generateNpc, isD20System } from './generate'

describe('generateNpc (opções fixas → determinístico)', () => {
  const npc = generateNpc({
    systemId: 'dnd5e-2024',
    level: 5,
    role: 'soldier',
    abilityMethod: 'standard',
    name: 'Test',
  })

  it('usa o modelo proficiency e a progressão correta', () => {
    expect(npc.model).toBe('proficiency')
    expect(npc.attackProgression).toBe(3)
  })

  it('deriva atributos, HP e CA', () => {
    expect(npc.abilities.str.score).toBe(15)
    expect(npc.hp).toBe(38)
    expect(npc.ac).toBe(17)
  })

  it('ataque e perícias incorporam a progressão', () => {
    expect(npc.attack.bonus).toBe(5) // STR +2 + prof 3
    expect(npc.attack.damage).toBe('1d8+2')
    expect(npc.skills.athletics).toBe(5)
    expect(npc.skills.perception).toBe(4)
  })

  it('soldier nível 5: 2 ataques (Extra Attack)', () => {
    expect(npc.attacks).toHaveLength(2)
    expect(npc.attack).toEqual(npc.attacks[0]) // alias retro-compat
    // ambos com mesmo bônus (proficiency model)
    expect(npc.attacks[0]!.bonus).toBe(5)
    expect(npc.attacks[1]!.bonus).toBe(5)
  })

  it('inclui benchmark de CR pra nível 5', () => {
    expect(npc.benchmark.level).toBe(5)
    expect(npc.benchmark.hp).toBe(115)
    expect(npc.benchmark.attackBonus).toBe(6)
  })

  it('atalhos fort/ref/will espelham saves CON/DEX/WIS', () => {
    expect(npc.fortSave).toBe(npc.saves.con)
    expect(npc.refSave).toBe(npc.saves.dex)
    expect(npc.willSave).toBe(npc.saves.wis)
  })

  it('soldier não tem bloco de magia, starfinder nem proficiencyRank', () => {
    expect(npc.magic).toBeUndefined()
    expect(npc.starfinder).toBeUndefined()
    expect(npc.proficiencyRank).toBeUndefined()
  })

  it('todos os mods conferem com os scores', () => {
    for (const ab of ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const) {
      expect(npc.abilities[ab].mod).toBe(Math.floor((npc.abilities[ab].score - 10) / 2))
    }
  })
})

describe('generateNpc (modelo bab)', () => {
  it('dnd-3.5 usa BAB = nível', () => {
    const n = generateNpc({
      systemId: 'dnd-3.5',
      level: 6,
      role: 'brute',
      abilityMethod: 'standard',
      name: 'X',
    })
    expect(n.model).toBe('bab')
    expect(n.attackProgression).toBe(6)
    expect(n.attack.bonus).toBe(8) // STR +2 + BAB 6
  })
})

describe('generateNpc (seed reproduzível)', () => {
  it('a mesma seed gera o mesmo NPC', () => {
    const a = generateNpc({ systemId: 'pathfinder-2e', seed: 42 })
    const b = generateNpc({ systemId: 'pathfinder-2e', seed: 42 })
    expect(a).toEqual(b)
    expect(a.name.length).toBeGreaterThan(0)
  })
})

describe('generateNpc (caster)', () => {
  const npc = generateNpc({
    systemId: 'dnd5e-2024',
    level: 9,
    role: 'caster',
    abilityMethod: 'standard',
    name: 'Mago',
  })

  it('preenche magic com CD e ataque mágico', () => {
    expect(npc.magic).toBeDefined()
    expect(npc.magic!.spellAbility).toBe('cha') // priority do role caster
    // CHA score 15 → mod +2; prof lvl 9 = +4 → DC 14, atk +6
    expect(npc.magic!.spellSaveDC).toBe(14)
    expect(npc.magic!.spellAttackBonus).toBe(6)
    // cantrip lvl 9: 2 dados (escala 5/11/17), mod +2
    expect(npc.magic!.cantripDamage).toBe('2d8+2')
  })
})

describe('generateNpc (Starfinder)', () => {
  it('SF1 inclui stamina/KAC/EAC/resolve', () => {
    const npc = generateNpc({
      systemId: 'starfinder-1e',
      level: 5,
      role: 'soldier',
      abilityMethod: 'standard',
      name: 'Veteran',
    })
    expect(npc.starfinder).toBeDefined()
    expect(npc.starfinder!.kac).toBe(npc.ac)
    expect(npc.starfinder!.eac).toBe(npc.ac - 1)
    expect(npc.starfinder!.stamina).toBeGreaterThan(0)
    expect(npc.starfinder!.resolve).toBeGreaterThanOrEqual(1)
    expect(npc.proficiencyRank).toBeUndefined() // SF1 não tem rank
  })

  it('SF2 inclui starfinder + proficiencyRank', () => {
    const npc = generateNpc({
      systemId: 'starfinder-2e',
      level: 11,
      role: 'archer',
      abilityMethod: 'standard',
      name: 'Sniper',
    })
    expect(npc.starfinder).toBeDefined()
    expect(npc.proficiencyRank).toBe('master')
  })
})

describe('generateNpc (PF2)', () => {
  it('inclui proficiencyRank, sem starfinder', () => {
    const npc = generateNpc({
      systemId: 'pathfinder-2e',
      level: 6,
      role: 'brute',
      abilityMethod: 'standard',
      name: 'Ogre',
    })
    expect(npc.proficiencyRank).toBe('expert')
    expect(npc.starfinder).toBeUndefined()
  })
})

describe('generateNpc (criatura/arma/resistências — v0.1.3)', () => {
  it('humanoide default sem resistências e walking 30', () => {
    const n = generateNpc({
      systemId: 'dnd5e-2024',
      level: 3,
      role: 'soldier',
      name: 'Guarda',
    })
    expect(n.creature.type).toBe('humanoid')
    expect(n.creature.size).toBe('medium')
    expect(n.creature.movements.walk).toBe(30)
    expect(n.speed).toBe(30)
    expect(n.resistances.damageResistances).toEqual([])
    expect(n.weapon.name).toBe('Espada Longa')
  })

  it('undead ganha resistências apropriadas e darkvision', () => {
    const n = generateNpc({
      systemId: 'dnd5e-2024',
      level: 3,
      role: 'lurker',
      creatureType: 'undead',
      name: 'Zumbi',
    })
    expect(n.creature.type).toBe('undead')
    expect(n.creature.senses).toContain('darkvision-60')
    expect(n.resistances.damageImmunities).toContain('poison')
  })

  it('dragão tem voo e o speed do NPC vem do walking da criatura', () => {
    const n = generateNpc({
      systemId: 'dnd5e-2024',
      level: 10,
      role: 'brute',
      creatureType: 'dragon',
      creatureSize: 'large',
      name: 'Wyrm',
    })
    expect(n.creature.movements.fly).toBe(80)
    expect(n.speed).toBe(40) // large = walk 40
  })
})

describe('generateNpc (nomes com estilo)', () => {
  it('nameStyle sci-fi muda o pool', () => {
    const a = generateNpc({ systemId: 'starfinder-1e', seed: 100, nameStyle: 'sci-fi' })
    const b = generateNpc({ systemId: 'starfinder-1e', seed: 100, nameStyle: 'fantasy' })
    expect(a.name).not.toBe(b.name)
  })

  it('withEpithet anexa "o Astuto" e similares', () => {
    const n = generateNpc({
      systemId: 'dnd5e-2024',
      seed: 7,
      nameStyle: 'fantasy',
      withEpithet: true,
    })
    expect(n.name).toContain(' ')
  })

  it('opts.name explícito tem prioridade sobre nameStyle', () => {
    const n = generateNpc({ systemId: 'dnd5e-2024', name: 'Aragorn', nameStyle: 'sci-fi' })
    expect(n.name).toBe('Aragorn')
  })
})

describe('isD20System / erros', () => {
  it('reconhece sistemas d20', () => {
    expect(isD20System('dnd5e-2024')).toBe(true)
    expect(isD20System('daggerheart')).toBe(false)
  })

  it('lança para sistema fora da família d20', () => {
    expect(() => generateNpc({ systemId: 'daggerheart' })).toThrowError(/família d20/)
  })
})
