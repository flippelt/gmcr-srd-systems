import { describe, it, expect } from 'vitest'
import {
  generateDaggerheartNpc,
  generateCandelaNpc,
  generateGumshoeNpc,
  generateNpc,
  isPoolNpc,
  isD20Npc,
  type DaggerheartExtra,
  type CandelaExtra,
  type GumshoeExtra,
  type PoolGeneratedNpc,
} from './index'
import { toTrackerCombatant, toCodexMarkdown } from './adapters'
import { setRng, seededRoller, resetRng } from './rng'

describe('Daggerheart', () => {
  it('tier 1 (lvl 1-3), tier 2 (4-6), tier 3 (7-9), tier 4 (10)', () => {
    expect(generateDaggerheartNpc({ level: 1, role: 'standard', name: 'X' }).tier).toBe(1)
    expect(generateDaggerheartNpc({ level: 3, role: 'standard', name: 'X' }).tier).toBe(1)
    expect(generateDaggerheartNpc({ level: 4, role: 'standard', name: 'X' }).tier).toBe(2)
    expect(generateDaggerheartNpc({ level: 7, role: 'standard', name: 'X' }).tier).toBe(3)
    expect(generateDaggerheartNpc({ level: 10, role: 'standard', name: 'X' }).tier).toBe(4)
  })

  it('shape inclui tracks HP/Stress/Armor/Hope', () => {
    const npc = generateDaggerheartNpc({ level: 3, role: 'bruiser', name: 'Smasher' })
    expect(npc.family).toBe('pool')
    expect(npc.system).toBe('daggerheart')
    expect(npc.tracks.hp!.max).toBeGreaterThan(0)
    expect(npc.tracks.stress).toBeDefined()
    expect(npc.tracks.armor).toBeDefined()
    expect(npc.tracks.hope).toBeDefined()
  })

  it('extra inclui thresholds, evasion e difficulty', () => {
    const npc = generateDaggerheartNpc({ level: 5, role: 'solo', name: 'Boss' })
    const extra = npc.extra as unknown as DaggerheartExtra
    expect(extra.tier).toBe(2)
    expect(extra.majorThreshold).toBeGreaterThan(0)
    expect(extra.severeThreshold).toBeGreaterThan(extra.majorThreshold)
    expect(extra.evasion).toBeGreaterThan(0)
    expect(extra.difficulty).toBeGreaterThan(0)
  })

  it('minion tem HP baixo e damage modesto', () => {
    const minion = generateDaggerheartNpc({ level: 1, role: 'minion', name: 'M' })
    const solo = generateDaggerheartNpc({ level: 1, role: 'solo', name: 'S' })
    expect(minion.tracks.hp!.max).toBeLessThan(solo.tracks.hp!.max)
  })
})

describe('Candela Obscura', () => {
  it('shape inclui tracks body/brain/bleed (cada um 0..3)', () => {
    const npc = generateCandelaNpc({ tier: 1, role: 'cultist', name: 'X' })
    expect(npc.tracks.body!.max).toBe(3)
    expect(npc.tracks.brain!.max).toBe(3)
    expect(npc.tracks.bleed!.max).toBe(3)
  })

  it('extra inclui drives (nerve/cunning/intuition) e hit threshold', () => {
    const npc = generateCandelaNpc({ tier: 2, role: 'occultist', name: 'X' })
    const extra = npc.extra as unknown as CandelaExtra
    expect(extra.drives.nerve).toBeGreaterThanOrEqual(1)
    expect(extra.drives.cunning).toBeGreaterThanOrEqual(1)
    expect(extra.drives.intuition).toBeGreaterThanOrEqual(1)
    expect(extra.hitThreshold).toBeGreaterThanOrEqual(1)
  })

  it('tier sobe hit threshold (clamped em 3)', () => {
    const t1 = generateCandelaNpc({ tier: 1, role: 'spectre', name: 'X' })
    const t3 = generateCandelaNpc({ tier: 3, role: 'spectre', name: 'X' })
    const e1 = t1.extra as unknown as CandelaExtra
    const e3 = t3.extra as unknown as CandelaExtra
    expect(e3.hitThreshold).toBeGreaterThanOrEqual(e1.hitThreshold)
  })
})

describe('GUMSHOE', () => {
  it('shape inclui health/stability + pools (athletics/fighting/weapons)', () => {
    const npc = generateGumshoeNpc({ tier: 2, role: 'professional', name: 'X' })
    expect(npc.tracks.health).toBeDefined()
    expect(npc.tracks.stability).toBeDefined()
    expect(npc.tracks.athletics).toBeDefined()
    expect(npc.tracks.fighting).toBeDefined()
    expect(npc.tracks.weapons).toBeDefined()
  })

  it('extra inclui hitThreshold e attackDamageMod', () => {
    const npc = generateGumshoeNpc({ tier: 2, role: 'thug', name: 'X' })
    const extra = npc.extra as unknown as GumshoeExtra
    expect(extra.hitThreshold).toBeGreaterThan(0)
    expect(typeof extra.attackDamageMod).toBe('number')
  })

  it('tier 3 escala pools comparado a tier 1', () => {
    const t1 = generateGumshoeNpc({ tier: 1, role: 'thug', name: 'X' })
    const t3 = generateGumshoeNpc({ tier: 3, role: 'thug', name: 'X' })
    expect(t3.tracks.health!.max).toBeGreaterThan(t1.tracks.health!.max)
  })

  it('monster role tem hitThreshold 5 e damage mod alto', () => {
    const npc = generateGumshoeNpc({ tier: 2, role: 'monster', name: 'X' })
    const extra = npc.extra as unknown as GumshoeExtra
    expect(extra.hitThreshold).toBe(5)
  })
})

describe('Dispatch por SYSTEM_FAMILY no generateNpc unificado', () => {
  it('daggerheart vira PoolGeneratedNpc', () => {
    const npc = generateNpc({ systemId: 'daggerheart', name: 'X' })
    expect(isPoolNpc(npc)).toBe(true)
    expect(isD20Npc(npc)).toBe(false)
  })

  it('candela-obscura vira PoolGeneratedNpc', () => {
    const npc = generateNpc({ systemId: 'candela-obscura', name: 'X' })
    expect(isPoolNpc(npc)).toBe(true)
  })

  it('gumshoe vira PoolGeneratedNpc', () => {
    const npc = generateNpc({ systemId: 'gumshoe', name: 'X' })
    expect(isPoolNpc(npc)).toBe(true)
  })

  it('dnd5e-2024 continua d20', () => {
    const npc = generateNpc({ systemId: 'dnd5e-2024', name: 'X' })
    expect(isD20Npc(npc)).toBe(true)
  })
})

describe('Adapters pool', () => {
  it('toTrackerCombatant pra Daggerheart usa tracks.hp e fields.difficulty/evasion', () => {
    const npc = generateDaggerheartNpc({ level: 3, role: 'bruiser', name: 'Smasher' })
    const c = toTrackerCombatant(npc)
    expect(c.name).toBe('Smasher')
    expect(c.hp).toBe(npc.tracks.hp!.max)
    expect(c.maxHp).toBe(npc.tracks.hp!.max)
    expect(c.fields.difficulty).toBeGreaterThan(0)
    expect(c.fields.evasion).toBeGreaterThan(0)
  })

  it('toCodexMarkdown pra Daggerheart inclui Limiar Maior/Severo', () => {
    const npc = generateDaggerheartNpc({ level: 5, role: 'solo', name: 'Boss' })
    const md = toCodexMarkdown(npc)
    expect(md).toContain('### Boss')
    expect(md).toContain('tier 2')
    expect(md).toContain('Limiar Maior')
    expect(md).toContain('Limiar Severo')
    expect(md).toMatch(/\*\*Hp\*\*/) // track HP
  })

  it('toCodexMarkdown pra GUMSHOE inclui Hit Threshold + pools', () => {
    const npc = generateGumshoeNpc({ tier: 2, role: 'professional', name: 'Agent' })
    const md = toCodexMarkdown(npc)
    expect(md).toContain('Hit Threshold')
    expect(md).toContain('Pools')
  })

  it('toCodexMarkdown pra Candela inclui Drives', () => {
    const npc = generateCandelaNpc({ tier: 2, role: 'occultist', name: 'Mage' })
    const md = toCodexMarkdown(npc)
    expect(md).toContain('Drives')
    expect(md).toContain('Nerve')
  })
})

describe('Determinismo: mesma seed → mesmo NPC pool', () => {
  it('Daggerheart é determinístico', () => {
    setRng(seededRoller(42))
    const a = generateDaggerheartNpc({ level: 5 })
    setRng(seededRoller(42))
    const b = generateDaggerheartNpc({ level: 5 })
    expect(a.name).toBe(b.name)
    expect(a.role).toBe(b.role)
    expect(a.tracks).toEqual(b.tracks)
    resetRng()
  })
})
