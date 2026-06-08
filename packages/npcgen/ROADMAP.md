# `@lippelt/srd-npcgen` — Roadmap v2

> TODO persistente e versionado (acessível de qualquer máquina/instância).
> Marque os itens com `[x]` conforme forem concluídos e abra um PR por bloco.

## Contexto / estado atual (v0.1.0)

O pacote gera NPCs para a **família d20** (`D20_MODEL`: 5e 2024/2014, D&D 3.5,
Pathfinder 1e/2e, Starfinder 1e/2e) e **lança erro** para sistemas de pool.

Já faz: atributos por arquétipo (8 papéis), HP (dado de vida + CON), CA
(`10 + armadura + Dex limitada`), saves (proficiência ou bom/fraco), **um**
ataque assinatura, algumas perícias, nome por sílabas. RNG injetável +
`seededRoller` (determinístico). Adapters: `toTrackerCombatant` (GMCR) e
`toCodexMarkdown` (codex).

Arquivos: `src/{types,rng,data,d20,names,generate,adapters,index}.ts` +
testes `*.test.ts`. Build tsup (esm+cjs+dts).

**Como retomar:** começar pelo Bloco A (mais isolado e testável). Cada item
deve vir com teste determinístico (use `seed`/`setRng`). Manter `typecheck`,
`lint` e `test` verdes (CI builda o core antes dos testes).

---

## Bloco A — Aprofundar o d20

- [x] **Multiataque por nível**: papéis marciais ganham ataques extras (ex.: 5/11/20 no estilo 5e; iterativos no modelo BAB). Expor `attacks: NpcAttack[]`. *(v0.1.1)*
- [x] **Escala de dano**: número de dados/bônus do ataque cresce com nível/CR (caster como cantrip 1/2/3/4; brute ganha dado extra no lvl 11). *(v0.1.1)*
- [x] **Benchmarks por CR/nível**: tabela alvo de HP/CA/ataque/DC por CR para *calibrar* a saída (não só derivar dos atributos), evitando NPCs fracos/fortes demais. *(v0.1.1 — função `getBenchmark`, anexado em `npc.benchmark`)*
- [x] **Bloco de magia para `caster`**: `spellSaveDC`/`spellAttackBonus`, cantrip que escala. *(v0.1.2 — `npc.magic`)*
- [x] **Tuning por sistema** (em vez de só os 2 modelos genéricos):
  - [x] PF2e: proficiência = nível + bônus de patente. *(v0.2.1 — hook `npc.attackProgression` em pathfinder-2e/starfinder-2e; o gerador aplica. Graus de sucesso são mecânica de rolagem, fora do escopo de um stat block.)*
  - [x] Starfinder: Stamina + HP, KAC/EAC no lugar de CA única. *(v0.1.2 — `npc.starfinder`)*
  - [x] D&D 3.5/PF1: saves Fort/Ref/Will explícitos *(v0.1.2 — atalhos `fortSave/refSave/willSave`)*; iterativos de BAB *(v0.1.1)*.
- [x] **Tipo/tamanho de criatura**, sentidos (visão no escuro), deslocamentos (voo/natação), idiomas. *(v0.1.3 — `npc.creature`)*
- [x] **Resistências/imunidades/imunidade a condições** por tipo/papel. *(v0.1.3 — `npc.resistances`, derivado do `creatureType`)*
- [x] **Perícias completas** por sistema + seleção de proficiências por papel. *(v0.2.1 — todos os pacotes d20 preenchem `npc.skills`; o gerador consome via `selectSkills` (perícias do papel + extras escalando com o nível) e expõe `availableSkills`.)*
- [x] **Tabela de armas/equipamento** → derivar nome/dano do ataque a partir de uma arma. *(v0.1.3 — `WEAPONS`, `getRoleWeapon`, `npc.weapon`)*
- [x] **Nomes melhores**: listas com sabor por sistema/cultura + títulos/epítetos. *(v0.1.3 — `NameStyle`: fantasy/sci-fi/lovecraftian/cyberpunk/plain + `withEpithet`)*
- [x] **Hook opcional `System.npc?`** no `@lippelt/srd-core`: cada pacote de sistema pode refinar a geração; `npcgen` usa o hook se existir, senão cai no genérico d20. *(v0.1.4 — `attackProgression`/`cantripDamageDice`/`skills`/`defaultLanguages` em `SystemNpcHooks`; passa via `NpcOptions.npc`)*

## Bloco B — Sistemas de pool (v0.2.0)

- [x] **Generalizar `generateNpc`**: despacha por *família* do sistema (d20 vs pool) em vez de lançar erro. `SYSTEM_FAMILY` em `data.ts`, `getSystemFamily()` exposto. *(v0.2.0)*
- [x] **Forma de NPC de pool** em `types.ts`: `PoolGeneratedNpc` com `tracks: Record<string, PoolTrack>`, `attacks: PoolAttack[]`, `extra: Record<string, unknown>` específico por sistema. `GeneratedNpc` agora é union `D20GeneratedNpc | PoolGeneratedNpc`; type guards `isD20Npc`/`isPoolNpc`. *(v0.2.0 — breaking shape)*
- [x] **Daggerheart**: dificuldade, limiares (major/severe), HP/Stress/Armor/Hope, 10 roles (bruiser, horde, leader, minion, ranged, skulk, social, solo, standard, support), 4 tiers. *(v0.2.0)*
- [x] **Candela Obscura**: 7 roles, Hit Threshold, drives (nerve/cunning/intuition), marks (body/brain/bleed). *(v0.2.0)*
- [x] **GUMSHOE**: 7 roles, Hit Threshold, pools (athletics/fighting/weapons), Health/Stability tracks. *(v0.2.0)*
- [x] **Adapters de pool** — `toTrackerCombatant` e `toCodexMarkdown` cobrem `PoolGeneratedNpc` com lógica por sistema. *(v0.2.0)*
- [x] **Testes determinísticos** — 20 cases novos em `pool.test.ts` + dispatch por família. *(v0.2.0)*

> **Próximo (pendente)**: integridade contra `trackerFields` reais — validar que `toTrackerCombatant(pool).fields` casa com os campos declarados pelo pacote do sistema (`@lippelt/srd-daggerheart` etc.).

## Bloco C — Integração com o GM Control Room ✅

- [x] **Publicar `@lippelt/srd-npcgen` no npm** — publicado (0.2.0). No GMCR é consumido via `file:` do repo irmão `gmcr-srd-systems`.
- [x] **Ação "Gerar NPC" no GMCR**: `client/src/features/npcgen/NpcGenPanel.tsx` chama `generateNpc` com o sistema da campanha ativa (`campaign.system` → `getSystem` → `npc` hooks).
- [x] **Jogar no tracker**: `toTrackerCombatant(npc)` → `socket.emit('addCombatant', …)`, fechando o ciclo.
- [x] **UI**: controles de nível/papel/tipo/tamanho/estilo de nome + *preview* em markdown (`toCodexMarkdown`).
- [x] **Mapeamento de `trackerFields`**: `toTrackerCombatant().fields` vai como `extras` do `addCombatant` (genérico — `ac` etc.).
- [x] **"Copiar pro codex"**: botão "📋 Copiar" copia o markdown (`toCodexMarkdown`) pro clipboard.
- [x] **Sistemas de pool no painel**: Daggerheart/Candela/GUMSHOE também geram pelo painel (não só d20). *(gm-control-room — esconde controles só-d20 em pool.)*

---

## Notas de design

- **Determinismo é regra**: toda nova lógica deve ser testável com `seed`/`setRng`.
- **Desacoplamento**: `npcgen` não importa GMCR nem codex — só produz dados/markdown; os adapters espelham os formatos sem dependência.
- **Família d20 vs pool**: manter os dois caminhos isolados; o genérico cobre o grosso, o hook `System.npc?` refina.
- **Atribuição/licenças**: ao adicionar dados de sistema, respeitar a `attribution` de cada pacote (SRD/CC-BY/ORC etc.).
