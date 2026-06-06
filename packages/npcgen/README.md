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
  proficiência `2 + ⌊(nível−1)/4⌋`.
- **`bab`** (D&D 3.5, Pathfinder 1e, Starfinder 1e): BAB cheio aproximado
  (= nível) e saves bom/fraco.

Sistemas baseados em pool (Daggerheart, Candela Obscura, GUMSHOE) ficam para
uma versão futura — o gerador lança erro para ids fora da família d20.

> As fórmulas são aproximações ao estilo "NPC de mesa" (não builds completos de
> PC): atributos por arquétipo, HP por dado de vida + CON, CA por armadura +
> Dex limitada, e ataque/perícias com a progressão do modelo.
