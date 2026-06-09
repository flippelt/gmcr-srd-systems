# `@lippelt/srd-npcgen` — Roadmap v3

> TODO persistente e versionado (acessível de qualquer máquina/instância).
> Marque os itens com `[x]` conforme forem concluídos e abra um PR por bloco.

## Contexto / estado atual (v0.2.1)

O **v2 está completo** (NPC avulso d20 aprofundado + sistemas de pool +
integração GMCR + hook pra sistemas externos/privados). Veja o histórico no
rodapé. O pacote hoje gera **um** NPC por chamada (`generateNpc`), d20 ou pool,
determinístico via `seed`/`setRng`.

O **v3** sobe um degrau: de NPC avulso para **mesa de jogo** — gerar um
**encontro inteiro** balanceado, com **recompensa**, **flavor de roleplay**, e
refinos no motor d20/pool. Tudo determinístico por seed e desacoplado (o
npcgen produz dados/markdown; adapters espelham GMCR/codex sem dep).

**Como retomar:** começar pelo **Bloco A** (gerador de encontros — base sobre
a qual loot/flavor se penduram). Cada item vem com teste determinístico
(`seed`). Manter `typecheck`, `lint` e `test` verdes (CI builda o core antes).

Arquivos atuais: `src/{types,rng,data,d20,combat,tuning,creature,resistances,
skills,weapons,names,generate,adapters,index}.ts` + `src/pool/*` + testes
`*.test.ts`. Build tsup (esm+cjs+dts).

---

## Bloco A — Gerador de encontros (headline) ✅ (v0.3.0)

Orquestra `generateNpc` N vezes (sub-seeds determinísticas por índice a partir
de um seed base) e **balanceia** o grupo. `src/encounter.ts`.

- [x] **Tipos** em `types.ts`: `EncounterDifficulty` ('easy'|'medium'|'hard'|'deadly'), `EncounterRoleSlot` ({ role?, count, level? }), `EncounterInput` (systemId, partySize?, partyLevel?, difficulty?, roleMix?, seed?, creatureType?, creatureSize?, nameStyle?, withEpithet?, npc?, maxEnemies?), `EncounterMeta`, `GeneratedEncounter` ({ meta, npcs }).
- [x] **Balanceamento d20 = orçamento de XP do 5e**: `XP_BY_CR` (nível 1..20 como proxy), thresholds por nível × dificuldade × `partySize`, e `encounterMultiplier` por nº de inimigos (×1/×1.5/×2/×2.5/×3/×4). Auto-compõe papéis (rotação determinística com offset de nível por papel: minion −3 … leader +1) até o XP ajustado atingir o alvo, respeitando `maxEnemies`.
- [x] **Balanceamento pool**: sistemas de pool **não têm orçamento de XP** → balanceia por **contagem** (easy `party−1` … deadly `party+2`) e **tier** (= `partyLevel`). `meta.notes` deixa isso explícito.
- [x] **`roleMix` explícito**: quando informado, gera exatamente os slots (papel/nível/contagem), sem auto-balancear; a meta ainda calcula XP pra informação.
- [x] **`generateEncounter(input): GeneratedEncounter`** — determinístico (sub-seed `seed + idx` por NPC); detecta família (embutida ou `npc.family`) igual ao `generateNpc`; lança erro claro pra sistema sem suporte.
- [x] **Adapters de encontro** em `adapters.ts`: `encounterToTrackerCombatants(enc)` (→ `TrackerCombatant[]`) e `encounterToCodexMarkdown(enc)` (cabeçalho do encontro com dificuldade/XP + cada stat block).
- [x] **Export** no `index.ts` (tipos + `generateEncounter`/`encounterMultiplier`/`xpThreshold`/`XP_BY_CR` + adapters).
- [x] **Testes** (`encounter.test.ts`, 16 cases): determinismo, orçamento d20 (alvo batido sem estourar `maxEnemies`), contagem por dificuldade no pool, `roleMix` respeitado, erro em sistema sem suporte, adapters.

## Bloco B — Loot / recompensa ✅ (v0.4.0)

`src/loot.ts`.

- [x] **Moedas por banda de CR**: faixas de gp por banda de nível (1-4/5-10/11-16/17-20), com troco em sp/cp; `coinMultiplier` pra hoards maiores; `totalGp` agregado.
- [x] **Itens por raridade**: `ITEMS` (common→legendary) amostrados por `rarityPool(level)` (banda de nível), determinístico por seed.
- [x] **`generateLoot(input)`** avulso **e** `encounter.loot` opcional (flag `withLoot` no `EncounterInput`; sub-seed afastada das dos NPCs).
- [x] **Markdown**: `lootToMarkdown` (seção "Recompensa") + integrado ao `encounterToCodexMarkdown`.
- [x] **Testes** (`loot.test.ts`, 12 cases): determinismo, contagem por dificuldade, `itemCount`/`coinMultiplier`, raridade por banda, loot no encontro.

## Bloco C — Flavor de roleplay ✅ (v0.5.0)

`src/flavor.ts`.

- [x] **Banco de traços** por seed: personalidade, motivação, maneirismo, tática de combate, gancho. Listas com sabor por `NameStyle` (fantasy/sci-fi/lovecraftian/cyberpunk/plain); tática/maneirismo genéricos.
- [x] **`NpcFlavor`** anexado opcionalmente (flag `withFlavor` no `NpcOptions`; campo `flavor?` em ambos os shapes, sem inflar o padrão). `attachFlavor` usa o RNG global já fixado pelo seed do NPC → determinístico.
- [x] **`generateFlavor`** avulso (com `seed`/`style` próprios) e **`flavorMarkdown`** (seção "Interpretação"), integrado ao `toCodexMarkdown`.
- [x] **Testes** (`flavor.test.ts`, 9 cases): determinismo, disjunção por estilo, withFlavor em d20 e pool, markdown.

## Bloco D — Aprofundar d20 / pool 🔧 ✅ (v0.6.0)

- [x] **Mais armas**: `WEAPONS` ampliado (+11: warhammer/battleaxe/scimitar/morningstar/glaive/handaxe/javelin/lightCrossbow/sling/quarterstaff…). `ROLE_WEAPON_OPTIONS` + `getRoleWeaponOptions`; `getRoleWeapon(role, variant?)` dá variedade opt-in sem mexer no dano (a arma é metadata do stat block). Default preservado (compat).
- [x] **Mais magias**: `NpcMagic` ganha `cantrips`/`spells` (sabor). Seleção **determinística por nível** (sem RNG — não desloca o stream de geração): mais truques no 11+, lista de magias por banda de poder. Renderizado em "Truques"/"Magias" no markdown d20.
- [ ] **Variações de papel** (subtipos caster arcano vs divino): **deferido** — exige refatorar a definição de papel; fica pra um v3.x se houver demanda.
- [ ] **Cobrir mais sistemas de pool**: **deferido** — sob demanda, quando surgir um sistema novo na mesa do Felipe.
- [x] **Testes** (`weapons.test.ts` 4 cases + magias no `tuning.test.ts` 2 cases).

## Bloco E — Integração com o GM Control Room 🎮 ✅

Implementado em `gm-control-room` (PR #35). Consome `@lippelt/srd-npcgen` via `file:`.

- [x] **Modo "Encontro"** no `NpcGenPanel` (alternador NPC avulso / Encontro): controles de nível do grupo, nº de jogadores e dificuldade; preview do encontro (`encounterToCodexMarkdown`) com XP alvo/ajustado.
- [x] **"Jogar encontro no tracker"**: `encounterToTrackerCombatants` → vários `socket.emit('addCombatant', …)` num clique.
- [x] **Recompensa/flavor** no preview quando ligados (checkboxes; `withLoot`/`withFlavor`; este último propagado por NPC via `EncounterInput.withFlavor`, npcgen 0.5.1).
- [x] Esconde controles só-d20 quando o sistema é pool (como no NPC avulso).

---

## Notas de design

- **Determinismo é regra**: toda nova lógica testável com `seed`. Encontro =
  sub-seeds derivadas (`seed + idx`) → reproduzível e cada NPC distinto.
- **Desacoplamento**: `npcgen` não importa GMCR nem codex — só produz dados/
  markdown; os adapters espelham os formatos sem dependência.
- **d20 vs pool**: d20 usa orçamento de XP (5e); pool não tem XP → balanceia por
  contagem/tier. Manter os dois caminhos isolados.
- **Hook `System.npc?`**: o gerador de encontros respeita os mesmos hooks do
  NPC avulso (família/model/generatePool), então sistemas externos/privados
  entram no encontro sem o público citar o id.
- **Atribuição/licenças**: ao adicionar dados de sistema, respeitar a
  `attribution` de cada pacote (SRD/CC-BY/ORC etc.). As tabelas de XP/orçamento
  do d20 seguem o SRD 5.1 (CC-BY-4.0).

---

## Histórico — v2 (concluído ✅)

NPC avulso completo. Resumo dos blocos entregues:

- **Bloco A (v0.1.x–0.2.1)** — d20 aprofundado: multiataque/escala de dano,
  benchmarks por CR, magia pro caster, tuning por sistema (PF2e/Starfinder/
  3.5/PF1), criatura (tipo/tamanho/sentidos/movimentos/idiomas), resistências,
  perícias completas, armas/equipamento, nomes com sabor, hook `System.npc?`.
- **Bloco B (v0.2.0)** — sistemas de pool: dispatch por família, shape
  `PoolGeneratedNpc`, Daggerheart/Candela/GUMSHOE, adapters de pool, integridade
  contra `trackerFields` reais.
- **Bloco C** — integração GMCR: painel "Gerar NPC", jogar no tracker, copiar
  pro codex, sistemas de pool no painel.
- **Bloco D** — extensibilidade por hook: sistemas externos/privados se plugam
  via `family`/`model`/`generatePool` sem o público citar o id; aplicado aos 6
  privados (`gmcr-srd-systems-private`).
