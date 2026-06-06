# @lippelt/srd-npcgen

Gerador de **NPCs / stat blocks** para a família **d20** dos sistemas
`gmcr-srd-systems` (D&D 5e 2024/2014, D&D 3.5, Pathfinder 1e/2e,
Starfinder 1e/2e), com saída pronta para o **tracker do GM Control Room** e
para o **Campaign Codex**.

## Uso

```ts
import { generateNpc, toTrackerCombatant, toCodexMarkdown } from '@lippelt/srd-npcgen'

const npc = generateNpc({ systemId: 'dnd5e-2024', level: 5, role: 'soldier' })

toTrackerCombatant(npc) // { name, initiative, hp, maxHp, statuses, fields: { ac } }
toCodexMarkdown(npc)    // stat block em Markdown
```

### Opções (`generateNpc`)

| Campo | Padrão | Descrição |
|-------|--------|-----------|
| `systemId` | — | Id de um sistema d20 (ex.: `dnd5e-2024`). |
| `level` | `1` | Nível/CR aproximado (1..20). |
| `role` | sorteado | Arquétipo: `brute`, `soldier`, `skirmisher`, `archer`, `caster`, `leader`, `lurker`, `minion`. |
| `abilityMethod` | `standard` | `standard` (array 15..8), `elite`, `average` ou `rolled` (4d6 descarta menor). |
| `name` | gerado | Nome fixo, senão gerado por sílabas. |
| `seed` | — | Geração reproduzível (define o RNG internamente). |

## Modelos de matemática

Dois modelos cobrem a família d20:

- **`proficiency`** (5e 2024/2014, Pathfinder 2e, Starfinder 2e): bônus de
  proficiência `2 + ⌊(nível−1)/4⌋`. Multiataque adiciona ataques com mesmo bônus.
- **`bab`** (D&D 3.5, Pathfinder 1e, Starfinder 1e): BAB cheio aproximado
  (= nível) e saves bom/fraco. Ataques iterativos com bônus decrescente (−5).

Sistemas baseados em pool (Daggerheart, Candela Obscura, GUMSHOE) **agora são
suportados** (v0.2.0+) — `generateNpc` despacha automaticamente por família.
Veja seção [Sistemas de pool](#sistemas-de-pool-v020) abaixo.

> As fórmulas são aproximações ao estilo "NPC de mesa" (não builds completos de
> PC): atributos por arquétipo, HP por dado de vida + CON, CA por armadura +
> Dex limitada, e ataque/perícias com a progressão do modelo.

## Multiataque, escala de dano e benchmarks (v0.1.1)

Cada NPC gerado tem `attacks: NpcAttack[]` (lista) além do `attack` (alias do primeiro).

### Multiataque por papel + modelo + nível

| Papel | proficiency | bab |
|---|---|---|
| Marciais (brute, soldier, skirmisher, archer, lurker) | 1 → 2 (lvl 5) → 3 (lvl 11) → 4 (lvl 20) | 1 → 2 (BAB 6) → 3 (BAB 11) → 4 (BAB 16) |
| Leader | 1 → 2 (lvl 5) | 1 → 2 (lvl 5) |
| Caster, Minion | 1 (sempre) | 1 (sempre) |

### Escala de dado de dano

| Papel | Quantidade de dados |
|---|---|
| Caster | 1 (lvl 1–4) → 2 (5–10) → 3 (11–16) → 4 (17+) — estilo cantrip 5e |
| Brute | 1 (1–10) → 2 (11+) |
| Demais marciais / leader / minion | 1 (sempre — a arma "escala" via multiataque) |

### Benchmarks de CR

`getBenchmark(level)` retorna HP/CA/ataque/CD/dano-por-round esperados pelo estilo 5e DMG. Cada NPC gerado já vem com `npc.benchmark` pra você comparar a saída com o alvo do CR.

## Sistemas de pool (v0.2.0)

`generateNpc({ systemId: 'daggerheart' | 'candela-obscura' | 'gumshoe' })` agora retorna `PoolGeneratedNpc` em vez de lançar erro. O retorno é uma **união discriminada** — use os type guards `isD20Npc` / `isPoolNpc` pra narrow.

```ts
import { generateNpc, isD20Npc, isPoolNpc } from '@lippelt/srd-npcgen'

const npc = generateNpc({ systemId: 'daggerheart', level: 5, name: 'Boss' })

if (isPoolNpc(npc)) {
  npc.tracks.hp        // { current: 12, max: 12 }
  npc.extra            // sistema-específico (Daggerheart: tier/difficulty/evasion/thresholds)
}
```

### Daggerheart

- 10 roles: `bruiser`, `horde`, `leader`, `minion`, `ranged`, `skulk`, `social`, `solo`, `standard`, `support`
- 4 tiers (lvls 1-3 / 4-6 / 7-9 / 10)
- Tracks: HP, Stress, Armor, Hope
- Extra: `difficulty`, `evasion`, `majorThreshold`, `severeThreshold`, `range`

### Candela Obscura

- 7 roles: `cultist`, `investigator`, `mundane`, `occultist`, `spectre`, `thug`, `whisper`
- 3 tiers (capacho / padrão / chefe)
- Tracks: marcas de body, brain, bleed (0..3 cada)
- Extra: `hitThreshold`, `drives` (nerve/cunning/intuition)

### GUMSHOE

- 7 roles: `cultist`, `investigator`, `mook`, `monster`, `professional`, `thug`, `witness`
- 3 tiers (escalando pools)
- Tracks: Health, Stability + Athletics, Fighting, Weapons (pools)
- Extra: `hitThreshold`, `pools`, `attackDamageMod`

## Hook de sistema (v0.1.4)

Cada sistema do `@lippelt/srd-*` pode opcionalmente expor `npc: SystemNpcHooks` no objeto System (definido no `@lippelt/srd-core`). O npcgen aceita os mesmos hooks via `NpcOptions.npc`:

```ts
import { getSystem } from '@lippelt/srd-core'
import { generateNpc } from '@lippelt/srd-npcgen'

const pf2 = getSystem('pathfinder-2e')!
const npc = generateNpc({
  systemId: 'pathfinder-2e',
  level: 10,
  role: 'soldier',
  npc: pf2.npc, // passa hooks do sistema se existirem
})
```

| Hook | Default genérico | Quando faz sentido |
|---|---|---|
| `attackProgression(level, role)` | 5e: `2 + ⌊(lvl−1)/4⌋` (proficiency) ou BAB cheio | PF2/SF2: `level + rank bonus` (rank trained +2 / expert +4 / master +6 / legendary +8) |
| `cantripDamageDice(level)` | 5e: 1/2/3/4 dados em 1/5/11/17 | PF2: heightening a cada 2 níveis |
| `skills` | (não usado ainda) | Lista canônica de perícias do sistema |
| `defaultLanguages(creatureType)` | Português padrão por tipo (Comum, Abissal, etc) | Settings exóticos (Starfinder: Galáctico, Vesk, Ysoki etc) |

Sem hook → cai no genérico. Hook parcial é OK: só os campos definidos são usados.

## Criatura, armas e resistências (v0.1.3)

Todo NPC vem com:

- **`npc.creature`** — `type` (humanoid/beast/undead/fiend/celestial/fey/dragon/aberration/construct/elemental/giant/monstrosity/ooze/plant), `size` (tiny..gargantuan), `senses` (darkvision-60/120, blindsight, low-light, tremorsense, truesight), `movements` (walk/fly/swim/climb/burrow em pés), `languages`.
- **`npc.resistances`** — `damageResistances`/`damageImmunities`/`damageVulnerabilities`/`conditionImmunities`, derivadas do tipo (undead imune a poison, fiend resiste a cold/fire/lightning vulnerável a radiant, construct imune a várias condições, etc).
- **`npc.weapon`** — arma assinatura completa (`name`, `category`, `damageDie`, `damageType`, `range`/`reach`, `properties`). Mapeada do `role` (brute → machado grande, archer → arco longo, caster → dardo arcano, etc).

### Opções novas

| Opção | Default | Conteúdo |
|---|---|---|
| `creatureType` | `'humanoid'` | Um dos tipos acima. Afeta sentidos/movimentos/idiomas/resistências. |
| `creatureSize` | `'medium'` | tiny/small/medium/large/huge/gargantuan. Afeta walking. |
| `nameStyle` | `'fantasy'` | `fantasy` / `sci-fi` / `lovecraftian` / `cyberpunk` / `plain`. |
| `withEpithet` | `false` | Anexa título/epíteto ("Korak o Astuto", "V1per netrunner"). |

### Exemplos

```ts
// Dragão jovem azul, large, com voo e darkvision
generateNpc({ systemId: 'dnd5e-2024', level: 10, role: 'brute',
              creatureType: 'dragon', creatureSize: 'large' })

// Replicante operativo no Starfinder, com epíteto sci-fi
generateNpc({ systemId: 'starfinder-2e', level: 5, role: 'archer',
              nameStyle: 'sci-fi', withEpithet: true })

// Avatar do Yog-Sothoth com nome lovecraftiano
generateNpc({ systemId: 'dnd5e-2024', level: 15, role: 'caster',
              creatureType: 'aberration', nameStyle: 'lovecraftian',
              withEpithet: true })
```

## Tuning específico por papel/sistema (v0.1.2)

Quando aplicável, o NPC ganha campos extras:

| Campo | Quando aparece | Conteúdo |
|---|---|---|
| `npc.magic` | `role === 'caster'` | `{ spellAbility, spellSaveDC, spellAttackBonus, cantripDamage }` |
| `npc.starfinder` | `systemId` em SF1/SF2 | `{ stamina, kac, eac, resolve }` (drena SP antes do HP) |
| `npc.proficiencyRank` | `systemId` em PF2/SF2 | `'trained' \| 'expert' \| 'master' \| 'legendary'` |
| `npc.fortSave/refSave/willSave` | sempre | atalhos pros saves clássicos (CON/DEX/WIS) |

> A matemática do PF2 (`level + bônus de rank`) difere do 5e. O `attackProgression` ainda usa o 5e — `proficiencyRank` é informativa. Tuning matemático fino do PF2 é planejado pro próximo PR (Bloco A item 11, hook `System.npc?`).

### Exemplo

```ts
const mago = generateNpc({ systemId: 'dnd5e-2024', level: 9, role: 'caster' })
mago.magic              // { spellAbility: 'cha', spellSaveDC: 14, spellAttackBonus: 6, cantripDamage: '2d8+2' }
mago.fortSave           // atalho pra saves.con

const operative = generateNpc({ systemId: 'starfinder-2e', level: 11, role: 'archer' })
operative.starfinder    // { stamina: ..., kac: ..., eac: ..., resolve: ... }
operative.proficiencyRank  // 'master'
```

```ts
const npc = generateNpc({ systemId: 'dnd5e-2024', level: 10, role: 'brute' })
npc.attacks.length     // 2 (Extra Attack ativo)
npc.attacks[0].damage  // '1d10+4' (brute lvl 10, ainda 1 dado)
npc.benchmark          // { level: 10, hp: 250, ac: 17, attackBonus: 7, ... }
```
