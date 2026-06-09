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

## Bloco B — Loot / recompensa 💰

- [ ] **Tabela de XP/recompensa por CR**: reaproveita a tabela de XP do Bloco A; recompensa em moedas por CR/encontro (faixas determinísticas).
- [ ] **Itens por raridade**: tabela simples de itens (common→legendary) sorteada por seed, escalando com CR/dificuldade do encontro.
- [ ] **`generateLoot(input)`** avulso **e** `encounter.loot` opcional (recompensa do encontro inteiro).
- [ ] **Markdown** no `toCodexMarkdown`/`encounterToCodexMarkdown` (seção "Recompensa").
- [ ] **Testes** determinísticos.

## Bloco C — Flavor de roleplay 🎭

- [ ] **Banco de traços** por seed: personalidade, motivação, maneirismo, tática de combate, segredo/gancho. Listas com sabor por `NameStyle`/`creatureType`.
- [ ] **`NpcFlavor`** anexado opcionalmente ao NPC (flag `withFlavor`), sem inflar o shape padrão.
- [ ] **Markdown**: seção "Interpretação" no `toCodexMarkdown`.
- [ ] **Testes** determinísticos (seed → mesmo flavor).

## Bloco D — Aprofundar d20 / pool 🔧

- [ ] **Mais armas/magias**: ampliar `WEAPONS` e o bloco de magia (lista de truques/efeitos por papel).
- [ ] **Variações de papel**: subtipos (ex.: caster arcano vs divino) influenciando perícias/ataques.
- [ ] **Cobrir mais sistemas de pool** que o Felipe use (avaliar sob demanda).
- [ ] **Testes** por item.

## Bloco E — Integração com o GM Control Room 🎮

- [ ] **Modo "Gerar encontro"** no `NpcGenPanel`: controles de tamanho do grupo/nível/dificuldade; preview do encontro (markdown) + XP alvo/ajustado.
- [ ] **"Jogar encontro no tracker"**: `encounterToTrackerCombatants` → vários `socket.emit('addCombatant', …)` num clique.
- [ ] **Recompensa/flavor** visíveis no preview quando ligados.
- [ ] Esconder controles só-d20 quando o sistema for pool (como já é no NPC avulso).

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
