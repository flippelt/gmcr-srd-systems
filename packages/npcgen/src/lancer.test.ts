import { afterEach, describe, expect, it } from 'vitest'
import { resetRng } from './rng'
import { generateLancerNpc, lancerNpcToMarkdown, parseLancerNpcData } from './lancer'

afterEach(resetRng)

// Catálogo fake mínimo — o npcgen não embute dados de livro, então os
// testes injetam um LCP sintético com a mesma forma do COMP/CON.
const CHUNK = {
  classes: [
    {
      id: 'npcc_test_assault',
      name: 'TEST ASSAULT',
      role: 'striker',
      info: { tactics: 'Atira e aguenta.' },
      stats: {
        armor: [1, 1, 2],
        hp: [15, 18, 21],
        evade: [8, 10, 12],
        edef: [8, 9, 10],
        heatcap: [8, 8, 8],
        speed: [4, 4, 4],
        sensor: [8, 8, 8],
        save: [10, 12, 14],
        hull: [1, 2, 3],
        agility: [1, 2, 3],
        systems: [1, 2, 3],
        engineering: [1, 2, 3],
        size: [[1], [1], [2]],
      },
      base_features: ['npcf_rifle'],
      optional_features: ['npcf_opt_a', 'npcf_opt_b'],
    },
  ],
  templates: [
    {
      id: 'npct_grunt',
      name: 'GRUNT',
      description: 'Carne pra moedor.',
      base_features: ['npcf_grunt_trait'],
    },
    { id: 'npct_ultra', name: 'ULTRA', base_features: [] },
    { id: 'npct_exotic', name: 'EXOTIC', description: 'Coisa estranha.', base_features: [] },
  ],
  features: [
    {
      id: 'npcf_rifle',
      name: 'TEST RIFLE',
      type: 'Weapon',
      weapon_type: 'Main Rifle',
      range: [{ type: 'Range', val: 10 }],
      damage: [{ type: 'Kinetic', damage: [5, 7, 9] }],
    },
    { id: 'npcf_opt_a', name: 'OPT A', type: 'System', effect: 'Faz A.' },
    { id: 'npcf_opt_b', name: 'OPT B', type: 'Trait', effect: 'Faz B.' },
    { id: 'npcf_grunt_trait', name: 'RANK AND FILE', type: 'Trait', effect: 'Peão.' },
  ],
}

describe('parseLancerNpcData', () => {
  it('mescla chunks com dedup por id (primeira ocorrência vence)', () => {
    const clone = JSON.parse(JSON.stringify(CHUNK))
    clone.classes[0].name = 'DUPLICATA'
    const data = parseLancerNpcData([CHUNK, clone])
    expect(data.classes).toHaveLength(1)
    expect(data.classes[0].name).toBe('TEST ASSAULT')
    expect(data.templates).toHaveLength(3)
    expect(data.features).toHaveLength(4)
  })

  it('descarta entradas malformadas e chunks parciais', () => {
    const data = parseLancerNpcData([
      { classes: [{ name: 'sem id' }, null, 42] },
      { features: CHUNK.features },
    ])
    expect(data.classes).toHaveLength(0)
    expect(data.features).toHaveLength(4)
  })
})

describe('generateLancerNpc', () => {
  const data = parseLancerNpcData([CHUNK])

  it('usa stats do tier e resolve features base + opcionais (default = tier)', () => {
    const npc = generateLancerNpc({ data, classId: 'TEST ASSAULT', tier: 2, seed: 7 })
    expect(npc.className).toBe('TEST ASSAULT')
    expect(npc.stats.hp).toBe(18)
    expect(npc.stats.evade).toBe(10)
    expect(npc.stats.structure).toBe(1)
    const base = npc.features.filter((f) => f.from === 'class')
    const opt = npc.features.filter((f) => f.from === 'class-optional')
    expect(base.map((f) => f.name)).toEqual(['TEST RIFLE'])
    expect(opt).toHaveLength(2) // tier 2 → 2 opcionais (pool só tem 2)
    // arma resume dano do tier
    expect(base[0].effect).toContain('7 Kinetic')
  })

  it('grunt: 1 PV; ultra: +3 estrutura/stress e +1 ativação', () => {
    const grunt = generateLancerNpc({ data, classId: 'npcc_test_assault', tier: 3, templateIds: ['grunt'], seed: 1 })
    expect(grunt.stats.hp).toBe(1)
    expect(grunt.stats.structure).toBe(1)
    expect(grunt.templates).toEqual(['GRUNT'])
    expect(grunt.features.some((f) => f.from === 'GRUNT')).toBe(true)

    const ultra = generateLancerNpc({ data, classId: 'npcc_test_assault', tier: 1, templateIds: ['ULTRA'], seed: 1 })
    expect(ultra.stats.structure).toBe(4)
    expect(ultra.stats.stress).toBe(4)
    expect(ultra.stats.activations).toBe(2)
  })

  it('template fora dos cinco centrais aplica só texto (nota)', () => {
    const npc = generateLancerNpc({ data, classId: 'TEST ASSAULT', templateIds: ['exotic'], seed: 1 })
    expect(npc.stats.hp).toBe(15)
    expect(npc.notes.join(' ')).toContain('Coisa estranha')
  })

  it('é determinístico com seed e sorteia classe sem classId', () => {
    const a = generateLancerNpc({ data, seed: 42 })
    const b = generateLancerNpc({ data, seed: 42 })
    expect(a).toEqual(b)
  })

  it('catálogo vazio explode com mensagem clara', () => {
    expect(() => generateLancerNpc({ data: { classes: [], templates: [], features: [] } })).toThrow(/catálogo vazio/)
  })

  it('markdown traz stats e notas', () => {
    const npc = generateLancerNpc({ data, classId: 'TEST ASSAULT', tier: 1, templateIds: ['grunt'], seed: 3 })
    const md = lancerNpcToMarkdown(npc)
    expect(md).toContain('**PV** 1')
    expect(md).toContain('Tier 1')
    expect(md).toContain('⚠')
  })
})
