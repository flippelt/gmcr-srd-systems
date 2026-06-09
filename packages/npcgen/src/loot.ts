/**
 * Gerador de loot/recompensa (v3): moedas escaladas por CR/nível + itens
 * mágicos por raridade. Determinístico via `seed` (roller seeded local — não
 * toca no RNG global usado por `generateNpc`).
 *
 * Faixas inspiradas nas tabelas de tesouro do SRD 5.1 (CC-BY-4.0),
 * simplificadas em bandas de CR.
 */
import type {
  EncounterDifficulty,
  GeneratedLoot,
  LootInput,
  LootItem,
  LootRarity,
} from './types'
import { seededRoller, type Roller } from './rng'
import { clampLevel } from './d20'

/** Faixa de moedas de ouro (gp) por banda de CR/nível: [min, max]. */
interface CoinBand {
  gp: [number, number]
}

function coinBand(level: number): CoinBand {
  if (level <= 4) return { gp: [10, 100] }
  if (level <= 10) return { gp: [100, 600] }
  if (level <= 16) return { gp: [600, 2500] }
  return { gp: [2500, 12000] }
}

/** Pool de raridades amostrado por banda de nível (pesos por repetição). */
function rarityPool(level: number): LootRarity[] {
  if (level <= 4) return ['common', 'common', 'common', 'uncommon']
  if (level <= 10) return ['common', 'uncommon', 'uncommon', 'rare']
  if (level <= 16) return ['uncommon', 'rare', 'rare', 'very-rare']
  return ['rare', 'very-rare', 'very-rare', 'legendary']
}

/** Itens por raridade (sabor genérico de fantasia). */
const ITEMS: Record<LootRarity, readonly string[]> = {
  common: [
    'Poção de cura',
    'Pergaminho de truque',
    'Adaga bem-feita',
    'Tocha élfica',
    'Corda de seda (15m)',
  ],
  uncommon: [
    'Poção de cura maior',
    'Arma +1',
    'Bolsa de retenção',
    'Manto élfico',
    'Botas élficas',
  ],
  rare: [
    'Arma +2',
    'Anel de proteção',
    'Capa de resistência',
    'Varinha de mísseis mágicos',
    'Armadura +1',
  ],
  'very-rare': [
    'Arma +3',
    'Manto de morcego',
    'Cajado de poder',
    'Amuleto da saúde',
    'Botas da velocidade',
  ],
  legendary: [
    'Espada vorpal',
    'Manto do arquimago',
    'Anel dos três desejos',
    'Armadura +3',
    'Orbe de domínio dragônico',
  ],
}

/** Nº padrão de itens mágicos por dificuldade. */
const ITEM_COUNT: Record<EncounterDifficulty, number> = {
  easy: 0, medium: 1, hard: 2, deadly: 3,
}

/** Roller padrão (não-determinístico) — usado quando não há seed. */
const defaultRoller: Roller = (sides) => Math.floor(Math.random() * sides) + 1

/** Sorteia um inteiro em [min, max] inclusivo usando o roller. */
function rollRange(roll: Roller, min: number, max: number): number {
  if (max <= min) return min
  return min + roll(max - min + 1) - 1
}

function pickWith<T>(roll: Roller, arr: readonly T[]): T {
  return arr[roll(arr.length) - 1]!
}

/**
 * Gera uma recompensa. Determinístico quando `seed` é informado.
 */
export function generateLoot(input: LootInput = {}): GeneratedLoot {
  const level = clampLevel(input.level ?? 1)
  const difficulty: EncounterDifficulty = input.difficulty ?? 'medium'
  const coinMultiplier = Math.max(0, input.coinMultiplier ?? 1)
  const itemCount = Math.max(0, Math.floor(input.itemCount ?? ITEM_COUNT[difficulty]))
  const roll: Roller = input.seed !== undefined ? seededRoller(input.seed) : defaultRoller

  // Moedas: gp na faixa da banda × multiplicador; trocados em sp/cp.
  const band = coinBand(level)
  const gp = Math.round(rollRange(roll, band.gp[0], band.gp[1]) * coinMultiplier)
  const sp = rollRange(roll, 0, 90)
  const cp = rollRange(roll, 0, 90)
  const coins = { cp, sp, gp }
  const totalGp = Math.round((gp + sp / 10 + cp / 100) * 100) / 100

  // Itens mágicos: raridade amostrada pela banda de nível.
  const pool = rarityPool(level)
  const items: LootItem[] = []
  for (let i = 0; i < itemCount; i++) {
    const rarity = pickWith(roll, pool)
    const name = pickWith(roll, ITEMS[rarity])
    items.push({ name, rarity })
  }

  return { level, coins, items, totalGp }
}

/** Recompensa em Markdown (seção "Recompensa") para o codex. */
export function lootToMarkdown(loot: GeneratedLoot): string {
  const { cp, sp, gp } = loot.coins
  const coinParts: string[] = []
  if (gp > 0) coinParts.push(`${gp} po`)
  if (sp > 0) coinParts.push(`${sp} pp`)
  if (cp > 0) coinParts.push(`${cp} pc`)
  const lines = ['#### Recompensa']
  lines.push(`- **Moedas** ${coinParts.length > 0 ? coinParts.join(', ') : '—'}`)
  if (loot.items.length > 0) {
    lines.push('- **Itens**')
    for (const it of loot.items) lines.push(`  - ${it.name} *(${it.rarity})*`)
  }
  return lines.join('\n')
}
